'use client'

import { Moon, Sun, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  // Initialize theme
  useEffect(() => {
    // Check localStorage
    const saved = localStorage.getItem('milo-theme')
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved)
      applyTheme(saved)
    } else {
      // Default to dark for luxury theme
      setTheme('dark')
      applyTheme('dark')
    }
  }, [])

  // Apply theme to document
  const applyTheme = (newTheme: 'light' | 'dark') => {
    const html = document.documentElement
    if (newTheme === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    localStorage.setItem('milo-theme', newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  return (
    <button
      onClick={toggleTheme}
      className="group relative p-3 rounded-xl glass-effect text-gray-300 hover:text-white border border-gray-800 hover:border-purple-500/50 transition-all duration-500 hover:scale-110"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-6 h-6">
        <Sun className={`absolute inset-0 w-6 h-6 transition-all duration-500 ${
          theme === 'light' ? 'opacity-100 rotate-0 text-yellow-400' : 'opacity-0 -rotate-90'
        }`} />
        <Moon className={`absolute inset-0 w-6 h-6 transition-all duration-500 ${
          theme === 'dark' ? 'opacity-100 rotate-0 text-purple-400' : 'opacity-0 rotate-90'
        }`} />
        <Sparkles className={`absolute inset-0 w-6 h-6 transition-all duration-500 ${
          theme === 'dark' ? 'opacity-100 text-yellow-400 animate-pulse' : 'opacity-0'
        }`} />
      </div>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </button>
  )
}