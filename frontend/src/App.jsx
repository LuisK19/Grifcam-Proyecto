import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'

import Home from './pages/Home/Home'
import Navbar from './components/Navbar/Navbar'
import Catalogo from './pages/Catalogo/Catalogo'
import Login from './pages/Login/Login'
import ProductDetail from './pages/ProductDetail/ProductDetail'
import Info from './pages/Info/Info'
import AdminDashboard from './pages/Admin/Dashboard/AdminDashboard'
import AdminProductos from './pages/Admin/Productos/AdminProductos'
import AdminProductoForm from './pages/Admin/ProductosForm/AdminProductoForm'
import AdminCategorias from './pages/Admin/Categorias/AdminCategorias'
import AdminInfo from './pages/Admin/Info/AdminInfo'
import Carrito from './pages/Carrito/Carrito'



function AppContent() {
  const location = useLocation()
  const esAdmin = location.pathname.startsWith('/admin')

  return (
    <>
      {!esAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/info" element={<Info />} />
        
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/productos" element={<AdminProductos />} />
        <Route path="/admin/productos/nuevo"          element={<AdminProductoForm />} />
        <Route path="/admin/productos/:id/editar"     element={<AdminProductoForm />} />
        <Route path="/admin/categorias" element={<AdminCategorias />} />
        <Route path="/admin/info" element={<AdminInfo />} />

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