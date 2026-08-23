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

  /* El lienzo se dimensiona al viewport.

     En móvil se limita la densidad a 1: rasterizar a 2x en una
     pantalla de 412x915 son 824x1830 píxeles que hay que volver a
     pintar en cada fotograma, y ahí es donde el scroll se traba.
     Como las imágenes de origen son de 1280x720, subir de 1x no
     añade detalle real: solo cuesta.

     El resize se ignora si solo cambió la altura, porque en móvil
     eso pasa cada vez que el navegador oculta o muestra su barra
     de direcciones — no es un cambio real de tamaño. */
  useEffect(() => {
    let anchoPrevio = 0
    let temporizador

    const medir = () => {
      const c = lienzo.current
      if (!c) return
      const movil = window.innerWidth < 900
      const d = movil ? 1 : Math.min(window.devicePixelRatio || 1, 2)
      c.width = Math.round(window.innerWidth * d)
      c.height = Math.round(window.innerHeight * d)
      anchoPrevio = window.innerWidth
      actual.current = -1
    }

    const alRedimensionar = () => {
      /* solo importa el cambio de ancho: la altura oscila sola */
      if (window.innerWidth === anchoPrevio) return
      clearTimeout(temporizador)
      temporizador = setTimeout(medir, 150)
    }

    medir()
    window.addEventListener('resize', alRedimensionar)
    window.addEventListener('orientationchange', medir)
    return () => {
      clearTimeout(temporizador)
      window.removeEventListener('resize', alRedimensionar)
      window.removeEventListener('orientationchange', medir)
    }
  }, [])

  return (
    <canvas ref={lienzo} className="descenso"
      style={{ opacity: listo ? 1 : 0 }} aria-hidden="true" />
  )
}
