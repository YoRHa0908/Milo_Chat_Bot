'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Users, Heart, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function Home() {
  const [userCount, setUserCount] = useState(0)
  const [matchCount, setMatchCount] = useState(0)

  useEffect(() => {
    // Simulate fetching stats
    const interval = setInterval(() => {
      setUserCount(prev => Math.min(prev + 1, 127))
      setMatchCount(prev => Math.min(prev + 1, 42))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Milo</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Admin
            </Link>
            <ThemeToggle />
            <Link 
              href="/onboarding" 
              className="bg-purple-600 dark:bg-purple-700 text-white px-6 py-2 rounded-full hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI-Powered Matchmaking</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Discover meaningful connections
            <span className="block text-purple-600 dark:text-purple-400">through conversation</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Milo is your AI matchmaking assistant. Chat naturally, share your interests, 
            and let our AI find you compatible connections based on real conversations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link 
              href="/onboarding" 
              className="bg-purple-600 dark:bg-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Start Chatting</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              href="/chat" 
              className="bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border-2 border-purple-200 dark:border-purple-800 px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors"
            >
              Try Demo Chat
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm dark:shadow-gray-900/50">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{userCount}+</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Active Users</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm dark:shadow-gray-900/50">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Heart className="h-8 w-8 text-pink-600 dark:text-pink-400" />
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{matchCount}+</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Successful Matches</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm dark:shadow-gray-900/50">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <MessageCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <span className="text-3xl font-bold text-gray-900 dark:text-white">24/7</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">AI Chat Support</p>
            </div>
          </div>

          {/* How It Works */}
          <div className="text-left max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">How Milo Works</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full p-3">
                  <span className="font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Share Your Story</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Chat with Milo about your interests, preferences, and what you're looking for in connections.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full p-3">
                  <span className="font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">AI-Powered Analysis</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Our Mistral AI analyzes your conversation to understand your personality and preferences.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full p-3">
                  <span className="font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Smart Matching</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Get personalized match suggestions based on compatibility with other users.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full p-3">
                  <span className="font-bold">4</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Connect & Chat</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Start conversations with your matches and build meaningful connections.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>Built with ❤️ for the Lythe.ai interview challenge</p>
          <p className="text-sm mt-2">Powered by Next.js, Supabase, and Mistral AI</p>
        </div>
      </footer>
    </div>
  )
}