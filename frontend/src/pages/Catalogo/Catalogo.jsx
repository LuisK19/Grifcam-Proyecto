import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import styles from './Catalogo.module.css'

const MOCK_CATEGORIES = [
  { id: 'cat-1', name: 'Lácteos'    },
  { id: 'cat-2', name: 'Bebidas'    },
  { id: 'cat-3', name: 'Snacks'     },
  { id: 'cat-4', name: 'Limpieza'   },
]

const MOCK_PRODUCTS = [
  { id: 'p-1',  name: 'Producto 1',  description: 'Descripción del producto 1.', price: 2500,  category_id: 'cat-1', image_url: null, is_offer: true,  is_new: false },
  { id: 'p-2',  name: 'Producto 2',  description: 'Descripción del producto 2.', price: 3800,  category_id: 'cat-2', image_url: null, is_offer: false, is_new: true  },
  { id: 'p-3',  name: 'Producto 3',  description: 'Descripción del producto 3.', price: 1200,  category_id: 'cat-1', image_url: null, is_offer: true,  is_new: false },
  { id: 'p-4',  name: 'Producto 4',  description: 'Descripción del producto 4.', price: 4500,  category_id: 'cat-3', image_url: null, is_offer: false, is_new: true  },
  { id: 'p-5',  name: 'Producto 5',  description: 'Descripción del producto 5.', price: 2900,  category_id: 'cat-2', image_url: null, is_offer: false, is_new: false },
  { id: 'p-6',  name: 'Producto 6',  description: 'Descripción del producto 6.', price: 3600,  category_id: 'cat-4', image_url: null, is_offer: true,  is_new: false },
  { id: 'p-7',  name: 'Producto 7',  description: 'Descripción del producto 7.', price: 1800,  category_id: 'cat-3', image_url: null, is_offer: false, is_new: true  },
  { id: 'p-8',  name: 'Producto 8',  description: 'Descripción del producto 8.', price: 5200,  category_id: 'cat-4', image_url: null, is_offer: false, is_new: false },
  { id: 'p-9',  name: 'Producto 9',  description: 'Descripción del producto 9.', price: 990,   category_id: 'cat-1', image_url: null, is_offer: true,  is_new: false },
  { id: 'p-10', name: 'Producto 10', description: 'Descripción del producto 10.', price: 6800, category_id: 'cat-2', image_url: null, is_offer: false, is_new: true  },
]

const FILTROS_ESPECIALES = [
  { key: 'todos',    label: 'Todos'   },
  { key: 'is_offer', label: 'Ofertas' },
  { key: 'is_new',   label: 'Nuevos'  },
]

export default function Catalogo() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const filtroInicial = searchParams.get('categoria') || 'todos'

  const [filtroActivo, setFiltroActivo] = useState(filtroInicial)
  const [busqueda, setBusqueda] = useState('')

  const productosFiltrados = useMemo(() => {
    let resultado = MOCK_PRODUCTS

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
  }, [filtroActivo, busqueda])

  function cambiarFiltro(key) {
    setFiltroActivo(key)
    setSearchParams({})
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

          {MOCK_CATEGORIES.map(cat => (
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
          {productosFiltrados.map(product => (
            <div
              key={product.id}
              className={styles.card}
              onClick={() => navigate(`/producto/${product.id}`)}
            >
              {(product.is_offer || product.is_new) && (
                <div className={styles.cardBadges}>
                  {product.is_offer && <span className={styles.badgeOferta}>Oferta</span>}
                  {product.is_new  && <span className={styles.badgeNuevo}>Nuevo</span>}
                </div>
              )}

              <div className={styles.cardImgWrap}>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className={styles.cardImg} />
                ) : (
                  <div className={styles.cardImgPlaceholder} />
                )}
              </div>

              <div className={styles.cardInfo}>
                <p className={styles.cardName}>{product.name}</p>
                <p className={styles.cardPrice}>
                  ₡ {product.price.toLocaleString('es-CR')}
                </p>
                <button
                  className={styles.cardBtn}
                  onClick={e => {
                    e.stopPropagation()
                    navigate(`/producto/${product.id}`)
                  }}
                >
                  Ver más
                </button>
              </div>
            </div>
          ))}
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
