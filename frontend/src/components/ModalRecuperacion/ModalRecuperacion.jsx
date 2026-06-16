// src/components/ModalRecuperacion/ModalRecuperacion.jsx
// Modal de recuperación de contraseña mediante código de recuperación

import { useState } from 'react'
import { X, Lock, KeyRound, Eye, EyeOff } from 'lucide-react'
import styles from './ModalRecuperacion.module.css'
import backendRESTAdapter from '../../adapter/backendRESTAdapter'

export default function ModalRecuperacion({ onCerrar }) {
  const [paso, setPaso]             = useState(1) // 1: código, 2: nueva contraseña
  const [codigo, setCodigo]         = useState('')
  const [nuevaPass, setNuevaPass]   = useState('')
  const [confirmar, setConfirmar]   = useState('')
  const [verNueva, setVerNueva]     = useState(false)
  const [verConf, setVerConf]       = useState(false)
  const [cargando, setCargando]     = useState(false)
  const [error, setError]           = useState('')
  const [exito, setExito]           = useState(false)

  async function verificarCodigo(e) {
    e.preventDefault()
    setError('')
    if (!codigo.trim()) { setError('Ingresá el código de recuperación.'); return }

    setCargando(true)
    try {
      await backendRESTAdapter.verificarCodigoRecuperacion({ recovery_code: codigo })
      setPaso(2)
    } catch {
      setError('Código de recuperación incorrecto.')
    } finally {
      setCargando(false)
    }
  }

  async function cambiarContrasena(e) {
    e.preventDefault()
    setError('')
    if (!nuevaPass.trim()) { setError('Ingresá la nueva contraseña.'); return }
    if (nuevaPass.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return }
    if (nuevaPass !== confirmar) { setError('Las contraseñas no coinciden.'); return }

    setCargando(true)
    try {
      await backendRESTAdapter.resetearContrasena({
        recovery_code: codigo,
        new_password:  nuevaPass,
      })
      setExito(true)
    } catch {
      setError('Ocurrió un error al cambiar la contraseña. Intentá de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onCerrar}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Encabezado */}
        <div className={styles.header}>
          <p className={styles.titulo}>Recuperar contraseña</p>
          <button className={styles.btnCerrar} onClick={onCerrar} aria-label="Cerrar">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Éxito */}
        {exito ? (
          <div className={styles.body}>
            <div className={styles.exitoWrap}>
              <div className={styles.exitoIcono}>✓</div>
              <p className={styles.exitoTitulo}>Contraseña actualizada</p>
              <p className={styles.exitoDesc}>
                La contraseña se cambió correctamente. Podés iniciar sesión con tu nueva contraseña.
              </p>
              <button className={styles.btnPrimario} onClick={onCerrar}>
                Volver al login
              </button>
            </div>
          </div>
        ) : paso === 1 ? (

          /* Paso 1: código de recuperación */
          <form className={styles.body} onSubmit={verificarCodigo} noValidate>
            <p className={styles.desc}>
              Ingresá el código de recuperación que fue entregado al momento de configurar el sistema.
            </p>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="codigo">Código de recuperación</label>
              <div className={styles.inputWrap}>
                <KeyRound size={16} className={styles.inputIcono} strokeWidth={1.8} />
                <input
                  id="codigo"
                  type="text"
                  className={styles.input}
                  placeholder="Ej: GRF-7K2M-X9P4"
                  value={codigo}
                  onChange={e => { setCodigo(e.target.value); setError('') }}
                  autoCapitalize="characters"
                  autoComplete="off"
                />
              </div>
            </div>
            {error && <p className={styles.error} role="alert">{error}</p>}
            <button type="submit" className={styles.btnPrimario} disabled={cargando}>
              {cargando ? 'Verificando...' : 'Continuar'}
            </button>
          </form>

        ) : (

          /* Paso 2: nueva contraseña */
          <form className={styles.body} onSubmit={cambiarContrasena} noValidate>
            <p className={styles.desc}>
              Código verificado. Ingresá tu nueva contraseña.
            </p>

            <div className={styles.campo}>
              <label className={styles.label} htmlFor="nuevaPass">Nueva contraseña</label>
              <div className={styles.inputWrap}>
                <Lock size={16} className={styles.inputIcono} strokeWidth={1.8} />
                <input
                  id="nuevaPass"
                  type={verNueva ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="Mínimo 8 caracteres"
                  value={nuevaPass}
                  onChange={e => { setNuevaPass(e.target.value); setError('') }}
                  autoComplete="new-password"
                />
                <button type="button" className={styles.verBtn}
                  onClick={() => setVerNueva(v => !v)}
                  aria-label={verNueva ? 'Ocultar' : 'Ver'}>
                  {verNueva ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
                </button>
              </div>
            </div>

            <div className={styles.campo}>
              <label className={styles.label} htmlFor="confirmar">Confirmar contraseña</label>
              <div className={styles.inputWrap}>
                <Lock size={16} className={styles.inputIcono} strokeWidth={1.8} />
                <input
                  id="confirmar"
                  type={verConf ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="Repetí la contraseña"
                  value={confirmar}
                  onChange={e => { setConfirmar(e.target.value); setError('') }}
                  autoComplete="new-password"
                />
                <button type="button" className={styles.verBtn}
                  onClick={() => setVerConf(v => !v)}
                  aria-label={verConf ? 'Ocultar' : 'Ver'}>
                  {verConf ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
                </button>
              </div>
            </div>

            {error && <p className={styles.error} role="alert">{error}</p>}
            <button type="submit" className={styles.btnPrimario} disabled={cargando}>
              {cargando ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
