import { useRef, useMemo, useLayoutEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/* ============================================================
   TORRE 3D — el descenso
   La cámara baja POR DENTRO de la estructura atravesando sus
   niveles. Eso es lo que produce la sensación de descender:
   los travesaños pasan por encima del observador uno a uno.
   ============================================================ */

const NIVELES = 26          // pisos de la torre
const ALTO_NIVEL = 9        // separación vertical entre travesaños
const ALTO_TOTAL = NIVELES * ALTO_NIVEL

/* La torre se estrecha con la altura, como una torre real.
   Radio en la base vs. en la cima. */
const R_BASE = 26
const R_CIMA = 15
const radioEn = (y) => {
  const t = THREE.MathUtils.clamp(y / ALTO_TOTAL, 0, 1)
  return THREE.MathUtils.lerp(R_BASE, R_CIMA, t)
}

/* Cuatro montantes en las esquinas de una planta cuadrada. */
const ESQUINAS = [
  [1, 1], [1, -1], [-1, -1], [-1, 1],
]

/* ---------- Estructura instanciada ----------
   Todos los perfiles comparten geometría y material: van en un
   solo InstancedMesh, un único draw call. Con un Mesh por barra
   serían ~400 draw calls y caería a 20fps en gama media. */
function Estructura({ material }) {
  const ref = useRef()

  /* Las matrices se calculan UNA vez, nunca por frame. */
  const matrices = useMemo(() => {
    const out = []
    const dummy = new THREE.Object3D()

    const barra = (a, b, grosor) => {
      const dir = new THREE.Vector3().subVectors(b, a)
      const largo = dir.length()
      const medio = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5)
      dummy.position.copy(medio)
      /* El cilindro nace en Y: se rota para alinearlo con el vector. */
      dummy.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0), dir.clone().normalize()
      )
      dummy.scale.set(grosor, largo, grosor)
      dummy.updateMatrix()
      out.push(dummy.matrix.clone())
    }

    for (let n = 0; n < NIVELES; n++) {
      const y0 = n * ALTO_NIVEL
      const y1 = y0 + ALTO_NIVEL
      const r0 = radioEn(y0)
      const r1 = radioEn(y1)

      const p0 = ESQUINAS.map(([sx, sz]) => new THREE.Vector3(sx * r0, y0, sz * r0))
      const p1 = ESQUINAS.map(([sx, sz]) => new THREE.Vector3(sx * r1, y1, sz * r1))

      /* Montantes verticales */
      for (let i = 0; i < 4; i++) barra(p0[i], p1[i], 0.62)

      /* Travesaños horizontales — son los que "pasan" al descender */
      for (let i = 0; i < 4; i++) barra(p0[i], p0[(i + 1) % 4], 0.46)

      /* Diagonales alternadas: la cruz de San Andrés real */
      for (let i = 0; i < 4; i++) {
        const j = (i + 1) % 4
        if ((n + i) % 2 === 0) barra(p0[i], p1[j], 0.3)
        else barra(p1[i], p0[j], 0.3)
      }
    }
    return out
  }, [])

  useLayoutEffect(() => {
    const m = ref.current
    matrices.forEach((mat, i) => m.setMatrixAt(i, mat))
    m.instanceMatrix.needsUpdate = true
  }, [matrices])

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, matrices.length]}
      material={material} frustumCulled={false}>
      <cylinderGeometry args={[1, 1, 1, 6]} />
    </instancedMesh>
  )
}

/* ---------- Rejilla de piso en cada plataforma ---------- */
function Plataformas({ material }) {
  const ref = useRef()
  const matrices = useMemo(() => {
    const out = []
    const d = new THREE.Object3D()
    for (let n = 2; n < NIVELES; n += 3) {
      const y = n * ALTO_NIVEL
      const r = radioEn(y)
      for (let i = -3; i <= 3; i++) {
        d.position.set(0, y, (i / 3) * r * 0.86)
        d.quaternion.identity()
        d.scale.set(r * 1.75, 0.16, 0.16)
        d.updateMatrix()
        out.push(d.matrix.clone())
      }
    }
    return out
  }, [])

  useLayoutEffect(() => {
    matrices.forEach((m, i) => ref.current.setMatrixAt(i, m))
    ref.current.instanceMatrix.needsUpdate = true
  }, [matrices])

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, matrices.length]}
      material={material} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  )
}

/* ---------- Cámara: el descenso ----------
   Lee el progreso del scroll (0→1) desde una ref externa y lo
   aplica dentro de useFrame. No se usa gsap.to sobre la cámara:
   así el movimiento queda dentro del ciclo de render de R3F. */
function CamaraDescenso({ progreso, reduce }) {
  const { camera } = useThree()
  const suave = useRef(0)

  useFrame((_, delta) => {
    const meta = progreso.current
    /* Interpolación amortiguada por delta: independiente de los
       Hz del monitor. Un incremento fijo correría distinto en
       144Hz que en 60Hz. */
    const k = 1 - Math.pow(0.0016, delta)
    suave.current += (meta - suave.current) * k

    const p = suave.current
    const y = ALTO_TOTAL * (1 - p) + 2.5

    if (reduce) {
      /* Con movimiento reducido: vista fija exterior, sin recorrido. */
      camera.position.set(48, ALTO_TOTAL * 0.55, 62)
      camera.lookAt(0, ALTO_TOTAL * 0.45, 0)
      return
    }

    /* La cámara desciende PEGADA a un montante, dentro de la
       estructura. El radio alto (0.82) la deja junto al acero:
       las barras pasan cerca del objetivo y ese roce es lo que
       produce la sensación de descender, no la vista lejana. */
    const giro = p * Math.PI * 1.5
    /* 0.72 del radio: dentro de la estructura pero cerca del
       acero. Los montantes pasan a los lados del encuadre. */
    const rIn = radioEn(y) * 0.72
    camera.position.set(
      Math.sin(giro) * rIn,
      y,
      Math.cos(giro) * rIn
    )
    /* Mira casi en vertical hacia el fondo del hueco: es la
       vista de quien desciende mirando dónde pisa. */
    camera.lookAt(
      Math.sin(giro) * rIn * 0.25,
      y - 26,
      Math.cos(giro) * rIn * 0.25
    )
    /* Ligero alabeo con el giro: da cuerpo al movimiento. */
    camera.rotation.z = Math.sin(p * Math.PI * 2) * 0.055
  })

  return null
}

/* ---------- Luz que desciende con la cámara ----------
   Un punto de luz anclado a la altura actual. Sin esto el
   interior de la torre queda completamente a oscuras. */
function LuzDescenso({ progreso }) {
  const ref = useRef()
  const suave = useRef(0)
  useFrame((_, delta) => {
    const k = 1 - Math.pow(0.0016, delta)
    suave.current += (progreso.current - suave.current) * k
    const y = ALTO_TOTAL * (1 - suave.current) + 2.5
    if (ref.current) ref.current.position.set(0, y + 3, 0)
  })
  return <pointLight ref={ref} intensity={2600} distance={150} decay={1.25} color="#FFE9C4" />
}

/* ---------- Escena ---------- */
function Escena({ progreso, reduce }) {
  /* Materiales creados una sola vez y compartidos por los
     InstancedMesh. Crearlos en el render los recrearía por frame. */
  const acero = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#C6D0DA', roughness: 0.42, metalness: 0.6,
  }), [])
  const rejilla = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#C2C9D0', roughness: 0.6, metalness: 0.5,
  }), [])

  useLayoutEffect(() => () => { acero.dispose(); rejilla.dispose() }, [acero, rejilla])

  return (
    <>
      {/* Niebla: oculta el final de la torre y da sensación de
          profundidad y altura. Sin ella se ve el borde del modelo. */}
      <fog attach="fog" args={['#0A0C0E', 34, 190]} />
      <color attach="background" args={['#0A0C0E']} />

      {/* Iluminación barata primero, como manda el orden de coste. */}
      <hemisphereLight args={['#AEBDCB', '#141A20', 3.4]} />
      <directionalLight position={[14, ALTO_TOTAL * 1.1, 10]} intensity={4.2} color="#FFF6E2" />
      <directionalLight position={[-12, ALTO_TOTAL * 0.4, -8]} intensity={1.5} color="#8FB4E0" />
      {/* Luz de acompañamiento que baja CON la cámara: sin ella
          el interior de la torre queda en sombra total. */}
      <LuzDescenso progreso={progreso} />

      <Estructura material={acero} />
      <Plataformas material={rejilla} />

      <CamaraDescenso progreso={progreso} reduce={reduce} />
    </>
  )
}

export default function Torre({ progreso, reduce }) {
  return (
    <Canvas
      /* dpr acotado: a 3x en un móvil de alta densidad el coste de
         fragmentos se multiplica por 9 sin beneficio visible. */
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 76, near: 0.1, far: 320, position: [0, ALTO_TOTAL, 8] }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Escena progreso={progreso} reduce={reduce} />
    </Canvas>
  )
}
