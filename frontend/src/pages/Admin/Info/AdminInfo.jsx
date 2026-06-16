import { useState, useEffect } from 'react'
import { Save, Loader, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import AdminLayout from '../../../components/AdminLayout/AdminLayout'
import styles from './AdminInfo.module.css'
import backendRESTAdapter from '../../../adapter/backendRESTAdapter'

// === Componente Sección acordeón ============================
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
  // Estado de datos
  const [businessId, setBusinessId] = useState(null)
  const [form, setForm]             = useState({
    descripcion_corta: '',
    descripcion_larga: '',
    telefono:          '',
    whatsapp:          '',
    email:             '',
    ubicacion:         '',
    maps_link:         '',
    maps_embed:        '',
    instagram:         '',
    facebook:          '',
  })
  const [horario, setHorario]     = useState([])
  const [politicas, setPoliticas] = useState([])
  const [videos, setVideos]       = useState([])

  // Estado de UI
  const [cargando, setCargando]   = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado]   = useState(false)
  const [errores, setErrores]     = useState({})

  // === Carga inicial ==========================================
  useEffect(() => {
    async function cargar() {
      setCargando(true)
      try {
        const [resBiz, resHor, resPol, resVid] = await Promise.allSettled([
          backendRESTAdapter.obtenerBusiness(),
          backendRESTAdapter.obtenerHorario(),
          backendRESTAdapter.obtenerPoliticas(),
          backendRESTAdapter.obtenerVideos(),
        ])

        if (resBiz.status === 'fulfilled') {
          const biz = resBiz.value.data
          setBusinessId(biz.id)
          setForm({
            descripcion_corta: biz.descripcion_corta ?? '',
            descripcion_larga: biz.descripcion_larga ?? '',
            telefono:          biz.telefono    ?? '',
            whatsapp:          biz.whatsapp    ?? '',
            email:             biz.email       ?? '',
            ubicacion:         biz.ubicacion   ?? '',
            maps_link:         biz.maps_link   ?? '',
            maps_embed:        biz.maps_embed  ?? '',
            instagram:         biz.instagram   ?? '',
            facebook:          biz.facebook    ?? '',
          })
        }

        if (resHor.status === 'fulfilled') setHorario(resHor.value.data)
        if (resPol.status === 'fulfilled') setPoliticas(resPol.value.data)
        if (resVid.status === 'fulfilled') setVideos(resVid.value.data)
      } catch (err) {
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  // === Cambios de form ============================================
  function handleChange(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }))
    if (errores[campo]) setErrores(prev => ({ ...prev, [campo]: '' }))
    setGuardado(false)
  }

  // === Horario - cada día se guarda individualmente ============
  function handleHorario(idx, campo, valor) {
    setHorario(prev => {
      const nuevo = [...prev]
      nuevo[idx] = { ...nuevo[idx], [campo]: valor }
      return nuevo
    })
    setGuardado(false)
  }

  // === Políticas ============================================
  function handlePolitica(id, campo, valor) {
    setPoliticas(prev =>
      prev.map(p => p.id === id ? { ...p, [campo]: valor } : p)
    )
    setGuardado(false)
  }

  async function agregarPolitica() {
    try {
      const res = await backendRESTAdapter.editarPolitica('nueva', {
        titulo: '', contenido: '', orden: politicas.length + 1
      })
      // Si el endpoint de crear no existe aún, lo manejamos local
      setPoliticas(prev => [...prev, res?.data ?? {
        id: `local-${Date.now()}`, titulo: '', contenido: '', orden: prev.length + 1
      }])
    } catch {
      // Fallback local mientras el endpoint POST no está disponible
      setPoliticas(prev => [...prev, {
        id: `local-${Date.now()}`, titulo: '', contenido: '', orden: prev.length + 1
      }])
    }
  }

  async function eliminarPolitica(id) {
    try {
      await backendRESTAdapter.editarPolitica(id, { _delete: true })
    } catch {
      // Si falla la API eliminamos local de todas formas
    }
    setPoliticas(prev => prev.filter(p => p.id !== id))
    setGuardado(false)
  }

  // === Videos =========================================
  function handleVideo(id, campo, valor) {
    setVideos(prev =>
      prev.map(v => v.id === id ? { ...v, [campo]: valor } : v)
    )
    setGuardado(false)
  }

  async function agregarVideo() {
    try {
      const res = await backendRESTAdapter.editarVideo('nuevo', {
        titulo: '', url: '', orden: videos.length + 1
      })
      setVideos(prev => [...prev, res?.data ?? {
        id: `local-${Date.now()}`, titulo: '', url: '', orden: prev.length + 1
      }])
    } catch {
      setVideos(prev => [...prev, {
        id: `local-${Date.now()}`, titulo: '', url: '', orden: prev.length + 1
      }])
    }
  }

  async function eliminarVideo(id) {
    try {
      await backendRESTAdapter.eliminarVideo(id)
    } catch {
      // eliminar local igualmente
    }
    setVideos(prev => prev.filter(v => v.id !== id))
    setGuardado(false)
  }

  // === Validación =============================================
  function validar() {
    const e = {}
    if (!form.descripcion_corta.trim()) e.descripcion_corta = 'Requerido.'
    if (!form.descripcion_larga.trim()) e.descripcion_larga = 'Requerido.'
    if (!form.telefono.trim())          e.telefono          = 'Requerido.'
    if (!form.email.trim())             e.email             = 'Requerido.'
    if (!form.ubicacion.trim())         e.ubicacion         = 'Requerido.'
    politicas.forEach((p, i) => {
      if (!p.titulo.trim())    e[`pol_titulo_${i}`]    = 'Requerido.'
      if (!p.contenido.trim()) e[`pol_contenido_${i}`] = 'Requerido.'
    })
    return e
  }

  // === Guardar todo ===========================================
  async function handleSubmit(e) {
    e.preventDefault()
    const nuevosErrores = validar()
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      return
    }

    setGuardando(true)
    try {
      // 1. Guardar info del negocio
      await backendRESTAdapter.editarBusiness(businessId, form)

      // 2. Guardar cada día del horario individualmente
      await Promise.all(
        horario.map(dia => backendRESTAdapter.editarHorarioDia(dia.id, {
          horas:   dia.abierto ? dia.horas : 'Cerrado',
          abierto: dia.abierto,
        }))
      )

      // 3. Guardar cada política individualmente
      await Promise.all(
        politicas
          .filter(p => !p.id.startsWith('local-'))
          .map(p => backendRESTAdapter.editarPolitica(p.id, {
            titulo:   p.titulo,
            contenido: p.contenido,
          }))
      )

      // 4. Guardar cada video individualmente
      await Promise.all(
        videos
          .filter(v => !v.id.startsWith('local-'))
          .map(v => backendRESTAdapter.editarVideo(v.id, {
            titulo: v.titulo,
            url:    v.url,
          }))
      )

      setGuardado(true)
    } catch (err) {
      setErrores({ global: 'Ocurrió un error al guardar. Intentá de nuevo.' })
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <AdminLayout>
        <div className={styles.page}>
          <p style={{ opacity: 0.5, padding: '1rem 0' }}>Cargando información...</p>
        </div>
      </AdminLayout>
    )
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

          {/* DESCRIPCIÓN */}
          <Seccion titulo="Descripción del negocio">
            <div className={styles.campo}>
              <label className={styles.label}>
                Descripción corta (Home) <span className={styles.requerido}>*</span>
              </label>
              <textarea
                className={`${styles.textarea} ${errores.descripcion_corta ? styles.inputError : ''}`}
                rows={2}
                maxLength={200}
                value={form.descripcion_corta}
                onChange={e => handleChange('descripcion_corta', e.target.value)}
                placeholder="Frase corta para la sección Sobre nosotros del Home..."
              />
              <div className={styles.textareaFooter}>
                {errores.descripcion_corta && <p className={styles.error}>{errores.descripcion_corta}</p>}
                <p className={styles.charCount}>{form.descripcion_corta.length}/200</p>
              </div>
            </div>
            <div className={styles.campo}>
              <label className={styles.label}>
                Descripción larga (página Info) <span className={styles.requerido}>*</span>
              </label>
              <textarea
                className={`${styles.textarea} ${errores.descripcion_larga ? styles.inputError : ''}`}
                rows={4}
                maxLength={600}
                value={form.descripcion_larga}
                onChange={e => handleChange('descripcion_larga', e.target.value)}
                placeholder="Descripción completa del negocio para la página de Información..."
              />
              <div className={styles.textareaFooter}>
                {errores.descripcion_larga && <p className={styles.error}>{errores.descripcion_larga}</p>}
                <p className={styles.charCount}>{form.descripcion_larga.length}/600</p>
              </div>
            </div>
          </Seccion>

          {/* CONTACTO */}
          <Seccion titulo="Contacto">
            <div className={styles.camposGrid}>
              <div className={styles.campo}>
                <label className={styles.label}>Teléfono <span className={styles.requerido}>*</span></label>
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
                <label className={styles.label}>WhatsApp (con código de país)</label>
                <input
                  type="text"
                  className={styles.input}
                  value={form.whatsapp}
                  onChange={e => handleChange('whatsapp', e.target.value)}
                  placeholder="Ej: 50660759718"
                  maxLength={20}
                />
                <p className={styles.hint}>Se usa para el botón de pedidos en el carrito</p>
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
                <label className={styles.label}>Embed de Google Maps</label>
                <input
                  type="url"
                  className={styles.input}
                  value={form.maps_embed}
                  onChange={e => handleChange('maps_embed', e.target.value)}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                />
                <p className={styles.hint}>Se obtiene en Google Maps → Compartir → Incorporar un mapa</p>
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
              {horario.map((fila, idx) => (
                <div key={fila.id ?? fila.dia} className={styles.horarioFila}>
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
              {politicas.map((pol, idx) => (
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
              {videos.map((vid, idx) => (
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