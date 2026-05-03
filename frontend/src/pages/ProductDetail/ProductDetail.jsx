// TODO: reemplazar MOCK con fetch real:
import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, X, ShoppingCart, MessageCircle } from 'lucide-react'
import styles from './ProductDetail.module.css'

import img1 from '../../assets/harina.png'
import img2 from '../../assets/Harina2.png'
import img3 from '../../assets/Bandeja1.jpg'

const MOCK_PRODUCT = {
  id:          'p-1',
  name:        'Harina Especial',
  description: 'Harina de trigo de alta calidad, ideal para panadería y repostería. Enriquecida con vitaminas y minerales. Producto importado con certificación de calidad.',
  price:       2500,
  price_before: 3200,   // null si no hay descuento
  category_id: 'cat-1',
  category_name: 'Lácteos',
  sku:         'HAR-001',
  is_offer:    true,
  is_new:      false,
  images:      [img1, img2, img3],  
}

const MOCK_RELACIONADOS = [
  { id: 'p-3',  name: 'Producto 3',  price: 1200, image_url: null, is_offer: true,  is_new: false },
  { id: 'p-5',  name: 'Producto 5',  price: 2900, image_url: null, is_offer: false, is_new: false },
  { id: 'p-7',  name: 'Producto 7',  price: 1800, image_url: null, is_offer: false, is_new: true  },
  { id: 'p-9',  name: 'Producto 9',  price: 990,  image_url: null, is_offer: true,  is_new: false },
]


const WHATSAPP_NUMBER = '50600000000'

export default function ProductDetail() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { id }    = useParams()

  const product   = MOCK_PRODUCT   
  const relacionados = MOCK_RELACIONADOS

  const [imgActiva, setImgActiva]     = useState(0)
  const [lightbox, setLightbox]       = useState(false)
  const [cantidad, setCantidad]       = useState(1)

  const total = product.images.length

  const anterior = useCallback(() =>
    setImgActiva(i => (i - 1 + total) % total), [total])

  const siguiente = useCallback(() =>
    setImgActiva(i => (i + 1) % total), [total])

  // Cerrar lightbox con Escape
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
    if (location.state?.from) {
      navigate(-1)
    } else {
      navigate('/catalogo')
    }
  }

  function consultarWhatsApp() {
    const msg = encodeURIComponent(
      `Hola, me interesa el producto:\n*${product.name}*\nCódigo: ${product.sku}\nPrecio: ₡ ${product.price.toLocaleString('es-CR')}\n\n¿Está disponible?`
    )
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank')
  }

  function agregarAlCarrito() {
    console.log('Agregar al carrito:', { product, cantidad })
  }

  const descuento = product.price_before
    ? Math.round((1 - product.price / product.price_before) * 100)
    : null

  return (
    <main className={styles.page}>

      {/* ── BOTÓN VOLVER ── */}
      <button className={styles.btnVolver} onClick={volverAlCatalogo}>
        <ArrowLeft size={18} strokeWidth={2} />
        <span>Catálogo</span>
      </button>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className={styles.contenido}>

        {/* ── GALERÍA DE IMÁGENES ── */}
        <div className={styles.galeria}>

          {/* Imagen principal */}
          <div className={styles.imgPrincipalWrap}>
            <img
              src={product.images[imgActiva]}
              alt={`${product.name} - imagen ${imgActiva + 1}`}
              className={styles.imgPrincipal}
              onClick={() => setLightbox(true)}
              draggable={false}
            />

            {/* Flechas sobre la imagen */}
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

            {/* Badges sobre la imagen */}
            <div className={styles.imgBadges}>
              {product.is_offer && <span className={styles.badgeOferta}>Oferta {descuento}% off</span>}
              {product.is_new   && <span className={styles.badgeNuevo}>Nuevo</span>}
            </div>

            {/* Indicador de click para ampliar */}
            <span className={styles.ampliarHint}>Toca para ampliar</span>
          </div>

          {/* Miniaturas */}
          {total > 1 && (
            <div className={styles.miniaturas}>
              {product.images.map((img, i) => (
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

        {/* ── PANEL DE INFORMACIÓN ── */}
        <div className={styles.info}>

          {/* Categoría + SKU */}
          <div className={styles.metaRow}>
            <span className={styles.categoria}>{product.category_name}</span>
            <span className={styles.sku}>SKU: {product.sku}</span>
          </div>

          {/* Nombre */}
          <h1 className={styles.nombre}>{product.name}</h1>

          {/* Precio */}
          <div className={styles.precioWrap}>
            {product.price_before && (
              <span className={styles.precioAnterior}>
                ₡ {product.price_before.toLocaleString('es-CR')}
              </span>
            )}
            <span className={styles.precio}>
              ₡ {product.price.toLocaleString('es-CR')}
            </span>
            {descuento && (
              <span className={styles.descuentoBadge}>-{descuento}%</span>
            )}
          </div>

          {/* Descripción */}
          <p className={styles.descripcion}>{product.description}</p>

          <div className={styles.separador} />

          {/* Cantidad */}
          <div className={styles.cantidadRow}>
            <span className={styles.cantidadLabel}>Cantidad</span>
            <div className={styles.cantidadCtrl}>
              <button className={styles.cantidadBtn} onClick={() => setCantidad(c => Math.max(1, c - 1))}>−</button>
              <span className={styles.cantidadNum}>{cantidad}</span>
              <button className={styles.cantidadBtn} onClick={() => setCantidad(c => c + 1)}>+</button>
            </div>
          </div>

          {/* Botones de acción */}
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
      <section className={styles.relacionados}>
        <p className={styles.relacionadosTitulo}>Productos relacionados</p>
        <div className={styles.relacionadosGrid}>
          {relacionados.map(p => (
            <div
              key={p.id}
              className={styles.relCard}
              onClick={() => { navigate(`/producto/${p.id}`); setImgActiva(0) }}
            >
              <div className={styles.relImgWrap}>
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} className={styles.relImg} />
                  : <div className={styles.relImgPlaceholder} />
                }
                {p.is_offer && <span className={styles.relBadge}>Oferta</span>}
                {p.is_new   && <span className={`${styles.relBadge} ${styles.relBadgeNuevo}`}>Nuevo</span>}
              </div>
              <div className={styles.relInfo}>
                <p className={styles.relNombre}>{p.name}</p>
                <p className={styles.relPrecio}>₡ {p.price.toLocaleString('es-CR')}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIGHTBOX ── */}
      {lightbox && (
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
            src={product.images[imgActiva]}
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
