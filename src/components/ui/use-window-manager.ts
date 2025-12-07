import { useState, useCallback } from 'react'

interface WindowManagerState {
  windowOrder: string[]
  baseZIndex: number
}

export function useWindowManager(baseZIndex = 40) {
  const [state, setState] = useState<WindowManagerState>({
    windowOrder: [],
    baseZIndex
  })

  /**
   * Register a new window (called when window opens)
   */
  const registerWindow = useCallback((id: string) => {
    setState(prev => {
      // If already registered, bring to front
      if (prev.windowOrder.includes(id)) {
        return {
          ...prev,
          windowOrder: [...prev.windowOrder.filter(wId => wId !== id), id]
        }
      }
      // Otherwise add to end (top)
      return {
        ...prev,
        windowOrder: [...prev.windowOrder, id]
      }
    })
  }, [])

  /**
   * Unregister a window (called when window closes)
   */
  const unregisterWindow = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      windowOrder: prev.windowOrder.filter(wId => wId !== id)
    }))
  }, [])

  /**
   * Bring a window to front (called on click or drag)
   */
  const bringToFront = useCallback((id: string) => {
    setState(prev => {
      // If already at the top, no change needed
      if (prev.windowOrder[prev.windowOrder.length - 1] === id) {
        return prev
      }
      // Move to end of array (highest z-index)
      return {
        ...prev,
        windowOrder: [...prev.windowOrder.filter(wId => wId !== id), id]
      }
    })
  }, [])

  /**
   * Get z-index for a specific window
   */
  const getZIndex = useCallback((id: string): number => {
    const index = state.windowOrder.indexOf(id)
    if (index === -1) return state.baseZIndex
    return state.baseZIndex + index
  }, [state.windowOrder, state.baseZIndex])

  return {
    registerWindow,
    unregisterWindow,
    bringToFront,
    getZIndex,
    windowOrder: state.windowOrder
  }
}

export type WindowManager = ReturnType<typeof useWindowManager>
