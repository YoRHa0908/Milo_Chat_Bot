'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Users, Heart, ArrowRight, Sparkles, Crown, Gem, Shield, Zap } from 'lucide-react'
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
    <div className="min-h-screen luxury-gradient">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between glass-effect p-4 rounded-2xl luxury-glow">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <MessageCircle className="h-10 w-10 text-purple-400" />
              <div className="absolute -top-1 -right-1">
                <Crown className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              </div>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Milo
            </span>
            <span className="text-sm text-gray-400 font-medium px-3 py-1 bg-gray-900/50 rounded-full border border-gray-800">
              PREMIUM
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/admin" className="text-gray-300 hover:text-white transition-colors duration-300 hover:scale-105">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Admin</span>
              </div>
            </Link>
            <ThemeToggle />
            <Link 
              href="/onboarding" 
              className="relative overflow-hidden group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center space-x-3 glass-effect px-6 py-3 rounded-full mb-8 border border-purple-500/20">
            <Sparkles className="h-5 w-5 text-yellow-400" />
            <span className="text-lg font-medium bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Exclusive AI-Powered Matchmaking
            </span>
            <Gem className="h-5 w-5 text-purple-400" />
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-8">
            <span className="block text-gray-100">Discover Elite</span>
            <span className="block shimmer-text">Connections</span>
            <span className="block text-gray-300 text-4xl md:text-5xl mt-4">through Intelligent Conversation</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Milo redefines luxury matchmaking. Engage in meaningful conversations with our premium AI assistant, 
            and experience curated connections that align with your lifestyle and aspirations.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <Link 
              href="/onboarding" 
              className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 text-white px-10 py-5 rounded-2xl text-xl font-semibold hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-purple-600 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10 flex items-center justify-center space-x-3">
                <span>Begin Your Journey</span>
                <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 luxury-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Link>
            <Link 
              href="/chat" 
              className="group glass-effect text-gray-300 border border-gray-800 px-10 py-5 rounded-2xl text-xl font-semibold hover:border-purple-500/50 hover:text-white transition-all duration-500 hover:scale-105"
            >
              <span className="flex items-center justify-center space-x-3">
                <Zap className="h-6 w-6 text-yellow-400" />
                <span>Experience Premium Demo</span>
              </span>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="luxury-card-gradient p-8 rounded-3xl border border-purple-500/10 hover:border-purple-500/30 transition-all duration-500 hover:scale-105 group">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-900 to-purple-700 rounded-xl">
                  <Users className="h-10 w-10 text-purple-300" />
                </div>
                <span className="text-5xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300">{userCount}+</span>
              </div>
              <p className="text-gray-400 text-lg">Exclusive Members</p>
              <div className="mt-4 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            
            <div className="luxury-card-gradient p-8 rounded-3xl border border-pink-500/10 hover:border-pink-500/30 transition-all duration-500 hover:scale-105 group">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-pink-900 to-pink-700 rounded-xl">
                  <Heart className="h-10 w-10 text-pink-300" />
                </div>
                <span className="text-5xl font-bold text-white group-hover:text-pink-300 transition-colors duration-300">{matchCount}+</span>
              </div>
              <p className="text-gray-400 text-lg">Successful Matches</p>
              <div className="mt-4 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            
            <div className="luxury-card-gradient p-8 rounded-3xl border border-blue-500/10 hover:border-blue-500/30 transition-all duration-500 hover:scale-105 group">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl">
                  <MessageCircle className="h-10 w-10 text-blue-300" />
                </div>
                <span className="text-5xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">24/7</span>
              </div>
              <p className="text-gray-400 text-lg">Premium AI Support</p>
              <div className="mt-4 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>

          {/* How It Works */}
          <div className="text-left max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-12 text-center">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                The Milo Experience
              </span>
            </h2>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-6 glass-effect p-6 rounded-2xl border border-gray-800 hover:border-purple-500/30 transition-all duration-500 group">
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-br from-purple-900 to-purple-700 text-purple-300 rounded-full p-4 text-2xl font-bold">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">Share Your Story</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    Engage in authentic conversations with Milo about your aspirations, lifestyle preferences, 
                    and what you seek in meaningful connections.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-6 glass-effect p-6 rounded-2xl border border-gray-800 hover:border-purple-500/30 transition-all duration-500 group">
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-br from-purple-900 to-purple-700 text-purple-300 rounded-full p-4 text-2xl font-bold">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">AI-Powered Analysis</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    Our advanced Mistral AI analyzes your conversation patterns, personality traits, 
                    and compatibility factors to understand you at a deeper level.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-6 glass-effect p-6 rounded-2xl border border-gray-800 hover:border-purple-500/30 transition-all duration-500 group">
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-br from-purple-900 to-purple-700 text-purple-300 rounded-full p-4 text-2xl font-bold">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">Curated Matching</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    Receive personalized match suggestions from our exclusive community, 
                    carefully selected based on compatibility, shared values, and lifestyle alignment.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-6 glass-effect p-6 rounded-2xl border border-gray-800 hover:border-purple-500/30 transition-all duration-500 group">
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-br from-purple-900 to-purple-700 text-purple-300 rounded-full p-4 text-2xl font-bold">
                    4
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">Connect & Elevate</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    Initiate meaningful conversations with your matches in our premium chat environment, 
                    building connections that enrich your personal and professional life.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-gray-800/50">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 mb-6">
            <MessageCircle className="h-6 w-6 text-purple-400" />
            <span className="text-2xl font-bold text-white">Milo</span>
            <span className="text-sm text-gray-400 font-medium px-2 py-1 bg-gray-900/50 rounded-full border border-gray-800">
              PREMIUM
            </span>
          </div>
          <p className="text-gray-400 text-lg mb-4">Crafted with excellence for discerning individuals</p>
          <p className="text-gray-500 text-sm">Powered by Next.js, Supabase, and Mistral AI • Built for the Lythe.ai interview challenge</p>
          <div className="mt-6 flex justify-center space-x-4">
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          </div>
        </div>
      </footer>
    </div>
  )
}