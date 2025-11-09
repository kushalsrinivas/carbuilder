#!/bin/bash

echo "🔍 Checking MCP Connection Status..."
echo ""

# Check if MCP server is running on port 3001
if lsof -ti:3001 >/dev/null 2>&1; then
    echo "✅ MCP Server: Port 3001 is in use"
    echo "   Process(es):"
    lsof -ti:3001 | xargs -I {} ps -p {} -o pid,comm,args 2>/dev/null || echo "   (Unable to get process info)"
else
    echo "❌ MCP Server: Port 3001 is FREE (server not running)"
    echo "   Start it with: npm run mcp"
fi

echo ""

# Check if Vite dev server is running on port 5173
if lsof -ti:5173 >/dev/null 2>&1; then
    echo "✅ Frontend: Port 5173 is in use"
else
    echo "❌ Frontend: Port 5173 is FREE (frontend not running)"
    echo "   Start it with: npm run dev"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Provide recommendations
if lsof -ti:3001 >/dev/null 2>&1 && lsof -ti:5173 >/dev/null 2>&1; then
    echo "🎉 Both services are running!"
    echo "   Open: http://localhost:5173"
    echo "   Check bottom-left corner for connection status"
elif lsof -ti:3001 >/dev/null 2>&1; then
    echo "⚠️  MCP server is running, but frontend is not"
    echo "   Run: npm run dev"
elif lsof -ti:5173 >/dev/null 2>&1; then
    echo "⚠️  Frontend is running, but MCP server is not"
    echo "   Run: npm run mcp"
else
    echo "🚀 Start both services with: ./start-dev.sh"
    echo "   Or use two terminals:"
    echo "   Terminal 1: npm run mcp"
    echo "   Terminal 2: npm run dev"
fi

echo ""

