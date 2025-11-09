# 🔧 WebSocket Infinite Loop Fix

## Problem Identified

The WebSocket connection was in an **infinite loop** of connecting and disconnecting, causing:
- Repeated "Frontend connected" and "Frontend disconnected" logs
- Unstable MCP connection
- Connection state constantly changing
- Poor user experience

## Root Cause

The issue was in `components/App.jsx`:

```javascript
// BEFORE (BROKEN):
useEffect(() => {
    websocketBridge.connect(wsUrl)
    websocketBridge.onConnectionChange((isConnected) => {
        setMcpConnected(isConnected)
    })
    return () => {
        websocketBridge.disconnect()
    }
}, [mcpConnected])  // ❌ THIS WAS THE PROBLEM!
```

### Why This Caused an Infinite Loop:

1. The `useEffect` had `mcpConnected` in its dependency array
2. When `mcpConnected` changed, the effect re-ran
3. Re-running the effect called `websocketBridge.connect()` again
4. The cleanup function called `disconnect()`, changing `mcpConnected` to `false`
5. This triggered the effect again → **infinite loop!**

## Solution Applied

### Fix #1: Remove Dependency from useEffect

Changed the dependency array from `[mcpConnected]` to `[]`:

```javascript
// AFTER (FIXED):
useEffect(() => {
    websocketBridge.connect(wsUrl)
    const removeListener = websocketBridge.onConnectionChange((isConnected) => {
        setMcpConnected(isConnected)
    })
    return () => {
        removeListener()
        websocketBridge.disconnect()
    }
}, [])  // ✅ Empty array - runs only once on mount
```

**Why this works:**
- Effect runs **only once** when component mounts
- Connection stays stable throughout component lifetime
- No re-initialization on state changes

### Fix #2: Added Listener Cleanup

Improved `websocket-bridge.js` to return a cleanup function from `onConnectionChange()`:

```javascript
// BEFORE:
onConnectionChange(callback) {
    this.connectionListeners.push(callback)
}

// AFTER:
onConnectionChange(callback) {
    this.connectionListeners.push(callback)
    
    // Return cleanup function
    return () => {
        const index = this.connectionListeners.indexOf(callback)
        if (index > -1) {
            this.connectionListeners.splice(index, 1)
        }
    }
}
```

**Why this matters:**
- Prevents memory leaks
- Properly removes listeners on component unmount
- Ensures clean state management

## Testing the Fix

### Before the Fix:
```
[MCP Server] Frontend connected
[MCP Server] Frontend disconnected
[MCP Server] Frontend connected
[MCP Server] Frontend disconnected
[MCP Server] Frontend connected
...endless loop...
```

### After the Fix:
```
[MCP Server] Frontend connected
...stays connected...
```

## How to Verify

1. **Restart the MCP Server:**
   ```bash
   npm run mcp
   ```

2. **Restart the Frontend:**
   ```bash
   npm run dev
   ```

3. **Open Browser:**
   - Go to http://localhost:5173
   - Check bottom-left corner shows "🟢 MCP Connected"

4. **Check Console Logs:**
   
   **Browser Console (F12):**
   ```
   [App] Connecting to MCP server at: ws://localhost:3001
   [WebSocket Bridge] ✅ Connected to MCP server
   [App] MCP connection status changed: true
   ```

   **MCP Server Terminal:**
   ```
   [MCP Server] Frontend connected
   (should stay connected - no disconnect messages!)
   ```

## What Was Changed

### Files Modified:
1. ✅ `components/App.jsx` - Fixed useEffect dependency array
2. ✅ `src/lib/websocket-bridge.js` - Added listener cleanup function

### Lines Changed:
- `App.jsx` line 50: Changed `}, [mcpConnected])` to `}, [])`
- `App.jsx` line 31: Added `const removeListener = ` to store cleanup function
- `App.jsx` line 38: Added `removeListener()` to cleanup
- `websocket-bridge.js` lines 292-304: Added return cleanup function

## Expected Behavior Now

✅ **Connection establishes once** when page loads  
✅ **Stays connected** throughout session  
✅ **No repeated connect/disconnect** messages  
✅ **Clean disconnection** when page closes  
✅ **Automatic reconnection** if server restarts (existing feature)  

## Additional Notes

- The periodic status check was removed as it's no longer needed
- The heartbeat mechanism in `websocket-bridge.js` still runs every 10 seconds to verify connection health
- This is separate from the connection initialization and doesn't trigger reconnects unless actually needed

## If Issues Persist

If you still see connection issues after this fix:

1. **Clear browser cache** and refresh (Cmd/Ctrl + Shift + R)
2. **Check no other tabs** have the app open
3. **Verify MCP server is running** on port 3001
4. **Check for firewall/antivirus** blocking WebSocket connections
5. **Look for errors** in browser console that weren't there before

The infinite loop issue should now be **completely resolved**! 🎉

