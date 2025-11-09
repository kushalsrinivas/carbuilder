import { useState, useEffect, useRef } from 'react'
import { 
    createNewSession, 
    sendMessageStreaming, 
    generateUserId,
    getSessionMessages 
} from '../src/lib/chat-api.js'
import { processAgentResponse } from '../src/lib/vehicle-update-handler.js'
import useGameStore from '../store/gameStore'

const ChatInterface = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            content: 'Hi! I\'m your AI assistant. I can help you customize your vehicle. Try asking me something like "Make the vehicle red" or "Add bigger tires".'
        }
    ])
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [currentSession, setCurrentSession] = useState(null)
    const [userId] = useState(() => generateUserId())
    const [streamingMessage, setStreamingMessage] = useState('')
    const abortControllerRef = useRef(null)
    const messagesEndRef = useRef(null)

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, streamingMessage])

    // Initialize session when chat is opened
    useEffect(() => {
        if (isOpen && !currentSession) {
            initializeSession()
        }
    }, [isOpen, currentSession])

    const initializeSession = async () => {
        try {
            const session = await createNewSession(userId)
            setCurrentSession(session)
            
            // Load existing messages if any
            const existingMessages = await getSessionMessages(userId, session.id)
            if (existingMessages.length > 0) {
                const formattedMessages = existingMessages.map(msg => ({
                    id: msg.id,
                    type: msg.role === 'user' ? 'user' : 'ai',
                    content: msg.parts?.[0]?.text || '',
                    toolEvents: msg.toolEvents || []
                }))
                setMessages(prev => [...prev.slice(0, 1), ...formattedMessages]) // Keep welcome message
            }
        } catch (error) {
            console.error('Failed to initialize session:', error)
        }
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!inputValue.trim() || isLoading || !currentSession) return

        const messageContent = inputValue.trim()
        setInputValue('')
        setIsLoading(true)
        setStreamingMessage('')

        // Add user message
        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: messageContent
        }
        
        setMessages(prev => [...prev, userMessage])

        // Create abort controller for this request
        abortControllerRef.current = new AbortController()

        try {
            // Get current vehicle configuration to send as context
            const currentVehicleConfig = useGameStore.getState().currentVehicle

            // Add placeholder for AI response
            const aiMessageId = Date.now() + 1
            setMessages(prev => [...prev, {
                id: aiMessageId,
                type: 'ai',
                content: '',
                isStreaming: true
            }])

            let accumulatedText = ''
            const toolEvents = []
            let structuredData = null

            const finalMessage = await sendMessageStreaming(
                userId,
                currentSession.id,
                messageContent,
                (chunk) => {
                    // Handle streaming chunks
                    console.log('📦 [Chat] Received chunk:', chunk)
                    
                    if (chunk.text) {
                        accumulatedText += chunk.text
                        setStreamingMessage(accumulatedText)
                    }
                    
                    if (chunk.toolEvents) {
                        toolEvents.push(...chunk.toolEvents)
                        console.log('🔧 [Chat] Tool events:', chunk.toolEvents)
                    }

                    // Store structured data when it arrives
                    if (chunk.structured) {
                        structuredData = chunk.structured
                        console.log('📊 [Chat] Structured data received in chunk:', chunk.structured)
                    }
                },
                abortControllerRef.current.signal,
                currentVehicleConfig // Pass vehicle config as context
            )

            console.log('✅ [Chat] Final message received:', finalMessage)
            console.log('📋 [Chat] Final message text:', finalMessage.parts?.[0]?.text)
            console.log('📊 [Chat] Final message structured:', finalMessage.structured)

            // Process structured response to update vehicle
            if (finalMessage.structured) {
                console.log('🚀 [Chat] Processing structured response...')
                console.log('📊 [Chat] Vehicle updates:', finalMessage.structured.vehicle_updates)
                console.log('📊 [Chat] Final vehicle state:', finalMessage.structured.final_vehicle_state)
                console.log('❌ [Chat] Error:', finalMessage.structured.error)
                
                await processAgentResponse(finalMessage.structured)
            } else {
                console.warn('⚠️ [Chat] No structured data in response! Full response:', finalMessage)
            }

            // Update the final message
            setMessages(prev => prev.map(msg => 
                msg.id === aiMessageId 
                    ? {
                        ...msg,
                        content: finalMessage.parts?.[0]?.text || accumulatedText,
                        toolEvents: finalMessage.toolEvents || toolEvents,
                        structured: finalMessage.structured,
                        isStreaming: false
                    }
                    : msg
            ))

        } catch (error) {
            console.error('Error sending message:', error)
            
            // Show error message
            setMessages(prev => [...prev, {
                id: Date.now() + 2,
                type: 'ai',
                content: 'Sorry, I encountered an error while processing your request. Please try again.',
                isError: true
            }])
        } finally {
            setIsLoading(false)
            setStreamingMessage('')
            abortControllerRef.current = null
        }
    }

    const handleStopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            setIsLoading(false)
            setStreamingMessage('')
        }
    }

    return (
        <div className={`fixed right-0 top-0 h-full bg-black/90 text-white transition-all duration-300 z-40 ${isOpen ? 'w-80' : 'w-12'}`}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full bg-black/80 text-white p-2 rounded-l-lg hover:bg-black/90 transition-colors"
                title={isOpen ? 'Close Chat' : 'Open AI Chat'}
            >
                {isOpen ? '→' : '💬'}
            </button>

            {isOpen && (
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-700">
                        <h3 className="text-lg font-semibold">AI Assistant</h3>
                        <p className="text-sm text-gray-400">Ask me to customize your vehicle</p>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-lg ${
                                        message.type === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : message.isError
                                            ? 'bg-red-600 text-white'
                                            : 'bg-gray-700 text-gray-100'
                                    }`}
                                >
                                    <p className="text-sm">
                                        {message.isStreaming && streamingMessage 
                                            ? streamingMessage 
                                            : message.content
                                        }
                                        {message.isStreaming && (
                                            <span className="inline-block w-2 h-4 bg-blue-400 ml-1 animate-pulse">|</span>
                                        )}
                                    </p>
                                    
                                    {/* Show vehicle updates if any */}
                                    {message.structured?.vehicle_updates && message.structured.vehicle_updates.length > 0 && (
                                        <div className="mt-2 text-xs text-gray-400">
                                            <details className="cursor-pointer">
                                                <summary className="text-green-400">
                                                    ✓ Applied {message.structured.vehicle_updates.length} change{message.structured.vehicle_updates.length > 1 ? 's' : ''}
                                                </summary>
                                                <div className="mt-1 space-y-1">
                                                    {message.structured.vehicle_updates.map((update, idx) => (
                                                        <div key={idx} className="bg-gray-800 p-2 rounded text-xs">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-green-400">✓</span>
                                                                <span className="text-gray-300">{update.description}</span>
                                                            </div>
                                                            <div className="mt-1 text-gray-500 text-xs">
                                                                {update.command_type}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </details>
                                        </div>
                                    )}
                                    
                                    {/* Show tool events if any */}
                                    {message.toolEvents && message.toolEvents.length > 0 && (
                                        <div className="mt-2 text-xs text-gray-400">
                                            <details className="cursor-pointer">
                                                <summary>Tool Events ({message.toolEvents.length})</summary>
                                                <div className="mt-1 space-y-1">
                                                    {message.toolEvents.map((event, idx) => (
                                                        <div key={idx} className="bg-gray-800 p-2 rounded text-xs">
                                                            <strong>{event.type}:</strong> {event.functionName}
                                                            {event.status && (
                                                                <span className={`ml-2 px-1 rounded text-xs ${
                                                                    event.status === 'completed' ? 'bg-green-600' :
                                                                    event.status === 'pending' ? 'bg-yellow-600' :
                                                                    'bg-red-600'
                                                                }`}>
                                                                    {event.status}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </details>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                        {/* Connection Status */}
                        {currentSession && (
                            <div className="mb-2 text-xs text-gray-500">
                                Connected to session: {currentSession.id.slice(-8)}
                            </div>
                        )}
                        
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={isLoading ? "AI is thinking..." : "Ask me to customize your vehicle..."}
                                disabled={isLoading}
                                className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            
                            {isLoading ? (
                                <button
                                    type="button"
                                    onClick={handleStopGeneration}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-medium transition-colors"
                                >
                                    Stop
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || !currentSession}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-white font-medium transition-colors"
                                >
                                    Send
                                </button>
                            )}
                        </div>
                        
                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="mt-2 flex items-center text-xs text-gray-400">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400 mr-2"></div>
                                AI is processing your request...
                            </div>
                        )}
                    </form>
                </div>
            )}
        </div>
    )
}

export default ChatInterface
