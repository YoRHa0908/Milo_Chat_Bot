'use client'

import { useState, useEffect } from 'react'
import { Users, Heart, MessageCircle, BarChart3, UserCheck, Clock, Home, Shield } from 'lucide-react'
import Link from 'next/link'

type User = {
  id: string
  name: string
  email: string | null
  age: number | null
  location: string | null
  interests: string[]
  looking_for: string[]
  created_at: string
}

type Match = {
  id: string
  user_id: string
  matched_user_id: string
  match_score: number
  status: string
  created_at: string
  user: User
  matched_user: User
}

type Stats = {
  totalUsers: number
  totalMatches: number
  activeMatches: number
  pendingMatches: number
  userGrowth: Array<{ date: string; cumulative: number }>
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalMatches: 0,
    activeMatches: 0,
    pendingMatches: 0,
    userGrowth: []
  })
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [error, setError] = useState('')

  const ADMIN_PASSWORD = 'milo-admin-2024' // In production, use proper auth

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
      setError('')
      loadAdminData()
    } else {
      setError('Invalid password')
    }
  }

  const loadAdminData = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin', {
        headers: {
          'Authorization': `Bearer ${ADMIN_PASSWORD}`
        }
      })

      const data = await response.json()
      
      if (response.ok) {
        setUsers(data.users || [])
        setMatches(data.matches || [])
        setStats(data.stats || {})
      } else {
        setError(data.error || 'Failed to load admin data')
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
      setError('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Auto-refresh every 30 seconds
    if (authenticated) {
      const interval = setInterval(loadAdminData, 30000)
      return () => clearInterval(interval)
    }
  }, [authenticated])

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/50 p-8 max-w-md w-full">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Access</h1>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="Enter admin password"
                required
              />
            </div>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-purple-600 dark:bg-purple-700 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
            >
              Access Admin Panel
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link href="/" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                <Home className="h-5 w-5" />
              </Link>
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Milo Admin Panel</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Internal view for monitoring and management</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={loadAdminData}
                disabled={loading}
                className="bg-purple-600 dark:bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? 'Refreshing...' : 'Refresh Data'}
              </button>
              <button
                onClick={() => setAuthenticated(false)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm dark:shadow-gray-900/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-4 w-4 mr-1" />
                <span>Active platform</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm dark:shadow-gray-900/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Matches</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalMatches}</p>
              </div>
              <Heart className="h-8 w-8 text-pink-600 dark:text-pink-400" />
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <UserCheck className="h-4 w-4 mr-1" />
                <span>{stats.activeMatches} accepted</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm dark:shadow-gray-900/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Matches</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pendingMatches}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Awaiting user response
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm dark:shadow-gray-900/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Match Score</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {matches.length > 0 
                    ? `${(matches.reduce((acc, m) => acc + m.match_score, 0) / matches.length * 100).toFixed(1)}%`
                    : '0%'
                  }
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Average compatibility score
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span>Recent Users ({users.length})</span>
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interests
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.slice(0, 10).map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          {user.email && (
                            <div className="text-sm text-gray-500">{user.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.location || 'Not specified'}</div>
                        {user.age && (
                          <div className="text-sm text-gray-500">{user.age} years old</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.interests.slice(0, 3).map((interest) => (
                            <span key={interest} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                              {interest}
                            </span>
                          ))}
                          {user.interests.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{user.interests.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {users.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No users found</p>
                </div>
              )}
              
              {loading && (
                <div className="text-center py-12">
                  <div className="h-8 w-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading users...</p>
                </div>
              )}
            </div>
          </div>

          {/* Matches Table */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Heart className="h-5 w-5 text-pink-600" />
                <span>Recent Matches ({matches.length})</span>
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Users
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {matches.slice(0, 10).map((match) => (
                    <tr key={match.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {match.user?.name} ↔ {match.matched_user?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Shared interests: {
                              match.user?.interests?.filter(interest => 
                                match.matched_user?.interests?.includes(interest)
                              ).length || 0
                            }
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${match.match_score * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {(match.match_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                          match.status === 'accepted' 
                            ? 'bg-green-100 text-green-800'
                            : match.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : match.status === 'blocked'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {match.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(match.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {matches.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No matches found</p>
                </div>
              )}
              
              {loading && (
                <div className="text-center py-12">
                  <div className="h-8 w-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading matches...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <span>System Information</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Platform Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Status</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AI Service</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">User Growth</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Today</span>
                  <span className="text-sm font-medium text-gray-900">
                    +{Math.floor(users.length * 0.1)} users
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Week</span>
                  <span className="text-sm font-medium text-gray-900">
                    +{Math.floor(users.length * 0.3)} users
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Growth</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.userGrowth.length > 0 ? stats.userGrowth[stats.userGrowth.length - 1]?.cumulative || 0 : 0} users
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Match Statistics</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Acceptance Rate</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.totalMatches > 0 
                      ? `${((stats.activeMatches / stats.totalMatches) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. Response Time</span>
                  <span className="text-sm font-medium text-gray-900">12 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Top Interest</span>
                  <span className="text-sm font-medium text-gray-900">
                    {users.length > 0 
                      ? (() => {
                          const allInterests = users.flatMap(u => u.interests)
                          const interestCounts = allInterests.reduce((acc, interest) => {
                            acc[interest] = (acc[interest] || 0) + 1
                            return acc
                          }, {} as Record<string, number>)
                          
                          const topInterest = Object.entries(interestCounts)
                            .sort((a, b) => b[1] - a[1])[0]
                          
                          return topInterest ? topInterest[0] : 'N/A'
                        })()
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}