import { useState, useEffect } from 'react'
import {
  Phone, Mail, MapPin, Clock, ExternalLink,
  ChevronDown, ChevronUp, Play
} from 'lucide-react'
import { FaInstagram, FaFacebook } from 'react-icons/fa'
import styles from './Info.module.css'
import backendRESTAdapter from '../../adapter/backendRESTAdapter'

// === Fallbacks mientras carga o si la API falla ===
const NEGOCIO_FALLBACK = {
  descripcion_larga: 'Distribuidora Grifcam es una empresa comprometida con la calidad y el servicio al cliente, ubicada en Limón, Costa Rica.',
  telefono:   '60759718',
  whatsapp:   '50660759718',
  email:      'distribuidoragrifcam@hotmail.com',
  ubicacion:  'Limón, Costa Rica',
  maps_link:  'https://maps.app.goo.gl/HPTci8P7EHCA4AzP6',
  maps_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1939.5767473956328!2d-83.03158393479985!3d9.994739003165694!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa7059a277d35c5%3A0x50aede45e8c2ff22!2sGRIFCAM!5e0!3m2!1ses-419!2scr!4v1780469715138!5m2!1ses-419!2scr',
  instagram:  'https://www.instagram.com/distribuidoragrifcam',
  facebook:   'https://www.facebook.com/p/Distribuidora-Grifcam-100064027475626/',
}

const HORARIO_FALLBACK = [
  { id: '1', dia: 'Lunes',     horas: '8:30 a.m. – 6:00 p.m.',  abierto: true  },
  { id: '2', dia: 'Martes',    horas: '8:30 a.m. – 6:00 p.m.',  abierto: true  },
  { id: '3', dia: 'Miércoles', horas: '8:30 a.m. – 6:00 p.m.',  abierto: true  },
  { id: '4', dia: 'Jueves',    horas: '8:30 a.m. – 6:00 p.m.',  abierto: true  },
  { id: '5', dia: 'Viernes',   horas: '8:30 a.m. – 5:00 p.m.',  abierto: true  },
  { id: '6', dia: 'Sábado',    horas: 'Cerrado',                 abierto: false },
  { id: '7', dia: 'Domingo',   horas: '8:30 a.m. – 12:00 p.m.', abierto: true  },
]

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const diaHoy = DIAS_SEMANA[new Date().getDay()]

// Formatea "60759718" a "6075 9718"
function formatearTelefono(tel) {
  if (!tel) return ''
  const limpio = tel.replace(/\D/g, '')
  return limpio.length === 8 ? `${limpio.slice(0,4)} ${limpio.slice(4)}` : limpio
}

function Acordeon({ titulo, contenido }) {
  const [abierto, setAbierto] = useState(false)
  return (
    <div className={styles.acordeon}>
      <button className={styles.acordeonBtn} onClick={() => setAbierto(a => !a)}>
        <span>{titulo}</span>
        {abierto
          ? <ChevronUp  size={15} strokeWidth={2} />
          : <ChevronDown size={15} strokeWidth={2} />
        }
      </button>
      {abierto && <p className={styles.acordeonContenido}>{contenido}</p>}
    </div>
  )
}

// Skeleton genérico de líneas
function SkeletonLineas({ cantidad = 3 }) {
  return (
    <div className={styles.skeletonWrap}>
      {[...Array(cantidad)].map((_, i) => (
        <div key={i} className={styles.skeletonLinea} style={{ width: `${70 + (i % 3) * 10}%` }} />
      ))}
    </div>
  )
}

export default function Info() {
  const [negocio, setNegocio]     = useState(null)
  const [horario, setHorario]     = useState([])
  const [politicas, setPoliticas] = useState([])
  const [videos, setVideos]       = useState([])
  const [cargando, setCargando]   = useState(true)

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

        setNegocio(resBiz.status   === 'fulfilled' ? resBiz.value.data   : NEGOCIO_FALLBACK)
        setHorario(resHor.status   === 'fulfilled' ? resHor.value.data   : HORARIO_FALLBACK)
        setPoliticas(resPol.status === 'fulfilled' ? resPol.value.data   : [])
        setVideos(resVid.status    === 'fulfilled' ? resVid.value.data   : [])
      } catch {
        setNegocio(NEGOCIO_FALLBACK)
        setHorario(HORARIO_FALLBACK)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  // Mientras carga usamos fallback para no mostrar pantalla vacía
  const info = negocio ?? NEGOCIO_FALLBACK
  const dias = horario.length > 0 ? horario : HORARIO_FALLBACK

  return (
    <main className={styles.page}>

      {/* === HEADER === */}
      <div className={styles.header}>
        <div className={styles.headerImgPlaceholder} />
        <div className={styles.headerTexto}>
          <h1 className={styles.headerTitulo}>Información</h1>
          {cargando
            ? <SkeletonLineas cantidad={2} />
            : <p className={styles.headerDesc}>{info.descripcion_larga}</p>
          }
        </div>
      </div>

      {/* === GRID PRINCIPAL === */}
      <div className={styles.grid}>

        {/* === CONTACTO === */}
        <div className={styles.card}>
          <p className={styles.cardTitulo}>Contacto</p>

          {cargando ? <SkeletonLineas cantidad={3} /> : (
            <>
              <a href={`tel:${info.telefono}`} className={styles.contactoItem}>
                <div className={styles.contactoIcono}>
                  <Phone size={16} strokeWidth={1.8} />
                </div>
                <div>
                  <p className={styles.contactoLabel}>Teléfono / WhatsApp</p>
                  <p className={styles.contactoValor}>{formatearTelefono(info.telefono)}</p>
                </div>
              </a>

              <div className={styles.divisor} />

              <a href={`mailto:${info.email}`} className={styles.contactoItem}>
                <div className={styles.contactoIcono}>
                  <Mail size={16} strokeWidth={1.8} />
                </div>
                <div>
                  <p className={styles.contactoLabel}>Correo electrónico</p>
                  <p className={styles.contactoValor}>{info.email}</p>
                </div>
              </a>

              <div className={styles.divisor} />

              <div className={styles.contactoItem}>
                <div className={styles.contactoIcono}>
                  <MapPin size={16} strokeWidth={1.8} />
                </div>
                <div>
                  <p className={styles.contactoLabel}>Ubicación</p>
                  <p className={styles.contactoValor}>{info.ubicacion}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* === REDES SOCIALES === */}
        <div className={styles.card}>
          <p className={styles.cardTitulo}>Redes sociales</p>

          {cargando ? <SkeletonLineas cantidad={2} /> : (
            <>
              {info.instagram && (
                <a href={info.instagram} target="_blank" rel="noopener noreferrer" className={styles.redItem}>
                  <div className={`${styles.redIcono} ${styles.redIg}`}>
                    <FaInstagram size={18} />
                  </div>
                  <div className={styles.redTexto}>
                    <p className={styles.redNombre}>Instagram</p>
                    <p className={styles.redHandle}>@{info.instagram?.split('/').filter(Boolean).pop()}</p>
                  </div>
                  <ExternalLink size={13} strokeWidth={2} className={styles.redFlecha} />
                </a>
              )}

              {info.instagram && info.facebook && <div className={styles.divisor} />}

              {info.facebook && (
                <a href={info.facebook} target="_blank" rel="noopener noreferrer" className={styles.redItem}>
                  <div className={`${styles.redIcono} ${styles.redFb}`}>
                    <FaFacebook size={18} />
                  </div>
                  <div className={styles.redTexto}>
                    <p className={styles.redNombre}>Facebook</p>
                    <p className={styles.redHandle}>Distribuidora Grifcam</p>
                  </div>
                  <ExternalLink size={13} strokeWidth={2} className={styles.redFlecha} />
                </a>
              )}
            </>
          )}
        </div>

        {/* === HORARIO === */}
        <div className={styles.card}>
          <p className={styles.cardTitulo}>
            <Clock size={13} strokeWidth={2} style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: 'middle' }} />
            Horario de atención
          </p>
          {cargando ? <SkeletonLineas cantidad={7} /> : (
            dias.map(({ id, dia, horas, abierto }) => (
              <div
                key={id ?? dia}
                className={`${styles.horarioFila} ${dia === diaHoy ? styles.horarioHoy : ''}`}
              >
                <span className={styles.horarioDia}>
                  {dia}
                  {dia === diaHoy && <span className={styles.hoyBadge}>Hoy</span>}
                </span>
                <span className={`${styles.horarioHoras} ${!abierto ? styles.horarioCerrado : ''}`}>
                  {abierto ? horas : 'Cerrado'}
                </span>
              </div>
            ))
          )}
        </div>

        {/* === MAPA === */}
        <div className={styles.card}>
          <p className={styles.cardTitulo}>Cómo llegarnos</p>
          <div className={styles.mapaWrap}>
            <iframe
              title="Ubicación Distribuidora Grifcam"
              src={info.maps_embed}
              className={styles.mapaIframe}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          {info.maps_link && (
            <a href={info.maps_link} target="_blank" rel="noopener noreferrer" className={styles.mapaBtn}>
              <MapPin size={14} strokeWidth={2} />
              Abrir en Google Maps
              <ExternalLink size={12} strokeWidth={2} />
            </a>
          )}
        </div>

        {/* === VIDEOS - ancho completo === */}
        {videos.length > 0 && (
          <div className={`${styles.card} ${styles.fullCol}`}>
            <p className={styles.cardTitulo}>Videos</p>
            <div className={styles.videosGrid}>
              {videos.map(video => (
                <div key={video.id} className={styles.videoCard}>
                  <div className={styles.videoThumb}>
                    {video.thumb
                      ? <img src={video.thumb} alt={video.titulo} className={styles.videoThumbImg} />
                      : <div className={styles.videoThumbPlaceholder} />
                    }
                    {video.url && (
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.videoPlayBtn}
                        aria-label={`Ver video: ${video.titulo}`}
                      >
                        <Play size={18} strokeWidth={2} fill="#fff" color="#fff" />
                      </a>
                    )}
                    {!video.url && (
                      <div className={styles.videoPlayBtn}>
                        <Play size={18} strokeWidth={2} fill="#fff" color="#fff" />
                      </div>
                    )}
                  </div>
                  <p className={styles.videoTitulo}>{video.titulo}</p>
                </div>
              ))}
            </div>
            {info.instagram && (
              <p className={styles.videosMas}>
                Ver más en nuestro{' '}
                <a href={info.instagram} target="_blank" rel="noopener noreferrer" className={styles.videosLink}>
                  Instagram
                </a>
              </p>
            )}
          </div>
        )}

        {/* === POLÍTICAS === */}
        {(cargando || politicas.length > 0) && (
          <div className={`${styles.card} ${styles.fullCol}`}>
            <p className={styles.cardTitulo}>Políticas</p>
            {cargando
              ? <SkeletonLineas cantidad={4} />
              : politicas.map(p => (
                  <Acordeon key={p.id} titulo={p.titulo} contenido={p.contenido} />
                ))
            }
          </div>
        )}

      </div>
    </main>
  )
}