import { useEffect, useRef, useState } from 'react'
import { animate, stagger } from 'animejs'
import { scrambleText, splitText } from 'animejs/text'

/* ============================================================
   PRUEBA — efectos de texto de Anime.js v4
   Tres variantes sobre copy real de Vertikal para decidir cuál
   encaja con la estética industrial antes de aplicarla.
   ============================================================ */

/* --- A. Descifrado tipo terminal --- */
function Scramble({ texto, chars, from, corriendo, lento }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current || !corriendo) return
    /* scrambleText devuelve un function value que se asigna a la
       propiedad textContent. Ponerlo en `text` lo escribía como
       atributo HTML y el texto nunca cambiaba. */
    const a = animate(ref.current, {
      textContent: scrambleText({ chars, from, ease: 'outQuad',
        duration: lento ? 7200 : 1800 }),
    })
    return () => a.revert?.()
  }, [chars, from, corriendo, lento])

  return <span ref={ref}>{texto}</span>
}

/* --- B. Revelado por letra con máscara --- */
function PorLetra({ texto, corriendo }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current || !corriendo) return
    const split = splitText(ref.current, { chars: true })
    const a = animate(split.chars, {
      y: ['110%', '0%'],
      opacity: [0, 1],
      duration: 720,
      delay: stagger(26),
      ease: 'outExpo',
    })
    return () => { a.revert?.(); split.revert?.() }
  }, [corriendo])

  return <span ref={ref} className="mask-chars">{texto}</span>
}

/* --- C. Revelado por palabra --- */
function PorPalabra({ texto, corriendo }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current || !corriendo) return
    const split = splitText(ref.current, { words: true })
    const a = animate(split.words, {
      y: ['100%', '0%'],
      opacity: [0, 1],
      duration: 850,
      delay: stagger(70),
      ease: 'outExpo',
    })
    return () => { a.revert?.(); split.revert?.() }
  }, [corriendo])

  return <span ref={ref} className="mask-chars">{texto}</span>
}

export default function PruebaTexto() {
  const [n, setN] = useState(0)     // relanza los efectos
  const [lento, setLento] = useState(false)
  const corriendo = true

  return (
    <div className="prueba">
      <header className="prueba-top">
        <span className="eyebrow">Prueba · Anime.js 4.5.0 · MIT</span>
        <h1 className="display">Efectos de texto</h1>
        <p>
          Tres variantes sobre texto real de Vertikal. Pulsa para repetir.
        </p>
        <div className="botones">
          <button className="cta" onClick={() => setN((v) => v + 1)}>
            Repetir animación
          </button>
          <button className="cta ghost"
            onClick={() => { setLento((v) => !v); setN((v) => v + 1) }}>
            {lento ? 'Velocidad normal' : 'Cámara lenta ×4'}
          </button>
        </div>
      </header>

      <section className="caso" key={`a-${n}`}>
        <span className="tag">A · Descifrado — alfanumérico</span>
        <h2 className="display grande">
          <Scramble texto="TRABAJO SEGURO EN ALTURAS"
            chars="A-Z0-9" from="left" corriendo={corriendo} lento={lento} />
        </h2>
        <p className="nota">
          El más cercano a la estética de telemetría. Las letras se
          resuelven de izquierda a derecha.
        </p>
      </section>

      <section className="caso" key={`b-${n}`}>
        <span className="tag">B · Descifrado — bloques</span>
        <h2 className="display grande amber">
          <Scramble texto="CUANDO EL TRABAJO ES UN RETO"
            chars="blocks" from="center" corriendo={corriendo} lento={lento} />
        </h2>
        <p className="nota">
          Con caracteres de bloque y resolución desde el centro. Más
          agresivo, casi de consola de mando.
        </p>
      </section>

      <section className="caso" key={`c-${n}`}>
        <span className="tag">C · Revelado por letra</span>
        <h2 className="display grande">
          <PorLetra texto="RESOLUCIÓN 4272" corriendo={corriendo} />
        </h2>
        <p className="nota">
          Sin descifrado: cada letra sube tras una máscara. Más sobrio,
          sirve para cifras y datos normativos.
        </p>
      </section>

      <section className="caso" key={`d-${n}`}>
        <span className="tag">D · Revelado por palabra</span>
        <h2 className="display mediano">
          <PorPalabra
            texto="Formación, ingeniería y supervisión en trabajo seguro en alturas"
            corriendo={corriendo} />
        </h2>
        <p className="nota">
          Para párrafos y frases largas, donde animar letra por letra
          resultaría ruidoso.
        </p>
      </section>

      <section className="caso">
        <span className="tag">E · Dato en vivo</span>
        <h2 className="display grande amber" key={`e-${n}`}>
          <Scramble texto="1,80 M" chars="numbers" from="right"
            corriendo={corriendo} lento={lento} />
        </h2>
        <p className="nota">
          Solo dígitos: el número parece calcularse. Encaja con el
          altímetro y las cifras de la landing.
        </p>
      </section>
    </div>
  )
}
