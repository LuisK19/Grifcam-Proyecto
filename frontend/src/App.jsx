// src/App.jsx

import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'

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

function AppContent() {
  const location = useLocation()
  const esAdmin = location.pathname.startsWith('/admin')

  return (
    <>
      <ScrollToTop />
      {!esAdmin && <Navbar />}
      <Routes>
        {/* Rutas públicas */}
        <Route path="/"            element={<Home />} />
        <Route path="/catalogo"    element={<Catalogo />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/carrito"     element={<Carrito />} />
        <Route path="/info"        element={<Info />} />

        {/* Login — público */}
        <Route path="/admin/login" element={<Login />} />

        {/* Rutas admin — protegidas */}
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