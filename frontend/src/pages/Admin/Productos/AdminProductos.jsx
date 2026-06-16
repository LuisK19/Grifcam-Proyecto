import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Search, X, Plus, Pencil, Trash2,
  TrendingUp, Sparkles, Star, ChevronDown
} from 'lucide-react'
import AdminLayout from '../../../components/AdminLayout/AdminLayout'
import styles from './AdminProductos.module.css'
import backendRESTAdapter from '../../../adapter/backendRESTAdapter'

function ModalConfirmar({ producto, onConfirmar, onCancelar }) {
  if (!producto) return null
  return (
    <div className={styles.modalOverlay} onClick={onCancelar}>
      <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
        <p className={styles.modalTitulo}>¿Eliminar producto?</p>
        <p className={styles.modalDesc}>
          Se eliminará <strong>{producto.name}</strong> del catálogo. Esta acción no se puede deshacer.
        </p>
        <div className={styles.modalBtns}>
          <button className={styles.btnCancelar} onClick={onCancelar}>Cancelar</button>
          <button className={styles.btnEliminar} onClick={() => onConfirmar(producto.id)}>Eliminar</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminProductos() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [productos, setProductos]   = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando]     = useState(true)
  const [error, setError]           = useState('')

  const [busqueda, setBusqueda]   = useState('')
  const [filtro, setFiltro]       = useState(searchParams.get('filtro') || 'todos')
  const [catFiltro, setCatFiltro] = useState('todas')
  const [aEliminar, setAEliminar] = useState(null)

  // Carga inicial
  useEffect(() => {
    async function cargar() {
      setCargando(true)
      setError('')
      try {
        const [resProd, resCats] = await Promise.all([
          backendRESTAdapter.obtenerProductos(),
          backendRESTAdapter.obtenerCategorias(),
        ])
        setProductos(resProd.data)
        setCategorias(resCats.data)
      } catch (err) {
        setError('No se pudieron cargar los productos.')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  // Nombre de categoría por ID
  function nombreCategoria(id) {
    return categorias.find(c => c.id === id)?.name ?? '-'
  }

  const productosFiltrados = useMemo(() => {
    let res = productos
    if (filtro === 'oferta')    res = res.filter(p => p.is_offer)
    if (filtro === 'nuevo')     res = res.filter(p => p.is_new)
    if (filtro === 'destacado') res = res.filter(p => p.is_featured)
    if (catFiltro !== 'todas')  res = res.filter(p => p.category_id === catFiltro)
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      res = res.filter(p => p.name.toLowerCase().includes(q))
    }
    return res
  }, [productos, filtro, catFiltro, busqueda])

  // Toggle de flag - actualiza local + llama API
  async function toggleFlag(id, flag) {
    const producto = productos.find(p => p.id === id)
    if (!producto) return
    const nuevoValor = !producto[flag]

    // Actualización optimista
    setProductos(prev =>
      prev.map(p => p.id === id ? { ...p, [flag]: nuevoValor } : p)
    )

    try {
      const formData = new FormData()
      formData.append('name',        producto.name)
      formData.append('description', producto.description ?? '')
      formData.append('price',       producto.price)
      formData.append('category_id', producto.category_id)
      formData.append('is_offer',    flag === 'is_offer'    ? nuevoValor : producto.is_offer)
      formData.append('is_new',      flag === 'is_new'      ? nuevoValor : producto.is_new)
      formData.append('is_featured', flag === 'is_featured' ? nuevoValor : (producto.is_featured ?? false))
      await backendRESTAdapter.editarProducto(id, formData)
    } catch (err) {
      // Revertir si falla
      setProductos(prev =>
        prev.map(p => p.id === id ? { ...p, [flag]: !nuevoValor } : p)
      )
    }
  }

  // Eliminar producto
  async function confirmarEliminar(id) {
    try {
      await backendRESTAdapter.eliminarProducto(id)
      const res = await backendRESTAdapter.obtenerProductos()
      setProductos(res.data)
    } catch (err) {
    }
    setAEliminar(null)
  }

  function cambiarFiltro(nuevo) {
    setFiltro(nuevo)
    setSearchParams(nuevo === 'todos' ? {} : { filtro: nuevo })
  }

  // Primera imagen del producto
  function getPrimeraImagen(product) {
    if (!product.product_images?.length) return null
    return [...product.product_images]
      .sort((a, b) => a.image_order - b.image_order)[0].image_url
  }

  const filtros = [
    { key: 'todos',     label: 'Todos'     },
    { key: 'oferta',    label: 'Oferta'    },
    { key: 'nuevo',     label: 'Nuevo'     },
    { key: 'destacado', label: 'Destacado' },
  ]

  return (
    <AdminLayout>
      <div className={styles.page}>

        {/* ENCABEZADO */}
        <div className={styles.topRow}>
          <div>
            <h1 className={styles.titulo}>Productos</h1>
            <p className={styles.subtitulo}>
              {cargando ? 'Cargando...' : `${productos.length} productos en total`}
            </p>
          </div>
          <button className={styles.btnNuevo} onClick={() => navigate('/admin/productos/nuevo')}>
            <Plus size={16} strokeWidth={2} />
            Nuevo producto
          </button>
        </div>

        {error && (
          <p style={{ color: 'var(--color-error)', fontSize: '0.875rem' }}>{error}</p>
        )}

        {/* BÚSQUEDA + FILTRO CATEGORÍA */}
        <div className={styles.searchRow}>
          <div className={styles.searchBox}>
            <Search size={15} className={styles.searchIcono} strokeWidth={2} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button className={styles.searchClear} onClick={() => setBusqueda('')}>
                <X size={13} strokeWidth={2} />
              </button>
            )}
          </div>

          <div className={styles.selectWrap}>
            <select
              className={styles.catSelect}
              value={catFiltro}
              onChange={e => setCatFiltro(e.target.value)}
            >
              <option value="todas">Todas las categorías</option>
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className={styles.selectFlecha} strokeWidth={2} />
          </div>
        </div>

        {/* CHIPS */}
        <div className={styles.chips}>
          {filtros.map(f => (
            <button
              key={f.key}
              className={`${styles.chip} ${filtro === f.key ? styles.chipActivo : ''}`}
              onClick={() => cambiarFiltro(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* CONTADOR */}
        <p className={styles.contador}>
          {cargando ? '...' : `${productosFiltrados.length} ${productosFiltrados.length === 1 ? 'producto' : 'productos'}`}
        </p>

        {/* TABLA */}
        {cargando ? (
          <div className={styles.tablaWrap}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th className={styles.thImg} />
                  <th className={styles.thNombre}>Nombre</th>
                  <th className={styles.thCat}>Categoría</th>
                  <th className={styles.thPrecio}>Precio</th>
                  <th className={styles.thFlags}>Flags</th>
                  <th className={styles.thAcciones}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className={styles.fila}>
                    <td><div className={`${styles.miniImg} ${styles.skeleton}`} /></td>
                    <td><div className={styles.skeletonLinea} style={{ width: '60%' }} /></td>
                    <td><div className={styles.skeletonLinea} style={{ width: '50%' }} /></td>
                    <td><div className={styles.skeletonLinea} style={{ width: '40%' }} /></td>
                    <td><div className={styles.skeletonLinea} style={{ width: '70%' }} /></td>
                    <td><div className={styles.skeletonLinea} style={{ width: '50%' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : productosFiltrados.length > 0 ? (
          <div className={styles.tablaWrap}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th className={styles.thImg} />
                  <th className={styles.thNombre}>Nombre</th>
                  <th className={styles.thCat}>Categoría</th>
                  <th className={styles.thPrecio}>Precio</th>
                  <th className={styles.thFlags}>Flags</th>
                  <th className={styles.thAcciones}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map(product => {
                  const imgUrl = getPrimeraImagen(product)
                  return (
                    <tr key={product.id} className={styles.fila}>

                      <td className={styles.tdImg}>
                        <div className={styles.miniImg}>
                          {imgUrl
                            ? <img src={imgUrl} alt={product.name} className={styles.miniImgEl} />
                            : <div className={styles.miniImgPlaceholder} />
                          }
                        </div>
                      </td>

                      <td className={styles.tdNombre}>
                        <p className={styles.productoNombre}>{product.name}</p>
                        <p className={styles.productoId}>#{product.id.slice(0, 8)}</p>
                      </td>

                      <td className={styles.tdCat}>
                        <span className={styles.catBadge}>{nombreCategoria(product.category_id)}</span>
                      </td>

                      <td className={styles.tdPrecio}>
                        ₡ {Number(product.price).toLocaleString('es-CR')}
                      </td>

                      <td className={styles.tdFlags}>
                        <div className={styles.flagsRow}>
                          <button
                            className={`${styles.flagBtn} ${product.is_offer ? styles.flagBtnOferta : ''}`}
                            onClick={() => toggleFlag(product.id, 'is_offer')}
                            title="Oferta"
                          >
                            <TrendingUp size={13} strokeWidth={2} />
                          </button>
                          <button
                            className={`${styles.flagBtn} ${product.is_new ? styles.flagBtnNuevo : ''}`}
                            onClick={() => toggleFlag(product.id, 'is_new')}
                            title="Nuevo"
                          >
                            <Sparkles size={13} strokeWidth={2} />
                          </button>
                          <button
                            className={`${styles.flagBtn} ${product.is_featured ? styles.flagBtnDestacado : ''}`}
                            onClick={() => toggleFlag(product.id, 'is_featured')}
                            title="Destacado"
                          >
                            <Star size={13} strokeWidth={2} />
                          </button>
                        </div>
                      </td>

                      <td className={styles.tdAcciones}>
                        <div className={styles.accionesRow}>
                          <button
                            className={styles.btnEditar}
                            onClick={() => navigate(`/admin/productos/${product.id}/editar`)}
                            title="Editar"
                          >
                            <Pencil size={14} strokeWidth={2} />
                          </button>
                          <button
                            className={styles.btnEliminarFila}
                            onClick={() => setAEliminar(product)}
                            title="Eliminar"
                          >
                            <Trash2 size={14} strokeWidth={2} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.vacio}>
            <p className={styles.vacioTexto}>No se encontraron productos.</p>
            <button
              className={styles.vacioBtn}
              onClick={() => { cambiarFiltro('todos'); setBusqueda(''); setCatFiltro('todas') }}
            >
              Ver todos
            </button>
          </div>
        )}

      </div>

      <ModalConfirmar
        producto={aEliminar}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAEliminar(null)}
      />

    </AdminLayout>
  )
}