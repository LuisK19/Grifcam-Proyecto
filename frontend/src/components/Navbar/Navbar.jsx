import { NavLink, Link } from 'react-router-dom'
import { Home, ShoppingBag, ShoppingCart, Info } from 'lucide-react'
import styles from './Navbar.module.css'
import { useCarrito } from '../../context/CarritoContext'
import Logo from '../../assets/logo-blanco.webp'

const navItems = [
  { to: '/',         end: true,  icon: Home,         label: 'Inicio'   },
  { to: '/catalogo', end: false, icon: ShoppingBag,  label: 'Catálogo' },
  { to: '/carrito',  end: false, icon: ShoppingCart, label: 'Carrito'  },
  { to: '/info',     end: false, icon: Info,         label: 'Info'     },
]

export default function Navbar() {
  const { totalItems } = useCarrito()

  return (
    <>
      {/* == MOBILE TOPBAR - solo logo, visible en mobile/tablet == */}
      <header className={styles.mobileTopbar}>
        <Link to="/"><img src={Logo} alt="Grifcam" className={styles.mobileTopbarLogo} /></Link>

      </header>

      {/* == DESKTOP NAVBAR - visible solo en desktop == */}
      <header className={styles.desktopNav}>
        <div className={styles.desktopInner}>
          <div className={styles.logoSlot}>
            <Link to="/"><img src={Logo} alt="Grifcam" className={styles.logoImg} /></Link>
          </div>
          <nav className={styles.desktopLinks}>
            {navItems.map(({ to, end, label }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `${styles.desktopLink} ${isActive ? styles.desktopLinkActive : ''}`
                }
              >
                {label}
                {to === '/carrito' && totalItems > 0 && (
                  <span className={styles.desktopCartBadge}>{totalItems}</span>
                )}
              </NavLink>
            ))}
          </nav>

        </div>
      </header>

      {/* Espaciador desktop - solo activo en desktop */}
      <div className={styles.desktopSpacer} />

      {/* == MOBILE BOTTOM NAV == */}
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
                <div className={`${styles.iconWrap} ${isActive ? styles.iconWrapActive : ''}`} style={{ position: 'relative' }}>
                  <Icon
                    size={isActive ? 26 : 22}
                    strokeWidth={1.8}
                    color={isActive ? '#fff' : 'currentColor'}
                  />
                  {to === '/carrito' && totalItems > 0 && (
                    <span className={styles.mobilCartBadge}>{totalItems}</span>
                  )}
                </div>
                <span className={styles.bottomLabel}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  )
}