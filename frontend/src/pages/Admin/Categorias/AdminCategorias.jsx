import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Check, Tag } from 'lucide-react'
import AdminLayout from '../../../components/AdminLayout/AdminLayout'
import styles from './AdminCategorias.module.css'
import backendRESTAdapter from '../../../adapter/backendRESTAdapter'

function ModalConfirmar({ categoria, onConfirmar, onCancelar }) {
  if (!categoria) return null
  return (
    <div className={styles.modalOverlay} onClick={onCancelar}>
      <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
        <p className={styles.modalTitulo}>¿Eliminar categoría?</p>
        <p className={styles.modalDesc}>
          Se eliminará <strong>{categoria.name}</strong>.
          {categoria.cantidad > 0 && (
            <span className={styles.modalAviso}>
              {' '}Esta categoría tiene {categoria.cantidad} producto{categoria.cantidad !== 1 ? 's' : ''} asignado{categoria.cantidad !== 1 ? 's' : ''}. Deberás reasignarlos.
            </span>
          )}
        </p>
        <div className={styles.modalBtns}>
          <button className={styles.btnCancelarModal} onClick={onCancelar}>Cancelar</button>
          <button className={styles.btnEliminarModal} onClick={() => onConfirmar(categoria.id)}>Eliminar</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando]     = useState(true)
  const [aEliminar, setAEliminar]   = useState(null)
  const [guardando, setGuardando]   = useState(false)
  const [toast, setToast]           = useState('')

  // Panel crear/editar
  const [panelAbierto, setPanelAbierto] = useState(false)
  const [editandoId, setEditandoId]     = useState(null)
  const [inputNombre, setInputNombre]   = useState('')
  const [errorNombre, setErrorNombre]   = useState('')

  // Carga inicial
  useEffect(() => {
    async function cargar() {
      setCargando(true)
      try {
        const res = await backendRESTAdapter.obtenerCategorias()
        // La API devuelve { id, name } - cantidad la calculamos aparte si hace falta
        setCategorias(res.data.map(c => ({ ...c, cantidad: c.cantidad ?? 0 })))
      } catch (err) {
        console.error('Error al cargar categorías:', err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  function abrirCrear() {
    setEditandoId(null)
    setInputNombre('')
    setErrorNombre('')
    setPanelAbierto(true)
  }

  function abrirEditar(cat) {
    setEditandoId(cat.id)
    setInputNombre(cat.name)
    setErrorNombre('')
    setPanelAbierto(true)
  }

  function cerrarPanel() {
    setPanelAbierto(false)
    setEditandoId(null)
    setInputNombre('')
    setErrorNombre('')
  }

  async function guardar() {
    const nombre = inputNombre.trim()
    if (!nombre) {
      setErrorNombre('El nombre es requerido.')
      return
    }
    const duplicado = categorias.some(
      c => c.name.toLowerCase() === nombre.toLowerCase() && c.id !== editandoId
    )
    if (duplicado) {
      setErrorNombre('Ya existe una categoría con ese nombre.')
      return
    }

    setGuardando(true)
    try {
      if (editandoId) {
        await backendRESTAdapter.editarCategoria(editandoId, { name: nombre })
      } else {
        await backendRESTAdapter.crearCategoria({ name: nombre })
      }
      // Recargar lista desde la API para asegurar datos actualizados
      const res = await backendRESTAdapter.obtenerCategorias()
      setCategorias(res.data.map(c => ({ ...c, cantidad: c.cantidad ?? 0 })))
      cerrarPanel()
      setToast(editandoId ? 'editado' : 'creado')
      setTimeout(() => setToast(''), 2500)
    } catch (err) {
      setErrorNombre('Error al guardar. Intentá de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') guardar()
    if (e.key === 'Escape') cerrarPanel()
  }

  async function confirmarEliminar(id) {
    try {
      await backendRESTAdapter.eliminarCategoria(id)
      const res = await backendRESTAdapter.obtenerCategorias()
      setCategorias(res.data.map(c => ({ ...c, cantidad: c.cantidad ?? 0 })))
      setToast('eliminado')
      setTimeout(() => setToast(''), 2500)
    } catch (err) {
      setToast('error')
      setTimeout(() => setToast(''), 2500)
    }
    setAEliminar(null)
  }

  return (
    <AdminLayout>
      <div className={styles.page}>

        {/* ENCABEZADO */}
        <div className={styles.topRow}>
          <div>
            <h1 className={styles.titulo}>Categorías</h1>
            <p className={styles.subtitulo}>
              {cargando ? 'Cargando...' : `${categorias.length} categorías en total`}
            </p>
          </div>
          <button className={styles.btnNuevo} onClick={abrirCrear}>
            <Plus size={16} strokeWidth={2} />
            Nueva categoría
          </button>
        </div>

        {/* PANEL CREAR / EDITAR */}
        {panelAbierto && (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <p className={styles.panelTitulo}>
                {editandoId ? 'Editar categoría' : 'Nueva categoría'}
              </p>
              <button className={styles.panelCerrar} onClick={cerrarPanel} aria-label="Cerrar">
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className={styles.panelBody}>
              <div className={styles.inputRow}>
                <div className={styles.inputWrap}>
                  <Tag size={15} className={styles.inputIcono} strokeWidth={1.8} />
                  <input
                    type="text"
                    className={`${styles.panelInput} ${errorNombre ? styles.panelInputError : ''}`}
                    placeholder="Nombre de la categoría"
                    value={inputNombre}
                    onChange={e => { setInputNombre(e.target.value); setErrorNombre('') }}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    maxLength={50}
                    disabled={guardando}
                  />
                </div>
                <button className={styles.btnGuardarPanel} onClick={guardar}
                  title="Guardar" disabled={guardando}>
                  <Check size={16} strokeWidth={2.5} />
                  {guardando ? 'Guardando...' : editandoId ? 'Guardar' : 'Crear'}
                </button>
                <button className={styles.btnCancelarPanel} onClick={cerrarPanel}
                  title="Cancelar" disabled={guardando}>
                  <X size={16} strokeWidth={2} />
                </button>
              </div>
              {errorNombre && <p className={styles.panelError}>{errorNombre}</p>}
              <p className={styles.panelHint}>Presioná Enter para guardar o Escape para cancelar</p>
            </div>
          </div>
        )}

        {/* LISTA */}
        {cargando ? (
          <div className={styles.lista}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className={styles.fila}>
                <span className={styles.filaNum}>{i + 1}</span>
                <div className={styles.filaIcono} />
                <div className={styles.filaNombre}>
                  <div className={styles.skeletonLinea} style={{ width: '40%' }} />
                  <div className={styles.skeletonLinea} style={{ width: '25%', marginTop: '0.25rem' }} />
                </div>
              </div>
            ))}
          </div>
        ) : categorias.length > 0 ? (
          <div className={styles.lista}>
            {categorias.map((cat, idx) => (
              <div key={cat.id} className={styles.fila}>
                <span className={styles.filaNum}>{idx + 1}</span>
                <div className={styles.filaIcono}>
                  <Tag size={15} strokeWidth={1.8} />
                </div>
                <div className={styles.filaNombre}>
                  <p className={styles.nombre}>{cat.name}</p>
                  <p className={styles.cantidad}>
                    {cat.cantidad} producto{cat.cantidad !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className={styles.filaAcciones}>
                  <button className={styles.btnEditar} onClick={() => abrirEditar(cat)} title="Editar">
                    <Pencil size={14} strokeWidth={2} />
                  </button>
                  <button className={styles.btnEliminar} onClick={() => setAEliminar(cat)} title="Eliminar">
                    <Trash2 size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.vacio}>
            <Tag size={32} strokeWidth={1.3} className={styles.vacioIcono} />
            <p className={styles.vacioTexto}>No hay categorías todavía.</p>
            <button className={styles.vacioBtn} onClick={abrirCrear}>
              <Plus size={14} strokeWidth={2} />
              Crear primera categoría
            </button>
          </div>
        )}

      </div>

      <ModalConfirmar
        categoria={aEliminar}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAEliminar(null)}
      />

      {/* === TOAST === */}
      {toast === 'creado'   && <div className={styles.toastExito}>✓ Categoría creada correctamente</div>}
      {toast === 'editado'  && <div className={styles.toastExito}>✓ Categoría actualizada correctamente</div>}
      {toast === 'eliminado'&& <div className={styles.toastExito}>✓ Categoría eliminada</div>}
      {toast === 'error'    && <div className={styles.toastError}>✕ Error al realizar la operación</div>}

    </AdminLayout>
  )
}