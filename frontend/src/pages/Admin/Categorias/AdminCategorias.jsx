import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Check, Tag } from 'lucide-react'
import AdminLayout from '../../../components/AdminLayout/AdminLayout'
import styles from './AdminCategorias.module.css'

const MOCK_CATEGORIAS_INIT = [
  { id: 'cat-1', name: 'Lácteos',    cantidad: 3 },
  { id: 'cat-2', name: 'Bebidas',    cantidad: 4 },
  { id: 'cat-3', name: 'Snacks',     cantidad: 2 },
  { id: 'cat-4', name: 'Limpieza',   cantidad: 2 },
  { id: 'cat-5', name: 'Panadería',  cantidad: 1 },
  { id: 'cat-6', name: 'Congelados', cantidad: 1 },
]

let nextId = 100

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
  const [categorias, setCategorias]   = useState(MOCK_CATEGORIAS_INIT)
  const [aEliminar, setAEliminar]     = useState(null)

  // Panel de crear/editar
  const [panelAbierto, setPanelAbierto] = useState(false)
  const [editandoId, setEditandoId]     = useState(null) // null = creando
  const [inputNombre, setInputNombre]   = useState('')
  const [errorNombre, setErrorNombre]   = useState('')

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

  function guardar() {
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

    if (editandoId) {
      setCategorias(prev =>
        prev.map(c => c.id === editandoId ? { ...c, name: nombre } : c)
      )
    } else {
      // Crear
      const nueva = { id: `cat-${nextId++}`, name: nombre, cantidad: 0 }
      setCategorias(prev => [...prev, nueva])
    }
    cerrarPanel()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') guardar()
    if (e.key === 'Escape') cerrarPanel()
  }

  function confirmarEliminar(id) {
    setCategorias(prev => prev.filter(c => c.id !== id))
    setAEliminar(null)
  }

  return (
    <AdminLayout>
      <div className={styles.page}>

        {/* ENCABEZADO */}
        <div className={styles.topRow}>
          <div>
            <h1 className={styles.titulo}>Categorías</h1>
            <p className={styles.subtitulo}>{categorias.length} categorías en total</p>
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
                  />
                </div>
                <button className={styles.btnGuardarPanel} onClick={guardar} title="Guardar">
                  <Check size={16} strokeWidth={2.5} />
                  {editandoId ? 'Guardar' : 'Crear'}
                </button>
                <button className={styles.btnCancelarPanel} onClick={cerrarPanel} title="Cancelar">
                  <X size={16} strokeWidth={2} />
                </button>
              </div>
              {errorNombre && <p className={styles.panelError}>{errorNombre}</p>}
              <p className={styles.panelHint}>Presioná Enter para guardar o Escape para cancelar</p>
            </div>
          </div>
        )}

        {/* LISTA DE CATEGORIAS */}
        {categorias.length > 0 ? (
          <div className={styles.lista}>
            {categorias.map((cat, idx) => (
              <div key={cat.id} className={styles.fila}>

                {/* Número */}
                <span className={styles.filaNum}>{idx + 1}</span>

                {/* Icono + nombre */}
                <div className={styles.filaIcono}>
                  <Tag size={15} strokeWidth={1.8} />
                </div>
                <div className={styles.filaNombre}>
                  <p className={styles.nombre}>{cat.name}</p>
                  <p className={styles.cantidad}>
                    {cat.cantidad} producto{cat.cantidad !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Acciones */}
                <div className={styles.filaAcciones}>
                  <button
                    className={styles.btnEditar}
                    onClick={() => abrirEditar(cat)}
                    title="Editar"
                  >
                    <Pencil size={14} strokeWidth={2} />
                  </button>
                  <button
                    className={styles.btnEliminar}
                    onClick={() => setAEliminar(cat)}
                    title="Eliminar"
                  >
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

      {/* MODAL CONFIRMAR ELIMINAR */}
      <ModalConfirmar
        categoria={aEliminar}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAEliminar(null)}
      />

    </AdminLayout>
  )
}
