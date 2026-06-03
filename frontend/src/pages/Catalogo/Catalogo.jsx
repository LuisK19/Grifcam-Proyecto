// src/pages/Catalogo/Catalogo.jsx

import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { Search, X, SlidersHorizontal, LayoutGrid, Grid2x2, Grid3x3 } from 'lucide-react'
import styles from './Catalogo.module.css'
import backendRESTAdapter from '../../adapter/backendRESTAdapter'

const FILTROS_ESPECIALES = [
  { key: 'todos',    label: 'Todos'   },
  { key: 'is_offer', label: 'Ofertas' },
  { key: 'is_new',   label: 'Nuevos'  },
]

function getPrimeraImagen(product) {
  const imgs = product.product_images
  if (!imgs || imgs.length === 0) return null
  return [...imgs].sort((a, b) => a.image_order - b.image_order)[0].image_url
}

// === Skeletons ===
function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={`${styles.skeleton} ${styles.skeletonImg}`} />
      <div className={styles.skeletonBody}>
        <div className={`${styles.skeleton} ${styles.skeletonNombre}`} />
        <div className={`${styles.skeleton} ${styles.skeletonPrecio}`} />
      </div>
    </div>
  )
}

function SkeletonSidebar() {
  return (
    <div className={styles.sidebarPanel}>
      <div className={`${styles.skeleton} ${styles.skeletonSidebarTitle}`} />
      {[...Array(6)].map((_, i) => (
        <div key={i} className={`${styles.skeleton} ${styles.skeletonSidebarItem}`} />
      ))}
      <div className={styles.panelDivisor} />
      <div className={`${styles.skeleton} ${styles.skeletonSidebarTitle}`} />
      <div className={`${styles.skeleton} ${styles.skeletonSidebarSlider}`} />
    </div>
  )
}

// === Panel de filtros ===
function PanelFiltros({
  categorias,
  catSeleccionadas, setCatSeleccionadas,
  precioMax, precioMaxReal, setPrecioMax,
  precioMin, setPrecioMin,
  onAplicar, onLimpiar,
}) {
  function toggleCat(id) {
    setCatSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  return (
    <div className={styles.sidebarPanel}>
      <div className={styles.panelHeader}>
        <p className={styles.panelTitulo}>Categorías</p>
        {catSeleccionadas.length > 0 && (
          <button className={styles.panelLimpiarBtn} onClick={() => setCatSeleccionadas([])}>
            Limpiar
          </button>
        )}
      </div>
      <div className={styles.catLista}>
        {categorias.map(cat => (
          <label key={cat.id} className={styles.catItem}>
            <input
              type="checkbox"
              className={styles.catCheckbox}
              checked={catSeleccionadas.includes(cat.id)}
              onChange={() => toggleCat(cat.id)}
            />
            <span className={styles.catNombre}>{cat.name}</span>
          </label>
        ))}
      </div>

      <div className={styles.panelDivisor} />

      <div className={styles.panelHeader}>
        <p className={styles.panelTitulo}>Precio</p>
      </div>

      <div className={styles.precioEtiquetas}>
        <span>₡ 0</span>
        <span>₡ {precioMaxReal.toLocaleString('es-CR')}</span>
      </div>

      <input
        type="range"
        className={styles.precioSlider}
        min={0}
        max={precioMaxReal}
        step={100}
        value={precioMax}
        onChange={e => setPrecioMax(Number(e.target.value))}
      />

      <div className={styles.precioInputs}>
        <div className={styles.precioInputWrap}>
          <span className={styles.precioMoneda}>₡</span>
          <input
            type="number"
            className={styles.precioInput}
            value={precioMin}
            min={0}
            max={precioMax}
            onChange={e => setPrecioMin(Math.min(Number(e.target.value), precioMax))}
          />
        </div>
        <span className={styles.precioSeparador}>—</span>
        <div className={styles.precioInputWrap}>
          <span className={styles.precioMoneda}>₡</span>
          <input
            type="number"
            className={styles.precioInput}
            value={precioMax}
            min={precioMin}
            max={precioMaxReal}
            onChange={e => setPrecioMax(Math.max(Number(e.target.value), precioMin))}
          />
        </div>
      </div>

      <button className={styles.aplicarBtn} onClick={onAplicar}>
        Aplicar filtros
      </button>
      <button className={styles.limpiarTodoBtn} onClick={onLimpiar}>
        Limpiar todo
      </button>
    </div>
  )
}

export default function Catalogo() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  // === Scroll al tope cuando cambia la ruta ===
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  // === Estado de datos ===
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos]   = useState([])
  const [cargando, setCargando]     = useState(true)
  const [error, setError]           = useState('')

  // === Filtros ===
  const [busqueda, setBusqueda]             = useState('')
  const [filtroEspecial, setFiltroEspecial] = useState(searchParams.get('filtro') || 'todos')
  const [catSeleccionadas, setCatSeleccionadas] = useState(
    searchParams.get('categoria') ? [searchParams.get('categoria')] : []
  )
  const [precioMin, setPrecioMin]         = useState(0)
  const [precioMax, setPrecioMax]         = useState(999999)
  const [precioMaxReal, setPrecioMaxReal] = useState(999999)
  const [filtrosAplicados, setFiltrosAplicados] = useState({
    cats: searchParams.get('categoria') ? [searchParams.get('categoria')] : [],
    min: 0,
    max: 999999,
  })

  // === UI ===
  const [drawerAbierto, setDrawerAbierto] = useState(false)
  // columnas: 3 | 4 | 5  (solo afecta desktop — en mobile siempre 2)
  const [columnas, setColumnas] = useState(4)

  // === Carga de datos ===
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

        const maxPrecio = Math.max(...resProd.data.map(p => Number(p.price)), 0)
        const maxRedondeado = Math.ceil(maxPrecio / 1000) * 1000
        setPrecioMaxReal(maxRedondeado)
        setPrecioMax(maxRedondeado)
        setFiltrosAplicados(prev => ({ ...prev, max: maxRedondeado }))
      } catch (err) {
        console.error('Error cargando catálogo:', err)
        setError('No se pudo cargar el catálogo. Intentá de nuevo.')
      } finally {
        setCargando(false)
      }
    }
    cargarDatos()
  }, [])

  function aplicarFiltros() {
    setFiltrosAplicados({ cats: catSeleccionadas, min: precioMin, max: precioMax })
    setDrawerAbierto(false)
  }

  function limpiarTodo() {
    setCatSeleccionadas([])
    setPrecioMin(0)
    setPrecioMax(precioMaxReal)
    setFiltrosAplicados({ cats: [], min: 0, max: precioMaxReal })
    setFiltroEspecial('todos')
    setBusqueda('')
    setSearchParams({})
  }

  const productosFiltrados = useMemo(() => {
    let res = productos
    if (filtroEspecial === 'is_offer') res = res.filter(p => p.is_offer)
    else if (filtroEspecial === 'is_new') res = res.filter(p => p.is_new)
    if (filtrosAplicados.cats.length > 0)
      res = res.filter(p => filtrosAplicados.cats.includes(p.category_id))
    res = res.filter(p => {
      const precio = Number(p.price)
      return precio >= filtrosAplicados.min && precio <= filtrosAplicados.max
    })
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      res = res.filter(p => p.name.toLowerCase().includes(q))
    }
    return res
  }, [productos, filtroEspecial, filtrosAplicados, busqueda])

  const filtrosActivosCount = useMemo(() => {
    let count = filtrosAplicados.cats.length
    if (filtrosAplicados.min > 0 || filtrosAplicados.max < precioMaxReal) count++
    return count
  }, [filtrosAplicados, precioMaxReal])

  function cambiarFiltroEspecial(key) {
    setFiltroEspecial(key)
    setSearchParams(key === 'todos' ? {} : { filtro: key })
  }

  // Clase del grid según columnas seleccionadas
  const gridClass = [
    styles.grid,
    columnas === 3 ? styles.grid3 :
    columnas === 4 ? styles.grid4 : styles.grid5
  ].join(' ')

  if (error) {
    return (
      <main className={styles.page}>
        <p style={{ textAlign: 'center', padding: '3rem', color: 'red' }}>{error}</p>
      </main>
    )
  }

  return (
    <main className={styles.page}>

      {/* === BÚSQUEDA === */}
      <div className={styles.searchWrap}>
        <div className={styles.searchBox}>
          <Search size={15} className={styles.searchIcon} strokeWidth={2} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button className={styles.searchClear} onClick={() => setBusqueda('')} aria-label="Limpiar">
              <X size={13} strokeWidth={2} />
            </button>
          )}
        </div>
        <button
          className={styles.btnFiltrosMobile}
          onClick={() => setDrawerAbierto(true)}
          aria-label="Abrir filtros"
        >
          <SlidersHorizontal size={16} strokeWidth={2} />
          Filtros
          {filtrosActivosCount > 0 && (
            <span className={styles.filtrosBadge}>{filtrosActivosCount}</span>
          )}
        </button>
      </div>

      {/* === CHIPS + SELECTOR COLUMNAS === */}
      <div className={styles.barraSecundaria}>
        <div className={styles.chipsWrap}>
          {FILTROS_ESPECIALES.map(f => (
            <button
              key={f.key}
              className={`${styles.chip} ${filtroEspecial === f.key ? styles.chipActivo : ''}`}
              onClick={() => cambiarFiltroEspecial(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Selector de columnas — solo desktop */}
        <div className={styles.columnasSelector}>
          <button
            className={`${styles.columnaBtn} ${columnas === 3 ? styles.columnaBtnActivo : ''}`}
            onClick={() => setColumnas(3)}
            aria-label="3 columnas"
            title="3 columnas"
          >
            <Grid2x2 size={15} strokeWidth={2} />
          </button>
          <button
            className={`${styles.columnaBtn} ${columnas === 4 ? styles.columnaBtnActivo : ''}`}
            onClick={() => setColumnas(4)}
            aria-label="4 columnas"
            title="4 columnas"
          >
            <LayoutGrid size={15} strokeWidth={2} />
          </button>
          <button
            className={`${styles.columnaBtn} ${columnas === 5 ? styles.columnaBtnActivo : ''}`}
            onClick={() => setColumnas(5)}
            aria-label="5 columnas"
            title="5 columnas"
          >
            <Grid3x3 size={15} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* === LAYOUT PRINCIPAL === */}
      <div className={styles.layout}>

        {/* Sidebar desktop */}
        <aside className={styles.sidebar}>
          {cargando ? (
            <SkeletonSidebar />
          ) : (
            <PanelFiltros
              categorias={categorias}
              catSeleccionadas={catSeleccionadas}
              setCatSeleccionadas={setCatSeleccionadas}
              precioMax={precioMax}
              precioMaxReal={precioMaxReal}
              setPrecioMax={setPrecioMax}
              precioMin={precioMin}
              setPrecioMin={setPrecioMin}
              onAplicar={aplicarFiltros}
              onLimpiar={limpiarTodo}
            />
          )}
        </aside>

        {/* Contenido central */}
        <div className={styles.contenido}>
          <p className={styles.contador}>
            {cargando ? 'Cargando...' : `${productosFiltrados.length} ${productosFiltrados.length === 1 ? 'producto' : 'productos'}`}
          </p>

          {cargando ? (
            <div className={styles.grid}>
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : productosFiltrados.length > 0 ? (
            <div className={gridClass}>
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
                      <p className={styles.cardPrice}>₡ {Number(product.price).toLocaleString('es-CR')}</p>
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
              <button className={styles.vacioBtn} onClick={limpiarTodo}>
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* === DRAWER MOBILE === */}
      {drawerAbierto && (
        <div className={styles.drawerOverlay} onClick={() => setDrawerAbierto(false)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <p className={styles.drawerTitulo}>Filtros</p>
              <button className={styles.drawerCerrar} onClick={() => setDrawerAbierto(false)} aria-label="Cerrar">
                <X size={18} strokeWidth={2} />
              </button>
            </div>
            <div className={styles.drawerBody}>
              <PanelFiltros
                categorias={categorias}
                catSeleccionadas={catSeleccionadas}
                setCatSeleccionadas={setCatSeleccionadas}
                precioMax={precioMax}
                precioMaxReal={precioMaxReal}
                setPrecioMax={setPrecioMax}
                precioMin={precioMin}
                setPrecioMin={setPrecioMin}
                onAplicar={aplicarFiltros}
                onLimpiar={limpiarTodo}
              />
            </div>
          </div>
        </div>
      )}

    </main>
  )
}