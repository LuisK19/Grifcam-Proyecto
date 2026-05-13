import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './Home.module.css'
import heroBg from '../../assets/bg.png'
import backendRESTAdapter from '../../adapter/backendRESTAdapter'

const BASE_URL = 'http://localhost:5000'

function getPrimeraImagen(product) {
  const imgs = product.product_images
  if (!imgs || imgs.length === 0) return null
  const sorted = [...imgs].sort((a, b) => a.image_order - b.image_order)
  return BASE_URL + sorted[0].image_url
}

function Carrusel({ items, renderCard, visibleCount = 1 }) {
  const [pagina, setPagina] = useState(0)
  const totalPaginas = Math.max(1, Math.ceil(items.length / visibleCount))
  const inicio   = pagina * visibleCount
  const visibles = items.slice(inicio, inicio + visibleCount)

  useEffect(() => {
    if (pagina >= totalPaginas) setPagina(0)
  }, [visibleCount, items.length, totalPaginas, pagina])

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
            className={`${styles.dot} ${i === pagina ? styles.dotActivo : ''}`}
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

  const [isDesktop, setIsDesktop]   = useState(window.innerWidth >= 1024)
  const [productos, setProductos]   = useState([])
  const [categorias, setCategorias] = useState([])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = e => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [resProd, resCats] = await Promise.all([
          backendRESTAdapter.obtenerProductos({ filter: 'is_offer' }),
          backendRESTAdapter.obtenerCategorias(),
        ])
        setProductos(resProd.data)
        setCategorias(resCats.data)
      } catch (err) {
        console.error('Error cargando datos del home:', err)
      }
    }
    cargarDatos()
  }, [])

  const visibleCount = isDesktop ? 2 : 1

  return (
    <main className={styles.page}>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} style={{ backgroundImage: `url(${heroBg})` }} />
        <div className={styles.heroContenido}>
          <span className={styles.heroEyebrow}>Distribuidora Grifcam</span>
          <h1 className={styles.heroTitulo}>Bienvenidos a<br />Grifcam</h1>
          <p className={styles.heroSub}>
            Productos de calidad para tu negocio, directo al mejor precio.
          </p>
          <button className={styles.heroBtn} onClick={() => navigate('/catalogo')}>
            Ver catálogo
            <ArrowRight size={15} strokeWidth={2.2} />
          </button>
        </div>
      </section>

      {/* ── CARRUSEL PRODUCTOS ── */}
      {productos.length > 0 && (
        <section className={styles.seccion}>
          <p className={styles.seccionTitulo}>Ofertas y destacados</p>
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
                      <img
                        src={imgUrl}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                  </div>
                  <div className={styles.productoInfo}>
                    {item.is_offer && <span className={styles.badge}>Oferta</span>}
                    {item.is_new   && <span className={`${styles.badge} ${styles.badgeNuevo}`}>Nuevo</span>}
                    <p className={styles.productoNombre}>{item.name}</p>
                    {item.previous_price && (
                      <p className={styles.precioAnterior}>
                        ₡ {Number(item.previous_price).toLocaleString('es-CR')}
                      </p>
                    )}
                    <p className={styles.precio}>
                      ₡ {Number(item.price).toLocaleString('es-CR')}
                    </p>
                  </div>
                </div>
              )
            }}
          />
        </section>
      )}

      {/* ── CARRUSEL CATEGORÍAS ── */}
      {categorias.length > 0 && (
        <section className={styles.seccion}>
          <p className={styles.seccionTitulo}>Categorías</p>
          <Carrusel
            items={categorias}
            visibleCount={visibleCount}
            renderCard={cat => (
              <div
                key={cat.id}
                className={styles.categoriaCard}
                onClick={() => navigate(`/catalogo?categoria=${cat.id}`)}
              >
                <div className={styles.categoriaIcono} />
                <div>
                  <p className={styles.categoriaNombre}>{cat.name}</p>
                </div>
              </div>
            )}
          />
        </section>
      )}

      {/* ── SOBRE NOSOTROS ── */}
      <section className={styles.seccion}>
        <p className={styles.seccionTitulo}>Sobre nosotros</p>
        <div className={styles.aboutCard}>
          <div className={styles.aboutImg} />
          <div className={styles.aboutCuerpo}>
            <p className={styles.aboutTitulo}>Distribuidora Grifcam</p>
            <p className={styles.aboutTexto}>
              Somos una distribuidora......
            </p>
          </div>
        </div>
      </section>

    </main>
  )
}