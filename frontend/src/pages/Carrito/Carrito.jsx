import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import backendRESTAdapter from '../../adapter/backendRESTAdapter'
import { Trash2, Plus, Minus, ShoppingBag, MessageCircle, ArrowLeft } from 'lucide-react'
import { useCarrito } from '../../context/CarritoContext'
import styles from './Carrito.module.css'

const WHATSAPP_FALLBACK = '50660759718'

export default function Carrito() {
  const navigate = useNavigate()
  const { items, setCantidad, eliminar, vaciar, totalItems, totalMonto } = useCarrito()
  const [whatsapp, setWhatsapp] = useState(WHATSAPP_FALLBACK)

  useEffect(() => {
    backendRESTAdapter.obtenerBusiness()
      .then(res => { if (res?.data?.whatsapp) setWhatsapp(res.data.whatsapp) })
      .catch(() => {})
  }, [])

  function enviarPorWhatsApp() {
    if (items.length === 0) return

    const lineas = items.map(item => {
      const subtotal = (item.price * item.cantidad).toLocaleString('es-CR')
      const anterior = item.previous_price
        ? ` _(antes ₡ ${Number(item.previous_price).toLocaleString('es-CR')})_`
        : ''
      return `• ${item.name} × ${item.cantidad} - ₡ ${subtotal}${anterior}`
    })

    const mensaje = [
      '¡Hola! Me gustaría realizar el siguiente pedido:',
      '',
      ...lineas,
      '',
      `*Total estimado: ₡ ${totalMonto.toLocaleString('es-CR')}*`,
      '',
      '¿Podría confirmar disponibilidad y coordinar la entrega? Gracias.',
    ].join('\n')

    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  // Carrito vacío
  if (items.length === 0) {
    return (
      <main className={styles.page}>
        <div className={styles.vacio}>
          <div className={styles.vacioIconoWrap}>
            <ShoppingBag size={40} strokeWidth={1.3} className={styles.vacioIcono} />
          </div>
          <p className={styles.vacioTitulo}>Tu carrito está vacío</p>
          <p className={styles.vacioDesc}>
            Explorá el catálogo y agregá productos para armar tu pedido.
          </p>
          <button className={styles.vacioBtnCatalogo} onClick={() => navigate('/catalogo')}>
            <ShoppingBag size={16} strokeWidth={2} />
            Ver catálogo
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.page}>

      {/* === ENCABEZADO === */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.titulo}>Carrito</h1>
          <p className={styles.subtitulo}>
            {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
          </p>
        </div>
        <button className={styles.btnVaciar} onClick={vaciar}>
          <Trash2 size={14} strokeWidth={2} />
          Vaciar carrito
        </button>
      </div>

      {/* === LISTA DE PRODUCTOS === */}
      <div className={styles.lista}>
        {items.map(item => (
          <div key={item.id} className={styles.itemCard}>

            {/* Imagen */}
            <div className={styles.itemImgWrap}>
              {item.image_url
                ? <img src={item.image_url} alt={item.name} className={styles.itemImg} />
                : <div className={styles.itemImgPlaceholder} />
              }
            </div>

            {/* Info */}
            <div className={styles.itemInfo}>
              <p className={styles.itemNombre}>{item.name}</p>
              <div className={styles.itemPrecios}>
                {item.previous_price && (
                  <span className={styles.itemPrecioAnterior}>
                    ₡ {Number(item.previous_price).toLocaleString('es-CR')}
                  </span>
                )}
                <span className={styles.itemPrecioUnit}>
                  ₡ {Number(item.price).toLocaleString('es-CR')} c/u
                </span>
              </div>
              <p className={styles.itemSubtotal}>
                Subtotal: <strong>₡ {(item.price * item.cantidad).toLocaleString('es-CR')}</strong>
              </p>
            </div>

            {/* Cantidad + eliminar */}
            <div className={styles.itemAcciones}>
              <div className={styles.cantidadCtrl}>
                <button
                  className={styles.cantidadBtn}
                  onClick={() => setCantidad(item.id, item.cantidad - 1)}
                  disabled={item.cantidad <= 1}
                  aria-label="Reducir cantidad"
                >
                  <Minus size={13} strokeWidth={2.5} />
                </button>
                <span className={styles.cantidadNum}>{item.cantidad}</span>
                <button
                  className={styles.cantidadBtn}
                  onClick={() => setCantidad(item.id, item.cantidad + 1)}
                  aria-label="Aumentar cantidad"
                >
                  <Plus size={13} strokeWidth={2.5} />
                </button>
              </div>
              <button
                className={styles.btnEliminar}
                onClick={() => eliminar(item.id)}
                aria-label="Eliminar del carrito"
              >
                <Trash2 size={15} strokeWidth={2} />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* === RESUMEN === */}
      <div className={styles.resumen}>
        <div className={styles.resumenCard}>

          <p className={styles.resumenTitulo}>Resumen del pedido</p>

          <div className={styles.resumenLista}>
            {items.map(item => (
              <div key={item.id} className={styles.resumenFila}>
                <span className={styles.resumenNombre}>
                  {item.name}
                  <span className={styles.resumenCantidad}> × {item.cantidad}</span>
                </span>
                <span className={styles.resumenMonto}>
                  ₡ {(item.price * item.cantidad).toLocaleString('es-CR')}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.resumenDivisor} />

          <div className={styles.resumenTotal}>
            <span className={styles.resumenTotalLabel}>Total estimado</span>
            <span className={styles.resumenTotalMonto}>
              ₡ {totalMonto.toLocaleString('es-CR')}
            </span>
          </div>

          <p className={styles.resumenNota}>
            El precio final puede variar según disponibilidad y condiciones de entrega acordadas con el negocio.
          </p>

          <button className={styles.btnWhatsApp} onClick={enviarPorWhatsApp}>
            <MessageCircle size={18} strokeWidth={2} />
            Enviar pedido por WhatsApp
          </button>

          <button className={styles.btnSeguir} onClick={() => navigate('/catalogo')}>
            <ArrowLeft size={14} strokeWidth={2} />
            Seguir comprando
          </button>

        </div>
      </div>

    </main>
  )
}