import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './Home.module.css'
import heroBg from '../../assets/bg.png'

// DATOS MOCK 
const MOCK_PRODUCTOS = [
  { id: 1, nombre: 'Producto A', precio: 2500, precioAnterior: 3200, badge: 'Oferta' },
  { id: 2, nombre: 'Producto B', precio: 3800, precioAnterior: null,  badge: 'Nuevo'  },
  { id: 3, nombre: 'Producto C', precio: 1200, precioAnterior: 1800, badge: 'Oferta' },
  { id: 4, nombre: 'Producto D', precio: 4500, precioAnterior: null,  badge: 'Nuevo'  },
  { id: 5, nombre: 'Producto E', precio: 2900, precioAnterior: null,  badge: 'Popular'},
  { id: 6, nombre: 'Producto F', precio: 3600, precioAnterior: null,  badge: 'Nuevo'  },
]

const MOCK_CATEGORIAS = [
  { id: 1, nombre: 'Categoría 1', cantidad: 12 },
  { id: 2, nombre: 'Categoría 2', cantidad: 8  },
  { id: 3, nombre: 'Categoría 3', cantidad: 15 },
  { id: 4, nombre: 'Categoría 4', cantidad: 6  },
]

function Carrusel({ items, renderCard, visibleCount = 1 }) {
  const [pagina, setPagina] = useState(0)
  const totalPaginas = Math.max(1, Math.ceil(items.length / visibleCount))
  const inicio = pagina * visibleCount
  const visibles = items.slice(inicio, inicio + visibleCount)

  // Ajustar la página si cambia visibleCount o la lista de items
  useEffect(() => {
    if (pagina >= totalPaginas) {
      setPagina(0)
    }
  }, [visibleCount, items.length, totalPaginas, pagina])

  const handlePrev = () => {
    setPagina((prev) => (prev - 1 + totalPaginas) % totalPaginas)
  }

  const handleNext = () => {
    setPagina((prev) => (prev + 1) % totalPaginas)
  }

  return (
    <div className={styles.carruselWrapper}>
      <button
        className={styles.carruselBtn}
        onClick={handlePrev}
        aria-label="Anterior"
      >
        <ChevronLeft size={16} strokeWidth={2.5} />
      </button>

      <div className={styles.carruselVentana}>
        {visibles.map(item => renderCard(item))}
      </div>

      <button
        className={styles.carruselBtn}
        onClick={handleNext}
        aria-label="Siguiente"
      >
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

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    const handler = (e) => setIsDesktop(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const visibleCount = isDesktop ? 2 : 1

  return (
    <main className={styles.page}>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div
          className={styles.heroBg}
          style={{ backgroundImage: `url(${heroBg})` }}
        />
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
      <section className={styles.seccion}>
        <p className={styles.seccionTitulo}>Ofertas y destacados</p>
        <Carrusel
          items={MOCK_PRODUCTOS}
          visibleCount={visibleCount}
          renderCard={(item) => (
            <div
              key={item.id}
              className={styles.productoCard}
              onClick={() => navigate(`/producto/${item.id}`)}
            >
              <div className={styles.productoImg} />
              <div className={styles.productoInfo}>
                {item.badge && (
                  <span className={`${styles.badge} ${
                    item.badge === 'Nuevo'   ? styles.badgeNuevo   :
                    item.badge === 'Popular' ? styles.badgePopular : ''
                  }`}>
                    {item.badge}
                  </span>
                )}
                <p className={styles.productoNombre}>{item.nombre}</p>
                {item.precioAnterior && (
                  <p className={styles.precioAnterior}>
                    ₡ {item.precioAnterior.toLocaleString('es-CR')}
                  </p>
                )}
                <p className={styles.precio}>
                  ₡ {item.precio.toLocaleString('es-CR')}
                </p>
              </div>
            </div>
          )}
        />
      </section>

      {/* ── CARRUSEL CATEGORÍAS ── */}
      <section className={styles.seccion}>
        <p className={styles.seccionTitulo}>Categorías</p>
        <Carrusel
          items={MOCK_CATEGORIAS}
          visibleCount={visibleCount}
          renderCard={(cat) => (
            <div
              key={cat.id}
              className={styles.categoriaCard}
              onClick={() => navigate(`/catalogo?categoria=${cat.id}`)}
            >
              <div className={styles.categoriaIcono} />
              <div>
                <p className={styles.categoriaNombre}>{cat.nombre}</p>
                <p className={styles.categoriaCantidad}>{cat.cantidad} productos</p>
              </div>
            </div>
          )}
        />
      </section>

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