import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, X, ShoppingCart, MessageCircle } from 'lucide-react'
import styles from './ProductDetail.module.css'
import backendRESTAdapter from '../../adapter/backendRESTAdapter'

const BASE_URL      = 'http://localhost:5000'
const WHATSAPP_NUMBER = '50600000000'

// Devuelve array de URLs completas ordenadas por image_order
function getImagenes(product) {
  if (!product?.product_images || product.product_images.length === 0) return []
  return [...product.product_images]
    .sort((a, b) => a.image_order - b.image_order)
    .map(img => BASE_URL + img.image_url)
}

export default function ProductDetail() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id }   = useParams()

  const [product, setProduct]           = useState(null)
  const [relacionados, setRelacionados] = useState([])
  const [cargando, setCargando]         = useState(true)
  const [error, setError]               = useState('')

  const [imgActiva, setImgActiva] = useState(0)
  const [lightbox, setLightbox]   = useState(false)
  const [cantidad, setCantidad]   = useState(1)

  useEffect(() => {
    async function cargar() {
      setCargando(true)
      setError('')
      setImgActiva(0)
      try {
        const res     = await backendRESTAdapter.obtenerProductoPorId(id)
        const producto = res.data
        setProduct(producto)

        // Relacionados: misma categoría, excluye el actual
        const resRel = await backendRESTAdapter.obtenerProductos({
          category: producto.category_id,
        })
        setRelacionados(resRel.data.filter(p => p.id !== producto.id).slice(0, 4))
      } catch (err) {
        console.error('Error cargando producto:', err)
        setError('No se pudo cargar el producto.')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [id])

  const imagenes = getImagenes(product)
  const total    = imagenes.length

  const anterior  = useCallback(() => setImgActiva(i => (i - 1 + total) % total), [total])
  const siguiente = useCallback(() => setImgActiva(i => (i + 1) % total), [total])

  useEffect(() => {
    function onKey(e) {
      if (!lightbox) return
      if (e.key === 'Escape')     setLightbox(false)
      if (e.key === 'ArrowLeft')  anterior()
      if (e.key === 'ArrowRight') siguiente()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, anterior, siguiente])

  function volverAlCatalogo() {
    if (location.state?.from) navigate(-1)
    else navigate('/catalogo')
  }

  function consultarWhatsApp() {
    if (!product) return
    const msg = encodeURIComponent(
      `Hola, me interesa el producto:\n*${product.name}*\nPrecio: ₡ ${Number(product.price).toLocaleString('es-CR')}\n\n¿Está disponible?`
    )
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank')
  }

  function agregarAlCarrito() {
    console.log('Agregar al carrito:', { product, cantidad })
  }

  if (cargando) {
    return (
      <main className={styles.page}>
        <p style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>Cargando producto...</p>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className={styles.page}>
        <button className={styles.btnVolver} onClick={volverAlCatalogo}>
          <ArrowLeft size={18} strokeWidth={2} />
          <span>Catálogo</span>
        </button>
        <p style={{ textAlign: 'center', padding: '3rem', color: 'red' }}>
          {error || 'Producto no encontrado.'}
        </p>
      </main>
    )
  }

  const descuento = product.previous_price
    ? Math.round((1 - product.price / product.previous_price) * 100)
    : null

  // Nombre de categoría viene en product.categories.name
  const categoriaNombre = product.categories?.name ?? ''

  return (
    <main className={styles.page}>

      {/* ── BOTÓN VOLVER ── */}
      <button className={styles.btnVolver} onClick={volverAlCatalogo}>
        <ArrowLeft size={18} strokeWidth={2} />
        <span>Catálogo</span>
      </button>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className={styles.contenido}>

        {/* ── GALERÍA ── */}
        <div className={styles.galeria}>
          <div className={styles.imgPrincipalWrap}>
            {imagenes.length > 0 ? (
              <img
                src={imagenes[imgActiva]}
                alt={`${product.name} - imagen ${imgActiva + 1}`}
                className={styles.imgPrincipal}
                onClick={() => setLightbox(true)}
                draggable={false}
              />
            ) : (
              <div className={styles.imgPrincipal} style={{ background: '#f0f0f0' }} />
            )}

            {total > 1 && (
              <>
                <button className={`${styles.flechaImg} ${styles.flechaIzq}`} onClick={anterior} aria-label="Anterior">
                  <ChevronLeft size={20} strokeWidth={2.5} />
                </button>
                <button className={`${styles.flechaImg} ${styles.flechaDer}`} onClick={siguiente} aria-label="Siguiente">
                  <ChevronRight size={20} strokeWidth={2.5} />
                </button>
              </>
            )}

            <div className={styles.imgBadges}>
              {product.is_offer && <span className={styles.badgeOferta}>Oferta {descuento ? `${descuento}% off` : ''}</span>}
              {product.is_new   && <span className={styles.badgeNuevo}>Nuevo</span>}
            </div>

            {imagenes.length > 0 && (
              <span className={styles.ampliarHint}>Toca para ampliar</span>
            )}
          </div>

          {/* Miniaturas */}
          {total > 1 && (
            <div className={styles.miniaturas}>
              {imagenes.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.miniatura} ${i === imgActiva ? styles.miniaturaActiva : ''}`}
                  onClick={() => setImgActiva(i)}
                  aria-label={`Ver imagen ${i + 1}`}
                >
                  <img src={img} alt={`Miniatura ${i + 1}`} className={styles.miniaturaImg} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── INFO ── */}
        <div className={styles.info}>
          <div className={styles.metaRow}>
            <span className={styles.categoria}>{categoriaNombre}</span>
          </div>

          <h1 className={styles.nombre}>{product.name}</h1>

          <div className={styles.precioWrap}>
            {product.previous_price && (
              <span className={styles.precioAnterior}>
                ₡ {Number(product.previous_price).toLocaleString('es-CR')}
              </span>
            )}
            <span className={styles.precio}>
              ₡ {Number(product.price).toLocaleString('es-CR')}
            </span>
            {descuento && (
              <span className={styles.descuentoBadge}>-{descuento}%</span>
            )}
          </div>

          <p className={styles.descripcion}>{product.description}</p>

          <div className={styles.separador} />

          <div className={styles.cantidadRow}>
            <span className={styles.cantidadLabel}>Cantidad</span>
            <div className={styles.cantidadCtrl}>
              <button className={styles.cantidadBtn} onClick={() => setCantidad(c => Math.max(1, c - 1))}>−</button>
              <span className={styles.cantidadNum}>{cantidad}</span>
              <button className={styles.cantidadBtn} onClick={() => setCantidad(c => c + 1)}>+</button>
            </div>
          </div>

          <div className={styles.acciones}>
            <button className={styles.btnCarrito} onClick={agregarAlCarrito}>
              <ShoppingCart size={17} strokeWidth={2} />
              Agregar al carrito
            </button>
            <button className={styles.btnWhatsApp} onClick={consultarWhatsApp}>
              <MessageCircle size={17} strokeWidth={2} />
              Consultar por WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* ── PRODUCTOS RELACIONADOS ── */}
      {relacionados.length > 0 && (
        <section className={styles.relacionados}>
          <p className={styles.relacionadosTitulo}>Productos relacionados</p>
          <div className={styles.relacionadosGrid}>
            {relacionados.map(p => {
              const relImg = p.product_images?.length > 0
                ? BASE_URL + [...p.product_images].sort((a, b) => a.image_order - b.image_order)[0].image_url
                : null
              return (
                <div
                  key={p.id}
                  className={styles.relCard}
                  onClick={() => { navigate(`/producto/${p.id}`); setImgActiva(0) }}
                >
                  <div className={styles.relImgWrap}>
                    {relImg
                      ? <img src={relImg} alt={p.name} className={styles.relImg} />
                      : <div className={styles.relImgPlaceholder} />
                    }
                    {p.is_offer && <span className={styles.relBadge}>Oferta</span>}
                    {p.is_new   && <span className={`${styles.relBadge} ${styles.relBadgeNuevo}`}>Nuevo</span>}
                  </div>
                  <div className={styles.relInfo}>
                    <p className={styles.relNombre}>{p.name}</p>
                    <p className={styles.relPrecio}>₡ {Number(p.price).toLocaleString('es-CR')}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── LIGHTBOX ── */}
      {lightbox && imagenes.length > 0 && (
        <div className={styles.lightboxOverlay} onClick={() => setLightbox(false)}>
          <button className={styles.lightboxCerrar} onClick={() => setLightbox(false)} aria-label="Cerrar">
            <X size={22} strokeWidth={2} />
          </button>

          {total > 1 && (
            <button
              className={`${styles.lightboxFlecha} ${styles.lightboxFlechaIzq}`}
              onClick={e => { e.stopPropagation(); anterior() }}
            >
              <ChevronLeft size={28} strokeWidth={2} />
            </button>
          )}

          <img
            src={imagenes[imgActiva]}
            alt={product.name}
            className={styles.lightboxImg}
            onClick={e => e.stopPropagation()}
            draggable={false}
          />

          {total > 1 && (
            <button
              className={`${styles.lightboxFlecha} ${styles.lightboxFlechaDer}`}
              onClick={e => { e.stopPropagation(); siguiente() }}
            >
              <ChevronRight size={28} strokeWidth={2} />
            </button>
          )}

          <p className={styles.lightboxContador}>{imgActiva + 1} / {total}</p>
        </div>
      )}

    </main>
  )
}