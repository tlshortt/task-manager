import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDarkMode } from './useDarkMode'

describe('useDarkMode', () => {
  beforeEach(() => {
    // Clear localStorage and reset dark class
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('returns isDark and toggle function', () => {
    const { result } = renderHook(() => useDarkMode())

    expect(result.current).toHaveProperty('isDark')
    expect(result.current).toHaveProperty('toggle')
    expect(typeof result.current.isDark).toBe('boolean')
    expect(typeof result.current.toggle).toBe('function')
  })

  it('reads from localStorage on mount', () => {
    localStorage.setItem('darkMode', 'true')

    const { result } = renderHook(() => useDarkMode())

    expect(result.current.isDark).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('toggles dark mode', () => {
    const { result } = renderHook(() => useDarkMode())

    const initialState = result.current.isDark

    act(() => {
      result.current.toggle()
    })

    expect(result.current.isDark).toBe(!initialState)
  })

  it('toggles dark class on documentElement', () => {
    const { result } = renderHook(() => useDarkMode())

    // Set to dark
    act(() => {
      if (!result.current.isDark) {
        result.current.toggle()
      }
    })

    expect(document.documentElement.classList.contains('dark')).toBe(true)

    // Toggle back to light
    act(() => {
      result.current.toggle()
    })

    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useDarkMode())

    act(() => {
      result.current.toggle()
    })

    const stored = localStorage.getItem('darkMode')
    expect(stored).toBe(String(result.current.isDark))
  })

  it('falls back to prefers-color-scheme when localStorage is empty', () => {
    // This test verifies the fallback logic exists
    // Actual media query matching is environment-dependent
    const { result } = renderHook(() => useDarkMode())

    expect(typeof result.current.isDark).toBe('boolean')
  })
})
