import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Tag, Info, Plus, TrendingUp, Star, Sparkles, ChevronRight } from 'lucide-react'
import AdminLayout from '../../../components/AdminLayout/AdminLayout'
import styles from './AdminDashboard.module.css'
import backendRESTAdapter from '../../../adapter/backendRESTAdapter'

export default function AdminDashboard() {
  const navigate = useNavigate()

  const [stats, setStats]       = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargarStats() {
      setCargando(true)
      try {
        const [resProd, resCats] = await Promise.all([
          backendRESTAdapter.obtenerProductos(),
          backendRESTAdapter.obtenerCategorias(),
        ])
        const productos = resProd.data
        setStats({
          totalProductos:      productos.length,
          totalCategorias:     resCats.data.length,
          productosOferta:     productos.filter(p => p.is_offer).length,
          productosNuevos:     productos.filter(p => p.is_new).length,
          productosDestacados: productos.filter(p => p.is_featured).length,
        })
      } catch (err) {
        // En caso de error mostramos ceros
        setStats({
          totalProductos: 0, totalCategorias: 0,
          productosOferta: 0, productosNuevos: 0, productosDestacados: 0,
        })
      } finally {
        setCargando(false)
      }
    }
    cargarStats()
  }, [])

  // Muestra "-" mientras carga, el número real después
  function num(val) {
    if (cargando) return '-'
    return val
  }

  return (
    <AdminLayout>
      <div className={styles.page}>

        {/* ENCABEZADO */}
        <div className={styles.header}>
          <h1 className={styles.titulo}>Dashboard</h1>
          <p className={styles.subtitulo}>Bienvenido al panel de administración de Grifcam</p>
        </div>

        {/* CONTADORES CLICKEABLES */}
        <div className={styles.statsGrid}>

          <button className={styles.statCard} onClick={() => navigate('/admin/categorias')}>
            <div className={styles.statIcono} style={{ background: '#E6F1FB' }}>
              <Tag size={18} color="#185FA5" strokeWidth={1.8} />
            </div>
            <div className={styles.statTexto}>
              <p className={styles.statNumero}>{num(stats?.totalCategorias)}</p>
              <p className={styles.statLabel}>Categorías</p>
            </div>
            <ChevronRight size={14} className={styles.statFlecha} strokeWidth={2} />
          </button>

          <button className={styles.statCard} onClick={() => navigate('/admin/productos')}>
            <div className={styles.statIcono} style={{ background: '#FEF0E6' }}>
              <Package size={18} color="var(--color-primary)" strokeWidth={1.8} />
            </div>
            <div className={styles.statTexto}>
              <p className={styles.statNumero}>{num(stats?.totalProductos)}</p>
              <p className={styles.statLabel}>Productos</p>
            </div>
            <ChevronRight size={14} className={styles.statFlecha} strokeWidth={2} />
          </button>

          <button className={styles.statCard} onClick={() => navigate('/admin/productos?filtro=oferta')}>
            <div className={styles.statIcono} style={{ background: '#FEF0E6' }}>
              <TrendingUp size={18} color="var(--color-primary)" strokeWidth={1.8} />
            </div>
            <div className={styles.statTexto}>
              <p className={styles.statNumero}>{num(stats?.productosOferta)}</p>
              <p className={styles.statLabel}>En oferta</p>
            </div>
            <ChevronRight size={14} className={styles.statFlecha} strokeWidth={2} />
          </button>

          <button className={styles.statCard} onClick={() => navigate('/admin/productos?filtro=nuevo')}>
            <div className={styles.statIcono} style={{ background: '#E1F5EE' }}>
              <Sparkles size={18} color="#0F6E56" strokeWidth={1.8} />
            </div>
            <div className={styles.statTexto}>
              <p className={styles.statNumero}>{num(stats?.productosNuevos)}</p>
              <p className={styles.statLabel}>Nuevos</p>
            </div>
            <ChevronRight size={14} className={styles.statFlecha} strokeWidth={2} />
          </button>

          <button className={styles.statCard} onClick={() => navigate('/admin/productos?filtro=destacado')}>
            <div className={styles.statIcono} style={{ background: '#FEF5E6' }}>
              <Star size={18} color="#B87D0F" strokeWidth={1.8} />
            </div>
            <div className={styles.statTexto}>
              <p className={styles.statNumero}>{num(stats?.productosDestacados)}</p>
              <p className={styles.statLabel}>Destacados</p>
            </div>
            <ChevronRight size={14} className={styles.statFlecha} strokeWidth={2} />
          </button>

        </div>

        {/* ACCESOS RÁPIDOS */}
        <p className={styles.seccionTitulo}>Accesos rápidos</p>
        <div className={styles.accesoGrid}>

          <div
            className={`${styles.accesoCard} ${styles.accesoCardPrimary}`}
            onClick={() => navigate('/admin/productos/nuevo')}
          >
            <div className={`${styles.accesoIcono} ${styles.accesoIconoPrimary}`}>
              <Plus size={22} strokeWidth={1.8} />
            </div>
            <div className={styles.accesoTexto}>
              <p className={styles.accesoTitulo}>Agregar producto</p>
              <p className={styles.accesoDesc}>Crear un nuevo producto en el catálogo</p>
            </div>
          </div>

          <div className={styles.accesoCard} onClick={() => navigate('/admin/productos')}>
            <div className={styles.accesoIcono}>
              <Package size={22} strokeWidth={1.8} />
            </div>
            <div className={styles.accesoTexto}>
              <p className={styles.accesoTitulo}>Gestionar productos</p>
              <p className={styles.accesoDesc}>Ver, editar y eliminar productos</p>
            </div>
          </div>

          <div className={styles.accesoCard} onClick={() => navigate('/admin/categorias')}>
            <div className={styles.accesoIcono} style={{ background: '#E6F1FB' }}>
              <Tag size={22} color="#185FA5" strokeWidth={1.8} />
            </div>
            <div className={styles.accesoTexto}>
              <p className={styles.accesoTitulo}>Gestionar categorías</p>
              <p className={styles.accesoDesc}>Crear y organizar categorías</p>
            </div>
          </div>

          <div className={styles.accesoCard} onClick={() => navigate('/admin/info')}>
            <div className={styles.accesoIcono}>
              <Info size={22} strokeWidth={1.8} />
            </div>
            <div className={styles.accesoTexto}>
              <p className={styles.accesoTitulo}>Editar página Info</p>
              <p className={styles.accesoDesc}>Actualizar descripción, horario y políticas</p>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  )
}