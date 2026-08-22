import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Torre from './Torre.jsx'
import { animate, stagger } from 'animejs'

gsap.registerPlugin(ScrollTrigger)

/* ============ DATOS — confirmar con el cliente ============
   Todo lo marcado ✓ está verificado en vertikalsas.com el
   21-08-2026. Lo demás va explícitamente como pendiente. */
const WA = '573153147530'          // ✓ verificado
const TEL = '6054406984'           // ✓ verificado
const MAIL = 'info@vertikal.com.co' // ✓ verificado

/* Redes verificadas el 22-08-2026. Solo se enlazan las reales: su
   web tenía iconos de Twitter y YouTube apuntando a las portadas
   genéricas de esas redes, no a perfiles suyos. */
const REDES = [
  { id: 'ig', n: 'Instagram', u: 'https://www.instagram.com/vertikalsas/', h: '@vertikalsas' },
  { id: 'fb', n: 'Facebook',  u: 'https://www.facebook.com/JFCVERTIKAL/',  h: 'JFC Vertikal SAS' },
]

/* Mensaje predefinido: llega escrito al chat, así el cliente no
   tiene que redactar nada y a Vertikal le entra el contexto. */
const WA_MSG = encodeURIComponent(
  'Hola, los contacto desde su página web. Me interesa información sobre ' +
  'sus servicios de trabajo seguro en alturas.'
)
const WA_LINK = `https://wa.me/${WA}?text=${WA_MSG}`

/* La altura desde la que la norma colombiana exige protección
   contra caídas. Es el umbral que dispara el estado del altímetro. */
const UMBRAL_M = 1.8
const ALTURA_MAX = 42

/* ============ SERVICIOS ============
   Los cuatro que su web lista, con el detalle textual de cada uno.
   Los iconos son SVG de trazo, dibujados para este proyecto: un
   arnés, un pozo, una grúa y una línea de vida. */
const CAPAS = [
  {
    ix: '01',
    t: 'Formación especializada',
    d: 'Certificación aprobada por el Ministerio del Trabajo.',
    items: [
      'Trabajo en alturas',
      'Espacios confinados',
      'Rescate vertical',
      'Andamios multidireccionales',
    ],
    n: 'Sedes: Santa Marta · La Mina — Cerrejón',
    icono: 'arnes',
  },
  {
    ix: '02',
    t: 'Gerencia del riesgo asociado',
    d: 'Acompañamiento técnico antes, durante y después de la tarea.',
    items: [
      'Peer review y gerenciamiento del riesgo',
      'Elaboración de planes y procedimientos de alto riesgo',
      'Diseño y configuración de sistemas de protección contra caídas',
      'Supervisión, consultoría e interventoría',
    ],
    n: 'Trabajo seguro en alturas y espacios confinados',
    icono: 'escudo',
  },
  {
    ix: '03',
    t: 'Labores especializadas',
    d: 'Ejecución directa de tareas en altura con personal certificado.',
    items: [
      'Lavado de silos, fachadas y ventanería',
      'Pinturas y trabajos en exteriores',
      'Montaje y desmontaje de antenas de comunicaciones',
      'Limpieza de cámaras y tanques',
      'Instalación de antenas de cable satelital',
    ],
    n: 'Personal propio, equipos propios',
    icono: 'grua',
  },
  {
    ix: '04',
    t: 'Sistemas de ingeniería',
    d: 'Venta, diseño, inspección, instalación y certificación.',
    items: [
      'Líneas de vida verticales',
      'Líneas de vida horizontales',
      'Puntos de anclaje',
      'Redes anticaídas',
    ],
    n: 'Incluye memorias de cálculo estructural',
    icono: 'linea',
  },
]


/* ============ REFERENTES ============
   Los siete logos salen de la biblioteca de medios del propio
   sitio de Vertikal (wp-content/uploads/2018/07). No se
   añadió ninguna marca que ellos no publiquen. */
const REFERENTES = [
  { n: 'Cerrejón',              f: 'cerrejon.png',    d: 'Minería responsable' },
  { n: 'Drummond Ltd.',         f: 'drummond.png',    d: 'Colombia' },
  { n: 'Prodeco',               f: 'prodeco.png',     d: 'En pro de Colombia' },
  { n: 'Ultracem',              f: 'ultracem.jpg',    d: 'Cemento' },
  { n: 'Komatsu',               f: 'komatsu.png',     d: 'Maquinaria' },
  { n: 'Conconcreto',           f: 'conconcreto.png', d: 'Constructora' },
  { n: 'Constructora Jiménez',  f: 'jimenez.png',     d: 'Constructora' },
]

/* ============ VALORES CORPORATIVOS ============
   Textuales de su página valores-corporativos. Las frases están
   dentro de imágenes en su sitio, así que Google no las indexa:
   aquí van como texto real. */
/* ============ VALIDAR CERTIFICADO ============
   El portal del Ministerio es ASP.NET WebForms con POST y
   __VIEWSTATE: no expone API ni acepta parámetros por URL.
   Verificado el 22-08-2026. Por eso aquí solo se enlaza: pedir
   el documento dos veces no aporta nada. */
const MINTRABAJO = 'https://app2.mintrabajo.gov.co/CentrosEntrenamiento/consulta_ext.aspx'


const VALORES = [
  { ix: '01', t: 'Trabajo en equipo', d: 'Potenciamos el esfuerzo.' },
  { ix: '02', t: 'Equilibrio',        d: 'Establecemos relaciones de ganar-ganar.' },
  { ix: '03', t: 'Transparencia',     d: 'Trabajo honesto y apasionado.' },
  { ix: '04', t: 'Oportunidad',       d: 'La inmediatez en nuestro servicio es el valor del tiempo.' },
  { ix: '05', t: 'Mística',           d: 'Realizamos nuestro trabajo bien desde el principio, con la convicción de hacer lo mejor de manera segura.' },
  { ix: '06', t: 'Respeto',           d: 'Entendemos tus necesidades, las apropiamos como nuestras.' },
]

const CIFRAS = [
  { b: '2009', s: 'Operando desde el 30 de diciembre', ok: true },
  { b: '04', s: 'Departamentos: Magdalena, Cesar, Atlántico, La Guajira', ok: true },
  { b: '02', s: 'Sedes de entrenamiento propias', ok: true },
  { b: 'Pendiente', s: 'Personas certificadas — dato por confirmar', ok: false },
]

/* ---------- Iconos de servicio ----------
   Cada uno es el equipo real del servicio, no una metáfora. Se
   dibujan verticales y estrechos —como el equipo de alturas— en
   vez de encajados en un cuadrado, que es lo que los volvía
   irreconocibles. Dos pesos de trazo dan jerarquía. */
function Icono({ tipo }) {
  const A = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6,
    strokeLinecap: 'round', strokeLinejoin: 'round' }
  const B = { ...A, strokeWidth: 1.1, opacity: 0.5 }

  const svg = {
    /* FORMACIÓN — casco con barbuquejo: es lo que distingue a una
       persona certificada y se reconoce al instante. */
    arnes: <>
      <path d="M8.5 27c0-8.6 7-15.5 15.5-15.5S39.5 18.4 39.5 27" {...A} />
      <path d="M6 27h36" {...A} />
      <path d="M24 11.5V7.5" {...B} />
      <path d="M17.5 27c0-7.4 2.9-13.4 6.5-13.4S30.5 19.6 30.5 27" {...B} />
      <path d="M11.5 30.5c2 5.6 6.9 9.5 12.5 9.5s10.5-3.9 12.5-9.5" {...A} />
      <path d="M18.5 38.4l1.4 3.4M29.5 38.4l-1.4 3.4" {...B} />
      <path d="M19.9 41.8h8.2" {...B} />
    </>,

    /* GERENCIA DEL RIESGO — arnés de cuerpo entero visto de frente:
       tirantes en Y, cinturón y perneras, con el anclaje dorsal
       marcado. Un mosquetón reducido a trazo cerrado se leía como
       un ratón de ordenador; el arnés tiene silueta inconfundible. */
    escudo: <>
      <path d="M17 8.5v6.5M31 8.5v6.5" {...A} />
      <path d="M17 15l7 6 7-6" {...A} />
      <circle cx="24" cy="23.4" r="2.4" {...A} />
      <path d="M12.5 25.5h23" {...A} />
      <path d="M12.5 25.5v3.5M35.5 25.5v3.5" {...B} />
      <path d="M15.5 29l-1.5 12M32.5 29l1.5 12" {...A} />
      <path d="M14 41h5M29 41h5" {...A} />
      <path d="M24 25.9v4.6" {...B} />
      <path d="M19.5 30.5h9" {...B} />
    </>,

    /* LABORES — fachada con plataforma suspendida: rejilla de
       ventanas y la góndola colgada de sus dos cables. Es
       literalmente el lavado de fachadas que ofrecen. */
    grua: <>
      <path d="M6 6.5h36" {...A} />
      <path d="M9.5 12.5h20v26h-20z" {...A} />
      <path d="M9.5 21h20M9.5 29.5h20M19.5 12.5v26" {...B} />
      <path d="M34 6.5v18M41 6.5v18" {...A} />
      <path d="M31.5 24.5h12v7h-12z" {...A} />
      <path d="M31.5 28h12" {...B} />
      <path d="M6 41.5h36" {...A} />
    </>,

    /* SISTEMAS DE INGENIERÍA — cable tensado entre dos anclajes
       estructurales con el carro anticaídas montado. */
    linea: <>
      <path d="M11 8h26M11 40h26" {...A} />
      <path d="M14 8v-3.5M34 8v-3.5M14 43.5V40M34 43.5V40" {...B} />
      <path d="M24 8v32" {...A} />
      <rect x="19.6" y="20" width="8.8" height="8" rx="1.5" {...A} />
      <path d="M28.4 24h5.2" {...A} />
      <circle cx="35.6" cy="24" r="2.1" {...A} />
      <path d="M21.4 22.4h1.8M21.4 25.6h1.8" {...B} />
      <path d="M17 14h14M17 34h14" {...B} />
    </>,
  }[tipo]

  return (
    <svg viewBox="0 0 48 48" width="34" height="34" aria-hidden="true">
      {svg}
    </svg>
  )
}

/* ---------- Iconos de red ---------- */
function IconoRed({ id }) {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"
      fill="currentColor">
      {id === 'ig' ? (
        <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 1.8.25 2.2.42.6.22 1 .48 1.4.9.44.43.7.83.92 1.4.17.42.36 1.05.42 2.24.06 1.28.07 1.66.07 4.88s0 3.6-.07 4.88c-.06 1.2-.25 1.82-.42 2.24-.22.56-.48.97-.92 1.4-.42.42-.83.68-1.4.9-.42.17-1.05.36-2.24.42-1.28.06-1.66.07-4.88.07s-3.6 0-4.88-.07c-1.2-.06-1.82-.25-2.24-.42-.56-.22-.97-.48-1.4-.9-.42-.43-.68-.84-.9-1.4-.17-.42-.36-1.05-.42-2.24C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.88c.06-1.2.25-1.82.42-2.24.22-.57.48-.97.9-1.4.43-.42.84-.68 1.4-.9.42-.17 1.05-.36 2.24-.42C8.4 2.2 8.8 2.2 12 2.2zm0 1.98c-3.16 0-3.5 0-4.74.07-1.14.05-1.76.24-2.17.4-.55.2-.94.47-1.35.88-.4.4-.66.8-.88 1.35-.16.4-.35 1.03-.4 2.17-.06 1.23-.07 1.6-.07 4.74s0 3.5.07 4.74c.05 1.14.24 1.76.4 2.17.22.55.48.94.88 1.35.4.4.8.66 1.35.88.4.16 1.03.35 2.17.4 1.23.06 1.6.07 4.74.07s3.5 0 4.74-.07c1.14-.05 1.76-.24 2.17-.4.55-.22.94-.48 1.35-.88.4-.4.66-.8.88-1.35.16-.4.35-1.03.4-2.17.06-1.23.07-1.6.07-4.74s0-3.5-.07-4.74c-.05-1.14-.24-1.76-.4-2.17a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.4-.16-1.03-.35-2.17-.4-1.23-.06-1.6-.07-4.74-.07zm0 3.37a5.03 5.03 0 1 1 0 10.06 5.03 5.03 0 0 1 0-10.06zm0 1.98a3.05 3.05 0 1 0 0 6.1 3.05 3.05 0 0 0 0-6.1zm6.4-2.2a1.18 1.18 0 1 1-2.35 0 1.18 1.18 0 0 1 2.35 0z" />
      ) : (
        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.9 3.77-3.9 1.1 0 2.24.19 2.24.19v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.9h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94z" />
      )}
    </svg>
  )
}

/* ---------- Servicios: acordeón en columna ----------
   No es una rejilla de tarjetas: en 2x2, al abrir una la vecina se
   estiraba 261px de hueco vacío porque la rejilla iguala alturas de
   fila. En columna el detalle se abre entre filas, sin arrastrar a
   nadie, y cada fila ocupa lo que necesita.

   Solo una abierta a la vez: mantiene la sección compacta y evita
   que el contenido de abajo salte varias veces seguidas. */
function Servicios({ items }) {
  const [activo, setActivo] = useState(null)
  const reduce = useRef(false)

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    /* En táctil no hay cursor: se abre la primera para que el
       contenido no quede escondido tras un gesto inexistente. */
    if (window.matchMedia('(hover: none)').matches) setActivo(0)
  }, [])

  /* El cierre se controla al salir del grupo entero, no de cada
     fila: al recorrer con el ratón, el mouseleave de una llegaba
     después del mouseenter de la siguiente y quedaban dos abiertas. */
  const salir = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setActivo(null)
  }

  return (
    <div className="servicios" onMouseLeave={salir}>
      {items.map((c, i) => (
        <Fila key={c.ix} c={c} i={i}
          abierto={activo === i}
          reduce={reduce}
          abrir={() => setActivo(i)}
          alternar={() => setActivo((v) => (v === i ? null : i))} />
      ))}
    </div>
  )
}

function Fila({ c, abierto, reduce, abrir, alternar }) {
  const panel = useRef(null)
  const lista = useRef(null)

  useEffect(() => {
    const el = panel.current
    if (!el) return
    const alto = lista.current ? lista.current.offsetHeight : 0

    animate(el, {
      height: abierto ? alto : 0,
      opacity: abierto ? 1 : 0,
      duration: reduce.current ? 180 : 420,
      ease: 'out(3)',
    })

    if (abierto && lista.current) {
      animate(lista.current.querySelectorAll('li'), {
        opacity: [0, 1],
        x: reduce.current ? 0 : [-8, 0],
        duration: reduce.current ? 180 : 380,
        delay: stagger(reduce.current ? 0 : 40),
        ease: 'out(3)',
      })
    }
  }, [abierto, reduce])

  return (
    <article className={`serv${abierto ? ' on' : ''}`} onMouseEnter={abrir}>
      <button className="serv-cab" aria-expanded={abierto} onClick={alternar}>
        <span className="serv-ico"><Icono tipo={c.icono} /></span>
        <span className="serv-tex">
          <span className="serv-ix mono">/ {c.ix}</span>
          <h3>{c.t}</h3>
          <span className="serv-res">{c.d}</span>
        </span>
        <span className="serv-mas" aria-hidden="true" />
      </button>

      <div className="serv-panel" ref={panel} aria-hidden={!abierto}>
        <ul ref={lista}>
          {c.items.map((i) => <li key={i}>{i}</li>)}
          <li className="serv-nota">{c.n}</li>
        </ul>
      </div>
    </article>
  )
}

/* ============ Marquesina ============
   El desplazamiento se hace por JS y no con animación CSS: si el
   sistema pide movimiento reducido, el navegador congela las
   animaciones CSS y la cinta se quedaba quieta con una barra de
   scroll asomando. Aquí la velocidad se reduce, pero nunca se
   detiene ni aparece barra. */
function Marquesina({ items }) {
  const pista = useRef(null)
  const x = useRef(0)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const vel = reduce ? 14 : 34   // px por segundo
    let anterior = performance.now()
    let raf

    const paso = (ahora) => {
      const dt = Math.min((ahora - anterior) / 1000, 0.05)
      anterior = ahora
      const el = pista.current
      if (el) {
        /* El ancho de UNA copia: al superarlo se reinicia sin salto,
           porque la segunda copia ya ocupa exactamente ese hueco. */
        const ancho = el.scrollWidth / 2
        x.current = ancho ? (x.current + vel * dt) % ancho : 0
        el.style.transform = `translate3d(${-x.current}px,0,0)`
      }
      raf = requestAnimationFrame(paso)
    }
    raf = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="marquee">
      <div className="marquee-track" ref={pista}>
        {[0, 1].map((copia) => (
          <div className="marquee-set" key={copia} aria-hidden={copia === 1}>
            {items.map((r) => (
              <figure className="ref" key={`${copia}-${r.n}`}
                role={copia === 0 ? 'listitem' : undefined}>
                {r.f
                  ? <img src={`${import.meta.env.BASE_URL}referentes/${r.f}`}
                      alt={r.n} loading="lazy" draggable="false" />
                  : <span className="ref-wordmark">{r.n}</span>}
                <figcaption>
                  <b>{r.n}</b>
                  <span>{r.d}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const raiz = useRef(null)
  const barra = useRef(null)
  /* El progreso vive en una ref, no en estado: se escribe en cada
     tick del scroll y un setState por frame provocaria un render
     de React por frame. La escena 3D lo lee dentro de useFrame. */
  const progreso = useRef(0)
  const [metros, setMetros] = useState(ALTURA_MAX)
  const [reduce3d, setReduce3d] = useState(false)
  const enRiesgo = metros > UMBRAL_M

  useEffect(() => {
    /* ?motion=on fuerza la animación completa aunque el sistema
       pida movimiento reducido. Sirve para enseñar el demo desde
       un equipo con esa preferencia activada. */
    const forzar = new URLSearchParams(location.search).get('motion') === 'on'
    const reduce = !forzar &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setReduce3d(reduce)

    /* Lenis da la inercia cinematográfica. Con movimiento reducido
       no se instancia: el scroll nativo es el comportamiento correcto. */
    let limpiarLenis = null
    if (!reduce) {
      const lenis = new Lenis({ duration: 1.15, smoothWheel: true })
      const tick = (t) => lenis.raf(t * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
      lenis.on('scroll', ScrollTrigger.update)
      limpiarLenis = () => { gsap.ticker.remove(tick); lenis.destroy() }
    }

    const ctx = gsap.context(() => {
      /* --- Barra de progreso --- */
      gsap.to(barra.current, {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.4 },
      })

      /* --- Altímetro: el scroll ES la altura --- */
      ScrollTrigger.create({
        trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: true,
        onUpdate: (self) => {
          /* Una sola fuente de verdad: el mismo progreso mueve la
             camara, el altimetro y la barra. */
          progreso.current = self.progress
          setMetros(+(ALTURA_MAX * (1 - self.progress)).toFixed(1))
        },
      })

      /* --- Entrada del hero: revelado por línea --- */
      gsap.from('.line-mask > span', {
        yPercent: 115, duration: 1.05, stagger: 0.09,
        ease: 'power4.out', delay: 0.15,
      })
      /* fromTo, no from: con from el estado final depende del valor
         computado al construir el tween y puede quedarse en 0. */
      gsap.fromTo('.tower-sub, .scroll-cue',
        { opacity: 0 },
        { opacity: 1, duration: 0.9, delay: 0.75, ease: 'power2.out' })

      if (!reduce) {
        /* --- El panel del riesgo se queda fijo mientras cuenta --- */
        ScrollTrigger.create({
          trigger: '.risk', start: 'top top', end: '+=110%', pin: '.risk-pin', pinSpacing: true,
        })
      }

      /* --- Contador de la cifra de riesgo --- */
      const cifra = { v: 0 }
      gsap.to(cifra, {
        v: 1.8, duration: 1.6, ease: 'power2.out',
        scrollTrigger: { trigger: '.risk', start: 'top 60%' },
        onUpdate: () => {
          const el = document.querySelector('.risk-num')
          if (el) el.textContent = cifra.v.toFixed(1).replace('.', ',')
        },
      })

      /* --- Entrada de secciones. Con movimiento reducido queda
             el fundido, que sigue comunicando la aparición. --- */
      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.from(el, {
          y: reduce ? 0 : 44, opacity: 0,
          duration: reduce ? 0.4 : 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 86%' },
        })
      })

      /* --- Valores: filas escalonadas y línea que se traza ---
             La línea se dibuja con scaleX, no con width: animar el
             ancho dispara recálculo de layout en cada frame. */
      /* Un trigger por fila, no uno global sobre la lista: con el
         pin del panel de riesgo por encima, las marcas calculadas
         sobre un contenedor alto quedaban fuera de rango y las
         filas no llegaban a dispararse nunca. */
      gsap.utils.toArray('.vrow').forEach((fila) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: fila, start: 'top 88%' },
        })
        tl.from(fila.querySelectorAll('.vix, h3, p'), {
          y: reduce ? 0 : 22, opacity: 0,
          duration: reduce ? 0.4 : 0.65,
          stagger: 0.06, ease: 'power3.out',
        })
        tl.to(fila.querySelector('.vline'), {
          scaleX: 1, duration: reduce ? 0.3 : 0.8, ease: 'power2.inOut',
        }, reduce ? 0 : 0.15)
      })

      /* --- Tarjetas escalonadas --- */
      gsap.from('.layer-card', {
        y: reduce ? 0 : 34, opacity: 0,
        duration: reduce ? 0.4 : 0.65, stagger: 0.09, ease: 'power2.out',
        scrollTrigger: { trigger: '.layers-grid', start: 'top 84%' },
      })
    }, raiz)

    return () => {
      ctx.revert()
      if (limpiarLenis) limpiarLenis()
    }
  }, [])

  return (
    <div ref={raiz}>
      <div className="grain" />

      <div className="progress">
        <div className="progress-fill" ref={barra} />
      </div>

      {/* El altímetro: el diferenciador. Marca la altura del
          descenso y cambia de estado al cruzar el umbral legal. */}
      <aside className="altimeter" data-risk={String(enRiesgo)}
        aria-label="Altura del descenso">
        <div className="alt-value">{metros.toFixed(1).replace('.', ',')}</div>
        <div className="alt-unit">METROS</div>
        <div className="alt-rule">
          {enRiesgo ? '▲ Riesgo de caída · Protección obligatoria' : '✓ Bajo el umbral normativo'}
        </div>
      </aside>

      {/* ---------- TORRE ---------- */}
      {/* La torre 3D es el fondo de TODO el descenso, no solo del
          hero: por eso va fija detras del contenido. */}
      <div className="escena">
        <Torre progreso={progreso} reduce={reduce3d} />
      </div>

      <header className="tower">
        <div className="tower-content">
          <img className="logo-hero"
            src={`${import.meta.env.BASE_URL}logo-jfc.png`}
            alt="JFC Vertikal SAS — Trabajo seguro en alturas"
            width="96" height="96" />
          <span className="eyebrow">Vertikal · Santa Marta</span>
          <h1 className="tower-title">
            <span className="line-mask"><span>Cuando</span></span>
            <span className="line-mask"><span>el trabajo</span></span>
            <span className="line-mask"><em>es un reto</em></span>
          </h1>
          <p className="tower-sub">
            Formación, ingeniería y supervisión en trabajo seguro en alturas
            y espacios confinados. Operando desde 2009.
          </p>
        </div>

        <div className="scroll-cue">
          Desciende
          <span />
        </div>
      </header>

      {/* ---------- EL RIESGO ---------- */}
      <section className="risk">
        <div className="risk-pin">
          <div>
            <span className="eyebrow">El umbral</span>
            <div className="risk-num">0,0</div>
            <p className="risk-label">
              Metros. A partir de esta altura, todo trabajo exige
              protección contra caídas.
            </p>
            <p className="risk-note">
              No es una recomendación. Es la norma.
            </p>
          </div>
        </div>
      </section>

      <div className="hazard-strip" />

      {/* ---------- LAS CAPAS ---------- */}
      <section className="chapter wrap">
        <div className="chapter-head reveal">
          <span className="eyebrow">Qué hacemos</span>
          <h2>Tres capas<br />entre el riesgo<br />y su gente</h2>
          <p>
            Cada una responde a un marco normativo distinto. Ninguna
            reemplaza a la otra.
          </p>
        </div>

        <Servicios items={CAPAS} />
      </section>

      {/* ---------- VALORES ---------- */}
      <section className="chapter wrap valores" id="valores">
        <div className="chapter-head reveal">
          <span className="eyebrow">Valores corporativos</span>
          <h2>Seis principios,<br />no un cartel</h2>
          <p>
            En trabajo de alto riesgo los valores no son decoración: son
            el procedimiento que evita que alguien se caiga.
          </p>
        </div>

        <ol className="vlist">
          {VALORES.map((v) => (
            <li className="vrow" key={v.ix}>
              <span className="vix mono">{v.ix}</span>
              <h3>{v.t}</h3>
              <p>{v.d}</p>
              <span className="vline" aria-hidden="true" />
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- VALIDAR CERTIFICADO ---------- */}
      <section className="chapter wrap valida-sec" id="validar">
        <div className="reveal" style={{ maxWidth: '62ch' }}>
          <span className="eyebrow">Validar certificado</span>
          <h2 className="vtitulo">Toda certificación<br />queda registrada</h2>
          <p className="vtexto">
            Las certificaciones de trabajo seguro en alturas se consultan
            directamente en el portal del <strong>Ministerio del
            Trabajo</strong>. Verifíquelas antes de subir a nadie a una
            estructura.
          </p>

          {/* El sello va dentro del botón: identifica el destino y
              evita un segundo enlace al mismo sitio. */}
          <a className="btn-min" href={MINTRABAJO}
            target="_blank" rel="noopener noreferrer">
            <img src={`${import.meta.env.BASE_URL}referentes/mintrabajo.png`}
              alt="" aria-hidden="true" loading="lazy" />
            <span className="btn-min-txt">
              Consultar en el portal oficial
              <b>app2.mintrabajo.gov.co</b>
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </a>

          <p className="valida-nota">
            La verificación la emite el Ministerio del Trabajo, no Vertikal.
            Si el certificado no aparece, llame al{' '}
            <a className="tel-destacado" href={`tel:+57${TEL}`}>605 440 6984</a>.
          </p>
        </div>
      </section>

      {/* ---------- REFERENTES ---------- */}
      <section className="chapter refs" id="referentes">
        <div className="wrap chapter-head reveal">
          <span className="eyebrow">Referentes</span>
          <h2>Con quiénes<br />hemos trabajado</h2>
          <p>
            Minería, cemento, maquinaria pesada y construcción. Sectores
            donde una falla en altura no admite segunda oportunidad.
          </p>
        </div>

        <Marquesina items={REFERENTES} />
      </section>

      {/* ---------- CIFRAS ---------- */}
      <section className="chapter" style={{ paddingInline: 0 }}>
        <div className="wrap chapter-head reveal" style={{ marginBottom: 44 }}>
          <span className="eyebrow">Trayectoria</span>
          <h2>Verificable</h2>
        </div>
        <div className="facts">
          {CIFRAS.map((f) => (
            <div className={`fact${f.ok ? '' : ' pending'}`} key={f.s}>
              <b>{f.b}</b>
              <span>{f.s}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- CONTACTO ---------- */}
      <section className="chapter contact wrap">
        <div className="contact-grid">
          <div className="reveal">
            <span className="eyebrow">Contacto directo</span>
            <h2>Hablemos<br />de su operación</h2>
            <a className="cta" href={WA_LINK}
              target="_blank" rel="noopener noreferrer">
              Escribir por WhatsApp
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>

          <div className="contact-list reveal">
            <a href={`tel:+57${TEL}`}>
              <span className="k">Teléfono</span>605 440 6984
            </a>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer">
              <span className="k">WhatsApp</span>315 314 7530
            </a>
            <a href={`mailto:${MAIL}`}>
              <span className="k">Correo</span>{MAIL}
            </a>
            <div>
              <span className="k">Dirección</span>Carrera 8B # 23-42 · Santa Marta
            </div>
          </div>
        </div>

        <div className="redes">
          <span className="redes-t mono">Síganos</span>
          <div className="redes-lista">
            {REDES.map((r) => (
              <a key={r.id} href={r.u} target="_blank" rel="noopener noreferrer"
                className="red" aria-label={`${r.n}: ${r.h}`}>
                <IconoRed id={r.id} />
                <span className="red-tx">
                  <b>{r.n}</b>
                  <em>{r.h}</em>
                </span>
              </a>
            ))}
          </div>
        </div>

        <footer className="foot">
          <span className="foot-marca">
            <img src={`${import.meta.env.BASE_URL}logo-jfc.png`}
              alt="" aria-hidden="true" width="34" height="34" />
            VERTIKAL · Trabajo seguro en alturas
          </span>
          <span>Demostración — no es el sitio oficial</span>
        </footer>
      </section>

      <div className="demo-tag">Demo · Vertikal</div>

      {/* Si el sistema pide movimiento reducido, la animación se
          desactiva. Se avisa en pantalla porque si no parece que
          el descenso simplemente no funciona. */}
      {reduce3d && (
        <a className="motion-note" href="?motion=on">
          Movimiento reducido activo en tu navegador ·
          <b> Ver el descenso animado →</b>
        </a>
      )}
    </div>
  )
}
