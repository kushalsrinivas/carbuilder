#!/bin/bash

# Start the MCP server in the background
echo "🚀 Starting MCP Server..."
npm run mcp &
MCP_PID=$!

# Wait a moment for the MCP server to start
sleep 2

# Start the Vite dev server
echo "🚀 Starting Frontend Dev Server..."
npm run dev

# When Vite is stopped (Ctrl+C), also stop the MCP server
trap "echo '🛑 Stopping services...'; kill $MCP_PID 2>/dev/null" EXIT

