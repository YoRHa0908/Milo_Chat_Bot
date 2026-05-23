'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Send, User, Bot, Sparkles, Users, Heart, Home, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function ChatPage() {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi there! I'm Milo, your AI matchmaking assistant. I'm here to help you discover meaningful connections. Tell me about yourself - what brings you here today?",
      timestamp: new Date().toISOString()
    }
  ])
  
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [sessionId, setSessionId] = useState<string>('')
  const [showMatches, setShowMatches] = useState(false)
  const [matches, setMatches] = useState<any[]>([])

  useEffect(() => {
    // Get user from localStorage (demo purposes)
    const storedUserId = localStorage.getItem('milo_user_id')
    const storedUserName = localStorage.getItem('milo_user_name')
    
    if (!storedUserId || !storedUserName) {
      router.push('/onboarding')
      return
    }
    
    setUserId(storedUserId)
    setUserName(storedUserName)
    
    // Load previous messages if any
    loadChatHistory(storedUserId)
  }, [router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatHistory = async (userId: string) => {
    try {
      const response = await fetch(`/api/chat?userId=${userId}`)
      const data = await response.json()
      
      if (response.ok && data.messages && data.messages.length > 0) {
        const formattedMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.created_at
        }))
        setMessages(formattedMessages)
        
        // Clear any invalid sessionId
        setSessionId('')
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    
    // Add user message to UI immediately
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }
    
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          userId: userId,
          sessionId: sessionId || undefined
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        const aiMsg: Message = {
          id: Date.now().toString() + '-ai',
          role: 'assistant',
          content: data.response,
          timestamp: data.timestamp
        }
        
        setMessages(prev => [...prev, aiMsg])
        
        if (data.sessionId && !sessionId) {
          setSessionId(data.sessionId)
        }
        
        // Check if we should suggest getting matches
        if (messages.length >= 3 && !showMatches) {
          setTimeout(() => {
            setShowMatches(true)
          }, 1000)
        }
      } else {
        throw new Error(data.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Add error message
      const errorMsg: Message = {
        id: Date.now().toString() + '-error',
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleGetMatches = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      const data = await response.json()
      
      if (response.ok) {
        setMatches(data.matches || [])
        
        // Add match suggestion message
        const matchMsg: Message = {
          id: Date.now().toString() + '-matches',
          role: 'assistant',
          content: `Great! I've found ${data.matches?.length || 0} potential matches for you based on our conversation. ${data.reasoning ? `Here's why I think these could be good connections: ${data.reasoning}` : ''}`,
          timestamp: new Date().toISOString()
        }
        
        setMessages(prev => [...prev, matchMsg])
        setShowMatches(false)
      } else {
        throw new Error(data.error || 'Failed to get matches')
      }
    } catch (error) {
      console.error('Error getting matches:', error)
      alert('Failed to get matches. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              <Home className="h-5 w-5" />
            </Link>
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Milo Chat</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Chatting as {userName}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={handleGetMatches}
              disabled={loading || matches.length > 0}
              className="bg-purple-600 dark:bg-purple-700 text-white px-6 py-2 rounded-full hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>Get Matches</span>
            </button>
            
            <Link 
              href="/matches" 
              className="bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 px-6 py-2 rounded-full hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>View Matches</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Container */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/50 h-[600px] flex flex-col">
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          message.role === 'user'
                            ? 'bg-purple-600 dark:bg-purple-700 text-white rounded-br-none'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`p-1 rounded-full ${
                            message.role === 'user' ? 'bg-purple-500 dark:bg-purple-600' : 'bg-gray-200 dark:bg-gray-600'
                          }`}>
                            {message.role === 'user' ? (
                              <User className="h-3 w-3 text-white" />
                            ) : (
                              <Bot className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                            )}
                          </div>
                          <span className="text-xs opacity-75">
                            {message.role === 'user' ? 'You' : 'Milo'}
                          </span>
                          <span className="text-xs opacity-50">
                            {new Date(message.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-none p-4 max-w-[80%]">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="p-1 rounded-full bg-gray-200 dark:bg-gray-600">
                            <Bot className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                          </div>
                          <span className="text-xs opacity-75">Milo</span>
                        </div>
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {showMatches && (
                    <div className="flex justify-start">
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-6 max-w-[80%]">
                        <div className="flex items-center space-x-2 mb-3">
                          <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          <h3 className="font-semibold text-purple-800 dark:text-purple-300">Ready to find matches?</h3>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          Based on our conversation, I think I have enough information to help you find compatible connections. Would you like me to suggest some matches for you?
                        </p>
                        <button
                          onClick={handleGetMatches}
                          disabled={loading}
                          className="bg-purple-600 dark:bg-purple-700 text-white px-6 py-2 rounded-full hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Finding matches...' : 'Yes, find matches!'}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-6">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type your message here... (Press Enter to send)"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      rows={3}
                      disabled={loading}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={loading || !input.trim()}
                    className="bg-purple-600 dark:bg-purple-700 text-white p-4 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Milo is powered by Mistral AI. Your conversations help improve match suggestions.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar - Matches & Info */}
          <div className="space-y-6">
            {/* User Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/50 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span>Your Profile</span>
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <div className="inline-flex items-center space-x-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full text-xs">
                    <div className="h-2 w-2 bg-green-500 dark:bg-green-400 rounded-full" />
                    <span>Active</span>
                  </div>
                </div>
                <Link 
                  href="/onboarding" 
                  className="block text-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium mt-4"
                >
                  Edit Profile →
                </Link>
              </div>
            </div>

            {/* Matches Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/50 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Heart className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                <span>Your Matches</span>
              </h3>
              
              {matches.length > 0 ? (
                <div className="space-y-4">
                  {matches.slice(0, 3).map((match) => (
                    <div key={match.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{match.matched_user?.name || 'Unknown User'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Match score: {(match.match_score * 100).toFixed(0)}%
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          match.status === 'pending' 
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        }`}>
                          {match.status}
                        </span>
                      </div>
                      {match.matched_user?.interests?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Shared interests:</p>
                          <div className="flex flex-wrap gap-1">
                            {match.matched_user.interests.slice(0, 3).map((interest: string) => (
                              <span key={interest} className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {matches.length > 3 && (
                    <Link 
                      href="/matches" 
                      className="block text-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium"
                    >
                      View all {matches.length} matches →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No matches yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Chat with Milo to help us understand your preferences and find compatible connections.
                  </p>
                </div>
              )}
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-800 rounded-2xl p-6">
              <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-3">Chat Tips</h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start space-x-2">
                  <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <span>Share your interests and hobbies</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <span>Talk about what you're looking for in connections</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <span>Ask Milo for advice on meeting new people</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <span>The more you chat, the better your matches will be</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}