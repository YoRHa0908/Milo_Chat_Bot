'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Send, User, Bot, Sparkles, Users, Heart, Home, MessageCircle } from 'lucide-react'
import Link from 'next/link'


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
    
    // Check if this is a new user (just signed up)
    const isNewUser = localStorage.getItem('milo_is_new_user') === 'true'
    
    if (isNewUser) {
      // Clear the new user flag
      localStorage.removeItem('milo_is_new_user')
      // Update initial message to include user's name
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: `Hi ${storedUserName}! I'm Milo, your AI matchmaking assistant. I'm here to help you discover meaningful connections. Tell me about yourself - what brings you here today?`,
          timestamp: new Date().toISOString()
        }
      ])
    } else {
      // Load previous messages if any
      loadChatHistory(storedUserId, storedUserName)
    }
  }, [router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatHistory = async (userId: string, userName: string) => {
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
      } else {
        // No existing messages, update initial message with user's name
        setMessages([
          {
            id: '1',
            role: 'assistant',
            content: `Hi ${userName}! I'm Milo, your AI matchmaking assistant. I'm here to help you discover meaningful connections. Tell me about yourself - what brings you here today?`,
            timestamp: new Date().toISOString()
          }
        ])
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
    <div className="min-h-screen luxury-gradient">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 glass-effect p-6 rounded-2xl border border-gray-800">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-300 hover:scale-105">
              <Home className="h-6 w-6" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <MessageCircle className="h-10 w-10 text-purple-400" />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Milo Chat</h1>
                <p className="text-sm text-gray-400">Chatting as <span className="text-gray-300 font-medium">{userName}</span></p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <button
              onClick={handleGetMatches}
              disabled={loading || matches.length > 0}
              className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3"
            >
              <Sparkles className="h-5 w-5" />
              <span>Get Matches</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </button>
            
            <Link 
              href="/matches" 
              className="group glass-effect text-gray-300 border border-gray-800 px-8 py-3 rounded-full font-semibold hover:border-purple-500/50 hover:text-white transition-all duration-500 hover:scale-105 flex items-center space-x-3"
            >
              <Users className="h-5 w-5" />
              <span>View Matches</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Container */}
          <div className="lg:col-span-2">
            <div className="luxury-card-gradient rounded-3xl border border-gray-800 h-[700px] flex flex-col luxury-glow">
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="space-y-8">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-3xl p-6 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none border border-purple-500/30'
                            : 'glass-effect text-gray-200 rounded-bl-none border border-gray-800'
                        }`}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`p-2 rounded-full ${
                            message.role === 'user' 
                              ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                              : 'bg-gradient-to-br from-gray-800 to-gray-700'
                          }`}>
                            {message.role === 'user' ? (
                              <User className="h-4 w-4 text-white" />
                            ) : (
                              <Bot className="h-4 w-4 text-purple-300" />
                            )}
                          </div>
                          <span className="text-sm font-medium opacity-90">
                            {message.role === 'user' ? 'You' : 'Milo'}
                          </span>
                          <span className="text-xs opacity-60">
                            {new Date(message.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {loading && (
                    <div className="flex justify-start">
                      <div className="glass-effect text-gray-200 rounded-3xl rounded-bl-none p-6 max-w-[80%] border border-gray-800">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 rounded-full bg-gradient-to-br from-gray-800 to-gray-700">
                            <Bot className="h-4 w-4 text-purple-300" />
                          </div>
                          <span className="text-sm font-medium opacity-90">Milo</span>
                        </div>
                        <div className="flex space-x-2">
                          <div className="h-3 w-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="h-3 w-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="h-3 w-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {showMatches && (
                    <div className="flex justify-start">
                      <div className="bg-gradient-to-r from-purple-900/40 via-purple-800/30 to-pink-900/40 border-2 border-purple-500/30 rounded-3xl p-8 max-w-[80%] luxury-glow">
                        <div className="flex items-center space-x-3 mb-4">
                          <Sparkles className="h-6 w-6 text-yellow-400" />
                          <h3 className="font-semibold text-white text-xl">Ready to find matches?</h3>
                        </div>
                        <p className="text-gray-300 mb-6 leading-relaxed">
                          Based on our conversation, I think I have enough information to help you find compatible connections. Would you like me to suggest some matches for you?
                        </p>
                        <button
                          onClick={handleGetMatches}
                          disabled={loading}
                          className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="relative z-10">{loading ? 'Finding matches...' : 'Yes, find matches!'}</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-800 p-8">
                <div className="flex space-x-6">
                  <div className="flex-1">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type your message here... (Press Enter to send)"
                      className="w-full px-6 py-4 border border-gray-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 resize-none glass-effect text-gray-200 placeholder-gray-500 focus:outline-none transition-all duration-300"
                      rows={3}
                      disabled={loading}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={loading || !input.trim()}
                    className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white p-5 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed self-end"
                  >
                    <Send className="h-6 w-6" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Milo is powered by Mistral AI. Your conversations help improve match suggestions.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar - Matches & Info */}
          <div className="space-y-8">
            {/* User Info Card */}
            <div className="luxury-card-gradient rounded-3xl border border-gray-800 p-8">
              <h3 className="font-semibold text-white mb-6 flex items-center space-x-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-purple-900 to-purple-700 rounded-lg">
                  <User className="h-6 w-6 text-purple-300" />
                </div>
                <span>Your Profile</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Name</p>
                  <p className="font-medium text-white text-lg">{userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-900/40 to-emerald-900/40 text-green-300 px-4 py-2 rounded-full text-sm border border-green-800/50">
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                    <span>Premium Member</span>
                  </div>
                </div>
                <Link 
                  href="/onboarding" 
                  className="block text-center text-purple-400 hover:text-purple-300 text-sm font-medium mt-6 hover:scale-105 transition-transform duration-300"
                >
                  Edit Profile →
                </Link>
              </div>
            </div>

            {/* Matches Card */}
            <div className="luxury-card-gradient rounded-3xl border border-gray-800 p-8">
              <h3 className="font-semibold text-white mb-6 flex items-center space-x-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-pink-900 to-pink-700 rounded-lg">
                  <Heart className="h-6 w-6 text-pink-300" />
                </div>
                <span>Your Matches</span>
              </h3>
              
              {matches.length > 0 ? (
                <div className="space-y-6">
                  {matches.slice(0, 3).map((match) => (
                    <div key={match.id} className="glass-effect border border-gray-800 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-500 group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 bg-gradient-to-br from-purple-900 to-purple-700 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-purple-300" />
                          </div>
                          <div>
                            <p className="font-medium text-white text-lg group-hover:text-purple-300 transition-colors duration-300">{match.matched_user?.name || 'Unknown User'}</p>
                            <p className="text-sm text-gray-400">
                              Match score: <span className="text-purple-300 font-semibold">{(match.match_score * 100).toFixed(0)}%</span>
                            </p>
                          </div>
                        </div>
                        <span className={`text-sm px-3 py-1.5 rounded-full ${
                          match.status === 'pending' 
                            ? 'bg-gradient-to-r from-yellow-900/40 to-amber-900/40 text-yellow-300 border border-yellow-800/50'
                            : 'bg-gradient-to-r from-green-900/40 to-emerald-900/40 text-green-300 border border-green-800/50'
                        }`}>
                          {match.status}
                        </span>
                      </div>
                      {match.matched_user?.interests?.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-400 mb-2">Shared interests:</p>
                          <div className="flex flex-wrap gap-2">
                            {match.matched_user.interests.slice(0, 3).map((interest: string) => (
                              <span key={interest} className="text-sm bg-gradient-to-r from-purple-900/40 to-pink-900/40 text-purple-300 px-3 py-1.5 rounded-full border border-purple-800/50">
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
                      className="block text-center text-purple-400 hover:text-purple-300 text-sm font-medium hover:scale-105 transition-transform duration-300"
                    >
                      View all {matches.length} matches →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="h-20 w-20 bg-gradient-to-br from-gray-900 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-800">
                    <Users className="h-10 w-10 text-gray-500" />
                  </div>
                  <p className="text-gray-400 text-lg mb-4">No matches yet</p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Chat with Milo to help us understand your preferences and find compatible connections.
                  </p>
                </div>
              )}
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-r from-purple-900/40 via-purple-800/30 to-pink-900/40 border-2 border-purple-500/30 rounded-3xl p-8 luxury-glow">
              <h3 className="font-semibold text-white mb-6 text-xl flex items-center space-x-3">
                <Sparkles className="h-6 w-6 text-yellow-400" />
                <span>Chat Tips</span>
              </h3>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start space-x-3">
                  <div className="p-1.5 bg-gradient-to-br from-purple-900 to-purple-700 rounded-lg mt-0.5">
                    <Sparkles className="h-4 w-4 text-purple-300" />
                  </div>
                  <span>Share your interests and hobbies</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="p-1.5 bg-gradient-to-br from-purple-900 to-purple-700 rounded-lg mt-0.5">
                    <Sparkles className="h-4 w-4 text-purple-300" />
                  </div>
                  <span>Talk about what you're looking for in connections</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="p-1.5 bg-gradient-to-br from-purple-900 to-purple-700 rounded-lg mt-0.5">
                    <Sparkles className="h-4 w-4 text-purple-300" />
                  </div>
                  <span>Ask Milo for advice on meeting new people</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="p-1.5 bg-gradient-to-br from-purple-900 to-purple-700 rounded-lg mt-0.5">
                    <Sparkles className="h-4 w-4 text-purple-300" />
                  </div>
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