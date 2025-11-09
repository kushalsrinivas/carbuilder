#!/bin/bash

echo "🔍 MCP Connection Debug"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if MCP server is running
if lsof -ti:3001 >/dev/null 2>&1; then
    echo "✅ MCP Server: Running on port 3001"
    echo "   PID(s): $(lsof -ti:3001 | tr '\n' ' ')"
else
    echo "❌ MCP Server: NOT running"
    echo "   Fix: Run 'npm run mcp' in a terminal"
    exit 1
fi

echo ""

# Check if frontend is running
if lsof -ti:5173 >/dev/null 2>&1; then
    echo "✅ Frontend: Running on port 5173"
    echo "   PID(s): $(lsof -ti:5173 | tr '\n' ' ')"
else
    echo "❌ Frontend: NOT running"
    echo "   Fix: Run 'npm run dev' in a terminal"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Connection Status:"
echo ""
echo "1. MCP Server ✅ (Claude Desktop can reach it)"
echo "2. Frontend   ✅ (Server is running)"
echo "3. WebSocket  ❓ (Need to verify)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 IMPORTANT: Open browser to http://localhost:5173"
echo ""
echo "Check these things IN THE BROWSER:"
echo "  1. Bottom-left shows '🟢 MCP Connected'"
echo "  2. Open console (F12) and look for:"
echo "     [WebSocket Bridge] ✅ Connected to MCP server"
echo ""
echo "Check this in MCP SERVER TERMINAL:"
echo "  Look for: [MCP Server] Frontend connected"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔧 If connection still failing:"
echo ""
echo "1. Refresh the browser (Cmd+R / Ctrl+R)"
echo "2. Click 'Reconnect' button in browser"
echo "3. Check browser console (F12) for errors"
echo "4. Look at MCP server terminal for connection logs"
echo ""

