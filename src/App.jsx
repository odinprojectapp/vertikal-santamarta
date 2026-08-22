import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Torre from './Torre.jsx'

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
   __VIEWSTATE: NO acepta parámetros por URL, así que no se puede
   preconsultar desde aquí. Lo que sí se puede es preparar los
   datos, validarlos y dejar al usuario listo para pegarlos.
   Verificado el 22-08-2026 en app2.mintrabajo.gov.co */
const MINTRABAJO = 'https://app2.mintrabajo.gov.co/CentrosEntrenamiento/consulta_ext.aspx'

const TIPOS_DOC = [
  { v: 'CC', t: 'Cédula de ciudadanía' },
  { v: 'CE', t: 'Cédula de extranjería' },
  { v: 'PA', t: 'Pasaporte' },
  { v: 'PE', t: 'Permiso especial de permanencia' },
  { v: 'PP', t: 'Permiso por protección temporal' },
  { v: 'RC', t: 'Registro civil' },
  { v: 'TI', t: 'Tarjeta de identidad' },
]

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

/* ============ Validar certificado ============
   No consulta: prepara. El portal del Ministerio no admite
   parámetros por URL, así que este módulo valida el documento,
   lo copia al portapapeles y abre el portal — el usuario solo
   tiene que pegar. Es la diferencia entre "aquí tiene un enlace"
   y "ya le dejé el dato listo". */
function ValidarCertificado() {
  const [tipo, setTipo] = useState('CC')
  const [doc, setDoc] = useState('')
  const [error, setError] = useState('')
  const [copiado, setCopiado] = useState(false)

  /* Solo dígitos para los documentos numéricos; pasaporte y
     permisos admiten letras. */
  const soloNumero = ['CC', 'TI', 'RC'].includes(tipo)

  const limpiar = (v) =>
    soloNumero ? v.replace(/\D/g, '') : v.replace(/[^A-Za-z0-9]/g, '').toUpperCase()

  const validar = () => {
    const v = doc.trim()
    if (!v) return 'Escribe el número de documento.'
    if (soloNumero && v.length < 5) return 'El número parece incompleto.'
    if (v.length > 20) return 'El número es demasiado largo.'
    return ''
  }

  const abrir = async () => {
    const err = validar()
    setError(err)
    if (err) return

    /* Se copia primero y se abre después: si el portapapeles
       falla, el usuario igual llega al portal. */
    try {
      await navigator.clipboard.writeText(doc.trim())
      setCopiado(true)
      setTimeout(() => setCopiado(false), 4000)
    } catch {
      /* Sin permiso de portapapeles no se interrumpe el flujo. */
    }
    window.open(MINTRABAJO, '_blank', 'noopener,noreferrer')
  }

  const etiqueta = TIPOS_DOC.find((t) => t.v === tipo)?.t || ''

  return (
    <div className="valida">
      <div className="valida-form">
        <label className="campo">
          <span className="clabel">Tipo de documento</span>
          <select value={tipo} onChange={(e) => { setTipo(e.target.value); setDoc(''); setError('') }}>
            {TIPOS_DOC.map((t) => <option key={t.v} value={t.v}>{t.t}</option>)}
          </select>
        </label>

        <label className="campo">
          <span className="clabel">Número de documento</span>
          <input
            type="text"
            inputMode={soloNumero ? 'numeric' : 'text'}
            value={doc}
            onChange={(e) => { setDoc(limpiar(e.target.value)); setError('') }}
            onKeyDown={(e) => { if (e.key === 'Enter') abrir() }}
            placeholder={soloNumero ? '1 090 000 000' : 'AB123456'}
            aria-invalid={!!error}
            aria-describedby={error ? 'err-doc' : undefined}
            maxLength={20}
          />
        </label>

        <button className="cta" onClick={abrir}>
          Consultar en MinTrabajo
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </button>
      </div>

      {error && (
        <p className="valida-err mono" id="err-doc" role="alert">▲ {error}</p>
      )}
      {copiado && !error && (
        <p className="valida-ok mono" role="status">
          ✓ Documento copiado. Pégalo en el campo del Ministerio.
        </p>
      )}

      <ol className="pasos">
        <li>
          <b>01</b>
          Escribe el documento aquí. Lo copiamos por ti.
        </li>
        <li>
          <b>02</b>
          Se abre el portal del <strong>Ministerio del Trabajo</strong> en
          otra pestaña.
        </li>
        <li>
          <b>03</b>
          Selecciona «{etiqueta}», pega el número y consulta.
        </li>
      </ol>

      <p className="valida-nota mono">
        La verificación la emite el Ministerio del Trabajo, no Vertikal.
        Si no aparece el certificado, llama al 605 440 6984.
      </p>
    </div>
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
        <div className="chapter-head reveal">
          <span className="eyebrow">Validar certificado</span>
          <h2>Compruebe una<br />certificación en 30&nbsp;segundos</h2>
          <p>
            Toda certificación de trabajo en alturas queda registrada ante
            el Ministerio del Trabajo. Verifíquela antes de subir a nadie
            a una estructura.
          </p>
        </div>

        <ValidarCertificado />
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
