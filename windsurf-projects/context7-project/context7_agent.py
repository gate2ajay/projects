from google.generativeai import Client
import os
from dotenv import load_dotenv
from typing import Optional

# Load environment variables
load_dotenv()

class Context7Agent:
    def __init__(self):
        # Initialize the Gemini model
        self.client = Client(
            api_key=os.getenv("GOOGLE_API_KEY"),
            base_url=os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta")
        )
        self.model = self.client.get_model(os.getenv("GEMINI_MODEL", "gemini-pro"))

    async def chat(self, message: str) -> str:
        """Send a message to the agent and get a response."""
        response = self.model.generate_content(message)
        return response.text()

    async def chat(self, message: str) -> str:
        """Send a message to the agent and get a response."""
        return await self.send_message(message)

# Create a CLI for chatting with the agent
def main():
    import asyncio
    import json
    
    # Load conversation history
    try:
        with open("conversation_history.json", "r") as f:
            history = json.load(f)
    except FileNotFoundError:
        history = []
    
    agent = Context7Agent()
    
    while True:
        message = input("\nYou: ")
        if message.lower() in ["quit", "exit", "bye"]:
            break
            
        # Add user message to history
        history.append({"role": "user", "content": message})
        
        # Get agent response
        response = asyncio.run(agent.chat(message))
        
        # Add agent response to history
        history.append({"role": "assistant", "content": response})
        
        # Save conversation history
        with open("conversation_history.json", "w") as f:
            json.dump(history, f, indent=2)
        
        print(f"\nAgent: {response}")

if __name__ == "__main__":
    main()
