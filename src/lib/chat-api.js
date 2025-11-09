import { env } from '../env.js'

// Types for better code documentation
/**
 * @typedef {Object} ChatSession
 * @property {string} id - Session ID
 * @property {string} userId - User ID
 * @property {string} title - Session title
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} Message
 * @property {string} id - Message ID
 * @property {string} role - Message role ('user' or 'assistant')
 * @property {Array} parts - Message content parts
 * @property {Date} timestamp - Message timestamp
 * @property {Array} toolEvents - Tool events associated with the message
 */

/**
 * @typedef {Object} ToolEvent
 * @property {string} type - Event type ('functionCall' or 'functionResponse')
 * @property {string} functionName - Function name
 * @property {Object} args - Function arguments
 * @property {Object} result - Function result
 * @property {string} status - Event status
 */

const { FASTAPI_BASE_URL, APP_NAME } = env

/**
 * Generate a unique session ID
 * @returns {string} UUID-like session ID
 */
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

/**
 * Generate a unique user ID (for demo purposes)
 * @returns {string} User ID
 */
export function generateUserId() {
  let userId = localStorage.getItem('4x4builder_user_id')
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('4x4builder_user_id', userId)
  }
  return userId
}

/**
 * Create a new chat session
 * @param {string} userId - User ID
 * @returns {Promise<ChatSession>} Created session
 */
export async function createNewSession(userId) {
  const sessionId = generateSessionId()
  
  try {
    const response = await fetch(
      `${FASTAPI_BASE_URL}/apps/${APP_NAME}/users/${userId}/sessions/${sessionId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Vehicle Customization Session'
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`)
    }

    const session = await response.json()
    return {
      id: sessionId,
      userId,
      title: session.title || 'New Session',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  } catch (error) {
    console.error('Error creating session:', error)
    // Return a local session if API fails
    return {
      id: sessionId,
      userId,
      title: 'New Vehicle Customization Session',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
}

/**
 * Get all chat sessions for a user
 * @param {string} userId - User ID
 * @returns {Promise<ChatSession[]>} Array of sessions
 */
export async function getChatSessions(userId) {
  try {
    const response = await fetch(
      `${FASTAPI_BASE_URL}/apps/${APP_NAME}/users/${userId}/sessions`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch sessions: ${response.statusText}`)
    }

    const sessions = await response.json()
    return sessions.map(session => ({
      ...session,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt)
    }))
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return []
  }
}

/**
 * Get messages for a specific session
 * @param {string} userId - User ID
 * @param {string} sessionId - Session ID
 * @returns {Promise<Message[]>} Array of messages
 */
export async function getSessionMessages(userId, sessionId) {
  try {
    const response = await fetch(
      `${FASTAPI_BASE_URL}/apps/${APP_NAME}/users/${userId}/sessions/${sessionId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.statusText}`)
    }

    const data = await response.json()
    return data.messages || []
  } catch (error) {
    console.error('Error fetching messages:', error)
    return []
  }
}

/**
 * Extract text content from streaming event data
 * @param {unknown} data - Event data
 * @returns {string} Extracted text
 */
function extractTextFromEvent(data) {
  if (typeof data === 'string') {
    return data
  }

  if (data && typeof data === 'object') {
    // Check for direct text field
    if (data.text) {
      return data.text
    }

    // Check for content.parts structure
    if (data.content && Array.isArray(data.content.parts)) {
      return data.content.parts
        .filter(part => part.text)
        .map(part => part.text)
        .join('')
    }

    // Check for top-level parts array
    if (Array.isArray(data.parts)) {
      return data.parts
        .filter(part => part.text)
        .map(part => part.text)
        .join('')
    }

    // Check for delta content (streaming format)
    if (data.delta && data.delta.content) {
      return data.delta.content
    }
  }

  return ''
}

/**
 * Extract tool events from streaming event data
 * @param {unknown} data - Event data
 * @returns {ToolEvent[]} Array of tool events
 */
function extractToolEventsFromEvent(data) {
  const toolEvents = []

  if (data && typeof data === 'object') {
    // Check for function calls
    if (data.functionCall) {
      toolEvents.push({
        type: 'functionCall',
        functionName: data.functionCall.name,
        args: data.functionCall.args,
        status: 'pending'
      })
    }

    // Check for function responses
    if (data.functionResponse) {
      toolEvents.push({
        type: 'functionResponse',
        functionName: data.functionResponse.name,
        result: data.functionResponse.response,
        status: data.functionResponse.status || 'completed'
      })
    }

    // Check for tool_calls array (OpenAI format)
    if (Array.isArray(data.tool_calls)) {
      data.tool_calls.forEach(toolCall => {
        toolEvents.push({
          type: 'functionCall',
          functionName: toolCall.function?.name,
          args: toolCall.function?.arguments,
          status: 'pending'
        })
      })
    }
  }

  return toolEvents
}

/**
 * Send a message with streaming response
 * @param {string} userId - User ID
 * @param {string} sessionId - Session ID
 * @param {string} content - Message content
 * @param {Function} onChunk - Callback for streaming chunks
 * @param {AbortSignal} abortSignal - Abort signal for cancellation
 * @param {Object} vehicleConfig - Current vehicle configuration to send as context
 * @returns {Promise<Message>} Final message
 */
export async function sendMessageStreaming(userId, sessionId, content, onChunk, abortSignal, vehicleConfig = null) {
  const payload = {
    app_name: APP_NAME,
    user_id: userId,
    session_id: sessionId,
    new_message: {
      parts: [{ text: content }],
      role: "user",
    },
    include_json: true, // Request structured JSON output
  }

  // Include vehicle configuration as context if provided
  if (vehicleConfig) {
    payload.vehicle_config = vehicleConfig
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📤 [API] Sending request to backend')
  console.log('🔗 [API] URL:', `${FASTAPI_BASE_URL}/run_sse`)
  console.log('📦 [API] Payload:', JSON.stringify(payload, null, 2))
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {
    const response = await fetch(`${FASTAPI_BASE_URL}/run_sse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(payload),
      signal: abortSignal,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body reader available')
    }

    const decoder = new TextDecoder()
    let accumulatedText = ''
    let allToolEvents = []
    let structuredResponse = null

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const eventData = line.slice(6) // Remove "data: " prefix
            
            if (eventData === '[DONE]') {
              console.log('✅ [API] Stream completed')
              break
            }

            try {
              const parsedData = JSON.parse(eventData)
              console.log('📨 [API] Parsed SSE data:', parsedData)
              
              // Extract text and tool events
              const text = extractTextFromEvent(parsedData)
              const toolEvents = extractToolEventsFromEvent(parsedData)

              if (text) {
                accumulatedText += text
                console.log('📝 [API] Accumulated text:', accumulatedText)
              }

              if (toolEvents.length > 0) {
                allToolEvents.push(...toolEvents)
                console.log('🔧 [API] Tool events found:', toolEvents)
              }

              // Check for structured response
              if (parsedData.structured) {
                console.log('📊 [API] Structured data found in SSE:', parsedData.structured)
                structuredResponse = parsedData.structured
              }

              // Call the chunk callback if provided
              if (onChunk) {
                onChunk({
                  text: text || undefined,
                  toolEvents: toolEvents.length > 0 ? toolEvents : undefined,
                  structured: parsedData.structured || undefined
                })
              }
            } catch (parseError) {
              console.warn('⚠️ [API] Failed to parse SSE data:', parseError, 'Raw data:', eventData)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ [API] Streaming complete!')
    console.log('📝 [API] Final accumulated text:', accumulatedText)
    console.log('🔧 [API] Total tool events:', allToolEvents.length)
    console.log('📊 [API] Structured response:', structuredResponse)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Return the final message
    const finalMessage = {
      id: 'msg_' + Date.now(),
      role: 'assistant',
      parts: [{ text: accumulatedText }],
      timestamp: new Date(),
      toolEvents: allToolEvents,
      structured: structuredResponse
    }

    console.log('📬 [API] Returning final message:', finalMessage)
    return finalMessage

  } catch (error) {
    console.error('Error in streaming request:', error)
    
    // Return error message
    return {
      id: 'msg_' + Date.now(),
      role: 'assistant',
      parts: [{ text: 'Sorry, I encountered an error while processing your request. Please try again.' }],
      timestamp: new Date(),
      toolEvents: []
    }
  }
}

/**
 * Send a simple message (non-streaming fallback)
 * @param {string} userId - User ID
 * @param {string} sessionId - Session ID
 * @param {string} content - Message content
 * @returns {Promise<Message>} Response message
 */
export async function sendMessage(userId, sessionId, content) {
  // For now, use streaming but ignore the chunks
  return sendMessageStreaming(userId, sessionId, content)
}
