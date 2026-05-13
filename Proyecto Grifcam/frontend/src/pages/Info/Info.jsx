import { useState } from 'react'
import {
  Phone, Mail, MapPin, Clock, ExternalLink,
  ChevronDown, ChevronUp, Play
} from 'lucide-react'
import { FaInstagram, FaFacebook } from 'react-icons/fa'
import styles from './Info.module.css'

const NEGOCIO = {
  nombre:          'Distribuidora Grifcam',
  telefono:        '60759718',
  telefonoDisplay: '6075 9718',
  email:           'distribuidoragrifcam@hotmail.com',
  instagram:       'https://www.instagram.com/distribuidoragrifcam',
  facebook:        'https://www.facebook.com/p/Distribuidora-Grifcam-100064027475626/',
  mapsLink:        'https://maps.app.goo.gl/iwWaicgNQLEyE6GQ7',
  mapsEmbed:       'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15689.0!2d-83.035!3d9.991!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa6e3b3b3b3b3b3%3A0x0!2sDistribuidora%20Grifcam!5e0!3m2!1ses!2scr!4v1700000000000',
}

const HORARIO = [
  { dia: 'Lunes',     horas: '8:30 a.m. – 6:00 p.m.', abierto: true  },
  { dia: 'Martes',    horas: '8:30 a.m. – 6:00 p.m.', abierto: true  },
  { dia: 'Miércoles', horas: '8:30 a.m. – 6:00 p.m.', abierto: true  },
  { dia: 'Jueves',    horas: '8:30 a.m. – 6:00 p.m.', abierto: true  },
  { dia: 'Viernes',   horas: '8:30 a.m. – 5:00 p.m.', abierto: true  },
  { dia: 'Sábado',    horas: 'Cerrado',                abierto: false },
  { dia: 'Domingo',   horas: '8:30 a.m. – 12:00 p.m.', abierto: true },
]

const POLITICAS = [
  {
    titulo: 'Política de devoluciones',
    contenido: 'Los productos pueden ser devueltos dentro de los primeros 7 días naturales a partir de la fecha de compra, siempre que se encuentren en su estado original, sin uso y con el empaque intacto. Para iniciar una devolución comuníquese con nosotros por teléfono o WhatsApp.',
  },
  {
    titulo: 'Política de entregas',
    contenido: 'Las entregas se coordinan directamente con el cliente según disponibilidad. El tiempo de entrega puede variar dependiendo de la zona. Consulte disponibilidad y costos de envío comunicándose con nosotros.',
  },
  {
    titulo: 'Política de pagos',
    contenido: 'Aceptamos pagos en efectivo, transferencia bancaria y SINPE Móvil. Para pedidos por WhatsApp se coordinará el método de pago al momento de confirmar el pedido.',
  },
]

const VIDEOS = [
  { id: 'v-1', titulo: 'Video publicitario 1', url: null, thumb: null },
  { id: 'v-2', titulo: 'Video publicitario 2', url: null, thumb: null },
]

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const diaHoy = DIAS_SEMANA[new Date().getDay()]

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

export default function Info() {
  return (
    <main className={styles.page}>

      {/* HEADER */}
      <div className={styles.header}>
        {/* reemplazar foto Negocio */}
        <div className={styles.headerImgPlaceholder} />
        <div className={styles.headerTexto}>
          <h1 className={styles.headerTitulo}>Información</h1>
          <p className={styles.headerDesc}>
            Distribuidora Grifcam es una empresa comprometida con la calidad
            y el servicio al cliente, ubicada en Limón, Costa Rica. Llevamos
            productos seleccionados directamente a tu negocio al mejor precio.
          </p>
        </div>
      </div>

      {/* ── GRID PRINCIPAL ── */}
      <div className={styles.grid}>

        {/* ── CONTACTO ── */}
        <div className={styles.card}>
          <p className={styles.cardTitulo}>Contacto</p>

          <a href={`tel:${NEGOCIO.telefono}`} className={styles.contactoItem}>
            <div className={styles.contactoIcono}>
              <Phone size={16} strokeWidth={1.8} />
            </div>
            <div>
              <p className={styles.contactoLabel}>Teléfono / WhatsApp</p>
              <p className={styles.contactoValor}>{NEGOCIO.telefonoDisplay}</p>
            </div>
          </a>

          <div className={styles.divisor} />

          <a href={`mailto:${NEGOCIO.email}`} className={styles.contactoItem}>
            <div className={styles.contactoIcono}>
              <Mail size={16} strokeWidth={1.8} />
            </div>
            <div>
              <p className={styles.contactoLabel}>Correo electrónico</p>
              <p className={styles.contactoValor}>{NEGOCIO.email}</p>
            </div>
          </a>

          <div className={styles.divisor} />

          <div className={styles.contactoItem}>
            <div className={styles.contactoIcono}>
              <MapPin size={16} strokeWidth={1.8} />
            </div>
            <div>
              <p className={styles.contactoLabel}>Ubicación</p>
              <p className={styles.contactoValor}>Limón, Costa Rica</p>
            </div>
          </div>
        </div>
        
                {/* ── REDES SOCIALES ── */}
        <div className={styles.card}>
          <p className={styles.cardTitulo}>Redes sociales</p>

          <a
            href={NEGOCIO.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.redItem}
          >
            <div className={`${styles.redIcono} ${styles.redIg}`}>
              <FaInstagram size={18} />
            </div>
            <div className={styles.redTexto}>
              <p className={styles.redNombre}>Instagram</p>
              <p className={styles.redHandle}>@distribuidoragrifcam</p>
            </div>
            <ExternalLink size={13} strokeWidth={2} className={styles.redFlecha} />
          </a>

          <div className={styles.divisor} />

          <a
            href={NEGOCIO.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.redItem}
          >
            <div className={`${styles.redIcono} ${styles.redFb}`}>
              <FaFacebook size={18} />
            </div>
            <div className={styles.redTexto}>
              <p className={styles.redNombre}>Facebook</p>
              <p className={styles.redHandle}>Distribuidora Grifcam</p>
            </div>
            <ExternalLink size={13} strokeWidth={2} className={styles.redFlecha} />
          </a>
        </div>

        {/* ── HORARIO ── */}
        <div className={styles.card}>
          <p className={styles.cardTitulo}>
            <Clock size={13} strokeWidth={2} style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: 'middle' }} />
            Horario de atención
          </p>
          {HORARIO.map(({ dia, horas, abierto }) => (
            <div
              key={dia}
              className={`${styles.horarioFila} ${dia === diaHoy ? styles.horarioHoy : ''}`}
            >
              <span className={styles.horarioDia}>
                {dia}
                {dia === diaHoy && <span className={styles.hoyBadge}>Hoy</span>}
              </span>
              <span className={`${styles.horarioHoras} ${!abierto ? styles.horarioCerrado : ''}`}>
                {horas}
              </span>
            </div>
          ))}
        </div>

        {/* ── MAPA ── */}
        <div className={styles.card}>
          <p className={styles.cardTitulo}>Cómo llegarnos</p>
          <div className={styles.mapaWrap}>
            <iframe
              title="Ubicación Distribuidora Grifcam"
              src={`https://maps.google.com/maps?q=Distribuidora+Grifcam+Limon+Costa+Rica&output=embed`}
              className={styles.mapaIframe}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a
            href={NEGOCIO.mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mapaBtn}
          >
            <MapPin size={14} strokeWidth={2} />
            Abrir en Google Maps
            <ExternalLink size={12} strokeWidth={2} />
          </a>
        </div>



        {/* ── VIDEOS — ancho completo ── */}
        <div className={`${styles.card} ${styles.fullCol}`}>
          <p className={styles.cardTitulo}>Videos</p>
          <div className={styles.videosGrid}>
            {VIDEOS.map(video => (
              <div key={video.id} className={styles.videoCard}>
                <div className={styles.videoThumb}>
                  {video.thumb
                    ? <img src={video.thumb} alt={video.titulo} className={styles.videoThumbImg} />
                    : <div className={styles.videoThumbPlaceholder} />
                  }
                  <div className={styles.videoPlayBtn}>
                    <Play size={18} strokeWidth={2} fill="#fff" color="#fff" />
                  </div>
                </div>
                <p className={styles.videoTitulo}>{video.titulo}</p>
              </div>
            ))}
          </div>
          <p className={styles.videosMas}>
            Ver más en nuestro{' '}
            <a href={NEGOCIO.instagram} target="_blank" rel="noopener noreferrer" className={styles.videosLink}>
              Instagram
            </a>
          </p>
        </div>

        {/*  POLÍTICAS */}
        <div className={`${styles.card} ${styles.fullCol}`}>
          <p className={styles.cardTitulo}>Políticas</p>
          {POLITICAS.map(p => (
            <Acordeon key={p.titulo} titulo={p.titulo} contenido={p.contenido} />
          ))}
        </div>

      </div>
    </main>
  )
}