'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Heart, MessageCircle, Check, X, Home, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

type Match = {
  id: string
  user_id: string
  matched_user_id: string
  match_score: number
  status: 'pending' | 'accepted' | 'rejected' | 'blocked'
  created_at: string
  updated_at: string
  matched_user?: {
    id: string
    name: string
    age: number | null
    location: string | null
    bio: string | null
    interests: string[]
    looking_for: string[]
  }
}

export default function MatchesPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted'>('all')
  const [updatingMatchId, setUpdatingMatchId] = useState<string | null>(null)

  useEffect(() => {
    const storedUserId = localStorage.getItem('milo_user_id')
    
    if (!storedUserId) {
      router.push('/onboarding')
      return
    }
    
    setUserId(storedUserId)
    loadMatches(storedUserId)
  }, [router])

  const loadMatches = async (userId: string) => {
    setLoading(true)
    
    try {
      const response = await fetch(`/api/matches?userId=${userId}`)
      const data = await response.json()
      
      if (response.ok) {
        setMatches(data.matches || [])
      } else {
        console.error('Error loading matches:', data.error)
      }
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateMatchStatus = async (matchId: string, status: 'accepted' | 'rejected' | 'blocked') => {
    setUpdatingMatchId(matchId)
    
    try {
      const response = await fetch('/api/matches', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, status })
      })

      const data = await response.json()
      
      if (response.ok) {
        // Update local state
        setMatches(prev => prev.map(match => 
          match.id === matchId ? { ...match, status } : match
        ))
      } else {
        console.error('Error updating match:', data.error)
        alert('Failed to update match status')
      }
    } catch (error) {
      console.error('Error updating match:', error)
      alert('Failed to update match status')
    } finally {
      setUpdatingMatchId(null)
    }
  }

  const handleGetNewMatches = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      const data = await response.json()
      
      if (response.ok) {
        // Reload matches
        loadMatches(userId)
        
        if (data.matches?.length > 0) {
          alert(`Found ${data.matches.length} new matches! ${data.reasoning ? `\n\n${data.reasoning}` : ''}`)
        } else {
          alert('No new matches found at the moment. Try chatting more with Milo!')
        }
      } else {
        throw new Error(data.error || 'Failed to get matches')
      }
    } catch (error) {
      console.error('Error getting matches:', error)
      alert('Failed to get new matches. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredMatches = matches.filter(match => {
    if (activeTab === 'all') return true
    return match.status === activeTab
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-gradient-to-r from-green-900/40 to-emerald-900/40 text-green-300 border border-green-800/50'
      case 'rejected': return 'bg-gradient-to-r from-red-900/40 to-rose-900/40 text-red-300 border border-red-800/50'
      case 'blocked': return 'bg-gradient-to-r from-gray-900/40 to-gray-800/40 text-gray-300 border border-gray-800/50'
      default: return 'bg-gradient-to-r from-yellow-900/40 to-amber-900/40 text-yellow-300 border border-yellow-800/50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <Check className="h-4 w-4" />
      case 'rejected': return <X className="h-4 w-4" />
      default: return <Heart className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen luxury-gradient">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 glass-effect p-8 rounded-3xl border border-gray-800">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-300 hover:scale-105">
              <Home className="h-6 w-6" />
            </Link>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Heart className="h-12 w-12 text-pink-400" />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Your Matches</h1>
                <p className="text-gray-400 text-lg">Discover and connect with compatible people</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <ThemeToggle />
            <Link 
              href="/chat" 
              className="group glass-effect text-gray-300 border border-gray-800 px-8 py-3 rounded-full font-semibold hover:border-purple-500/50 hover:text-white transition-all duration-500 hover:scale-105 flex items-center space-x-3"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Back to Chat</span>
            </Link>
            
            <button
              onClick={handleGetNewMatches}
              disabled={loading}
              className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3"
            >
              <Sparkles className="h-5 w-5" />
              <span>Find New Matches</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="luxury-card-gradient rounded-3xl border border-gray-800 p-8 hover:border-purple-500/30 transition-all duration-500 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Matches</p>
                <p className="text-4xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300">{matches.length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-900 to-purple-700 rounded-xl">
                <Users className="h-8 w-8 text-purple-300" />
              </div>
            </div>
            <div className="mt-4 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
          
          <div className="luxury-card-gradient rounded-3xl border border-gray-800 p-8 hover:border-yellow-500/30 transition-all duration-500 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending</p>
                <p className="text-4xl font-bold text-white group-hover:text-yellow-300 transition-colors duration-300">
                  {matches.filter(m => m.status === 'pending').length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-yellow-900 to-yellow-700 rounded-xl">
                <Heart className="h-8 w-8 text-yellow-300" />
              </div>
            </div>
            <div className="mt-4 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
          
          <div className="luxury-card-gradient rounded-3xl border border-gray-800 p-8 hover:border-green-500/30 transition-all duration-500 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Accepted</p>
                <p className="text-4xl font-bold text-white group-hover:text-green-300 transition-colors duration-300">
                  {matches.filter(m => m.status === 'accepted').length}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-900 to-green-700 rounded-xl">
                <Check className="h-8 w-8 text-green-300" />
              </div>
            </div>
            <div className="mt-4 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
          
          <div className="luxury-card-gradient rounded-3xl border border-gray-800 p-8 hover:border-pink-500/30 transition-all duration-500 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg. Match Score</p>
                <p className="text-4xl font-bold text-white group-hover:text-pink-300 transition-colors duration-300">
                  {matches.length > 0 
                    ? `${(matches.reduce((acc, m) => acc + m.match_score, 0) / matches.length * 100).toFixed(0)}%`
                    : '0%'
                  }
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-pink-900 to-pink-700 rounded-xl">
                <Sparkles className="h-8 w-8 text-pink-300" />
              </div>
            </div>
            <div className="mt-4 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass-effect rounded-2xl border border-gray-800 mb-8">
          <div className="flex">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-5 text-center font-medium text-lg ${
                activeTab === 'all'
                  ? 'text-white bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white transition-colors duration-300'
              }`}
            >
              All Matches
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-5 text-center font-medium text-lg ${
                activeTab === 'pending'
                  ? 'text-white bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white transition-colors duration-300'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab('accepted')}
              className={`flex-1 py-5 text-center font-medium text-lg ${
                activeTab === 'accepted'
                  ? 'text-white bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white transition-colors duration-300'
              }`}
            >
              Accepted
            </button>
          </div>
        </div>

        {/* Matches List */}
        <div className="luxury-card-gradient rounded-3xl border border-gray-800 p-8">
          {loading ? (
            <div className="text-center py-16">
              <div className="h-16 w-16 border-4 border-purple-800 border-t-purple-400 rounded-full animate-spin mx-auto mb-6" />
              <p className="text-gray-400 text-lg">Loading matches...</p>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-20 w-20 bg-gradient-to-br from-gray-900 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-800">
                <Users className="h-10 w-10 text-gray-500" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">No matches found</h3>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                {activeTab === 'all' 
                  ? "You don't have any matches yet. Chat with Milo to help us understand your preferences."
                  : `You don't have any ${activeTab} matches.`
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  href="/chat"
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
                >
                  <span className="relative z-10">Chat with Milo</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Link>
                <button
                  onClick={handleGetNewMatches}
                  className="group glass-effect text-gray-300 border border-gray-800 px-8 py-4 rounded-full font-semibold hover:border-purple-500/50 hover:text-white transition-all duration-500 hover:scale-105"
                >
                  Find New Matches
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMatches.map((match) => (
                <div key={match.id} className="glass-effect border border-gray-800 rounded-3xl p-8 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-500 group">
                  {/* Match Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-14 w-14 bg-gradient-to-br from-purple-900 to-pink-900 rounded-full flex items-center justify-center">
                        <Users className="h-7 w-7 text-purple-300" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-xl group-hover:text-purple-300 transition-colors duration-300">
                          {match.matched_user?.name || 'Unknown User'}
                        </h3>
                        <div className="flex items-center space-x-3 mt-2">
                          <span className={`text-sm px-3 py-1.5 rounded-full flex items-center space-x-2 ${getStatusColor(match.status)}`}>
                            {getStatusIcon(match.status)}
                            <span className="capitalize">{match.status}</span>
                          </span>
                          <span className="text-sm text-gray-400">
                            <span className="text-purple-300 font-semibold">{(match.match_score * 100).toFixed(0)}%</span> match
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Match Details */}
                  <div className="space-y-4 mb-8">
                    {match.matched_user?.age && (
                      <div className="flex items-center text-sm text-gray-400">
                        <span className="font-medium w-24 text-gray-300">Age:</span>
                        <span className="text-white">{match.matched_user.age}</span>
                      </div>
                    )}
                    
                    {match.matched_user?.location && (
                      <div className="flex items-center text-sm text-gray-400">
                        <span className="font-medium w-24 text-gray-300">Location:</span>
                        <span className="text-white">{match.matched_user.location}</span>
                      </div>
                    )}
                    
                    {match.matched_user?.bio && (
                      <div className="text-sm">
                        <p className="font-medium text-gray-300 mb-2">Bio:</p>
                        <p className="text-gray-400 line-clamp-2 leading-relaxed">{match.matched_user.bio}</p>
                      </div>
                    )}
                    
                    {match.matched_user?.interests && match.matched_user.interests.length > 0 && (
                      <div className="text-sm">
                        <p className="font-medium text-gray-300 mb-2">Interests:</p>
                        <div className="flex flex-wrap gap-2">
                          {match.matched_user.interests.slice(0, 4).map((interest) => (
                            <span key={interest} className="text-sm bg-gradient-to-r from-purple-900/40 to-pink-900/40 text-purple-300 px-3 py-1.5 rounded-full border border-purple-800/50">
                              {interest}
                            </span>
                          ))}
                          {match.matched_user.interests.length > 4 && (
                            <span className="text-sm text-gray-500">
                              +{match.matched_user.interests.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {match.status === 'pending' && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleUpdateMatchStatus(match.id, 'accepted')}
                        disabled={updatingMatchId === match.id}
                        className="group flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                      >
                        {updatingMatchId === match.id ? (
                          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Check className="h-5 w-5" />
                            <span className="font-medium">Accept</span>
                          </>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </button>
                      <button
                        onClick={() => handleUpdateMatchStatus(match.id, 'rejected')}
                        disabled={updatingMatchId === match.id}
                        className="group flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                      >
                        <X className="h-5 w-5" />
                        <span className="font-medium">Reject</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </button>
                    </div>
                  )}
                  
                  {match.status === 'accepted' && (
                    <div className="text-center">
                      <span className="text-sm text-green-300 font-medium bg-gradient-to-r from-green-900/40 to-emerald-900/40 px-4 py-2 rounded-full border border-green-800/50">✓ Match accepted</span>
                      <p className="text-xs text-gray-500 mt-2">
                        Matched on {new Date(match.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How Matching Works */}
        <div className="mt-12 bg-gradient-to-r from-purple-900/40 via-purple-800/30 to-pink-900/40 border-2 border-purple-500/30 rounded-3xl p-10 luxury-glow">
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center space-x-3">
            <Sparkles className="h-7 w-7 text-yellow-400" />
            <span>How Milo's Matching Works</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-effect p-6 rounded-2xl border border-gray-800">
              <h4 className="font-semibold text-white text-lg mb-3">AI-Powered Analysis</h4>
              <p className="text-gray-400 leading-relaxed">
                Milo analyzes your conversations to understand your personality, interests, and preferences using Mistral AI.
              </p>
            </div>
            <div className="glass-effect p-6 rounded-2xl border border-gray-800">
              <h4 className="font-semibold text-white text-lg mb-3">Compatibility Scoring</h4>
              <p className="text-gray-400 leading-relaxed">
                Matches are scored based on shared interests, complementary personalities, and stated preferences.
              </p>
            </div>
            <div className="glass-effect p-6 rounded-2xl border border-gray-800">
              <h4 className="font-semibold text-white text-lg mb-3">Continuous Learning</h4>
              <p className="text-gray-400 leading-relaxed">
                The more you chat with Milo, the better it understands you and the more accurate your matches become.
              </p>
            </div>
            <div className="glass-effect p-6 rounded-2xl border border-gray-800">
              <h4 className="font-semibold text-white text-lg mb-3">Privacy First</h4>
              <p className="text-gray-400 leading-relaxed">
                Your conversations are used only to improve your matches. You control what information is shared.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}