# 🚀 Quick Start - MCP Connection

## What Was Fixed

I've identified and fixed the MCP connection issue:

1. ✅ Created missing `vehicle-update-handler.js` file
2. ✅ Improved WebSocket connection with better error handling  
3. ✅ Added reconnect button and detailed logging
4. ✅ Created startup scripts for easy management

## Start Both Services (Choose One Method)

### Method 1: Shell Script (Recommended)
```bash
./start-dev.sh
```

### Method 2: Two Terminals
**Terminal 1:**
```bash
npm run mcp
```

**Terminal 2:**
```bash
npm run dev
```

## Verify Connection

1. Open browser to: `http://localhost:5173`
2. Check **bottom-left corner** of the page:
   - ✅ **Green = Connected**
   - ❌ **Red = Disconnected** (click "Reconnect" button)

## If Still Disconnected

1. **Check if both services are running:**
   ```bash
   ./check-connection.sh
   ```

2. **Refresh the browser page** (sometimes frontend loads before server is ready)

3. **Click the "Reconnect" button** in the bottom-left corner

4. **Check browser console** (F12) for errors

## Quick Commands

```bash
# Check connection status
./check-connection.sh

# Start both services
./start-dev.sh

# Kill processes on port 3001 (if needed)
kill -9 $(lsof -ti:3001)
```

## More Help

- **Detailed Troubleshooting:** `MCP_TROUBLESHOOTING.md`
- **Architecture Guide:** `MCP_CONNECTION_GUIDE.md`

## Expected Result

When working correctly, you should see:

**Browser (bottom-left):**
```
🟢 MCP Connected
```

**Browser Console:**
```
[WebSocket Bridge] ✅ Connected to MCP server
```

**MCP Server Terminal:**
```
[MCP Server] Frontend connected
```

That's it! 🎉

