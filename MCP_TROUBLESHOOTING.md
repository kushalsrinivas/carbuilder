# MCP Connection Troubleshooting

## ✅ What I Fixed

I've made several improvements to ensure proper MCP connection:

1. **Created the missing `vehicle-update-handler.js`** file
2. **Improved WebSocket connection handling** with better error logging
3. **Added connection status indicator** with manual reconnect button
4. **Created helper scripts** for easy startup and connection checking

## 🚀 Quick Fix - Try This First

### Step 1: Check Current Status

```bash
./check-connection.sh
```

This will tell you if both services are running.

### Step 2: Restart Everything

**Option A - Single Command (Easy):**

```bash
./start-dev.sh
```

**Option B - Two Terminals (More Control):**

Terminal 1:

```bash
npm run mcp
```

Wait until you see:

```
✓ MCP Server running on stdio
✓ WebSocket server running on ws://localhost:3001
Waiting for frontend connection...
```

Terminal 2:

```bash
npm run dev
```

### Step 3: Check Connection in Browser

1. Open `http://localhost:5173`
2. Look at the **bottom-left corner**
3. You should see: **🟢 MCP Connected** (green)
4. If it says **🔴 MCP Disconnected** (red), click the **"Reconnect"** button

### Step 4: Verify in Browser Console

Open browser console (F12) and check for:

```
[WebSocket Bridge] ✅ Connected to MCP server
```

If you see errors, continue to the detailed troubleshooting below.

## 🔍 Detailed Troubleshooting

### Issue: "MCP Disconnected" in Browser

**Symptoms:**

- Red indicator in bottom-left corner
- Console shows: `[WebSocket Bridge] ❌ WebSocket error`

**Solutions:**

1. **Make sure MCP server is running:**

   ```bash
   # Check if it's running
   lsof -ti:3001

   # If nothing appears, start it
   npm run mcp
   ```

2. **Check MCP server logs:**
   Look for this message:

   ```
   [MCP Server] WebSocket server listening on port 3001
   ```

3. **Force reconnect from browser:**

   - Click the "Reconnect" button in the UI
   - Or run in browser console:
     ```javascript
     window.websocketBridge.forceReconnect();
     ```

4. **Refresh the page:**
   Sometimes the frontend loads before the MCP server is ready.
   Just refresh the browser (Cmd+R / Ctrl+R) after the MCP server starts.

### Issue: "Port 3001 already in use"

**Symptoms:**

- MCP server won't start
- Error: `EADDRINUSE: address already in use`

**Solutions:**

```bash
# Find and kill the process using port 3001
kill -9 $(lsof -ti:3001)

# Then restart MCP server
npm run mcp
```

### Issue: Connection Keeps Dropping

**Symptoms:**

- Connection indicator flashes between green and red
- Console shows repeated connect/disconnect messages

**Solutions:**

1. **Check firewall/antivirus:**

   - Temporarily disable to test
   - Add exception for localhost:3001

2. **Check system resources:**

   - Make sure your system isn't overloaded
   - Close unnecessary applications

3. **Increase reconnect delay:**
   Edit `src/lib/websocket-bridge.js`:
   ```javascript
   this.reconnectDelay = 5000; // Change from 2000 to 5000
   ```

### Issue: MCP Server Crashes

**Symptoms:**

- MCP server terminal shows errors
- Process exits unexpectedly

**Solutions:**

1. **Check Node.js version:**

   ```bash
   node --version  # Should be v18 or higher
   ```

2. **Reinstall dependencies:**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check for port conflicts:**
   ```bash
   lsof -ti:3001
   ```

## 🧪 Testing the Connection

Once you see **🟢 MCP Connected**:

1. **Test from browser console:**

   ```javascript
   // Check connection
   window.websocketBridge.getConnectionStatus(); // Should return: true

   // Test a handler
   window.vehicleUpdateTests.testColorChange();
   ```

2. **Test from Claude Desktop:**
   - Make sure Claude Desktop is configured (see MCP_CONNECTION_GUIDE.md)
   - Try a simple command: "What vehicles are available?"
   - You should see the MCP server logs in the terminal

## 📝 Debugging Checklist

- [ ] MCP server is running (`npm run mcp`)
- [ ] Frontend is running (`npm run dev`)
- [ ] Port 3001 is available
- [ ] Port 5173 is available
- [ ] Browser console shows no WebSocket errors
- [ ] Connection indicator is green
- [ ] MCP server logs show "Frontend connected"
- [ ] Claude Desktop config is correct (if using Claude)

## 🛠 Manual Testing Commands

### Check Ports

```bash
# Check if MCP server port is in use
lsof -ti:3001

# Check if frontend port is in use
lsof -ti:5173
```

### View Process Details

```bash
# See what's using port 3001
lsof -i:3001

# See what's using port 5173
lsof -i:5173
```

### Force Kill Everything

```bash
# Kill both ports
kill -9 $(lsof -ti:3001) $(lsof -ti:5173)

# Then restart
./start-dev.sh
```

## 🆘 Still Having Issues?

1. **Check browser console** (F12) for detailed error messages
2. **Check MCP server terminal** for error logs
3. **Try the connection test:**

   ```bash
   # In terminal
   ./check-connection.sh

   # In browser console
   window.websocketBridge.getConnectionStatus()
   ```

4. **Common Issues:**
   - **CORS errors:** Not applicable for WebSocket connections to localhost
   - **Mixed content:** Only applies if using HTTPS - use HTTP for dev
   - **Browser extensions:** Try disabling ad blockers or security extensions
   - **VPN/Proxy:** Can interfere with localhost connections

## 📚 Related Files

- **Connection Guide:** `MCP_CONNECTION_GUIDE.md` - Detailed architecture explanation
- **Check Script:** `check-connection.sh` - Quick status check
- **Start Script:** `start-dev.sh` - Start both services together
- **WebSocket Bridge:** `src/lib/websocket-bridge.js` - Connection implementation
- **MCP Server:** `src/mcp/server.js` - Server implementation

## 🎯 Expected Behavior

When everything is working correctly:

1. **MCP Server Terminal:**

   ```
   [MCP Server] WebSocket server listening on port 3001
   [MCP Server] Frontend connected
   ```

2. **Browser Console:**

   ```
   [WebSocket Bridge] Attempting to connect to: ws://localhost:3001
   [WebSocket Bridge] ✅ Connected to MCP server
   ```

3. **UI Indicator:**

   - 🟢 Green indicator in bottom-left
   - Text: "MCP Connected"
   - No "Reconnect" button visible

4. **Functionality:**
   - Test commands work in browser console
   - Claude Desktop can interact with the scene
   - No error messages in either terminal
