import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './Home.module.css'
import heroBg from '../../assets/bg.png'
import heroBgDark from '../../assets/bg-dark.png'
import backendRESTAdapter from '../../adapter/backendRESTAdapter'

function getPrimeraImagen(product) {
  const imgs = product.product_images
  if (!imgs || imgs.length === 0) return null
  const sorted = [...imgs].sort((a, b) => a.image_order - b.image_order)
  return sorted[0].image_url
}

// === Skeleton de tarjeta de producto ===
function SkeletonProductoCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={`${styles.skeleton} ${styles.skeletonImg}`} />
      <div className={styles.skeletonInfo}>
        <div className={`${styles.skeleton} ${styles.skeletonBadge}`} />
        <div className={`${styles.skeleton} ${styles.skeletonNombre}`} />
        <div className={`${styles.skeleton} ${styles.skeletonPrecio}`} />
      </div>
    </div>
  )
}

// === Skeleton de tarjeta de categoría ===
function SkeletonCategoriaCard() {
  return (
    <div className={styles.skeletonCatCard}>
      <div className={`${styles.skeleton} ${styles.skeletonCatIcono}`} />
      <div className={`${styles.skeleton} ${styles.skeletonCatNombre}`} />
    </div>
  )
}

// === Skeleton del carrusel completo ===
function SkeletonCarrusel({ tipo = 'producto', cantidad = 2 }) {
  return (
    <div className={styles.carruselWrapper}>
      <div className={styles.skeletonCarruselBtn} />
      <div className={styles.carruselVentana}>
        {Array.from({ length: cantidad }).map((_, i) =>
          tipo === 'producto'
            ? <SkeletonProductoCard key={i} />
            : <SkeletonCategoriaCard key={i} />
        )}
      </div>
      <div className={styles.skeletonCarruselBtn} />
    </div>
  )
}

// Colores rotativos para avatares de categoría
const CAT_COLORS = [
  { bg: 'var(--color-avatar-orange-bg)', color: 'var(--color-avatar-orange-text)' },
  { bg: 'var(--color-avatar-blue-bg)',   color: 'var(--color-avatar-blue-text)'   },
  { bg: 'var(--color-avatar-green-bg)',  color: 'var(--color-avatar-green-text)'  },
  { bg: 'var(--color-avatar-yellow-bg)', color: 'var(--color-avatar-yellow-text)' },
  { bg: 'var(--color-avatar-purple-bg)', color: 'var(--color-avatar-purple-text)' },
  { bg: 'var(--color-avatar-red-bg)',    color: 'var(--color-avatar-red-text)'    },
]

function CatAvatar({ name, index }) {
  // Ignora palabras cortas (artículos, preposiciones) para las iniciales
  const IGNORAR = new Set(['y','e','o','a','de','del','la','el','los','las','un','una','en','con'])
  const palabras = name.split(' ').filter(w => w.length > 0 && !IGNORAR.has(w.toLowerCase()))
  const initials = palabras.length >= 2
    ? (palabras[0][0] + palabras[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
  const { bg, color } = CAT_COLORS[index % CAT_COLORS.length]
  return (
    <div style={{
      width: '2.25rem', height: '2.25rem', borderRadius: 'var(--radius-sm)',
      background: bg, color, display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0,
      fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.03em',
    }}>
      {initials}
    </div>
  )
}

// === Carrusel ===
function Carrusel({ items, renderCard, visibleCount = 1 }) {
  const [pagina, setPagina] = useState(0)
  const totalPaginas = Math.max(1, Math.ceil(items.length / visibleCount))
  const paginaSegura = useMemo(() => Math.min(pagina, totalPaginas - 1), [pagina, totalPaginas])
  const inicio   = paginaSegura * visibleCount
  const visibles = items.slice(inicio, inicio + visibleCount)

  return (
    <div className={styles.carruselWrapper}>
      <button className={styles.carruselBtn} onClick={() => setPagina(p => (p - 1 + totalPaginas) % totalPaginas)} aria-label="Anterior">
        <ChevronLeft size={16} strokeWidth={2.5} />
      </button>
      <div className={styles.carruselVentana}>
        {visibles.map(item => renderCard(item))}
      </div>
      <button className={styles.carruselBtn} onClick={() => setPagina(p => (p + 1) % totalPaginas)} aria-label="Siguiente">
        <ChevronRight size={16} strokeWidth={2.5} />
      </button>
      <div className={styles.dots}>
        {Array.from({ length: totalPaginas }).map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === paginaSegura ? styles.dotActivo : ''}`}
            onClick={() => setPagina(i)}
            aria-label={`Página ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)
  const [oscuro, setOscuro] = useState(
    () => document.documentElement.getAttribute('data-theme') === 'dark'
  )

  // Escuchar cambios en data-theme para actualizar el fondo del hero
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setOscuro(document.documentElement.getAttribute('data-theme') === 'dark')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])
  const [negocio, setNegocio]           = useState(null)
  const [productos, setProductos]       = useState([])
  const [categorias, setCategorias]     = useState([])
  const [cargandoProd, setCargandoProd] = useState(true)
  const [cargandoCats, setCargandoCats] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = e => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [resProd, resCats, resBiz] = await Promise.all([
          backendRESTAdapter.obtenerProductos(),
          backendRESTAdapter.obtenerCategorias(),
          backendRESTAdapter.obtenerBusiness(),
        ])
        // Mostrar productos en oferta O destacados en el carrusel del home
        const destacados = resProd.data.filter(p => p.is_offer || p.is_featured)
        setProductos(destacados)
        setCategorias(resCats.data)
        if (resBiz?.data) setNegocio(resBiz.data)
      } catch (err) {
      } finally {
        setCargandoProd(false)
        setCargandoCats(false)
      }
    }
    cargarDatos()
  }, [])

  const visibleCount = isDesktop ? 2 : 1

  return (
    <main className={styles.page}>

      {/* === HERO === */}
      <section className={styles.hero}>
        <div className={styles.heroBg} style={{ backgroundImage: `url(${oscuro ? heroBgDark : heroBg})` }} />
        <div className={styles.heroContenido}>
          <span className={styles.heroEyebrow}>Distribuidora Grifcam</span>
          <h1 className={styles.heroTitulo}>Bienvenidos a<br />Grifcam</h1>
          <p className={styles.heroSub}>
            {negocio?.descripcion_corta ?? 'Productos de calidad para tu negocio, directo al mejor precio.'}
          </p>
          <button className={styles.heroBtn} onClick={() => navigate('/catalogo')}>
            Ver catálogo
            <ArrowRight size={15} strokeWidth={2.2} />
          </button>
        </div>
      </section>

      {/* === CARRUSEL PRODUCTOS - skeleton mientras carga === */}
      <section className={styles.seccion}>
        <p className={styles.seccionTitulo}>Ofertas y destacados</p>
        {cargandoProd ? (
          <SkeletonCarrusel tipo="producto" cantidad={visibleCount} />
        ) : productos.length > 0 ? (
          <Carrusel
            items={productos}
            visibleCount={visibleCount}
            renderCard={item => {
              const imgUrl = getPrimeraImagen(item)
              return (
                <div
                  key={item.id}
                  className={styles.productoCard}
                  onClick={() => navigate(`/producto/${item.id}`)}
                >
                  <div className={styles.productoImg}>
                    {imgUrl && (
                      <img src={imgUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  <div className={styles.productoInfo}>
                    {item.is_offer && <span className={styles.badge}>Oferta</span>}
                    {item.is_new   && <span className={`${styles.badge} ${styles.badgeNuevo}`}>Nuevo</span>}
                    <p className={styles.productoNombre}>{item.name}</p>
                    {item.previous_price && (
                      <p className={styles.precioAnterior}>₡ {Number(item.previous_price).toLocaleString('es-CR')}</p>
                    )}
                    <p className={styles.precio}>₡ {Number(item.price).toLocaleString('es-CR')}</p>
                  </div>
                </div>
              )
            }}
          />
        ) : (
          <p className={styles.sinDatos}>No hay productos disponibles por el momento.</p>
        )}
      </section>

      {/* === CARRUSEL CATEGORÍAS - skeleton mientras carga === */}
      <section className={styles.seccion}>
        <p className={styles.seccionTitulo}>Categorías</p>
        {cargandoCats ? (
          <SkeletonCarrusel tipo="categoria" cantidad={visibleCount} />
        ) : categorias.length > 0 ? (
          <Carrusel
            items={categorias}
            visibleCount={visibleCount}
            renderCard={cat => (
              <div
                key={cat.id}
                className={styles.categoriaCard}
                onClick={() => navigate(`/catalogo?categoria=${cat.id}`)}
              >
                <CatAvatar name={cat.name} index={categorias.indexOf(cat)} />
                <div>
                  <p className={styles.categoriaNombre}>{cat.name}</p>
                </div>
              </div>
            )}
          />
        ) : (
          <p className={styles.sinDatos}>No hay categorías disponibles.</p>
        )}
      </section>


    </main>
  )
}