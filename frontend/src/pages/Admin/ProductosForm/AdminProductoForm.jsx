import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, X, ImagePlus, Save,
  Loader, ChevronLeft, ChevronRight
} from 'lucide-react'
import AdminLayout from '../../../components/AdminLayout/AdminLayout'
import styles from './AdminProductoForm.module.css'

// Cambiar en crear nuevo que auto seleccione la flag de nuevo y poner un timer para que se quite sola después 
const MOCK_CATEGORIES = [
  { id: 'cat-1', name: 'Lácteos'    },
  { id: 'cat-2', name: 'Bebidas'    },
  { id: 'cat-3', name: 'Snacks'     },
  { id: 'cat-4', name: 'Limpieza'   },
  { id: 'cat-5', name: 'Panadería'  },
  { id: 'cat-6', name: 'Congelados' },
]

const MOCK_PRODUCTS = {
  'p-1': {
    id: 'p-1', name: 'Producto 1',
    description: 'Descripción del producto 1.',
    price: 2500, price_before: 3200,
    category_id: 'cat-1',
    images: [], 
    is_offer: true, is_new: false, is_featured: true, featured_badge: 'Oferta'
  },
}

const FORM_INICIAL = {
  name:           '',
  description:    '',
  price:          '',
  price_before:   '',
  category_id:    '',
  is_offer:       false,
  is_new:         false,
  is_featured:    false,
  featured_badge: '',
}

const BADGE_OPCIONES = ['', 'Oferta', 'Nuevo', 'Popular']
// ─────────────────────────────────────────────────────────

// Cada imagen en el estado tiene: { id, src (URL), file (File|null), esExistente }
let nextImgId = 1

export default function AdminProductoForm() {
  const navigate  = useNavigate()
  const { id }    = useParams()
  const esEdicion = Boolean(id)
  const inputFileRef = useRef(null)

  const [form, setForm]           = useState(FORM_INICIAL)
  const [errores, setErrores]     = useState({})
  const [guardando, setGuardando] = useState(false)
  const [imagenes, setImagenes]   = useState([]) // { id, src, file, esExistente }
  const [lightbox, setLightbox]   = useState(null) // índice de imagen ampliada

  // Cargar datos si es edición
  useEffect(() => {
    if (!esEdicion) return
    const producto = MOCK_PRODUCTS[id]
    if (!producto) return
    setForm({
      name:           producto.name,
      description:    producto.description,
      price:          String(producto.price),
      price_before:   producto.price_before ? String(producto.price_before) : '',
      category_id:    producto.category_id,
      is_offer:       producto.is_offer,
      is_new:         producto.is_new,
      is_featured:    producto.is_featured,
      featured_badge: producto.featured_badge ?? '',
    })
    const imgs = (producto.images ?? []).map(url => ({
      id: nextImgId++,
      src: url,
      file: null,
      esExistente: true,
    }))
    setImagenes(imgs)
  }, [id, esEdicion])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }))
  }

  function handleAgregarImagenes(e) {
    const archivos = Array.from(e.target.files ?? [])
    if (!archivos.length) return
    const nuevas = archivos.map(file => ({
      id:          nextImgId++,
      src:         URL.createObjectURL(file),
      file,
      esExistente: false,
    }))
    setImagenes(prev => [...prev, ...nuevas])
    if (inputFileRef.current) inputFileRef.current.value = ''
  }

  function eliminarImagen(imgId) {
    setImagenes(prev => {
      const nuevas = prev.filter(img => img.id !== imgId)
      if (lightbox !== null) {
        const nuevoIdx = Math.min(lightbox, nuevas.length - 1)
        setLightbox(nuevas.length > 0 ? nuevoIdx : null)
      }
      return nuevas
    })
  }

  function abrirLightbox(idx) { setLightbox(idx) }
  function cerrarLightbox()   { setLightbox(null) }
  function lightboxAnterior() { setLightbox(i => (i - 1 + imagenes.length) % imagenes.length) }
  function lightboxSiguiente(){ setLightbox(i => (i + 1) % imagenes.length) }

  function validar() {
    const e = {}
    if (!form.name.trim())        e.name        = 'El nombre es requerido.'
    if (!form.description.trim()) e.description = 'La descripción es requerida.'
    if (!form.price)              e.price       = 'El precio es requerido.'
    if (isNaN(Number(form.price)) || Number(form.price) <= 0)
                                  e.price       = 'Ingresá un precio válido.'
    if (form.price_before && (isNaN(Number(form.price_before)) || Number(form.price_before) <= 0))
                                  e.price_before = 'Ingresá un precio anterior válido.'
    if (!form.category_id)        e.category_id = 'Seleccioná una categoría.'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const nuevosErrores = validar()
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      return
    }
    setGuardando(true)
    try {
      await new Promise(r => setTimeout(r, 800))
      navigate('/admin/productos')
    } catch {
      setErrores({ global: 'Ocurrió un error. Intentá de nuevo.' })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <AdminLayout>
      <div className={styles.page}>

        {/* ── ENCABEZADO ── */}
        <div className={styles.encabezado}>
          <button className={styles.btnVolver} onClick={() => navigate('/admin/productos')}>
            <ArrowLeft size={16} strokeWidth={2} />
            Productos
          </button>
          <h1 className={styles.titulo}>
            {esEdicion ? 'Editar producto' : 'Nuevo producto'}
          </h1>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>

          {/* FILA SUPERIOR: flags izq + info der */}
          <div className={styles.formGrid}>

            {/* Columna izquierda — flags */}
            <div className={styles.colIzq}>
              <div className={styles.seccion}>
                <p className={styles.seccionTitulo}>Etiquetas</p>
                <div className={styles.flagsGrid}>

                  <label className={styles.flagItem}>
                    <input type="checkbox" name="is_offer" checked={form.is_offer}
                      onChange={handleChange} className={styles.checkbox} />
                    <div className={`${styles.flagLabel} ${form.is_offer ? styles.flagLabelOferta : ''}`}>
                      <span className={styles.flagNombre}>Oferta</span>
                      <span className={styles.flagDesc}>Aparece en el carrusel de ofertas</span>
                    </div>
                  </label>

                  <label className={styles.flagItem}>
                    <input type="checkbox" name="is_new" checked={form.is_new}
                      onChange={handleChange} className={styles.checkbox} />
                    <div className={`${styles.flagLabel} ${form.is_new ? styles.flagLabelNuevo : ''}`}>
                      <span className={styles.flagNombre}>Nuevo</span>
                      <span className={styles.flagDesc}>Muestra badge de "Nuevo"</span>
                    </div>
                  </label>

                  <label className={styles.flagItem}>
                    <input type="checkbox" name="is_featured" checked={form.is_featured}
                      onChange={handleChange} className={styles.checkbox} />
                    <div className={`${styles.flagLabel} ${form.is_featured ? styles.flagLabelDestacado : ''}`}>
                      <span className={styles.flagNombre}>Destacado en Home</span>
                      <span className={styles.flagDesc}>Aparece en la sección de destacados</span>
                    </div>
                  </label>

                </div>

                {form.is_featured && (
                  <div className={styles.campo} style={{ marginTop: '0.75rem' }}>
                    <label className={styles.label} htmlFor="featured_badge">Badge del destacado</label>
                    <select id="featured_badge" name="featured_badge"
                      value={form.featured_badge} onChange={handleChange} className={styles.select}>
                      {BADGE_OPCIONES.map(b => (
                        <option key={b} value={b}>{b || 'Sin badge'}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Columna derecha — info */}
            <div className={styles.colDer}>
              <div className={styles.seccion}>
                <p className={styles.seccionTitulo}>Información del producto</p>

                <div className={styles.campo}>
                  <label className={styles.label} htmlFor="name">
                    Nombre <span className={styles.requerido}>*</span>
                  </label>
                  <input id="name" name="name" type="text"
                    className={`${styles.input} ${errores.name ? styles.inputError : ''}`}
                    placeholder="Ej: Harina de trigo 1kg"
                    value={form.name} onChange={handleChange} maxLength={100} />
                  {errores.name && <p className={styles.error}>{errores.name}</p>}
                </div>

                <div className={styles.campo}>
                  <label className={styles.label} htmlFor="description">
                    Descripción <span className={styles.requerido}>*</span>
                  </label>
                  <textarea id="description" name="description"
                    className={`${styles.textarea} ${errores.description ? styles.inputError : ''}`}
                    placeholder="Describe el producto, presentación, usos, etc."
                    value={form.description} onChange={handleChange} rows={4} maxLength={500} />
                  <p className={styles.charCount}>{form.description.length}/500</p>
                  {errores.description && <p className={styles.error}>{errores.description}</p>}
                </div>

                <div className={styles.campo}>
                  <label className={styles.label} htmlFor="category_id">
                    Categoría <span className={styles.requerido}>*</span>
                  </label>
                  <select id="category_id" name="category_id"
                    value={form.category_id} onChange={handleChange}
                    className={`${styles.select} ${errores.category_id ? styles.inputError : ''}`}>
                    <option value="">Seleccionar categoría...</option>
                    {MOCK_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errores.category_id && <p className={styles.error}>{errores.category_id}</p>}
                </div>

                <div className={styles.preciosRow}>
                  <div className={styles.campo}>
                    <label className={styles.label} htmlFor="price">
                      Precio <span className={styles.requerido}>*</span>
                    </label>
                    <div className={`${styles.precioWrap} ${errores.price ? styles.inputError : ''}`}>
                      <span className={styles.precioMoneda}>₡</span>
                      <input id="price" name="price" type="number" min="0" step="1"
                        className={styles.inputPrecio} placeholder="0"
                        value={form.price} onChange={handleChange} />
                    </div>
                    {errores.price && <p className={styles.error}>{errores.price}</p>}
                  </div>

                  <div className={styles.campo}>
                    <label className={styles.label} htmlFor="price_before">
                      Precio anterior <span className={styles.opcional}>(opcional)</span>
                    </label>
                    <div className={`${styles.precioWrap} ${errores.price_before ? styles.inputError : ''}`}>
                      <span className={styles.precioMoneda}>₡</span>
                      <input id="price_before" name="price_before" type="number" min="0" step="1"
                        className={styles.inputPrecio} placeholder="0"
                        value={form.price_before} onChange={handleChange} />
                    </div>
                    {errores.price_before && <p className={styles.error}>{errores.price_before}</p>}
                    <p className={styles.campoHint}>Aparece tachado junto al precio actual</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* SECCION IMAGENES — ancho completo */}
          <div className={styles.seccion}>
            <div className={styles.imagenesHeader}>
              <p className={styles.seccionTitulo} style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
                Imágenes del producto
                <span className={styles.imagenesContador}>{imagenes.length} imagen{imagenes.length !== 1 ? 'es' : ''}</span>
              </p>
              <button
                type="button"
                className={styles.btnAgregarImg}
                onClick={() => inputFileRef.current?.click()}
              >
                <ImagePlus size={15} strokeWidth={2} />
                Agregar imágenes
              </button>
            </div>

            <input
              ref={inputFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className={styles.inputFileOculto}
              onChange={handleAgregarImagenes}
            />

            {imagenes.length > 0 ? (
              <div className={styles.imagenesGrid}>
                {imagenes.map((img, idx) => (
                  <div key={img.id} className={styles.imagenCard}>
                    <img
                      src={img.src}
                      alt={`Imagen ${idx + 1}`}
                      className={styles.imagenThumb}
                      onClick={() => abrirLightbox(idx)}
                    />
                    {!img.esExistente && (
                      <span className={styles.imagenNuevaBadge}>Nueva</span>
                    )}
                    <button
                      type="button"
                      className={styles.imagenEliminarBtn}
                      onClick={() => eliminarImagen(img.id)}
                      aria-label="Eliminar imagen"
                    >
                      <X size={12} strokeWidth={2.5} />
                    </button>
                  </div>
                ))}

                {/* Botón agregar más dentro de la cuadrícula */}
                <button
                  type="button"
                  className={styles.imagenAgregarCard}
                  onClick={() => inputFileRef.current?.click()}
                >
                  <ImagePlus size={22} strokeWidth={1.5} className={styles.imagenAgregarIcono} />
                  <span className={styles.imagenAgregarTexto}>Agregar</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={styles.imagenesVacio}
                onClick={() => inputFileRef.current?.click()}
              >
                <ImagePlus size={30} strokeWidth={1.3} className={styles.imagenIcono} />
                <span className={styles.imagenTexto}>Tocá para agregar imágenes</span>
                <span className={styles.imagenSubtexto}>JPG, PNG, WebP — podés seleccionar varias a la vez</span>
              </button>
            )}
          </div>

          {/* ── ERROR GLOBAL ── */}
          {errores.global && (
            <p className={styles.errorGlobal}>{errores.global}</p>
          )}

          {/* ── BOTONES ── */}
          <div className={styles.formBtns}>
            <button type="button" className={styles.btnCancelar}
              onClick={() => navigate('/admin/productos')} disabled={guardando}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnGuardar} disabled={guardando}>
              {guardando
                ? <><Loader size={15} strokeWidth={2} className={styles.spinner} /> Guardando...</>
                : <><Save size={15} strokeWidth={2} /> {esEdicion ? 'Guardar cambios' : 'Crear producto'}</>
              }
            </button>
          </div>

        </form>
      </div>

      {/*  LIGHTBOX  */}
      {lightbox !== null && imagenes.length > 0 && (
        <div className={styles.lightboxOverlay} onClick={cerrarLightbox}>
          <button className={styles.lightboxCerrar} onClick={cerrarLightbox}>
            <X size={20} strokeWidth={2} />
          </button>

          {imagenes.length > 1 && (
            <button
              className={`${styles.lightboxFlecha} ${styles.lightboxFlechaIzq}`}
              onClick={e => { e.stopPropagation(); lightboxAnterior() }}
            >
              <ChevronLeft size={26} strokeWidth={2} />
            </button>
          )}

          <img
            src={imagenes[lightbox]?.src}
            alt={`Imagen ${lightbox + 1}`}
            className={styles.lightboxImg}
            onClick={e => e.stopPropagation()}
          />

          {imagenes.length > 1 && (
            <button
              className={`${styles.lightboxFlecha} ${styles.lightboxFlechaDer}`}
              onClick={e => { e.stopPropagation(); lightboxSiguiente() }}
            >
              <ChevronRight size={26} strokeWidth={2} />
            </button>
          )}

          <p className={styles.lightboxContador}>{lightbox + 1} / {imagenes.length}</p>
        </div>
      )}

    </AdminLayout>
  )
}
