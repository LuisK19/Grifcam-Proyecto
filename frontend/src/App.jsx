import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'

import Home from './pages/Home/Home'
import Navbar from './components/Navbar/Navbar'
import Catalogo from './pages/Catalogo/Catalogo'
import Login from './pages/Login/Login'
import ProductDetail from './pages/ProductDetail/ProductDetail'
import Info from './pages/Info/Info'
// import Admin from './pages/Admin/Admin'

function AppContent() {
  const location = useLocation()
  const esAdmin = location.pathname.startsWith('/admin')

  return (
    <>
      {!esAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/info" element={<Info />} />
        {/* <Route path="/admin" element={<Admin />} /> */}
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