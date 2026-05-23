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
      <div className="min-h-screen luxury-gradient flex items-center justify-center">
        <div className="luxury-card-gradient rounded-3xl border border-gray-800 p-10 max-w-md w-full luxury-glow">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-purple-900 to-purple-700 rounded-xl">
              <Shield className="h-8 w-8 text-purple-300" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Admin Access</h1>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 border border-gray-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent glass-effect text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all duration-300"
                placeholder="Enter admin password"
                required
              />
            </div>
            
            {error && (
              <div className="bg-gradient-to-r from-red-900/40 to-rose-900/40 text-red-300 p-4 rounded-xl text-sm border border-red-800/50">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className="group relative overflow-hidden w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
            >
              <span className="relative z-10">Access Admin Panel</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm hover:scale-105 transition-transform duration-300">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen luxury-gradient">
      {/* Admin Header */}
      <div className="glass-effect border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-300 hover:scale-105">
                <Home className="h-6 w-6" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-900 to-purple-700 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-300" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Milo Admin Panel</h1>
                  <p className="text-sm text-gray-400">Internal view for monitoring and management</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <button
                onClick={loadAdminData}
                disabled={loading}
                className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10">{loading ? 'Refreshing...' : 'Refresh Data'}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
              <button
                onClick={() => setAuthenticated(false)}
                className="group glass-effect text-gray-400 border border-gray-800 px-6 py-3 rounded-xl font-semibold hover:border-purple-500/50 hover:text-white transition-all duration-500 hover:scale-105"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="luxury-card-gradient rounded-3xl border border-gray-800 p-8 hover:border-purple-500/30 transition-all duration-500 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="text-4xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300">{stats.totalUsers}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-900 to-purple-700 rounded-xl">
                <Users className="h-8 w-8 text-purple-300" />
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center text-sm text-gray-400">
                <Clock className="h-4 w-4 mr-2" />
                <span>Active platform</span>
              </div>
            </div>
            <div className="mt-4 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
          
          <div className="luxury-card-gradient rounded-3xl border border-gray-800 p-8 hover:border-pink-500/30 transition-all duration-500 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Matches</p>
                <p className="text-4xl font-bold text-white group-hover:text-pink-300 transition-colors duration-300">{stats.totalMatches}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-pink-900 to-pink-700 rounded-xl">
                <Heart className="h-8 w-8 text-pink-300" />
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center text-sm text-gray-400">
                <UserCheck className="h-4 w-4 mr-2" />
                <span>{stats.activeMatches} accepted</span>
              </div>
            </div>
            <div className="mt-4 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
          
          <div className="luxury-card-gradient rounded-3xl border border-gray-800 p-8 hover:border-yellow-500/30 transition-all duration-500 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending Matches</p>
                <p className="text-4xl font-bold text-white group-hover:text-yellow-300 transition-colors duration-300">{stats.pendingMatches}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-yellow-900 to-yellow-700 rounded-xl">
                <Clock className="h-8 w-8 text-yellow-300" />
              </div>
            </div>
            <div className="mt-6">
              <div className="text-sm text-gray-400">
                Awaiting user response
              </div>
            </div>
            <div className="mt-4 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
          
          <div className="luxury-card-gradient rounded-3xl border border-gray-800 p-8 hover:border-green-500/30 transition-all duration-500 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg. Match Score</p>
                <p className="text-4xl font-bold text-white group-hover:text-green-300 transition-colors duration-300">
                  {matches.length > 0 
                    ? `${(matches.reduce((acc, m) => acc + m.match_score, 0) / matches.length * 100).toFixed(1)}%`
                    : '0%'
                  }
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-900 to-green-700 rounded-xl">
                <BarChart3 className="h-8 w-8 text-green-300" />
              </div>
            </div>
            <div className="mt-6">
              <div className="text-sm text-gray-400">
                Average compatibility score
              </div>
            </div>
            <div className="mt-4 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users Table */}
          <div className="luxury-card-gradient rounded-3xl border border-gray-800">
            <div className="p-8 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-900 to-purple-700 rounded-lg">
                  <Users className="h-6 w-6 text-purple-300" />
                </div>
                <span>Recent Users ({users.length})</span>
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-900/50 to-gray-800/50">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Interests
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {users.slice(0, 10).map((user) => (
                    <tr key={user.id} className="hover:bg-gray-900/30 transition-colors duration-300">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-white">{user.name}</div>
                          {user.email && (
                            <div className="text-sm text-gray-400">{user.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-sm text-white">{user.location || 'Not specified'}</div>
                        {user.age && (
                          <div className="text-sm text-gray-400">{user.age} years old</div>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-wrap gap-2">
                          {user.interests.slice(0, 3).map((interest) => (
                            <span key={interest} className="text-xs bg-gradient-to-r from-purple-900/40 to-pink-900/40 text-purple-300 px-3 py-1.5 rounded-full border border-purple-800/50">
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
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {users.length === 0 && !loading && (
                <div className="text-center py-16">
                  <Users className="h-16 w-16 text-gray-500 mx-auto mb-6" />
                  <p className="text-gray-400 text-lg">No users found</p>
                </div>
              )}
              
              {loading && (
                <div className="text-center py-16">
                  <div className="h-12 w-12 border-4 border-purple-800 border-t-purple-400 rounded-full animate-spin mx-auto mb-6" />
                  <p className="text-gray-400 text-lg">Loading users...</p>
                </div>
              )}
            </div>
          </div>

          {/* Matches Table */}
          <div className="luxury-card-gradient rounded-3xl border border-gray-800">
            <div className="p-8 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-pink-900 to-pink-700 rounded-lg">
                  <Heart className="h-6 w-6 text-pink-300" />
                </div>
                <span>Recent Matches ({matches.length})</span>
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-900/50 to-gray-800/50">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Users
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {matches.slice(0, 10).map((match) => (
                    <tr key={match.id} className="hover:bg-gray-900/30 transition-colors duration-300">
                      <td className="px-8 py-5">
                        <div>
                          <div className="font-medium text-white">
                            {match.user?.name} ↔ {match.matched_user?.name}
                          </div>
                          <div className="text-sm text-gray-400">
                            Shared interests: {
                              match.user?.interests?.filter(interest => 
                                match.matched_user?.interests?.includes(interest)
                              ).length || 0
                            }
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-800 rounded-full h-2 mr-3">
                            <div 
                              className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full"
                              style={{ width: `${match.match_score * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-white">
                            {(match.match_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className={`px-3 py-1.5 text-sm rounded-full capitalize ${
                          match.status === 'accepted' 
                            ? 'bg-gradient-to-r from-green-900/40 to-emerald-900/40 text-green-300 border border-green-800/50'
                            : match.status === 'rejected'
                            ? 'bg-gradient-to-r from-red-900/40 to-rose-900/40 text-red-300 border border-red-800/50'
                            : match.status === 'blocked'
                            ? 'bg-gradient-to-r from-gray-900/40 to-gray-800/40 text-gray-300 border border-gray-800/50'
                            : 'bg-gradient-to-r from-yellow-900/40 to-amber-900/40 text-yellow-300 border border-yellow-800/50'
                        }`}>
                          {match.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-400">
                        {new Date(match.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {matches.length === 0 && !loading && (
                <div className="text-center py-16">
                  <Heart className="h-16 w-16 text-gray-500 mx-auto mb-6" />
                  <p className="text-gray-400 text-lg">No matches found</p>
                </div>
              )}
              
              {loading && (
                <div className="text-center py-16">
                  <div className="h-12 w-12 border-4 border-purple-800 border-t-purple-400 rounded-full animate-spin mx-auto mb-6" />
                  <p className="text-gray-400 text-lg">Loading matches...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="mt-12 luxury-card-gradient rounded-3xl border border-gray-800 p-10">
          <h3 className="text-2xl font-semibold text-white mb-8 flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-900 to-purple-700 rounded-lg">
              <BarChart3 className="h-7 w-7 text-purple-300" />
            </div>
            <span>System Information</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-effect p-6 rounded-2xl border border-gray-800">
              <h4 className="font-medium text-white text-lg mb-4">Platform Status</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">API Status</span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-green-900/40 to-emerald-900/40 text-green-300 border border-green-800/50">
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Database</span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-green-900/40 to-emerald-900/40 text-green-300 border border-green-800/50">
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">AI Service</span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-green-900/40 to-emerald-900/40 text-green-300 border border-green-800/50">
                    Active
                  </span>
                </div>
              </div>
            </div>
            
            <div className="glass-effect p-6 rounded-2xl border border-gray-800">
              <h4 className="font-medium text-white text-lg mb-4">User Growth</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Today</span>
                  <span className="text-sm font-medium text-white">
                    +{Math.floor(users.length * 0.1)} users
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">This Week</span>
                  <span className="text-sm font-medium text-white">
                    +{Math.floor(users.length * 0.3)} users
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total Growth</span>
                  <span className="text-sm font-medium text-white">
                    {stats.userGrowth.length > 0 ? stats.userGrowth[stats.userGrowth.length - 1]?.cumulative || 0 : 0} users
                  </span>
                </div>
              </div>
            </div>
            
            <div className="glass-effect p-6 rounded-2xl border border-gray-800">
              <h4 className="font-medium text-white text-lg mb-4">Match Statistics</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Acceptance Rate</span>
                  <span className="text-sm font-medium text-white">
                    {stats.totalMatches > 0 
                      ? `${((stats.activeMatches / stats.totalMatches) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Avg. Response Time</span>
                  <span className="text-sm font-medium text-white">12 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Top Interest</span>
                  <span className="text-sm font-medium text-white">
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