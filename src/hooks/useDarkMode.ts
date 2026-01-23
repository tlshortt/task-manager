import { useState, useEffect } from 'react'

interface UseDarkModeReturn {
  isDark: boolean
  toggle: () => void
}

export function useDarkMode(): UseDarkModeReturn {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first
    const stored = localStorage.getItem('darkMode')
    if (stored !== null) {
      return stored === 'true'
    }

    // Fall back to prefers-color-scheme
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    // Toggle dark class on document.documentElement
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Persist to localStorage
    localStorage.setItem('darkMode', String(isDark))
  }, [isDark])

  const toggle = () => {
    setIsDark(prev => !prev)
  }

  return { isDark, toggle }
}
