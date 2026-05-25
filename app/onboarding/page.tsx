'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, MapPin, Heart, MessageCircle, ArrowRight } from 'lucide-react'


const interestsOptions = [
  'Technology', 'Music', 'Sports', 'Travel', 'Reading', 'Cooking',
  'Art', 'Gaming', 'Movies', 'Fitness', 'Photography', 'Writing',
  'Dancing', 'Hiking', 'Yoga', 'Coffee', 'Foodie', 'Volunteering'
]

const lookingForOptions = [
  'Friendship', 'Dating', 'Networking', 'Mentorship', 'Activity Partners',
  'Study Buddies', 'Travel Companions', 'Creative Collaboration'
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [existingUserId, setExistingUserId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    location: '',
    bio: '',
    interests: [] as string[],
    looking_for: [] as string[]
  })

  // Load existing user data if editing
  useEffect(() => {
    // Check if we're in edit mode via query parameter
    const urlParams = new URLSearchParams(window.location.search)
    const isEditMode = urlParams.get('edit') === 'true'
    
    const userId = localStorage.getItem('milo_user_id')
    console.log('Loading user data, userId:', userId, 'isEditMode:', isEditMode)
    
    // Only load existing data if we have a userId AND we're in edit mode
    if (userId && isEditMode) {
      setIsEditing(true)
      setExistingUserId(userId)
      
      // Load user data from localStorage
      const existingUsers = JSON.parse(localStorage.getItem('milo_users') || '[]')
      console.log('Existing users in localStorage:', existingUsers)
      
      const currentUser = existingUsers.find((user: any) => user.id === userId)
      console.log('Found current user:', currentUser)
      
      if (currentUser) {
        setFormData({
          name: currentUser.name || '',
          email: currentUser.email || '',
          age: currentUser.age?.toString() || '',
          location: currentUser.location || '',
          bio: currentUser.bio || '',
          interests: currentUser.interests || [],
          looking_for: currentUser.looking_for || []
        })
        console.log('Form data set for edit mode')
      } else {
        console.log('User not found in localStorage')
        // User not found, treat as new user
        setIsEditing(false)
        setExistingUserId(null)
      }
    } else {
      // Not in edit mode OR no userId - show empty form for new registration
      console.log('Showing empty form for new registration')
      setIsEditing(false)
      setExistingUserId(null)
      // Ensure form is empty
      setFormData({
        name: '',
        email: '',
        age: '',
        location: '',
        bio: '',
        interests: [],
        looking_for: []
      })
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Limit bio to 500 characters
    if (name === 'bio' && value.length > 500) {
      return
    }
    
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Simple email format validation
  const isValidEmail = (email: string): boolean => {
    if (!email.trim()) return true // Empty email is allowed (optional field)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleLookingForToggle = (option: string) => {
    setFormData(prev => ({
      ...prev,
      looking_for: prev.looking_for.includes(option)
        ? prev.looking_for.filter(i => i !== option)
        : [...prev.looking_for, option]
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Please enter your name')
      return
    }

    // Validate email format if provided
    if (formData.email.trim() && !isValidEmail(formData.email)) {
      alert('Please enter a valid email address')
      return
    }

    setLoading(true)
    
    try {
      let userId = existingUserId
      let isNewUser = true
      
      if (isEditing && existingUserId) {
        // Editing existing user
        isNewUser = false
        userId = existingUserId
      } else {
        // Creating new user - generate unique ID
        userId = Date.now().toString() + Math.random().toString(36).substring(2, 11)
      }
      
      // Create/update user object
      const userData = {
        id: userId!,
        name: formData.name,
        email: formData.email.trim() || null,
        age: formData.age ? parseInt(formData.age) : null,
        location: formData.location.trim() || null,
        bio: formData.bio.trim() || null,
        interests: formData.interests || [],
        looking_for: formData.looking_for || [],
        updated_at: new Date().toISOString()
      }

      // Save to localStorage (primary storage for client-side)
      const existingUsers = JSON.parse(localStorage.getItem('milo_users') || '[]')
      
      if (isEditing && existingUserId) {
        // Update existing user
        const userIndex = existingUsers.findIndex((user: any) => user.id === existingUserId)
        if (userIndex !== -1) {
          // Keep the original created_at timestamp
          const originalUser = existingUsers[userIndex]
          
          // Check if email is being changed to another user's email
          if (formData.email.trim() && formData.email.trim() !== originalUser.email) {
            const emailExists = existingUsers.some((user: any) => 
              user.id !== existingUserId && user.email === formData.email.trim()
            )
            if (emailExists) {
              alert('Email already in use by another user. Please use a different email or leave it blank.')
              setLoading(false)
              return
            }
          }
          
          existingUsers[userIndex] = {
            ...originalUser,
            ...userData,
            created_at: originalUser.created_at // Preserve original creation date
          }
        } else {
          // User not found, create as new
          existingUsers.push({
            ...userData,
            created_at: new Date().toISOString()
          })
        }
      } else {
        // Creating new user
        // Check if email already exists (only for new users)
        if (formData.email.trim()) {
          const existingUser = existingUsers.find((user: any) => user.email === formData.email.trim())
          if (existingUser) {
            alert('Email already in use. Please use a different email or leave it blank.')
            setLoading(false)
            return
          }
        }
        
        existingUsers.push({
          ...userData,
          created_at: new Date().toISOString()
        })
      }
      
      localStorage.setItem('milo_users', JSON.stringify(existingUsers))
      
      // Store user ID and name for session management
      localStorage.setItem('milo_user_id', userId!)
      localStorage.setItem('milo_user_name', formData.name)
      
      if (isNewUser) {
        localStorage.setItem('milo_is_new_user', 'true')
      } else {
        localStorage.removeItem('milo_is_new_user')
      }
      
      // Also save/update via API (for consistency with server-side matching)
      try {
        const apiMethod = isEditing ? 'PUT' : 'POST'
        const apiResponse = await fetch('/api/users', {
          method: apiMethod,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: userId,
            name: formData.name,
            email: formData.email.trim() || null,
            age: formData.age ? parseInt(formData.age) : null,
            location: formData.location.trim() || null,
            bio: formData.bio.trim() || null,
            interests: formData.interests || [],
            looking_for: formData.looking_for || []
          })
        })
        
        if (!apiResponse.ok) {
          console.warn('API save warning:', await apiResponse.text())
        } else {
          console.log('User saved to API successfully')
        }
      } catch (apiError) {
        console.warn('API save failed (localStorage is primary):', apiError)
        // Continue anyway - localStorage save is successful
      }
      
      // Redirect to chat
      router.push('/chat')
    } catch (error) {
      console.error('Error saving user profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleNewChat = () => {
    // Clear any existing chat sessions and messages from localStorage
    localStorage.removeItem('milo_chat_sessions')
    localStorage.removeItem('milo_chat_messages')
    
    // Get current user ID and name
    const currentUserId = localStorage.getItem('milo_user_id')
    const currentUserName = localStorage.getItem('milo_user_name')
    
    if (!currentUserId || !currentUserName) {
      alert('Please create or select a profile first')
      return
    }
    
    // Set flag to indicate this is a new chat (not a new user)
    localStorage.removeItem('milo_is_new_user')
    
    // Redirect to chat with fresh conversation
    router.push('/chat')
  }

  const nextStep = () => {
    if (step === 1 && !formData.name.trim()) {
      alert('Please enter your name')
      return
    }
    if (step === 2 && formData.interests.length === 0) {
      alert('Please select at least one interest')
      return
    }
    setStep(step + 1)
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  return (
    <div className="min-h-screen luxury-gradient">
      <div className="container mx-auto px-4 py-12">

        
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="relative">
                <MessageCircle className="h-12 w-12 text-purple-400" />
                <div className="absolute -top-1 -right-1">
                  <Heart className="h-5 w-5 text-pink-400" />
                </div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {isEditing ? 'Edit Your Profile' : 'Welcome to Milo'}
              </h1>
            </div>
            <p className="text-gray-400 text-lg">
              {isEditing 
                ? 'Update your profile information to improve your matches'
                : 'Let\'s create your profile so Milo can help you find meaningful connections'
              }
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                    step >= s 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30' 
                      : 'glass-effect text-gray-500 border border-gray-800'
                  }`}>
                    {s}
                  </div>
                  <span className="text-sm mt-2 text-gray-400">
                    {s === 1 ? 'Basic Info' : s === 2 ? 'Interests' : 'Preferences'}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-2 glass-effect rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="luxury-card-gradient rounded-3xl border border-gray-800 p-10">
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-gradient-to-br from-purple-900 to-purple-700 rounded-xl">
                  <User className="h-7 w-7 text-purple-300" />
                </div>
                <h2 className="text-3xl font-bold text-white">Tell us about yourself</h2>
              </div>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 border border-gray-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 luxury-card-gradient text-gray-200 placeholder-gray-500 focus:outline-none transition-all duration-300"
                    placeholder="What should we call you?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 border border-gray-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 luxury-card-gradient text-gray-200 placeholder-gray-500 focus:outline-none transition-all duration-300"
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border border-gray-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 luxury-card-gradient text-gray-200 placeholder-gray-500 focus:outline-none transition-all duration-300"
                      placeholder="Optional"
                      min="18"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <span>Location</span>
                      </div>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border border-gray-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 glass-effect text-gray-200 placeholder-gray-500 focus:outline-none transition-all duration-300"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Bio
                  </label>
                  <div className="relative">
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border border-gray-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 luxury-card-gradient text-gray-200 placeholder-gray-500 focus:outline-none transition-all duration-300 resize-none"
                      placeholder="Tell us a bit about yourself... Share your story, passions, and what makes you unique."
                      rows={6}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                      {formData.bio.length}/500 characters
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    This helps Milo understand your personality and find better matches.
                  </p>
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                <button
                  onClick={nextStep}
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 flex items-center space-x-3"
                >
                  <span className="relative z-10">Continue</span>
                  <ArrowRight className="h-6 w-6 relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Interests */}
          {step === 2 && (
            <div className="luxury-card-gradient rounded-3xl border border-gray-800 p-10">
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-gradient-to-br from-pink-900 to-pink-700 rounded-xl">
                  <Heart className="h-7 w-7 text-pink-300" />
                </div>
                <h2 className="text-3xl font-bold text-white">What are you interested in?</h2>
              </div>
              
              <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                Select topics that interest you. This helps Milo understand your personality and find compatible matches.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                {interestsOptions.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-5 py-4 rounded-xl border-2 transition-all duration-300 ${
                      formData.interests.includes(interest)
                        ? 'border-purple-500 bg-gradient-to-r from-purple-900/40 to-pink-900/40 text-purple-300 shadow-lg shadow-purple-500/20'
                        : 'glass-effect border-gray-800 hover:border-purple-500/50 hover:text-white text-gray-400'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  className="group glass-effect text-gray-400 border border-gray-800 px-8 py-3 rounded-full font-semibold hover:border-purple-500/50 hover:text-white transition-all duration-500 hover:scale-105"
                >
                  Back
                </button>
                <button
                  onClick={nextStep}
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 flex items-center space-x-3"
                >
                  <span className="relative z-10">Continue</span>
                  <ArrowRight className="h-6 w-6 relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className="luxury-card-gradient rounded-3xl border border-gray-800 p-10">
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-gradient-to-br from-purple-900 to-purple-700 rounded-xl">
                  <MessageCircle className="h-7 w-7 text-purple-300" />
                </div>
                <h2 className="text-3xl font-bold text-white">What are you looking for?</h2>
              </div>
              
              <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                Help Milo understand what kind of connections you're seeking.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {lookingForOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleLookingForToggle(option)}
                    className={`px-6 py-5 rounded-xl border-2 transition-all duration-300 ${
                      formData.looking_for.includes(option)
                        ? 'border-purple-500 bg-gradient-to-r from-purple-900/40 to-pink-900/40 text-purple-300 shadow-lg shadow-purple-500/20'
                        : 'glass-effect border-gray-800 hover:border-purple-500/50 hover:text-white text-gray-400'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="mt-10 p-8 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-2 border-purple-500/30 rounded-2xl luxury-glow">
                <h3 className="font-semibold text-white text-xl mb-4">Your Profile Summary</h3>
                <div className="space-y-3 text-gray-300">
                  <p><span className="font-medium text-gray-200">Name:</span> {formData.name}</p>
                  {formData.age && <p><span className="font-medium text-gray-200">Age:</span> {formData.age}</p>}
                  {formData.location && <p><span className="font-medium text-gray-200">Location:</span> {formData.location}</p>}
                  <p><span className="font-medium text-gray-200">Interests:</span> {formData.interests.join(', ') || 'None selected'}</p>
                  <p><span className="font-medium text-gray-200">Looking for:</span> {formData.looking_for.join(', ') || 'Not specified'}</p>
                </div>
              </div>

              <div className="flex justify-between mt-12">
                <button
                  onClick={prevStep}
                  className="group glass-effect text-gray-400 border border-gray-800 px-8 py-3 rounded-full font-semibold hover:border-purple-500/50 hover:text-white transition-all duration-500 hover:scale-105"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3"
                >
                  {loading ? (
                    <>
                      <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10" />
                      <span className="relative z-10">Creating Profile...</span>
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">
                        {isEditing ? 'Update Profile' : 'Start Chatting with Milo'}
                      </span>
                      <ArrowRight className="h-6 w-6 relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}