# server.py
import subprocess

from mcp.server.fastmcp import FastMCP

# Create a Model-Context-Protocol (MCP) server
mcp = FastMCP("Bash")

from typing import Tuple
import os

# Global variable for working directory
GLOBAL_CWD = os.getcwd()  # Default to current directory

@mcp.tool()
async def set_cwd(path: str) -> str:
    """
    Set the global working directory for bash commands.

    Args:
        path: The absolute path to use as the new working directory.

    Returns:
        A confirmation message.
    """
    global GLOBAL_CWD

    if not os.path.isdir(path):
        raise ValueError(f"Invalid directory: {path}")

    GLOBAL_CWD = path
    return f"Working directory set to: {GLOBAL_CWD}"

@mcp.tool()
async def execute_bash(cmd: str) -> Tuple[str, str]:
    """
    Run a bash command in the global working directory.

    Args:
        cmd: The shell command to execute.

    Returns:
        A tuple (stdout, stderr) from the command execution.
    """
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        shell=True,
        cwd=GLOBAL_CWD
    )
    stdout, stderr = process.communicate()
    return stdout, stderr