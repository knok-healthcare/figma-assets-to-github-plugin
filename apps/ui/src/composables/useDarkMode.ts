import { ref } from "vue"

export function useDarkMode() {
  const isDarkMode = ref(false)

  const initDarkMode = () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDarkMode.value = prefersDark

    // Apply theme
    updateTheme()
  }

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
    updateTheme()
  }

  const updateTheme = () => {
    document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light')
  }

  // Initialize on mount
  initDarkMode()

  return {
    isDarkMode,
    toggleDarkMode
  }
}
