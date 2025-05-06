import re
from datetime import datetime
import time
import os
import logging
import sys
from dotenv import load_dotenv
from py_zipkin.zipkin import zipkin_span, ZipkinAttrs, Kind, create_http_headers_for_new_span
from py_zipkin.transport import BaseTransportHandler
from py_zipkin.encoding import Encoding
from py_zipkin.exception import ZipkinError
import requests # Used for the transport handler
import time  # Add this at the top with other imports

# --- Configuration ---
load_dotenv() # Load environment variables from .env file

ZIPKIN_URL = os.getenv('ZIPKIN_URL', 'http://localhost:9411/api/v2/spans')
SERVICE_NAME = os.getenv('SERVICE_NAME', 'task-service')
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

# --- Logging Setup ---
logging.basicConfig(level=logging.DEBUG if DEBUG else logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

# --- Zipkin Transport Handler ---
# Handles sending spans to the Zipkin server via HTTP
class HttpTransportHandler(BaseTransportHandler):
    def __init__(self, address):
        super().__init__()
        self.address = address
        # Use a session for potential connection pooling
        self.session = requests.Session()

    def get_max_payload_bytes(self):
        # Define a reasonable max payload size if needed, otherwise None
        return None

    def send(self, encoded_spans):
        """
        Sends encoded spans to the Zipkin server.
        :param encoded_spans: A list of encoded spans.
        """
        url = self.address
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        try:
            logging.debug(f"Sending span data to Zipkin: {encoded_spans[:100]}... (truncated)")
            response = self.session.post(
                url,
                data=encoded_spans, # py_zipkin encodes spans before sending
                headers=headers,
                timeout=5 # Add a timeout
            )
            response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
            logging.debug(f"Successfully sent {len(encoded_spans)} bytes to Zipkin at {url}")
            logging.debug(f"Zipkin response: {response.text}")
        except requests.exceptions.RequestException as e:
            logging.error(f"Failed to send spans to Zipkin at {url}: {e}")
            logging.error(f"Response: {getattr(e.response, 'text', 'No response')}")
            # Optionally, implement retry logic or dead-letter queue here
        except Exception as e:
            logging.error(f"An unexpected error occurred during Zipkin transport: {e}")

# Initialize the transport handler
transport_handler = HttpTransportHandler(ZIPKIN_URL)

# --- Log Parsing Logic ---
# Regex to capture the main components of the log line
# Groups: 1:Timestamp, 2:Thread, 3:ServiceContext, 4:Level, 5:Logger, 6:Message
log_pattern = re.compile(
    r"(\d{4}-\d{2}-\d{2}/\d{2}:\d{2}:\d{2}\.\d{3})\s+" # 1: Timestamp (YYYY-MM-DD/HH:MM:SS.ms)
    r"\[([^\]]+)\]"                                   # 2: Thread name
    r"\[([^:]+):(\w+):(\w+):(\w+)\]\s+"            # 3: Service Context (e.g., task-v1), 4: TraceID, 5: SpanID, 6: ParentSpanID
    r"(\w+)\s+"                                       # 7: Log Level (INFO, WARN, etc.)
    r"\s*([^\s]+(?:\s+[^\s]+)*)\s+-\s+"            # 8: Logger name (allowing for extra spaces)
    r"(.*)"                                           # 9: Message
)

def parse_timestamp(ts_str):
    """Converts the log timestamp string to a Unix timestamp float (in seconds)."""
    try:
        # Accommodate both '/' and ' ' as date/time separators if needed, but original uses '/'
        dt_obj = datetime.datetime.strptime(ts_str, "%Y-%m-%d/%H:%M:%S.%f")
        # Convert to UTC if logs are in local time and Zipkin expects UTC
        # For simplicity, assuming logs are already in the desired timezone (often UTC)
        # If conversion is needed:
        # import pytz
        # local_tz = pytz.timezone('Your/Local/Timezone') # e.g., 'America/Chicago'
        # utc_tz = pytz.utc
        # dt_obj = local_tz.localize(dt_obj).astimezone(utc_tz)
        return dt_obj.timestamp()
    except ValueError:
        logging.error(f"Could not parse timestamp: {ts_str}")
        return time.time() # Fallback to current time

def parse_log_line(line):
    """Parses a single log line into its components."""
    logging.debug(f"Processing line: {line.strip()}")
    match = log_pattern.match(line)
    if not match:
        logging.debug(f"No match for line: {line.strip()}")
        return None

    # Extract groups from regex match
    timestamp_str = match.group(1)
    thread = match.group(2)
    service_context = match.group(3)
    trace_id = match.group(4)
    parent_span_id = match.group(5)
    span_id = match.group(6)
    level = match.group(7)
    logger = match.group(8)
    message = match.group(9)

    logging.info(f"Parsed log data: {locals()}")

    # Convert timestamp to microseconds since epoch
    try:
        timestamp = datetime.strptime(timestamp_str, '%Y-%m-%d/%H:%M:%S.%f')
        timestamp_micros = int(timestamp.timestamp() * 1_000)
        logging.info(f"Parsed timestamp: {timestamp}, timestamp_micros: {timestamp_micros}")
    except ValueError:
        logging.warning(f"Invalid timestamp format: {timestamp_str}")
        timestamp_micros = int(time.time() * 1_000)  # Fallback to current time

    parsed_data = {
        'timestamp': timestamp_str,
        'timestamp_micros': timestamp_micros,
        'thread': thread,
        'service_context': service_context,
        'trace_id': trace_id,
        'parent_span_id': parent_span_id,
        'span_id': span_id,
        'level': level,
        'logger': logger,
        'message': message
    }

    logging.debug(f"Returning parsed data: {parsed_data}")
    return parsed_data

import uuid

def send_to_zipkin(log_data):
    """Creates and sends a Zipkin span based on parsed log data."""
    if not log_data:
        return

    try:
        # Extract IDs from the service context
        service_context = log_data.get('service_context', '')
        parts = service_context.split(':')
        logging.info(f"Service context: {service_context}")
        logging.info(f"Parts: {parts}")
    
        service_name = service_context
        trace_id = log_data.get('trace_id', uuid.uuid4().hex)
        span_id = log_data.get('span_id', uuid.uuid4().hex[:16])
        parent_span_id = log_data.get('parent_span_id', None)
        
        # Validate IDs are proper hex strings
        if trace_id and (len(trace_id) not in (16, 32) or not all(c in '0123456789abcdefABCDEF' for c in trace_id)):
            logging.warning(f"Invalid trace_id format or length: {trace_id}")
            trace_id = uuid.uuid4().hex
            logging.debug(f"Generated new trace_id: {trace_id}")
        
        if span_id and (len(span_id) not in (16, 32) or not all(c in '0123456789abcdefABCDEF' for c in span_id)):
            logging.warning(f"Invalid span_id format or length: {span_id}")
            span_id = uuid.uuid4().hex
            logging.debug(f"Generated new span_id: {span_id}")
        
        # Handle parent_span_id validation
        if parent_span_id and parent_span_id != 'None':
            if len(parent_span_id) not in (16, 32) or not all(c in '0123456789abcdefABCDEF' for c in parent_span_id):
                logging.warning(f"Invalid parent_span_id format: {parent_span_id}")
                parent_span_id = None
            else:
                logging.info(f"Child span detected with parent_span_id: {parent_span_id}")
        else:
            logging.info(f"Root span detected: {log_data.get('logger')}")
            parent_span_id = None
                
        logging.info(f"Final IDs: trace_id={trace_id}, span_id={span_id}, parent_span_id={parent_span_id}")

        # Create a more descriptive span name
        logger_name = log_data.get('logger', '').split('.')[-1]  # Get just the class name
        message = log_data.get('message', '')
        
        # Extract operation or method name if possible
        operation = 'process'  # Default operation name
        if 'operation' in message.lower():
            # Try to extract operation name from message
            op_match = re.search(r'([a-zA-Z]+) operation', message)
            if op_match:
                operation = op_match.group(1)
        
        # Create a consistent span name format
        span_name = f"{logger_name}.{operation}"
        
        # Add thread info to distinguish between similar operations
        thread = log_data.get('thread', '')
        if thread:
            span_name = f"{span_name} ({thread.split('-')[-1]})"
        
        logging.info(f"Creating span: {span_name}")

        # py_zipkin expects IDs to be hex strings
        zipkin_attrs = ZipkinAttrs(
            trace_id=trace_id,
            span_id=span_id,
            parent_span_id=parent_span_id,
            is_sampled=True,
            flags=None,
        )

        # Create tags from log data
        tags = {
            'thread': log_data['thread'],
            'level': log_data['level'],
            'logger': log_data['logger'],
            'original_log_format': log_data['service_context'],
        }
        
        # Add message as a tag if it's not too long
        if len(message) < 256:  # Arbitrary limit to prevent too large tags
            tags['message'] = message
        else:
            tags['message'] = message[:253] + '...'

        with zipkin_span(
            service_name=SERVICE_NAME,
            span_name=span_name,
            zipkin_attrs=zipkin_attrs,
            transport_handler=transport_handler,
            encoding=Encoding.V2_JSON,
            port=0,
            binary_annotations=tags
        ) as span:
            # Add the log line itself as a timestamped event (annotation)
            span.add_annotation(f"{logger_name}: {message}", 
                              timestamp=log_data['timestamp_micros'] / 1_000_000)

        logging.debug(f"Sent span {span_id} for trace {trace_id}")

    except ZipkinError as e:
        logging.error(f"ZipkinError while processing span: {e}")
    except Exception as e:
        logging.error(f"Unexpected error processing span: {e}")
        logging.error(f"Error details: {str(e)}")
        import traceback
        logging.error(traceback.format_exc())

# --- Main Execution ---
if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Read from file specified as command line argument
        log_file_path = sys.argv[1]
        logging.info(f"Processing log file: {log_file_path}")
        span_count = 0
        try:
            with open(log_file_path, 'r') as f:
                for line in f:
                    try:
                        parsed_data = parse_log_line(line)
                        if parsed_data:
                            logging.info(f"Sending span for trace_id: {parsed_data.get('trace_id')}, span_id: {parsed_data.get('span_id')}")
                            send_to_zipkin(parsed_data)
                            span_count += 1
                            # Small delay to prevent overwhelming Zipkin
                            if span_count % 10 == 0:  # Log progress every 10 spans
                                logging.info(f"Processed {span_count} spans so far...")
                            time.sleep(0.1)  # 100ms delay
                    except Exception as e:
                        logging.error(f"Error processing line: {line.strip()}. Error: {e}")
                        continue
            
            logging.info(f"Finished processing. Total spans sent: {span_count}")
            # Give some time for the last spans to be sent
            time.sleep(1)
            
        except FileNotFoundError:
            logging.error(f"Error: Log file not found at {log_file_path}")
            sys.exit(1)
        except Exception as e:
            logging.error(f"An error occurred reading the log file: {e}")
            sys.exit(1)
    else:
        # Read from standard input
        logging.info(f"Processing logs from standard input. Press Ctrl+D (Linux/macOS) or Ctrl+Z then Enter (Windows) to end. DEBUG={DEBUG}")
        span_count = 0
        try:
            for line in sys.stdin:
                try:
                    parsed_data = parse_log_line(line)
                    if parsed_data:
                        logging.info(f"Sending span for trace_id: {parsed_data.get('trace_id')}, span_id: {parsed_data.get('span_id')}")
                        send_to_zipkin(parsed_data)
                        span_count += 1
                        if span_count % 10 == 0:
                            logging.info(f"Processed {span_count} spans so far...")
                        time.sleep(0.1)
                except Exception as e:
                    logging.error(f"Error processing line: {line.strip()}. Error: {e}")
                    continue
            
            logging.info(f"Finished processing. Total spans sent: {span_count}")
            time.sleep(1)
            
        except KeyboardInterrupt:
            logging.info("Processing interrupted by user.")
        except Exception as e:
            logging.error(f"An error occurred reading from stdin: {e}")

    logging.info("Log processing finished.")
    # Ensure all buffered spans are sent (py_zipkin usually sends immediately with HttpTransport)
    # If using a different transport that buffers, you might need an explicit flush call.
