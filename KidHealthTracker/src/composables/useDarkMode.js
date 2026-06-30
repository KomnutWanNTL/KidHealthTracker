import { ref } from 'vue'

const THEME_KEY = 'kidhealth-dark-mode'
const LIGHT_THEME = '#F8FAFC'
const DARK_THEME = '#0F172A'

const isDark = ref(false)
let initialized = false

export function useDarkMode() {
  function applyTheme(dark, persist) {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.content = dark ? DARK_THEME : LIGHT_THEME
    if (persist) {
      localStorage.setItem(THEME_KEY, dark ? 'on' : 'off')
    }
    isDark.value = dark
  }

  function init() {
    if (initialized) return
    initialized = true

    isDark.value = document.documentElement.classList.contains('dark')

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const stored = localStorage.getItem(THEME_KEY)
      if (stored !== 'on' && stored !== 'off') {
        applyTheme(e.matches, false)
      }
    })
  }

  function toggle() {
    applyTheme(!isDark.value, true)
  }

  return { isDark, toggle, init }
}
