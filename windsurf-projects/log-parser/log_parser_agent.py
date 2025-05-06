from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import requests
import json
import os
import re
from datetime import datetime
from py_zipkin.zipkin import create_http_headers_for_new_span, ZipkinAttrs, zipkin_span
from py_zipkin.util import generate_random_64bit_string

# Define Zipkin Span model using Pydantic
class ZipkinSpan(BaseModel):
    trace_id: str = Field(alias='traceId')
    parent_id: Optional[str] = Field(alias='parentId')
    id: str
    name: str
    timestamp: int
    duration: int
    kind: str = "SERVER"
    local_endpoint: Dict = Field(alias='localEndpoint', default_factory=lambda: {"serviceName": "task-service"})
    tags: Dict = Field(default_factory=dict)

# Define the LogParserAgent class
class LogParserAgent:
    def __init__(self, zipkin_url: str):
        # Ensure we have the correct Zipkin URL
        if not zipkin_url.endswith('/api/v2/spans'):
            zipkin_url = f"{zipkin_url.rstrip('/')}/api/v2/spans"
        self.zipkin_url = zipkin_url
        print(f"Using Zipkin URL: {self.zipkin_url}")
        # Pattern to match the span information in the format: [thread][trace:parent:span]
        self.span_pattern = re.compile(r'\[(.*?)\]')
        
        # Test the connection
        try:
            response = requests.get(zipkin_url.replace('/api/v2/spans', '/'))
            if response.status_code == 200:
                print("Successfully connected to Zipkin UI")
            else:
                print(f"Failed to connect to Zipkin UI. Status code: {response.status_code}")
        except Exception as e:
            print(f"Error testing Zipkin connection: {e}")
        
    def parse_log_line(self, line: str) -> Optional[ZipkinSpan]:
        try:
            print(f"Processing line: {line.strip()}")
            
            # Extract timestamp
            timestamp_str = line.split('[')[0].strip()
            print(f"Extracted timestamp: {timestamp_str}")
            timestamp = int(datetime.strptime(timestamp_str, '%Y-%m-%d/%H:%M:%S.%f').timestamp() * 1000000)
            
            # Extract span information
            span_parts = line.split(']')
            if len(span_parts) < 2:
                print("No span information found in line")
                return None
                
            # Extract the span part which contains trace:parent:span
            span_part = span_parts[1].split('[')[1].strip()
            print(f"Span part: {span_part}")
            
            # Split by colons to get trace, parent, and span IDs
            span_ids = span_part.split(':')
            if len(span_ids) < 3:
                print("Not enough span IDs found")
                return None
                
            trace_id = span_ids[1]
            parent_id = span_ids[2]
            span_id = span_ids[3] if len(span_ids) > 3 else parent_id
            
            # Extract operation name
            operation = line.split(' - ')[1].split(' ')[0]
            
            # Create span
            span = ZipkinSpan(
                traceId=trace_id,
                parentId=parent_id if parent_id != trace_id else None,
                id=span_id,
                name=operation,
                timestamp=timestamp,
                duration=1000000,  # 1 second duration as a default
                tags={
                    "log.message": line,
                    "log.level": "INFO"
                }
            )
            
            print(f"Created span: {span.json()}")
            return span
            
        except Exception as e:
            print(f"Error parsing log line: {e}")
            return None
            
    def send_to_zipkin(self, span: ZipkinSpan):
        try:
            # Create headers for the span
            headers = {
                'X-B3-TraceId': span.trace_id,
                'X-B3-SpanId': span.id,
                'X-B3-ParentSpanId': span.parent_id or '',
                'X-B3-Sampled': '1',
                'Content-Type': 'application/json'
            }
            
            # Send the span to Zipkin
            response = requests.post(
                self.zipkin_url,
                headers=headers,
                json=[span.model_dump()]
            )
            response.raise_for_status()
            print("Successfully sent span to Zipkin")
        except requests.exceptions.RequestException as e:
            print(f"Error sending to Zipkin: {e}")
            print(f"Response status: {response.status_code if 'response' in locals() else 'N/A'}")
            print(f"Response text: {response.text if 'response' in locals() else 'N/A'}")
            
    def process_log_file(self, log_file_path: str):
        with open(log_file_path, 'r') as f:
            for line in f:
                span = self.parse_log_line(line)
                if span:
                    self.send_to_zipkin(span)

if __name__ == "__main__":
    # Create agent instance
    agent = LogParserAgent("http://127.0.0.1:9411/zipkin")
    print(f"Starting to process log file: {os.path.abspath('task_service.log')}")
    
    # Process log file (replace with your actual log file path)
    agent.process_log_file("task_service.log")
