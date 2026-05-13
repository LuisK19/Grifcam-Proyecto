import { useState } from 'react'
import { Save, Loader, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import AdminLayout from '../../../components/AdminLayout/AdminLayout'
import styles from './AdminInfo.module.css'

const MOCK_INFO = {
  descripcion: 'Somos una distribuidora comprometida con la calidad y el servicio al cliente. Llevamos productos seleccionados directamente a tu negocio con los mejores precios del mercado.',
  telefono:    '60759718',
  email:       'distribuidoragrifcam@',
  ubicacion:   'Limón, Costa Rica',
  instagram:   'https://www.instagram.com/distribuidoragrifcam',
  facebook:    'https://www.facebook.com/p/Distribuidora-Grifcam-100064027475626/',
  maps_link:   'https://maps.app.goo.gl/iwWaicgNQLEyE6GQ7',
  horario: [
    { dia: 'Lunes',      horas: '8:30 a.m. – 6:00 p.m.', abierto: true  },
    { dia: 'Martes',     horas: '8:30 a.m. – 6:00 p.m.', abierto: true  },
    { dia: 'Miércoles',  horas: '8:30 a.m. – 6:00 p.m.', abierto: true  },
    { dia: 'Jueves',     horas: '8:30 a.m. – 6:00 p.m.', abierto: true  },
    { dia: 'Viernes',    horas: '8:30 a.m. – 5:00 p.m.', abierto: true  },
    { dia: 'Sábado',     horas: 'Cerrado',                abierto: false },
    { dia: 'Domingo',    horas: '8:30 a.m. – 12:00 p.m.', abierto: true },
  ],
  politicas: [
    { id: 'p-1', titulo: 'Política de devoluciones', contenido: 'Los productos pueden ser devueltos dentro de los primeros 7 días naturales a partir de la fecha de compra, siempre que se encuentren en su estado original, sin uso y con el empaque intacto.' },
    { id: 'p-2', titulo: 'Política de entregas',     contenido: 'Las entregas se coordinan directamente con el cliente según disponibilidad. El tiempo de entrega puede variar dependiendo de la zona.' },
    { id: 'p-3', titulo: 'Política de pagos',        contenido: 'Aceptamos pagos en efectivo, transferencia bancaria y SINPE Móvil.' },
  ],
  videos: [
    { id: 'v-1', titulo: 'Video publicitario 1', url: '' },
    { id: 'v-2', titulo: 'Video publicitario 2', url: '' },
  ],
}
let nextPoliticaId = 10
let nextVideoId = 10

function Seccion({ titulo, children, defaultAbierta = true }) {
  const [abierta, setAbierta] = useState(defaultAbierta)
  return (
    <div className={styles.seccion}>
      <button
        type="button"
        className={styles.seccionHeader}
        onClick={() => setAbierta(a => !a)}
      >
        <span className={styles.seccionTitulo}>{titulo}</span>
        {abierta
          ? <ChevronUp size={16} strokeWidth={2} />
          : <ChevronDown size={16} strokeWidth={2} />
        }
      </button>
      {abierta && <div className={styles.seccionBody}>{children}</div>}
    </div>
  )
}

export default function AdminInfo() {
  const [form, setForm]           = useState(MOCK_INFO)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado]   = useState(false)
  const [errores, setErrores]     = useState({})

  function handleChange(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }))
    if (errores[campo]) setErrores(prev => ({ ...prev, [campo]: '' }))
    setGuardado(false)
  }

  function handleHorario(idx, campo, valor) {
    setForm(prev => {
      const horario = [...prev.horario]
      horario[idx] = { ...horario[idx], [campo]: valor }
      return { ...prev, horario }
    })
    setGuardado(false)
  }

  function handlePolitica(id, campo, valor) {
    setForm(prev => ({
      ...prev,
      politicas: prev.politicas.map(p => p.id === id ? { ...p, [campo]: valor } : p)
    }))
    setGuardado(false)
  }

  function agregarPolitica() {
    setForm(prev => ({
      ...prev,
      politicas: [
        ...prev.politicas,
        { id: `p-${nextPoliticaId++}`, titulo: '', contenido: '' }
      ]
    }))
  }

  function eliminarPolitica(id) {
    setForm(prev => ({
      ...prev,
      politicas: prev.politicas.filter(p => p.id !== id)
    }))
  }

  // Videos
  function handleVideo(id, campo, valor) {
    setForm(prev => ({
      ...prev,
      videos: prev.videos.map(v => v.id === id ? { ...v, [campo]: valor } : v)
    }))
    setGuardado(false)
  }

  function agregarVideo() {
    setForm(prev => ({
      ...prev,
      videos: [...prev.videos, { id: `v-${nextVideoId++}`, titulo: '', url: '' }]
    }))
  }

  function eliminarVideo(id) {
    setForm(prev => ({
      ...prev,
      videos: prev.videos.filter(v => v.id !== id)
    }))
  }

  function validar() {
    const e = {}
    if (!form.descripcion.trim()) e.descripcion = 'La descripción es requerida.'
    if (!form.telefono.trim())    e.telefono    = 'El teléfono es requerido.'
    if (!form.email.trim())       e.email       = 'El correo es requerido.'
    if (!form.ubicacion.trim())   e.ubicacion   = 'La ubicación es requerida.'
    form.politicas.forEach((p, i) => {
      if (!p.titulo.trim())    e[`pol_titulo_${i}`]    = 'Requerido.'
      if (!p.contenido.trim()) e[`pol_contenido_${i}`] = 'Requerido.'
    })
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
      setGuardado(true)
    } catch {
      setErrores({ global: 'Ocurrió un error al guardar. Intentá de nuevo.' })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <AdminLayout>
      <div className={styles.page}>

        {/* ENCABEZADO */}
        <div className={styles.header}>
          <h1 className={styles.titulo}>Editar página Info</h1>
          <p className={styles.subtitulo}>Los cambios se reflejan en la página pública de Información</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className={styles.form}>

          {/* DESCRIPCION */}
          <Seccion titulo="Descripción del negocio">
            <div className={styles.campo}>
              <label className={styles.label}>
                Descripción <span className={styles.requerido}>*</span>
              </label>
              <textarea
                className={`${styles.textarea} ${errores.descripcion ? styles.inputError : ''}`}
                rows={4}
                maxLength={600}
                value={form.descripcion}
                onChange={e => handleChange('descripcion', e.target.value)}
                placeholder="Breve descripción del negocio..."
              />
              <div className={styles.textareaFooter}>
                {errores.descripcion && <p className={styles.error}>{errores.descripcion}</p>}
                <p className={styles.charCount}>{form.descripcion.length}/600</p>
              </div>
            </div>
          </Seccion>

          {/* CONTACTO */}
          <Seccion titulo="Contacto">
            <div className={styles.camposGrid}>
              <div className={styles.campo}>
                <label className={styles.label}>Teléfono / WhatsApp <span className={styles.requerido}>*</span></label>
                <input
                  type="text"
                  className={`${styles.input} ${errores.telefono ? styles.inputError : ''}`}
                  value={form.telefono}
                  onChange={e => handleChange('telefono', e.target.value)}
                  placeholder="Ej: 60759718"
                  maxLength={20}
                />
                {errores.telefono && <p className={styles.error}>{errores.telefono}</p>}
              </div>

              <div className={styles.campo}>
                <label className={styles.label}>Correo electrónico <span className={styles.requerido}>*</span></label>
                <input
                  type="email"
                  className={`${styles.input} ${errores.email ? styles.inputError : ''}`}
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="correo@ejemplo.com"
                />
                {errores.email && <p className={styles.error}>{errores.email}</p>}
              </div>

              <div className={styles.campo}>
                <label className={styles.label}>Ubicación <span className={styles.requerido}>*</span></label>
                <input
                  type="text"
                  className={`${styles.input} ${errores.ubicacion ? styles.inputError : ''}`}
                  value={form.ubicacion}
                  onChange={e => handleChange('ubicacion', e.target.value)}
                  placeholder="Ej: Limón, Costa Rica"
                />
                {errores.ubicacion && <p className={styles.error}>{errores.ubicacion}</p>}
              </div>

              <div className={styles.campo}>
                <label className={styles.label}>Link de Google Maps</label>
                <input
                  type="url"
                  className={styles.input}
                  value={form.maps_link}
                  onChange={e => handleChange('maps_link', e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                />
              </div>

              <div className={styles.campo}>
                <label className={styles.label}>Instagram</label>
                <input
                  type="url"
                  className={styles.input}
                  value={form.instagram}
                  onChange={e => handleChange('instagram', e.target.value)}
                  placeholder="https://www.instagram.com/..."
                />
              </div>

              <div className={styles.campo}>
                <label className={styles.label}>Facebook</label>
                <input
                  type="url"
                  className={styles.input}
                  value={form.facebook}
                  onChange={e => handleChange('facebook', e.target.value)}
                  placeholder="https://www.facebook.com/..."
                />
              </div>
            </div>
          </Seccion>

          {/* HORARIO */}
          <Seccion titulo="Horario de atención">
            <div className={styles.horarioLista}>
              {form.horario.map((fila, idx) => (
                <div key={fila.dia} className={styles.horarioFila}>
                  <span className={styles.horarioDia}>{fila.dia}</span>

                  <label className={styles.horarioToggle}>
                    <input
                      type="checkbox"
                      checked={fila.abierto}
                      onChange={e => handleHorario(idx, 'abierto', e.target.checked)}
                      className={styles.checkbox}
                    />
                    <span className={`${styles.horarioEstado} ${fila.abierto ? styles.horarioAbierto : styles.horarioCerrado}`}>
                      {fila.abierto ? 'Abierto' : 'Cerrado'}
                    </span>
                  </label>

                  <input
                    type="text"
                    className={`${styles.horarioInput} ${!fila.abierto ? styles.horarioInputDisabled : ''}`}
                    value={fila.horas}
                    onChange={e => handleHorario(idx, 'horas', e.target.value)}
                    disabled={!fila.abierto}
                    placeholder="Ej: 8:30 a.m. – 6:00 p.m."
                  />
                </div>
              ))}
            </div>
            <p className={styles.hint}>Si el día está cerrado, el horario se ignorará en la página pública.</p>
          </Seccion>

          {/* POLÍTICAS */}
          <Seccion titulo="Políticas">
            <div className={styles.politicasLista}>
              {form.politicas.map((pol, idx) => (
                <div key={pol.id} className={styles.politicaCard}>
                  <div className={styles.politicaHeader}>
                    <span className={styles.politicaNum}>{idx + 1}</span>
                    <button
                      type="button"
                      className={styles.btnEliminarItem}
                      onClick={() => eliminarPolitica(pol.id)}
                      title="Eliminar política"
                    >
                      <Trash2 size={13} strokeWidth={2} />
                    </button>
                  </div>

                  <div className={styles.campo}>
                    <label className={styles.label}>Título <span className={styles.requerido}>*</span></label>
                    <input
                      type="text"
                      className={`${styles.input} ${errores[`pol_titulo_${idx}`] ? styles.inputError : ''}`}
                      value={pol.titulo}
                      onChange={e => handlePolitica(pol.id, 'titulo', e.target.value)}
                      placeholder="Ej: Política de devoluciones"
                      maxLength={80}
                    />
                    {errores[`pol_titulo_${idx}`] && <p className={styles.error}>{errores[`pol_titulo_${idx}`]}</p>}
                  </div>

                  <div className={styles.campo}>
                    <label className={styles.label}>Contenido <span className={styles.requerido}>*</span></label>
                    <textarea
                      className={`${styles.textarea} ${errores[`pol_contenido_${idx}`] ? styles.inputError : ''}`}
                      rows={3}
                      value={pol.contenido}
                      onChange={e => handlePolitica(pol.id, 'contenido', e.target.value)}
                      placeholder="Descripción de la política..."
                      maxLength={500}
                    />
                    {errores[`pol_contenido_${idx}`] && <p className={styles.error}>{errores[`pol_contenido_${idx}`]}</p>}
                  </div>
                </div>
              ))}
            </div>

            <button type="button" className={styles.btnAgregar} onClick={agregarPolitica}>
              <Plus size={14} strokeWidth={2} />
              Agregar política
            </button>
          </Seccion>

          {/* VIDEOS */}
          <Seccion titulo="Videos" defaultAbierta={false}>
            <div className={styles.videosLista}>
              {form.videos.map((vid, idx) => (
                <div key={vid.id} className={styles.videoCard}>
                  <div className={styles.politicaHeader}>
                    <span className={styles.politicaNum}>Video {idx + 1}</span>
                    <button
                      type="button"
                      className={styles.btnEliminarItem}
                      onClick={() => eliminarVideo(vid.id)}
                      title="Eliminar video"
                    >
                      <Trash2 size={13} strokeWidth={2} />
                    </button>
                  </div>

                  <div className={styles.camposGrid}>
                    <div className={styles.campo}>
                      <label className={styles.label}>Título</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={vid.titulo}
                        onChange={e => handleVideo(vid.id, 'titulo', e.target.value)}
                        placeholder="Ej: Video publicitario 1"
                        maxLength={80}
                      />
                    </div>
                    <div className={styles.campo}>
                      <label className={styles.label}>URL del video</label>
                      <input
                        type="url"
                        className={styles.input}
                        value={vid.url}
                        onChange={e => handleVideo(vid.id, 'url', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" className={styles.btnAgregar} onClick={agregarVideo}>
              <Plus size={14} strokeWidth={2} />
              Agregar video
            </button>
          </Seccion>

          {/* ERROR GLOBAL */}
          {errores.global && (
            <p className={styles.errorGlobal}>{errores.global}</p>
          )}

          {/* BOTÓN GUARDAR */}
          <div className={styles.formBtns}>
            {guardado && (
              <p className={styles.guardadoMsg}>✓ Cambios guardados correctamente</p>
            )}
            <button type="submit" className={styles.btnGuardar} disabled={guardando}>
              {guardando
                ? <><Loader size={15} strokeWidth={2} className={styles.spinner} /> Guardando...</>
                : <><Save size={15} strokeWidth={2} /> Guardar cambios</>
              }
            </button>
          </div>

        </form>
      </div>
    </AdminLayout>
  )
}
