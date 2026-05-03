import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import styles from './Login.module.css'
import Logo from '../../assets/blanco.png'

export default function Login() {
  const navigate = useNavigate()

  const [usuario, setUsuario]       = useState('')
  const [password, setPassword]     = useState('')
  const [verPass, setVerPass]       = useState(false)
  const [cargando, setCargando]     = useState(false)
  const [error, setError]           = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!usuario.trim() || !password.trim()) {
      setError('Por favor completá todos los campos.')
      return
    }

    setCargando(true)

    try {
      // TODO: reemplazar con llamada real a la API
      await new Promise(r => setTimeout(r, 1000))
      if (usuario === 'admin' && password === '1234') {
        navigate('/admin')
      } else {
        setError('Usuario o contraseña incorrectos.')
      }
    } catch {
      setError('Ocurrió un error. Intentá de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className={styles.pagina}>

      <div className={styles.tarjeta}>

        {/* Logo */}
        <div className={styles.logoWrap}>
          <img src={Logo} alt="Grifcam" className={styles.logo} />
        </div>

        <h1 className={styles.titulo}>Acceso administrativo</h1>
        <p className={styles.subtitulo}>Ingresá tus credenciales para continuar</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>

          {/* Usuario */}
          <div className={styles.campo}>
            <label className={styles.label} htmlFor="usuario">Usuario</label>
            <div className={styles.inputWrap}>
              <User size={16} className={styles.inputIcono} strokeWidth={1.8} />
              <input
                id="usuario"
                type="text"
                className={styles.input}
                placeholder="Nombre de usuario"
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
                autoComplete="username"
                autoCapitalize="none"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className={styles.campo}>
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="password">Contraseña</label>
              <button
                type="button"
                className={styles.olvideLinkBtn}
                onClick={() => {
                  // TODO: implementar flujo de recuperación de contraseña
                  alert('Contactá al administrador del sistema.')
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcono} strokeWidth={1.8} />
              <input
                id="password"
                type={verPass ? 'text' : 'password'}
                className={styles.input}
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.verPassBtn}
                onClick={() => setVerPass(v => !v)}
                aria-label={verPass ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {verPass
                  ? <EyeOff size={16} strokeWidth={1.8} />
                  : <Eye    size={16} strokeWidth={1.8} />
                }
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className={styles.error} role="alert">{error}</p>
          )}

          {/* Botón submit */}
          <button
            type="submit"
            className={styles.btnIngresar}
            disabled={cargando}
          >
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>

        </form>
      </div>
    </div>
  )
}
