import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Search, X, Plus, Pencil, Trash2,
  TrendingUp, Sparkles, Star, ChevronDown
} from 'lucide-react'
import AdminLayout from '../../../components/AdminLayout/AdminLayout'
import styles from './AdminProductos.module.css'
import AdminProductoForm from '../../../pages/Admin/ProductosForm/AdminProductoForm'

const MOCK_CATEGORIES = [
  { id: 'cat-1', name: 'Lácteos'    },
  { id: 'cat-2', name: 'Bebidas'    },
  { id: 'cat-3', name: 'Snacks'     },
  { id: 'cat-4', name: 'Limpieza'   },
  { id: 'cat-5', name: 'Panadería'  },
  { id: 'cat-6', name: 'Congelados' },
]

const MOCK_PRODUCTS_INIT = [
  { id: 'p-1',  name: 'Producto 1',  price: 2500,  category_id: 'cat-1', image_url: null, is_offer: true,  is_new: false, is_featured: true  },
  { id: 'p-2',  name: 'Producto 2',  price: 3800,  category_id: 'cat-2', image_url: null, is_offer: false, is_new: true,  is_featured: false },
  { id: 'p-3',  name: 'Producto 3',  price: 1200,  category_id: 'cat-1', image_url: null, is_offer: true,  is_new: false, is_featured: false },
  { id: 'p-4',  name: 'Producto 4',  price: 4500,  category_id: 'cat-3', image_url: null, is_offer: false, is_new: true,  is_featured: true  },
  { id: 'p-5',  name: 'Producto 5',  price: 2900,  category_id: 'cat-2', image_url: null, is_offer: false, is_new: false, is_featured: false },
  { id: 'p-6',  name: 'Producto 6',  price: 3600,  category_id: 'cat-4', image_url: null, is_offer: true,  is_new: false, is_featured: true  },
  { id: 'p-7',  name: 'Producto 7',  price: 1800,  category_id: 'cat-3', image_url: null, is_offer: false, is_new: true,  is_featured: false },
  { id: 'p-8',  name: 'Producto 8',  price: 5200,  category_id: 'cat-5', image_url: null, is_offer: false, is_new: false, is_featured: false },
  { id: 'p-9',  name: 'Producto 9',  price: 990,   category_id: 'cat-6', image_url: null, is_offer: true,  is_new: false, is_featured: false },
  { id: 'p-10', name: 'Producto 10', price: 6800,  category_id: 'cat-2', image_url: null, is_offer: false, is_new: true,  is_featured: false },
]

function nombreCategoria(id) {
  return MOCK_CATEGORIES.find(c => c.id === id)?.name ?? '—'
}

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

  const [productos, setProductos]       = useState(MOCK_PRODUCTS_INIT)
  const [busqueda, setBusqueda]         = useState('')
  const [filtro, setFiltro]             = useState(searchParams.get('filtro') || 'todos')
  const [catFiltro, setCatFiltro]       = useState('todas')
  const [aEliminar, setAEliminar]       = useState(null)

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

  function toggleFlag(id, flag) {
    setProductos(prev =>
      prev.map(p => p.id === id ? { ...p, [flag]: !p[flag] } : p)
    )
  }

  function confirmarEliminar(id) {
    setProductos(prev => prev.filter(p => p.id !== id))
    setAEliminar(null)
  }

  function cambiarFiltro(nuevo) {
    setFiltro(nuevo)
    setSearchParams(nuevo === 'todos' ? {} : { filtro: nuevo })
  }

  const filtros = [
    { key: 'todos',    label: 'Todos'      },
    { key: 'oferta',   label: 'Oferta'     },
    { key: 'nuevo',    label: 'Nuevo'      },
    { key: 'destacado',label: 'Destacado'  },
  ]

  return (
    <AdminLayout>
      <div className={styles.page}>

        {/* ── ENCABEZADO ── */}
        <div className={styles.topRow}>
          <div>
            <h1 className={styles.titulo}>Productos</h1>
            <p className={styles.subtitulo}>{productos.length} productos en total</p>
          </div>
          <button
            className={styles.btnNuevo}
            onClick={() => navigate('/admin/productos/nuevo')}
          >
            <Plus size={16} strokeWidth={2} />
            Nuevo producto
          </button>
        </div>

        {/* ── BÚSQUEDA + FILTRO CATEGORÍA ── */}
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
              {MOCK_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className={styles.selectFlecha} strokeWidth={2} />
          </div>
        </div>

        {/* ── CHIPS DE FILTRO ── */}
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

        {/* ── CONTADOR ── */}
        <p className={styles.contador}>
          {productosFiltrados.length} {productosFiltrados.length === 1 ? 'producto' : 'productos'}
        </p>

        {/* ── TABLA DE PRODUCTOS ── */}
        {productosFiltrados.length > 0 ? (
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
                {productosFiltrados.map(product => (
                  <tr key={product.id} className={styles.fila}>

                    {/* Imagen */}
                    <td className={styles.tdImg}>
                      <div className={styles.miniImg}>
                        {product.image_url
                          ? <img src={product.image_url} alt={product.name} className={styles.miniImgEl} />
                          : <div className={styles.miniImgPlaceholder} />
                        }
                      </div>
                    </td>

                    {/* Nombre + ID */}
                    <td className={styles.tdNombre}>
                      <p className={styles.productoNombre}>{product.name}</p>
                      <p className={styles.productoId}>#{product.id}</p>
                    </td>

                    {/* Categoría */}
                    <td className={styles.tdCat}>
                      <span className={styles.catBadge}>{nombreCategoria(product.category_id)}</span>
                    </td>

                    {/* Precio */}
                    <td className={styles.tdPrecio}>
                      ₡ {product.price.toLocaleString('es-CR')}
                    </td>

                    {/* Flags toggleables */}
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

                    {/* Acciones */}
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
                ))}
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

      {/* ── MODAL CONFIRMAR ELIMINAR ── */}
      <ModalConfirmar
        producto={aEliminar}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAEliminar(null)}
      />

    </AdminLayout>
  )
}
