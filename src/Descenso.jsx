import { useEffect, useRef, useState } from 'react'

/* ============================================================
   DESCENSO — secuencia de fotogramas
   96 imágenes renderizadas en Blender con la torre real y el
   operario. El scroll es el cabezal de reproducción: no hay
   cálculo 3D en el navegador, solo mostrar la imagen que toca.
   ============================================================ */

const TOTAL = 96
const RUTA = (i) =>
  `${import.meta.env.BASE_URL}descenso/f${String(i).padStart(3, '0')}.webp`

export default function Descenso({ progreso }) {
  const lienzo = useRef(null)
  const imgs = useRef([])
  const actual = useRef(-1)
  const [listo, setListo] = useState(false)

  /* Precarga por lotes: cargar 96 imágenes de golpe satura la
     conexión y bloquea el primer pintado. */
  useEffect(() => {
    let vivo = true
    const arr = new Array(TOTAL)
    let cargadas = 0

    const cargar = (i) => {
      if (i >= TOTAL || !vivo) return
      const im = new Image()
      im.decoding = 'async'
      im.onload = im.onerror = () => {
        cargadas++
        if (cargadas === 1) setListo(true)   // pinta en cuanto llega la primera
        cargar(i + 6)                        // 6 hilos en paralelo
      }
      im.src = RUTA(i)
      arr[i] = im
    }
    for (let k = 0; k < 6; k++) cargar(k)
    imgs.current = arr
    return () => { vivo = false }
  }, [])

  /* Dibuja el fotograma que corresponde al progreso del scroll. */
  useEffect(() => {
    let raf
    const pinta = () => {
      const c = lienzo.current
      if (c) {
        const i = Math.min(TOTAL - 1,
          Math.max(0, Math.round(progreso.current * (TOTAL - 1))))
        if (i !== actual.current) {
          const im = imgs.current[i]
          if (im && im.complete && im.naturalWidth) {
            const ctx = c.getContext('2d', { alpha: false })
            /* cover: llena el lienzo sin deformar */
            const ec = c.width / c.height
            const ei = im.naturalWidth / im.naturalHeight
            let w = c.width, h = c.height, x = 0, y = 0
            if (ei > ec) { w = c.height * ei; x = (c.width - w) / 2 }
            else { h = c.width / ei; y = (c.height - h) / 2 }
            ctx.drawImage(im, x, y, w, h)
            actual.current = i
          }
        }
      }
      raf = requestAnimationFrame(pinta)
    }
    raf = requestAnimationFrame(pinta)
    return () => cancelAnimationFrame(raf)
  }, [progreso])

  /* El lienzo se dimensiona al viewport, con tope de 2x para no
     rasterizar de más en pantallas de alta densidad. */
  useEffect(() => {
    const medir = () => {
      const c = lienzo.current
      if (!c) return
      const d = Math.min(window.devicePixelRatio || 1, 2)
      c.width = Math.round(window.innerWidth * d)
      c.height = Math.round(window.innerHeight * d)
      actual.current = -1
    }
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [])

  return (
    <canvas ref={lienzo} className="descenso"
      style={{ opacity: listo ? 1 : 0 }} aria-hidden="true" />
  )
}
