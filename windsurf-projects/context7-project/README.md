# Context7 Agent with Gemini AI

This project implements a Pydantic AI agent that connects to the Context7 MCP server using the Gemini AI model.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file based on `.env.example` and fill in your Google API credentials.

3. Ensure you have Node.js installed to run the Context7 MCP server.

## Usage

Run the chat interface:
```bash
python context7_agent.py
```

The conversation history will be saved in `conversation_history.json`.

To exit the chat interface, type "quit", "exit", or "bye".
