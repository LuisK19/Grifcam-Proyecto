import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function useDarkMode() {
  const location = useLocation()
  const esAdmin = location.pathname.startsWith('/admin')

  const [oscuro, setOscuro] = useState(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) return false
    const guardado = localStorage.getItem('grifcam-tema')
    if (guardado) return guardado === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    if (esAdmin) {
      document.documentElement.setAttribute('data-theme', 'light')
      return
    }
    document.documentElement.setAttribute('data-theme', oscuro ? 'dark' : 'light')
    localStorage.setItem('grifcam-tema', oscuro ? 'dark' : 'light')
  }, [oscuro, esAdmin])

  return [oscuro, setOscuro]
}