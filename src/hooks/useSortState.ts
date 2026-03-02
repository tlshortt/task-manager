import { useState, useEffect, useCallback } from 'react'
import type { SortState, SortField } from '../types'

const STORAGE_KEY = 'task-manager-sort'

const DEFAULT_SORT_STATE: SortState = {
  field: 'dueDate',
  direction: 'asc',
}

function isValidSortState(value: unknown): value is SortState {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  const validFields: SortField[] = ['dueDate', 'priority', 'title', 'createdAt']
  return (
    validFields.includes(obj.field as SortField) &&
    (obj.direction === 'asc' || obj.direction === 'desc')
  )
}

function loadSortState(): SortState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      const parsed = JSON.parse(stored)
      if (isValidSortState(parsed)) {
        return parsed
      }
    }
  } catch {
    // Invalid JSON or storage error — fall back to default
  }
  return DEFAULT_SORT_STATE
}

interface UseSortStateReturn {
  sortState: SortState
  setSortField: (field: SortField) => void
  toggleSortDirection: () => void
  setSortState: (state: SortState) => void
}

export function useSortState(): UseSortStateReturn {
  const [sortState, setSortStateInternal] = useState<SortState>(loadSortState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sortState))
  }, [sortState])

  const setSortField = useCallback((field: SortField) => {
    setSortStateInternal(prev => ({
      field,
      direction: field === prev.field ? prev.direction : (field === 'priority' ? 'desc' : 'asc'),
    }))
  }, [])

  const toggleSortDirection = useCallback(() => {
    setSortStateInternal(prev => ({
      ...prev,
      direction: prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }, [])

  const setSortState = useCallback((state: SortState) => {
    setSortStateInternal(state)
  }, [])

  return { sortState, setSortField, toggleSortDirection, setSortState }
}
