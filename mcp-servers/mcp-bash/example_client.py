#!/usr/bin/env python3
# example_client.py - Example client for the Model-Context-Protocol (MCP) Bash Server

from mcp.client import MCPClient
import asyncio
import os

async def main():
    # Connect to the MCP server (assuming it's running locally)
    client = MCPClient("http://localhost:8000")
    
    # Get the current directory
    current_dir = os.getcwd()
    print(f"Current directory: {current_dir}")
    
    # Set the working directory
    print("\nSetting working directory...")
    response = await client.set_cwd(current_dir)
    print(f"Response: {response}")
    
    # Execute some commands
    print("\nListing directory contents:")
    stdout, stderr = await client.execute_bash("ls -la")
    print(f"Output:\n{stdout}")
    if stderr:
        print(f"Error: {stderr}")
    
    print("\nChecking system info:")
    stdout, stderr = await client.execute_bash("uname -a")
    print(f"Output: {stdout}")
    
    print("\nRunning a pipe command:")
    stdout, stderr = await client.execute_bash("find . -type f -name '*.py' | sort")
    print(f"Python files:\n{stdout}")

if __name__ == "__main__":
    asyncio.run(main())
