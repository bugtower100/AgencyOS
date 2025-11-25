import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type ThemeMode = 'night' | 'day'

interface ThemeState {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'night',
      setMode: (mode) => set({ mode }),
      toggleMode: () => {
        const next = get().mode === 'night' ? 'day' : 'night'
        set({ mode: next })
      },
    }),
    {
      name: 'agency-theme-mode',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => undefined,
            removeItem: () => undefined,
          }
        }
        return window.localStorage
      }),
    },
  ),
)
