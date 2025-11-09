# MCP Connection Guide

## Overview

The 4x4 Builder uses a **WebSocket connection** to link the MCP server with the frontend. Both services must be running simultaneously for the connection to work.

## Quick Start

### Option 1: Using the Shell Script (Recommended)

```bash
./start-dev.sh
```

This will:

1. Start the MCP server on `ws://localhost:3001`
2. Start the Vite dev server on `http://localhost:5173`
3. Stop both services when you press `Ctrl+C`

### Option 2: Manual Start (Two Terminals)

**Terminal 1 - MCP Server:**

```bash
npm run mcp
```

**Terminal 2 - Frontend:**

```bash
npm run dev
```

### Option 3: Install Concurrently (One Terminal)

First, install the dependency:

```bash
npm install --save-dev concurrently
```

Then run:

```bash
npm run dev:all
```

## Connection Status

Once both services are running:

1. **Open your browser** to `http://localhost:5173`
2. Look at the **bottom-left corner** of the page
3. You should see: 🟢 **"MCP Connected"** (green indicator)

If you see: ⚪ **"MCP Disconnected"** (gray indicator):

- Check that the MCP server is running (`npm run mcp`)
- Check the browser console for connection errors
- Verify no other service is using port 3001

## How It Works

```
┌─────────────────┐         WebSocket          ┌──────────────────┐
│                 │    ws://localhost:3001     │                  │
│  Claude Desktop │◄──────────────────────────►│   MCP Server     │
│                 │                            │   (Node.js)      │
└─────────────────┘                            └────────┬─────────┘
                                                        │
                                                        │ WebSocket
                                                        │ ws://localhost:3001
                                                        │
                                               ┌────────▼─────────┐
                                               │                  │
                                               │   Frontend       │
                                               │   (React/Vite)   │
                                               │                  │
                                               └──────────────────┘
```

1. **MCP Server** starts and listens on port 3001
2. **Frontend** loads and attempts to connect to `ws://localhost:3001`
3. **WebSocket connection** is established
4. **Claude Desktop** communicates with MCP Server via stdio
5. **MCP Server** forwards commands to Frontend via WebSocket

## Troubleshooting

### "MCP Disconnected" in Browser

**Solution:**

- Make sure the MCP server is running: `npm run mcp`
- Refresh the browser page after starting the MCP server

### "Address already in use" Error

**Problem:** Port 3001 is already in use

**Solution:**

```bash
# Find the process using port 3001
lsof -ti:3001

# Kill the process
kill -9 $(lsof -ti:3001)

# Or use a different port (update vite.config.js)
```

### Connection Keeps Dropping

**Solution:**

- Check for firewall/antivirus blocking WebSocket connections
- Try restarting both services
- Check browser console for error messages

### Claude Desktop Can't Connect

**Problem:** Claude Desktop configuration issue

**Solution:**

1. Open Claude Desktop config:

   - Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the MCP server configuration:

```json
{
  "mcpServers": {
    "4x4builder": {
      "command": "node",
      "args": ["/absolute/path/to/apps/4x4builder/src/mcp/server.js"]
    }
  }
}
```

3. Restart Claude Desktop

## Environment Variables

You can customize the WebSocket URL by creating a `.env` file:

```env
VITE_WS_SERVER_URL=ws://localhost:3001
```

Or set it directly when running:

```bash
VITE_WS_SERVER_URL=ws://localhost:3001 npm run dev
```

## Testing the Connection

Once connected, you can test it from the browser console:

```javascript
// Check connection status
window.websocketBridge?.getConnectionStatus();

// Test a scene handler call (if exposed)
window.vehicleUpdateTests?.testColorChange();
```

## Development Tips

1. **Always start the MCP server first** (it takes longer to initialize)
2. **Keep both terminals visible** to monitor logs
3. **Check the connection indicator** before using Claude Desktop
4. **Hot reload works** - you can edit code without restarting

## Support

If you're still having connection issues:

1. Check the MCP server terminal for error messages
2. Check the browser console (F12) for WebSocket errors
3. Verify both services are running on the correct ports
4. Try restarting both services in order: MCP first, then frontend
