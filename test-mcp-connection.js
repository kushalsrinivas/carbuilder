#!/usr/bin/env node

/**
 * MCP Connection Test Script
 * 
 * This script tests the MCP server's WebSocket connection
 * to help diagnose connection issues.
 */

import WebSocket from 'ws'

const WS_URL = 'ws://localhost:3001'
const TEST_TIMEOUT = 5000

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('  MCP Connection Test')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('')
console.log('Testing connection to:', WS_URL)
console.log('')

const ws = new WebSocket(WS_URL)
let isConnected = false
let testPassed = false

const timeout = setTimeout(() => {
  if (!isConnected) {
    console.error('❌ TEST FAILED: Connection timeout')
    console.error('')
    console.error('Possible issues:')
    console.error('  1. MCP server is not running')
    console.error('  2. Server is running on a different port')
    console.error('  3. Firewall is blocking the connection')
    console.error('')
    console.error('Solution:')
    console.error('  Run: npm run mcp')
    console.error('  Or: node src/mcp/server.js')
    process.exit(1)
  }
}, TEST_TIMEOUT)

ws.on('open', () => {
  console.log('✅ WebSocket connection opened')
  isConnected = true
  clearTimeout(timeout)
  
  // Test sending a command
  console.log('📤 Sending test command: getSceneState')
  const testMessage = {
    type: 'command',
    id: 'test_' + Date.now(),
    method: 'getSceneState',
    params: {}
  }
  
  ws.send(JSON.stringify(testMessage))
  
  // Wait for response
  setTimeout(() => {
    if (!testPassed) {
      console.log('')
      console.log('⚠️  No response received from frontend')
      console.log('')
      console.log('This is expected if the frontend is not running.')
      console.log('The MCP server is working, but needs the frontend to be open.')
      console.log('')
      console.log('Next steps:')
      console.log('  1. Start frontend: npm run dev')
      console.log('  2. Open browser to: http://localhost:5173')
      console.log('  3. Try the MCP tool again')
      ws.close()
      process.exit(0)
    }
  }, 2000)
})

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString())
    console.log('📥 Received response:', message.type)
    
    if (message.type === 'response') {
      console.log('')
      console.log('✅ TEST PASSED!')
      console.log('')
      console.log('Connection is working correctly.')
      console.log('MCP server ↔ Frontend communication is functional.')
      testPassed = true
      ws.close()
      process.exit(0)
    }
  } catch (error) {
    console.error('Failed to parse message:', error)
  }
})

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message)
  console.error('')
  console.error('Make sure the MCP server is running:')
  console.error('  npm run mcp')
  process.exit(1)
})

ws.on('close', () => {
  if (!testPassed && isConnected) {
    console.log('')
    console.log('Connection closed.')
  }
})

