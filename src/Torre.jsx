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
   Vestimenta tomada del logo oficial JFC VERTIKAL SAS: casco
   naranja, camisa blanca de manga oscura, arnés negro, guantes
   verde lima y pantalón caqui.

   Ergonomía: proporciones de 7,5 cabezas (canon humano real),
   articulaciones marcadas en hombro, codo y rodilla, y pose de
   rápel en L — el cuerpo forma ángulo recto con las piernas
   apoyadas en el acero, que es la postura de descenso correcta. */
function Tecnico({ progreso, m }) {
  const g = useRef()
  const brazoFreno = useRef()
  const suave = useRef(0)

  useFrame((state, delta) => {
    const k = 1 - Math.pow(0.0018, delta)
    suave.current += (progreso.current - suave.current) * k
    const p = suave.current
    const y = ALTO_TOTAL * (1 - p) - 1.5

    if (!g.current) return
    g.current.position.set(LINEA_X, y, lineaZ(y) - 0.62)
    g.current.rotation.y = Math.PI

    const t = state.clock.elapsedTime
    /* Balanceo mínimo: descenso controlado, no un péndulo. */
    g.current.rotation.z = Math.sin(t * 0.9) * 0.035
    /* El brazo de freno gobierna la velocidad: se mueve porque
       está trabajando, no por decoración. */
    if (brazoFreno.current) {
      brazoFreno.current.rotation.x = 0.55 + Math.sin(t * 1.4) * 0.16
    }
  })

  /* Brazo: hombro -> codo -> antebrazo -> guante. */
  const Brazo = ({ lado, refHombro, rotHombro, rotCodo }) => (
    <group position={[lado * 0.22, 1.28, 0]} ref={refHombro} rotation={rotHombro}>
      <mesh material={m.manga} position={[0, -0.17, 0]}>
        <capsuleGeometry args={[0.072, 0.26, 4, 8]} />
      </mesh>
      <group position={[0, -0.34, 0]} rotation={rotCodo}>
        <mesh material={m.manga} position={[0, -0.16, 0]}>
          <capsuleGeometry args={[0.062, 0.24, 4, 8]} />
        </mesh>
        <mesh material={m.guante} position={[0, -0.33, 0]}>
          <sphereGeometry args={[0.075, 8, 8]} />
        </mesh>
      </group>
    </group>
  )

  /* Pierna: cadera -> muslo -> rodilla -> pantorrilla -> bota. */
  const Pierna = ({ lado }) => (
    <group position={[lado * 0.13, 0.72, 0]}>
      <group rotation={[-1.32, 0, lado * 0.16]}>
        <mesh material={m.pantalon} position={[0, -0.22, 0]}>
          <capsuleGeometry args={[0.093, 0.34, 4, 8]} />
        </mesh>
        <group position={[0, -0.45, 0]} rotation={[0.62, 0, 0]}>
          <mesh material={m.pantalon} position={[0, -0.2, 0]}>
            <capsuleGeometry args={[0.077, 0.32, 4, 8]} />
          </mesh>
          {/* bota apoyada contra el montante */}
          <mesh material={m.arnes} position={[0, -0.42, -0.06]}
            rotation={[0.3, 0, 0]}>
            <boxGeometry args={[0.14, 0.11, 0.26]} />
          </mesh>
        </group>
      </group>
    </group>
  )

  return (
    <group ref={g} scale={0.98}>
      {/* ---- cabeza ---- */}
      <mesh material={m.piel} position={[0, 1.62, 0.015]}>
        <sphereGeometry args={[0.113, 14, 14]} />
      </mesh>
      {/* casco naranja con ala */}
      <mesh material={m.casco} position={[0, 1.655, 0]}>
        <sphereGeometry args={[0.132, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.56]} />
      </mesh>
      <mesh material={m.casco} position={[0, 1.632, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.126, 0.021, 8, 18]} />
      </mesh>
      {/* barbuquejo: el casco va sujeto, como exige la norma */}
      <mesh material={m.arnes} position={[0, 1.545, 0.015]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.108, 0.012, 6, 16]} />
      </mesh>

      {/* ---- cuello y torso ---- */}
      <mesh material={m.piel} position={[0, 1.5, 0.01]}>
        <capsuleGeometry args={[0.045, 0.05, 4, 8]} />
      </mesh>
      {/* El torso se inclina hacia atrás: el peso cuelga del arnés */}
      <group rotation={[0.34, 0, 0]}>
        <mesh material={m.camisa} position={[0, 1.24, 0.05]}>
          <capsuleGeometry args={[0.176, 0.34, 6, 12]} />
        </mesh>
        {/* cintas del arnés sobre el pecho */}
        <mesh material={m.arnes} position={[0.075, 1.26, -0.13]} rotation={[0, 0, -0.34]}>
          <boxGeometry args={[0.042, 0.4, 0.03]} />
        </mesh>
        <mesh material={m.arnes} position={[-0.075, 1.26, -0.13]} rotation={[0, 0, 0.34]}>
          <boxGeometry args={[0.042, 0.4, 0.03]} />
        </mesh>
        {/* bandera de Colombia en la manga, como en el logo */}
        <mesh material={m.casco} position={[0.178, 1.32, 0.02]}>
          <boxGeometry args={[0.012, 0.05, 0.07]} />
        </mesh>
      </group>

      {/* ---- arnés de cintura + punto de anclaje ---- */}
      <mesh material={m.arnes} position={[0, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.166, 0.038, 8, 18]} />
      </mesh>
      {/* perneras */}
      {[-1, 1].map((s) => (
        <mesh key={s} material={m.arnes} position={[s * 0.12, 0.86, 0]}
          rotation={[Math.PI / 2, 0, s * 0.2]}>
          <torusGeometry args={[0.088, 0.026, 6, 14]} />
        </mesh>
      ))}
      {/* mosquetón y descensor sobre la línea de vida */}
      <mesh material={m.cinta} position={[0, 1.0, -0.2]}>
        <torusGeometry args={[0.055, 0.016, 8, 14]} />
      </mesh>
      <mesh material={m.arnes} position={[0, 1.02, -0.29]}>
        <boxGeometry args={[0.1, 0.13, 0.07]} />
      </mesh>

      {/* ---- extremidades ---- */}
      <Pierna lado={-1} />
      <Pierna lado={1} />
      {/* brazo de freno: sujeta la cuerda por debajo de la cadera */}
      <Brazo lado={1} refHombro={brazoFreno}
        rotHombro={[0.55, 0, -0.3]} rotCodo={[0.5, 0, 0]} />
      {/* brazo guía: hacia la línea, por encima del descensor */}
      <Brazo lado={-1} rotHombro={[-0.62, 0, 0.34]} rotCodo={[-0.5, 0, 0]} />
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
  const mira = useRef(new THREE.Vector3(0, ALTO_TOTAL, lineaZ(ALTO_TOTAL)))
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
    const ang = THREE.MathUtils.lerp(-0.75, 1.05, p)
    /* Cámara CERCA del técnico: él es el sujeto, la torre pasa a
       ser el entorno que se desplaza detrás. La distancia se mide
       desde la línea de vida, no desde el eje de la torre, así el
       encuadre no cambia aunque la estructura se ensanche. */
    /* 9 u: el técnico ocupa buena parte del alto del cuadro y la
       celosía sigue visible detrás como entorno. A 4-5 u la
       cámara se salía de la estructura y quedaba mirando al vacío. */
    const dist = 9 + Math.sin(p * Math.PI) * 1.5
    const alto = THREE.MathUtils.lerp(1.6, 1.0, p)

    /* Orbita en un arco frontal acotado (no da la vuelta entera):
       la línea de vida está en la cara +Z, así que rodearla por
       detrás dejaría al técnico oculto tras la estructura. */
    const zLinea = lineaZ(yTec)
    camera.position.set(
      Math.sin(ang) * dist,
      yTec + alto,
      zLinea + Math.cos(ang) * dist
    )

    /* El técnico se encuadra a la derecha del texto: el objetivo
       se desplaza en X para dejarle la izquierda a la tipografía. */
    /* Desplazado en X para que el técnico caiga a la derecha del
       cuadro y la tipografía tenga libre la mitad izquierda. */
    /* Un objetivo muy desplazado en X empuja al técnico al borde
       derecho del encuadre, que es la zona libre de tipografía. */
    objetivo.current.set(-6.5, yTec + 0.6, zLinea)
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
    /* Uniforme real, tomado de su foto de portada en Google:
       overol naranja de alta visibilidad y casco blanco Petzl.
       Antes seguíamos el logo (casco naranja, camisa blanca), pero
       la foto de su propio equipo manda sobre la ilustración. */
    camisa: new THREE.MeshStandardMaterial({ color: '#E8621A', roughness: 0.82 }),
    manga: new THREE.MeshStandardMaterial({ color: '#C94E10', roughness: 0.84 }),
    pantalon: new THREE.MeshStandardMaterial({ color: '#E8621A', roughness: 0.85 }),
    casco: new THREE.MeshStandardMaterial({ color: '#F2F4F6', roughness: 0.3, metalness: 0.1 }),
    guante: new THREE.MeshStandardMaterial({ color: '#1B1E22', roughness: 0.8 }),
    arnes: new THREE.MeshStandardMaterial({ color: '#1B1E22', roughness: 0.72 }),
    cinta: new THREE.MeshStandardMaterial({ color: '#2E7DD1', roughness: 0.7 }),
    piel: new THREE.MeshStandardMaterial({ color: '#C89268', roughness: 0.9 }),
    baliza: new THREE.MeshStandardMaterial({
      color: '#E5342A', emissive: '#E5342A', emissiveIntensity: 1.6, roughness: 0.5,
    }),
  }), [])

  useLayoutEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats])

  return (
    <>
      <fog attach="fog" args={['#12171C', 22, 165]} />
      <color attach="background" args={['#12171C']} />

      <hemisphereLight args={['#9FB4C8', '#0E1216', 2.2]} />
      <directionalLight position={[30, ALTO_TOTAL * 1.2, 22]} intensity={3} color="#FFF4DC" />
      <directionalLight position={[-24, ALTO_TOTAL * 0.4, -16]} intensity={0.9} color="#7FA0C8" />

      <Celosia material={mats.acero} />
      <Antenas acero={mats.acero} baliza={mats.baliza} />
      <LineaVida material={mats.cable} />
      <Tecnico progreso={progreso} m={mats} />

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
