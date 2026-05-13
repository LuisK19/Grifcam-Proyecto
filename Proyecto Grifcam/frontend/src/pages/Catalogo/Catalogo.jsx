import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import styles from './Catalogo.module.css'
import backendRESTAdapter from '../../adapter/backendRESTAdapter'

const BASE_URL = 'http://localhost:5000'

const FILTROS_ESPECIALES = [
  { key: 'todos',    label: 'Todos'   },
  { key: 'is_offer', label: 'Ofertas' },
  { key: 'is_new',   label: 'Nuevos'  },
]

// Devuelve la URL completa de la primera imagen, o null si no hay
function getPrimeraImagen(product) {
  const imgs = product.product_images
  if (!imgs || imgs.length === 0) return null
  const sorted = [...imgs].sort((a, b) => a.image_order - b.image_order)
  return BASE_URL + sorted[0].image_url
}

export default function Catalogo() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const filtroInicial = searchParams.get('categoria') || 'todos'

  const [filtroActivo, setFiltroActivo] = useState(filtroInicial)
  const [busqueda, setBusqueda]         = useState('')
  const [categorias, setCategorias]     = useState([])
  const [productos, setProductos]       = useState([])
  const [cargando, setCargando]         = useState(true)
  const [error, setError]               = useState('')

  useEffect(() => {
    async function cargarDatos() {
      setCargando(true)
      setError('')
      try {
        const [resCats, resProd] = await Promise.all([
          backendRESTAdapter.obtenerCategorias(),
          backendRESTAdapter.obtenerProductos(),
        ])
        setCategorias(resCats.data)
        setProductos(resProd.data)
      } catch (err) {
        console.error('Error cargando catálogo:', err)
        setError('No se pudo cargar el catálogo. Intentá de nuevo.')
      } finally {
        setCargando(false)
      }
    }
    cargarDatos()
  }, [])

  const productosFiltrados = useMemo(() => {
    let resultado = productos

    if (filtroActivo === 'is_offer') {
      resultado = resultado.filter(p => p.is_offer)
    } else if (filtroActivo === 'is_new') {
      resultado = resultado.filter(p => p.is_new)
    } else if (filtroActivo !== 'todos') {
      resultado = resultado.filter(p => p.category_id === filtroActivo)
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      resultado = resultado.filter(p => p.name.toLowerCase().includes(q))
    }

    return resultado
  }, [productos, filtroActivo, busqueda])

  function cambiarFiltro(key) {
    setFiltroActivo(key)
    setSearchParams({})
  }

  if (cargando) {
    return (
      <main className={styles.page}>
        <p style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>Cargando catálogo...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className={styles.page}>
        <p style={{ textAlign: 'center', padding: '3rem', color: 'red' }}>{error}</p>
      </main>
    )
  }

  return (
    <main className={styles.page}>

      {/* ── BARRA DE BÚSQUEDA ── */}
      <div className={styles.searchWrap}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} strokeWidth={2} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button
              className={styles.searchClear}
              onClick={() => setBusqueda('')}
              aria-label="Limpiar búsqueda"
            >
              <X size={14} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* ── FILTROS ── */}
      <div className={styles.filtrosWrap}>
        <div className={styles.filtros}>
          {FILTROS_ESPECIALES.map(f => (
            <button
              key={f.key}
              className={`${styles.filtroBtn} ${filtroActivo === f.key ? styles.filtroBtnActivo : ''}`}
              onClick={() => cambiarFiltro(f.key)}
            >
              {f.label}
            </button>
          ))}

          <div className={styles.filtroSeparador} />

          {categorias.map(cat => (
            <button
              key={cat.id}
              className={`${styles.filtroBtn} ${filtroActivo === cat.id ? styles.filtroBtnActivo : ''}`}
              onClick={() => cambiarFiltro(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTADOR ── */}
      <p className={styles.contador}>
        {productosFiltrados.length} {productosFiltrados.length === 1 ? 'producto' : 'productos'}
      </p>

      {/* ── CUADRÍCULA ── */}
      {productosFiltrados.length > 0 ? (
        <div className={styles.grid}>
          {productosFiltrados.map(product => {
            const imgUrl = getPrimeraImagen(product)
            return (
              <div
                key={product.id}
                className={styles.card}
                onClick={() => navigate(`/producto/${product.id}`)}
              >
                {(product.is_offer || product.is_new) && (
                  <div className={styles.cardBadges}>
                    {product.is_offer && <span className={styles.badgeOferta}>Oferta</span>}
                    {product.is_new   && <span className={styles.badgeNuevo}>Nuevo</span>}
                  </div>
                )}

                <div className={styles.cardImgWrap}>
                  {imgUrl
                    ? <img src={imgUrl} alt={product.name} className={styles.cardImg} />
                    : <div className={styles.cardImgPlaceholder} />
                  }
                </div>

                <div className={styles.cardInfo}>
                  <p className={styles.cardName}>{product.name}</p>
                  <p className={styles.cardPrice}>
                    ₡ {Number(product.price).toLocaleString('es-CR')}
                  </p>
                  <button
                    className={styles.cardBtn}
                    onClick={e => { e.stopPropagation(); navigate(`/producto/${product.id}`) }}
                  >
                    Ver más
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className={styles.vacio}>
          <p className={styles.vacioTexto}>No se encontraron productos.</p>
          <button
            className={styles.vacioBtn}
            onClick={() => { cambiarFiltro('todos'); setBusqueda('') }}
          >
            Ver todos los productos
          </button>
        </div>
      )}

    </main>
  )
}