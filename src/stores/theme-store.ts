import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type ThemeMode = 'night' | 'day' | 'win98' | 'retro' | 'fluent' | 'siphon'
export type Win98TitleBarColor = 'blue' | 'red'

interface ThemeState {
  mode: ThemeMode
  win98TitleBarColor: Win98TitleBarColor
  dayFlatStyle: boolean
  setMode: (mode: ThemeMode) => void
  setWin98TitleBarColor: (color: Win98TitleBarColor) => void
  setDayFlatStyle: (flat: boolean) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'win98',
      win98TitleBarColor: 'blue',
      dayFlatStyle: false,
      setMode: (mode) => set({ mode }),
      setWin98TitleBarColor: (color) => set({ win98TitleBarColor: color }),
      setDayFlatStyle: (flat) => set({ dayFlatStyle: flat }),
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
