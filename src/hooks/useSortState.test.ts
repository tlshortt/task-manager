import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSortState } from './useSortState'

describe('useSortState', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('returns sortState and control functions', () => {
    const { result } = renderHook(() => useSortState())

    expect(result.current).toHaveProperty('sortState')
    expect(result.current).toHaveProperty('setSortField')
    expect(result.current).toHaveProperty('toggleSortDirection')
    expect(result.current).toHaveProperty('setSortState')
  })

  it('defaults to dueDate ascending', () => {
    const { result } = renderHook(() => useSortState())

    expect(result.current.sortState).toEqual({
      field: 'dueDate',
      direction: 'asc',
    })
  })

  it('reads from localStorage on mount', () => {
    localStorage.setItem(
      'task-manager-sort',
      JSON.stringify({ field: 'priority', direction: 'desc' })
    )

    const { result } = renderHook(() => useSortState())

    expect(result.current.sortState).toEqual({
      field: 'priority',
      direction: 'desc',
    })
  })

  it('falls back to default when localStorage has invalid JSON', () => {
    localStorage.setItem('task-manager-sort', 'not-json')

    const { result } = renderHook(() => useSortState())

    expect(result.current.sortState).toEqual({
      field: 'dueDate',
      direction: 'asc',
    })
  })

  it('falls back to default when localStorage has invalid sort state', () => {
    localStorage.setItem(
      'task-manager-sort',
      JSON.stringify({ field: 'invalid', direction: 'asc' })
    )

    const { result } = renderHook(() => useSortState())

    expect(result.current.sortState).toEqual({
      field: 'dueDate',
      direction: 'asc',
    })
  })

  it('persists sort state to localStorage on change', () => {
    const { result } = renderHook(() => useSortState())

    act(() => {
      result.current.setSortField('title')
    })

    const stored = JSON.parse(localStorage.getItem('task-manager-sort')!)
    expect(stored).toEqual({ field: 'title', direction: 'asc' })
  })

  it('setSortField changes the field and resets direction to asc', () => {
    const { result } = renderHook(() => useSortState())

    act(() => {
      result.current.setSortField('title')
    })

    expect(result.current.sortState).toEqual({
      field: 'title',
      direction: 'asc',
    })
  })

  it('setSortField defaults priority to descending', () => {
    const { result } = renderHook(() => useSortState())

    act(() => {
      result.current.setSortField('priority')
    })

    expect(result.current.sortState).toEqual({
      field: 'priority',
      direction: 'desc',
    })
  })

  it('setSortField keeps direction when selecting the same field', () => {
    const { result } = renderHook(() => useSortState())

    act(() => {
      result.current.setSortField('title')
    })

    act(() => {
      result.current.toggleSortDirection()
    })

    expect(result.current.sortState.direction).toBe('desc')

    act(() => {
      result.current.setSortField('title')
    })

    expect(result.current.sortState.direction).toBe('desc')
  })

  it('toggleSortDirection flips the direction', () => {
    const { result } = renderHook(() => useSortState())

    expect(result.current.sortState.direction).toBe('asc')

    act(() => {
      result.current.toggleSortDirection()
    })

    expect(result.current.sortState.direction).toBe('desc')

    act(() => {
      result.current.toggleSortDirection()
    })

    expect(result.current.sortState.direction).toBe('asc')
  })

  it('setSortState sets the full state', () => {
    const { result } = renderHook(() => useSortState())

    act(() => {
      result.current.setSortState({ field: 'createdAt', direction: 'desc' })
    })

    expect(result.current.sortState).toEqual({
      field: 'createdAt',
      direction: 'desc',
    })
  })
})
