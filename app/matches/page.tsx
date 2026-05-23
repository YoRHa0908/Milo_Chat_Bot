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
      case 'accepted': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'rejected': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      case 'blocked': return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
      default: return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              <Home className="h-5 w-5" />
            </Link>
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-pink-600 dark:text-pink-400" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Matches</h1>
                <p className="text-gray-600 dark:text-gray-400">Discover and connect with compatible people</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link 
              href="/chat" 
              className="bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 px-6 py-2 rounded-full hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Back to Chat</span>
            </Link>
            
            <button
              onClick={handleGetNewMatches}
              disabled={loading}
              className="bg-purple-600 dark:bg-purple-700 text-white px-6 py-2 rounded-full hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>Find New Matches</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm dark:shadow-gray-900/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Matches</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{matches.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm dark:shadow-gray-900/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {matches.filter(m => m.status === 'pending').length}
                </p>
              </div>
              <Heart className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm dark:shadow-gray-900/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Accepted</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {matches.filter(m => m.status === 'accepted').length}
                </p>
              </div>
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm dark:shadow-gray-900/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Match Score</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {matches.length > 0 
                    ? `${(matches.reduce((acc, m) => acc + m.match_score, 0) / matches.length * 100).toFixed(0)}%`
                    : '0%'
                  }
                </p>
              </div>
              <Sparkles className="h-8 w-8 text-pink-600 dark:text-pink-400" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'all'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              All Matches
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'pending'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab('accepted')}
              className={`flex-1 py-4 text-center font-medium ${
                activeTab === 'accepted'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Accepted
            </button>
          </div>
        </div>

        {/* Matches List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/50 p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="h-12 w-12 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading matches...</p>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No matches found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {activeTab === 'all' 
                  ? "You don't have any matches yet. Chat with Milo to help us understand your preferences."
                  : `You don't have any ${activeTab} matches.`
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/chat"
                  className="bg-purple-600 dark:bg-purple-700 text-white px-6 py-3 rounded-full hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
                >
                  Chat with Milo
                </Link>
                <button
                  onClick={handleGetNewMatches}
                  className="bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 px-6 py-3 rounded-full hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Find New Matches
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMatches.map((match) => (
                <div key={match.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow">
                  {/* Match Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {match.matched_user?.name || 'Unknown User'}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full flex items-center space-x-1 ${getStatusColor(match.status)}`}>
                            {getStatusIcon(match.status)}
                            <span className="capitalize">{match.status}</span>
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {(match.match_score * 100).toFixed(0)}% match
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Match Details */}
                  <div className="space-y-3 mb-6">
                    {match.matched_user?.age && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium w-20">Age:</span>
                        <span>{match.matched_user.age}</span>
                      </div>
                    )}
                    
                    {match.matched_user?.location && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium w-20">Location:</span>
                        <span>{match.matched_user.location}</span>
                      </div>
                    )}
                    
                    {match.matched_user?.bio && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p className="font-medium mb-1">Bio:</p>
                        <p className="line-clamp-2">{match.matched_user.bio}</p>
                      </div>
                    )}
                    
                    {match.matched_user?.interests?.length > 0 && (
                      <div className="text-sm">
                        <p className="font-medium text-gray-600 dark:text-gray-400 mb-1">Interests:</p>
                        <div className="flex flex-wrap gap-1">
                          {match.matched_user.interests.slice(0, 4).map((interest) => (
                            <span key={interest} className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                              {interest}
                            </span>
                          ))}
                          {match.matched_user.interests.length > 4 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{match.matched_user.interests.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {match.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateMatchStatus(match.id, 'accepted')}
                        disabled={updatingMatchId === match.id}
                        className="flex-1 bg-green-600 dark:bg-green-700 text-white py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {updatingMatchId === match.id ? (
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            <span>Accept</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleUpdateMatchStatus(match.id, 'rejected')}
                        disabled={updatingMatchId === match.id}
                        className="flex-1 bg-red-600 dark:bg-red-700 text-white py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <X className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                  
                  {match.status === 'accepted' && (
                    <div className="text-center">
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">✓ Match accepted</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <span>How Milo's Matching Works</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">AI-Powered Analysis</h4>
              <p className="text-gray-600">
                Milo analyzes your conversations to understand your personality, interests, and preferences using Mistral AI.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Compatibility Scoring</h4>
              <p className="text-gray-600">
                Matches are scored based on shared interests, complementary personalities, and stated preferences.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Continuous Learning</h4>
              <p className="text-gray-600">
                The more you chat with Milo, the better it understands you and the more accurate your matches become.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Privacy First</h4>
              <p className="text-gray-600">
                Your conversations are used only to improve your matches. You control what information is shared.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}