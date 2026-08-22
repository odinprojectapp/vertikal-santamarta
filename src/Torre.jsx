import { useRef, useMemo, useLayoutEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/* ============================================================
   TORRE DE TELECOMUNICACIONES — el descenso
   Un técnico desciende por la línea de vida. La cámara lo sigue
   DESDE FUERA y cambia de ángulo durante el recorrido.
   El protagonista es la persona, no la estructura.
   ============================================================ */

const NIVELES = 22
const ALTO_NIVEL = 5.2
const ALTO_TOTAL = NIVELES * ALTO_NIVEL

const R_BASE = 9
const R_CIMA = 2.6
const radioEn = (y) => {
  const t = THREE.MathUtils.clamp(y / ALTO_TOTAL, 0, 1)
  return THREE.MathUtils.lerp(R_BASE, R_CIMA, t)
}

const ESQUINAS = [[1, 1], [1, -1], [-1, -1], [-1, 1]]

/* La línea de vida corre pegada a la cara frontal (+Z). */
const LINEA_X = 0
const lineaZ = (y) => radioEn(y) + 0.55

/* ---------- Celosía instanciada ----------
   Todas las barras comparten geometría y material: un solo
   InstancedMesh, un único draw call. */
function Celosia({ material }) {
  const ref = useRef()

  const matrices = useMemo(() => {
    const out = []
    const d = new THREE.Object3D()
    const eje = new THREE.Vector3(0, 1, 0)

    const barra = (a, b, g) => {
      const dir = new THREE.Vector3().subVectors(b, a)
      d.position.copy(a).add(b).multiplyScalar(0.5)
      d.quaternion.setFromUnitVectors(eje, dir.clone().normalize())
      d.scale.set(g, dir.length(), g)
      d.updateMatrix()
      out.push(d.matrix.clone())
    }

    for (let n = 0; n < NIVELES; n++) {
      const y0 = n * ALTO_NIVEL
      const y1 = y0 + ALTO_NIVEL
      const r0 = radioEn(y0), r1 = radioEn(y1)
      const p0 = ESQUINAS.map(([x, z]) => new THREE.Vector3(x * r0, y0, z * r0))
      const p1 = ESQUINAS.map(([x, z]) => new THREE.Vector3(x * r1, y1, z * r1))

      for (let i = 0; i < 4; i++) barra(p0[i], p1[i], 0.26)
      for (let i = 0; i < 4; i++) barra(p0[i], p0[(i + 1) % 4], 0.17)
      for (let i = 0; i < 4; i++) {
        const j = (i + 1) % 4
        if ((n + i) % 2 === 0) barra(p0[i], p1[j], 0.12)
        else barra(p1[i], p0[j], 0.12)
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
      <cylinderGeometry args={[1, 1, 1, 6]} />
    </instancedMesh>
  )
}

/* ---------- Antenas ----------
   Hacen reconocible la torre como de telecomunicaciones. */
function Antenas({ acero, baliza }) {
  return (
    <group position={[0, ALTO_TOTAL, 0]}>
      <mesh material={acero} position={[0, 5, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 10, 8]} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <group key={i} rotation={[0, (i / 3) * Math.PI * 2, 0]}>
          <mesh material={acero} position={[R_CIMA + 1.1, -1.6, 0]}
            rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[1.5, 1.5, 0.22, 14]} />
          </mesh>
          <mesh material={acero} position={[R_CIMA + 0.5, -1.6, 0]}
            rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.1, 0.1, 1.3, 6]} />
          </mesh>
          <mesh material={acero} position={[R_CIMA + 0.4, 2.4, 0]}>
            <boxGeometry args={[0.3, 2.6, 0.75]} />
          </mesh>
        </group>
      ))}
      <mesh material={baliza} position={[0, 10.4, 0]}>
        <sphereGeometry args={[0.42, 12, 12]} />
      </mesh>
    </group>
  )
}

/* ---------- Línea de vida vertical ----------
   Es el producto que Vertikal instala y certifica: debe verse. */
function LineaVida({ material }) {
  const geo = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 24; i++) {
      const y = (i / 24) * ALTO_TOTAL
      pts.push(new THREE.Vector3(LINEA_X, y, lineaZ(y)))
    }
    return new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(pts), 48, 0.09, 6, false
    )
  }, [])
  useLayoutEffect(() => () => geo.dispose(), [geo])
  return <mesh geometry={geo} material={material} />
}

/* ---------- EL TÉCNICO ----------
   Pose de rápel real: sentado en el arnés, piernas flexionadas
   apoyadas contra la estructura. No es una figura colgando recta. */
function Tecnico({ progreso, cuerpo, casco, arnes, piel }) {
  const g = useRef()
  const brazo = useRef()
  const suave = useRef(0)

  useFrame((state, delta) => {
    const k = 1 - Math.pow(0.0018, delta)
    suave.current += (progreso.current - suave.current) * k
    const p = suave.current
    const y = ALTO_TOTAL * (1 - p) - 1.5

    if (!g.current) return
    g.current.position.set(LINEA_X, y, lineaZ(y) - 0.75)
    g.current.rotation.y = Math.PI

    /* Balanceo sutil: es un descenso controlado, no un péndulo. */
    const t = state.clock.elapsedTime
    g.current.rotation.z = Math.sin(t * 1.1) * 0.045
    if (brazo.current) brazo.current.rotation.x = -0.5 + Math.sin(t * 1.6) * 0.12
  })

  return (
    <group ref={g}>
      <mesh material={casco} position={[0, 1.62, 0]}>
        <sphereGeometry args={[0.3, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
      </mesh>
      <mesh material={piel} position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.245, 12, 12]} />
      </mesh>
      <mesh material={cuerpo} position={[0, 1.02, 0.06]} rotation={[0.28, 0, 0]}>
        <capsuleGeometry args={[0.27, 0.68, 4, 10]} />
      </mesh>
      <mesh material={arnes} position={[0, 1.12, 0.03]} rotation={[0.28, 0, 0]}>
        <torusGeometry args={[0.3, 0.055, 8, 16]} />
      </mesh>
      <mesh material={arnes} position={[0, 0.62, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.31, 0.07, 8, 16]} />
      </mesh>
      <mesh material={arnes} position={[0, 0.62, -0.34]}>
        <boxGeometry args={[0.17, 0.17, 0.12]} />
      </mesh>

      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.18, 0.55, 0]}>
          <mesh material={cuerpo} position={[0, -0.3, -0.26]} rotation={[-0.95, 0, 0]}>
            <capsuleGeometry args={[0.115, 0.5, 4, 8]} />
          </mesh>
          <mesh material={cuerpo} position={[0, -0.5, -0.82]} rotation={[-0.15, 0, 0]}>
            <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
          </mesh>
          <mesh material={arnes} position={[0, -0.72, -1.05]}>
            <boxGeometry args={[0.19, 0.14, 0.3]} />
          </mesh>
        </group>
      ))}

      <group ref={brazo} position={[0.3, 1.16, 0]}>
        <mesh material={cuerpo} position={[0, -0.26, -0.1]} rotation={[-0.5, 0, 0]}>
          <capsuleGeometry args={[0.095, 0.44, 4, 8]} />
        </mesh>
      </group>
      <mesh material={cuerpo} position={[-0.3, 0.92, -0.16]} rotation={[-0.75, 0, 0]}>
        <capsuleGeometry args={[0.095, 0.46, 4, 8]} />
      </mesh>
    </group>
  )
}

/* ---------- Cámara: sigue al técnico DESDE FUERA ----------
   El ángulo orbital y la distancia cambian durante el descenso,
   así el recorrido se lee como un movimiento de grúa y no como
   una cámara clavada. */
function Camara({ progreso, reduce }) {
  const { camera } = useThree()
  const suave = useRef(0)
  const mira = useRef(new THREE.Vector3(0, ALTO_TOTAL, 0))
  const objetivo = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    const k = 1 - Math.pow(0.0022, delta)
    suave.current += (progreso.current - suave.current) * k
    const p = suave.current
    const yTec = ALTO_TOTAL * (1 - p) - 1.5

    if (reduce) {
      camera.position.set(26, ALTO_TOTAL * 0.62, 34)
      camera.lookAt(0, ALTO_TOTAL * 0.5, 0)
      return
    }

    /* El ángulo gira ~140° durante el descenso. La distancia se
       acorta solo un poco: acercarse demasiado metía las barras
       en primer plano y tapaba al técnico. */
    const ang = THREE.MathUtils.lerp(0.5, 2.9, p)
    /* 22 u: lo bastante cerca para leer al técnico como persona,
       lo bastante lejos para que la celosía no llene el cuadro. */
    const dist = 22 - Math.sin(p * Math.PI) * 4
    const alto = THREE.MathUtils.lerp(4, 2, p)

    camera.position.set(Math.sin(ang) * dist, yTec + alto, Math.cos(ang) * dist)

    /* El técnico se encuadra a la derecha del texto: el objetivo
       se desplaza en X para dejarle la izquierda a la tipografía. */
    /* El objetivo se desplaza a la IZQUIERDA del eje, lo que
       empuja al técnico hacia la DERECHA del encuadre y deja la
       izquierda libre para la tipografía. */
    objetivo.current.set(6.5, yTec + 1.2, 0)
    mira.current.lerp(objetivo.current, 0.12)
    camera.lookAt(mira.current)
  })

  return null
}

/* ---------- Escena ---------- */
function Escena({ progreso, reduce }) {
  const mats = useMemo(() => ({
    acero: new THREE.MeshStandardMaterial({ color: '#9FAAB6', roughness: 0.5, metalness: 0.75 }),
    cable: new THREE.MeshStandardMaterial({ color: '#D8DEE4', roughness: 0.35, metalness: 0.85 }),
    cuerpo: new THREE.MeshStandardMaterial({ color: '#1F5FA8', roughness: 0.82 }),
    casco: new THREE.MeshStandardMaterial({ color: '#F2C300', roughness: 0.42, metalness: 0.15 }),
    arnes: new THREE.MeshStandardMaterial({ color: '#23262A', roughness: 0.75 }),
    piel: new THREE.MeshStandardMaterial({ color: '#B8895E', roughness: 0.9 }),
    baliza: new THREE.MeshStandardMaterial({
      color: '#E5342A', emissive: '#E5342A', emissiveIntensity: 1.6, roughness: 0.5,
    }),
  }), [])

  useLayoutEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats])

  return (
    <>
      <fog attach="fog" args={['#12171C', 40, 220]} />
      <color attach="background" args={['#12171C']} />

      <hemisphereLight args={['#9FB4C8', '#0E1216', 2.2]} />
      <directionalLight position={[30, ALTO_TOTAL * 1.2, 22]} intensity={3} color="#FFF4DC" />
      <directionalLight position={[-24, ALTO_TOTAL * 0.4, -16]} intensity={0.9} color="#7FA0C8" />

      <Celosia material={mats.acero} />
      <Antenas acero={mats.acero} baliza={mats.baliza} />
      <LineaVida material={mats.cable} />
      <Tecnico progreso={progreso} cuerpo={mats.cuerpo}
        casco={mats.casco} arnes={mats.arnes} piel={mats.piel} />

      <Camara progreso={progreso} reduce={reduce} />
    </>
  )
}

export default function Torre({ progreso, reduce }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 46, near: 0.5, far: 480, position: [20, ALTO_TOTAL, 28] }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Escena progreso={progreso} reduce={reduce} />
    </Canvas>
  )
}
