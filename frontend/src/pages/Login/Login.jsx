// src/pages/Login/Login.jsx
// Pantalla de inicio de sesión del administrador
// Accesible únicamente por URL directa: /admin/login

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import styles from './Login.module.css'
import Logo from '../../assets/blanco.png'
import backendRESTAdapter from '../../adapter/backendRESTAdapter'

export default function Login() {
  const navigate = useNavigate()

  const [usuario, setUsuario]   = useState('')
  const [password, setPassword] = useState('')
  const [verPass, setVerPass]   = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!usuario.trim() || !password.trim()) {
      setError('Por favor completá todos los campos.')
      return
    }

    setCargando(true)
    try {
      const res = await backendRESTAdapter.loginUsuario({
        username: usuario,
        password: password,
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/admin')
    } catch (err) {
      const msg = err.response?.data?.message
      setError(msg || 'Usuario o contraseña incorrectos.')
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
                onClick={() => alert('Contactá al administrador del sistema.')}
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