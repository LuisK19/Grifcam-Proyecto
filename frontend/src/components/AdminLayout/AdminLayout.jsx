// src/components/AdminLayout/AdminLayout.jsx
// Layout del panel administrativo — sidebar desktop + bottom nav mobile

import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Tag, Info,
  LogOut, PanelRightOpen
} from 'lucide-react'
import styles from './AdminLayout.module.css'
import Logo from '../../assets/logo-blanco.webp'

const navItems = [
  { to: '/admin',            end: true,  icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/admin/productos',  end: false, icon: Package,          label: 'Productos'  },
  { to: '/admin/categorias', end: false, icon: Tag,              label: 'Categorías' },
  { to: '/admin/info',       end: false, icon: Info,             label: 'Info'       },
]

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const [colapsado, setColapsado] = useState(false)

  function cerrarSesion() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/admin/login')
  }

  return (
    <div className={styles.layout}>

      {/* === SIDEBAR DESKTOP === */}
      <aside className={`${styles.sidebar} ${colapsado ? styles.sidebarColapsado : ''}`}>

        <div className={styles.sidebarHeader}>
          {!colapsado && (
            <img src={Logo} alt="Grifcam" className={styles.logoImg} />
          )}
          <button
            className={styles.toggleBtn}
            onClick={() => setColapsado(c => !c)}
            aria-label={colapsado ? 'Expandir menú' : 'Colapsar menú'}
          >
            <PanelRightOpen
              size={18}
              strokeWidth={1.8}
              style={{ transform: colapsado ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s ease' }}
            />
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map(({ to, end, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ''}`
              }
              title={colapsado ? label : undefined}
            >
              <Icon size={18} strokeWidth={1.8} style={{ flexShrink: 0 }} />
              {!colapsado && <span className={styles.sidebarLabel}>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <button
          className={styles.sidebarSalir}
          onClick={cerrarSesion}
          title={colapsado ? 'Cerrar sesión' : undefined}
        >
          <LogOut size={16} strokeWidth={1.8} style={{ flexShrink: 0 }} />
          {!colapsado && <span>Cerrar sesión</span>}
        </button>
      </aside>

      {/* === ÁREA PRINCIPAL === */}
      <main className={`${styles.main} ${colapsado ? styles.mainExpandido : ''}`}>

        <div className={styles.mobileTopbar}>
          <img src={Logo} alt="Grifcam" className={styles.mobileTopbarLogo} />
        </div>

        <div className={styles.contenido}>
          {children}
        </div>

        <div className={styles.mobileSpacer} />
      </main>

      {/* === BOTTOM NAV MOBILE === */}
      <nav className={styles.bottomNav}>
        {navItems.map(({ to, end, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `${styles.bottomItem} ${isActive ? styles.bottomItemActive : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`${styles.iconWrap} ${isActive ? styles.iconWrapActive : ''}`}>
                  <Icon
                    size={isActive ? 22 : 19}
                    strokeWidth={1.8}
                    color={isActive ? '#fff' : 'currentColor'}
                  />
                </div>
                <span className={styles.bottomLabel}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
        <button className={styles.bottomItem} onClick={cerrarSesion}>
          <div className={styles.iconWrap}>
            <LogOut size={19} strokeWidth={1.8} />
          </div>
          <span className={styles.bottomLabel}>Salir</span>
        </button>
      </nav>

    </div>
  )
}