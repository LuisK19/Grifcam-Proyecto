import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDarkMode } from './hooks/useDarkMode'
import { Moon, Sun } from 'lucide-react'

import Home            from './pages/Home/Home'
import Navbar          from './components/Navbar/Navbar'
import Catalogo        from './pages/Catalogo/Catalogo'
import ProductDetail   from './pages/ProductDetail/ProductDetail'
import Info            from './pages/Info/Info'
import Login           from './pages/Admin/Login/Login'
import AdminDashboard  from './pages/Admin/Dashboard/AdminDashboard'
import AdminProductos  from './pages/Admin/Productos/AdminProductos'
import AdminProductoForm from './pages/Admin/ProductosForm/AdminProductoForm'
import AdminCategorias from './pages/Admin/Categorias/AdminCategorias'
import AdminInfo       from './pages/Admin/Info/AdminInfo'
import Carrito         from './pages/Carrito/Carrito'

// === Scroll al tope en cada cambio de ruta ===
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

// === Guard de rutas admin ===
function RutaAdmin({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/admin/login" replace />
  return children
}

function DarkModeToggle() {
  const [oscuro, setOscuro] = useDarkMode()
  const location = useLocation()
  const esAdmin = location.pathname.startsWith('/admin')
  
  // En admin forzar modo claro
  useEffect(() => {
    if (esAdmin) {
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }, [esAdmin])

  if (esAdmin) return null

  return (
    <button
      onClick={() => setOscuro(o => !o)}
      aria-label={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="darkModeFloatingBtn"
      style={{
        position: 'fixed',
        bottom: '5.5rem',
        right: '1rem',
        zIndex: 150,
        width: '2.75rem',
        height: '2.75rem',
        borderRadius: '50%',
        border: '0.0625rem solid var(--color-border)',
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: 'var(--shadow)',
      }}
    >
      {oscuro
        ? <Sun  size={18} strokeWidth={1.8} />
        : <Moon size={18} strokeWidth={1.8} />
      }
    </button>
  )
}

function AppContent() {
  const location = useLocation()
  const esAdmin = location.pathname.startsWith('/admin')

  return (
    <>
      <ScrollToTop />
      <DarkModeToggle />
      {!esAdmin && <Navbar />}
      <Routes>
        {/* Rutas públicas */}
        <Route path="/"            element={<Home />} />
        <Route path="/catalogo"    element={<Catalogo />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/carrito"     element={<Carrito />} />
        <Route path="/info"        element={<Info />} />

        {/* Login - público */}
        <Route path="/admin/login" element={<Login />} />

        {/* Rutas admin - protegidas */}
        <Route path="/admin"                      element={<RutaAdmin><AdminDashboard /></RutaAdmin>} />
        <Route path="/admin/productos"            element={<RutaAdmin><AdminProductos /></RutaAdmin>} />
        <Route path="/admin/productos/nuevo"      element={<RutaAdmin><AdminProductoForm /></RutaAdmin>} />
        <Route path="/admin/productos/:id/editar" element={<RutaAdmin><AdminProductoForm /></RutaAdmin>} />
        <Route path="/admin/categorias"           element={<RutaAdmin><AdminCategorias /></RutaAdmin>} />
        <Route path="/admin/info"                 element={<RutaAdmin><AdminInfo /></RutaAdmin>} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App