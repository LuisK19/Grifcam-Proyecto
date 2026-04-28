import { BrowserRouter, Routes, Route } from 'react-router-dom'
//import Login from './pages/Login/Login'

// Descomentar conforme se vayan completando:
import Home from './pages/Home/Home'
// import Catalogo from './pages/Catalogo/Catalogo'
// import ProductDetail from './pages/ProductDetail/ProductDetail'
// import Info from './pages/Info/Info'
// import Admin from './pages/Admin/Admin'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*<Route path="/admin/login" element={<Login />} />*/}
        <Route path="/" element={<Home />} />
        {/* <Route path="/catalogo" element={<Catalogo />} /> */}
        {/* <Route path="/producto/:id" element={<ProductDetail />} /> */}
        {/* <Route path="/info" element={<Info />} /> */}
        {/* <Route path="/admin" element={<Admin />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App