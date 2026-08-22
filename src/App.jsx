import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

/* ============ DATOS — confirmar con el cliente ============
   Todo lo marcado ✓ está verificado en vertikalsas.com el
   21-08-2026. Lo demás va explícitamente como pendiente. */
const WA = '573153147530'          // ✓ verificado
const TEL = '6054406984'           // ✓ verificado
const MAIL = 'info@vertikal.com.co' // ✓ verificado

/* La altura desde la que la norma colombiana exige protección
   contra caídas. Es el umbral que dispara el estado del altímetro. */
const UMBRAL_M = 1.8
const ALTURA_MAX = 42

const CAPAS = [
  {
    ix: '01',
    t: 'Formación certificada',
    d: 'Niveles básico, avanzado y coordinador de trabajos en alturas. Base de entrenamiento con entornos que simulan el área real de trabajo.',
    n: 'Sedes: Santa Marta · La Mina — Cerrejón',
  },
  {
    ix: '02',
    t: 'Espacios confinados',
    d: 'Permiso de acceso requerido y persona competente. Soporte, equipos de acceso, acompañamiento y actividades de rescate.',
    n: 'Marco: OSHA 1910.146',
  },
  {
    ix: '03',
    t: 'Sistemas de ingeniería',
    d: 'Líneas de vida verticales y horizontales, puntos de anclaje y redes anticaídas. Venta, diseño, inspección, instalación y certificación.',
    n: 'Incluye memorias de cálculo estructural',
  },
]

const CIFRAS = [
  { b: '2009', s: 'Operando desde el 30 de diciembre', ok: true },
  { b: '04', s: 'Departamentos: Magdalena, Cesar, Atlántico, La Guajira', ok: true },
  { b: '02', s: 'Sedes de entrenamiento propias', ok: true },
  { b: 'Pendiente', s: 'Personas certificadas — dato por confirmar', ok: false },
]

/* ============ Torre en SVG ============
   Tres capas a distinta profundidad. Se dibujan una vez y solo
   se les anima el transform: nunca se regeneran por frame. */
function Estructura({ profundidad }) {
  const o = { 1: 0.22, 2: 0.45, 3: 1 }[profundidad]
  const trazo = { 1: 1.2, 2: 1.6, 3: 2.2 }[profundidad]
  const color = profundidad === 3 ? '#2E353C' : '#1C2126'

  return (
    <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMax slice"
      style={{ opacity: o }} aria-hidden="true">
      <g stroke={color} strokeWidth={trazo} fill="none" strokeLinecap="square">
        {/* Montantes: anchos abajo (700), estrechos arriba (40).
            La perspectiva de una torre vista desde su base. */}
        <path d="M300 700 L470 40" />
        <path d="M900 700 L730 40" />
        {/* Travesaños: el ancho se interpola con la misma razón
            que los montantes, si no la estructura no cierra. */}
        {Array.from({ length: 11 }, (_, i) => {
          const t = i / 10
          const y = 700 - t * 660
          const x1 = 300 + t * 170
          const x2 = 900 - t * 170
          return <path key={`h${i}`} d={`M${x1} ${y} L${x2} ${y}`} />
        })}
        {/* Diagonales alternadas — cruz de San Andrés */}
        {Array.from({ length: 10 }, (_, i) => {
          const t1 = i / 10, t2 = (i + 1) / 10
          const y1 = 700 - t1 * 660, y2 = 700 - t2 * 660
          const a1 = 300 + t1 * 170, b1 = 900 - t1 * 170
          const a2 = 300 + t2 * 170, b2 = 900 - t2 * 170
          return i % 2 === 0
            ? <path key={`d${i}`} d={`M${a1} ${y1} L${b2} ${y2}`} />
            : <path key={`d${i}`} d={`M${b1} ${y1} L${a2} ${y2}`} />
        })}
      </g>
    </svg>
  )
}

export default function App() {
  const raiz = useRef(null)
  const barra = useRef(null)
  const [metros, setMetros] = useState(ALTURA_MAX)
  const enRiesgo = metros > UMBRAL_M

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
        /* --- Parallax: cada capa a su velocidad. Eso es la profundidad. --- */
        const vel = { 1: -8, 2: -20, 3: -42 }
        gsap.utils.toArray('.layer').forEach((el) => {
          gsap.to(el, {
            yPercent: vel[el.dataset.z], ease: 'none',
            scrollTrigger: { trigger: '.tower', start: 'top top', end: 'bottom top', scrub: 1 },
          })
        })

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
      <header className="tower">
        <div className="tower-sky" />
        <div className="layer" data-z="1"><Estructura profundidad={1} /></div>
        <div className="layer" data-z="2"><Estructura profundidad={2} /></div>
        <div className="layer" data-z="3"><Estructura profundidad={3} /></div>

        <div className="tower-content">
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

        <div className="layers-grid">
          {CAPAS.map((c) => (
            <article className="layer-card" key={c.ix}>
              <span className="ix">/ {c.ix}</span>
              <h3>{c.t}</h3>
              <p>{c.d}</p>
              <div className="norm">{c.n}</div>
            </article>
          ))}
        </div>
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
            <a className="cta" href={`https://wa.me/${WA}`}
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
            <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer">
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

        <footer className="foot">
          <span>VERTIKAL · Trabajo seguro en alturas</span>
          <span>Demostración — no es el sitio oficial</span>
        </footer>
      </section>

      <div className="demo-tag">Demo · Vertikal</div>
    </div>
  )
}
