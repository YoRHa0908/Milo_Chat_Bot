'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, MapPin, Heart, MessageCircle, ArrowRight } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

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
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    location: '',
    bio: '',
    interests: [] as string[],
    looking_for: [] as string[]
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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

    setLoading(true)
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: formData.age ? parseInt(formData.age) : null
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        // Store user ID in localStorage for demo purposes
        localStorage.setItem('milo_user_id', data.user.id)
        localStorage.setItem('milo_user_name', data.user.name)
        
        // Redirect to chat
        router.push('/chat')
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Failed to create profile. Please try again.')
    } finally {
      setLoading(false)
    }
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Theme Toggle in top-right */}
        <div className="flex justify-end mb-6">
          <ThemeToggle />
        </div>
        
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <MessageCircle className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to Milo</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Let's create your profile so Milo can help you find meaningful connections
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= s ? 'bg-purple-600 dark:bg-purple-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  }`}>
                    {s}
                  </div>
                  <span className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                    {s === 1 ? 'Basic Info' : s === 2 ? 'Interests' : 'Preferences'}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-600 dark:bg-purple-700 transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/50 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tell us about yourself</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="What should we call you?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="Optional - for match notifications"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      placeholder="Optional"
                      min="18"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>Location</span>
                      </div>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="Tell us a bit about yourself..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={nextStep}
                  className="bg-purple-600 dark:bg-purple-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors flex items-center space-x-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Interests */}
          {step === 2 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/50 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Heart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">What are you interested in?</h2>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Select topics that interest you. This helps Milo understand your personality and find compatible matches.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {interestsOptions.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.interests.includes(interest)
                        ? 'border-purple-600 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium"
                >
                  Back
                </button>
                <button
                  onClick={nextStep}
                  className="bg-purple-600 dark:bg-purple-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors flex items-center space-x-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/50 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <MessageCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">What are you looking for?</h2>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Help Milo understand what kind of connections you're seeking.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {lookingForOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleLookingForToggle(option)}
                    className={`px-6 py-4 rounded-lg border-2 transition-all ${
                      formData.looking_for.includes(option)
                        ? 'border-purple-600 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="mt-8 p-6 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Your Profile Summary</h3>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p><span className="font-medium">Name:</span> {formData.name}</p>
                  {formData.age && <p><span className="font-medium">Age:</span> {formData.age}</p>}
                  {formData.location && <p><span className="font-medium">Location:</span> {formData.location}</p>}
                  <p><span className="font-medium">Interests:</span> {formData.interests.join(', ') || 'None selected'}</p>
                  <p><span className="font-medium">Looking for:</span> {formData.looking_for.join(', ') || 'Not specified'}</p>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-purple-600 dark:bg-purple-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Profile...</span>
                    </>
                  ) : (
                    <>
                      <span>Start Chatting with Milo</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}