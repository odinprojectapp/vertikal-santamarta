# VERTIKAL — Demo scrollytelling

Demostración de landing para **Vertikal**, empresa de trabajo seguro en
alturas y espacios confinados en Santa Marta (Magdalena).

> ⚠️ **No es el sitio oficial.** Es una demostración comercial no
> solicitada. El sitio real es `vertikalsas.com`.

---

## El concepto

El scroll hacia abajo **es el descenso por una torre**. Cada sección que
aparece al bajar es una capa de protección. La página no habla del
servicio: lo ejecuta.

### El diferenciador — el altímetro

Fijo en el costado derecho. No es decoración: marca la altura del
descenso (42,0 m → 0,0 m) ligada al progreso del scroll, y **cambia de
estado al cruzar 1,80 m** — la altura desde la que la norma colombiana
exige protección contra caídas.

Su negocio, convertido en interfaz.

## Técnicas aplicadas

| Técnica | Dónde |
|---|---|
| **Scrubbing** | El altímetro y la barra de progreso avanzan exactamente con el scroll |
| **Pinning** | El panel del umbral (1,8 m) queda fijo mientras el contador sube |
| **Cámara scrub 3D** | La cámara desciende por dentro de la torre; el scroll es su playhead |
| **Instancing** | ~700 barras de acero en 2 draw calls |
| **Lenis** | Inercia de scroll cinematográfica, sincronizada al ticker de GSAP |
| **Revelado por línea** | El titular entra línea a línea con máscara de overflow |
| **Stagger** | Tarjetas escalonadas a 90 ms |
| **Marquesina infinita** | Referentes en cinta continua movida por `requestAnimationFrame`, doble copia sin costura |

## Stack

- **React 19** + **Vite 8**
- **GSAP 3 + ScrollTrigger** — todo el scroll
- **Lenis** — scroll suave
- **Three.js + React Three Fiber** — la torre 3D
- Geometría generada por código, sin modelos externos
- **347 KB gzip** · 60 fps medidos

### El descenso en WebGL

Una **torre de telecomunicaciones** (celosía, antenas sectoriales,
platos parabólicos y baliza) con una **línea de vida vertical** — el
producto que Vertikal instala y certifica.

Un **técnico con casco, arnés y equipo** desciende por esa línea a lo
largo del scroll, en pose de rápel real: sentado en el arnés, piernas
flexionadas apoyadas contra la estructura.

**Su vestimenta viene del logo oficial JFC VERTIKAL SAS**: casco
naranja con barbuquejo, camisa blanca de manga oscura, arnés negro de
pecho y cintura, guantes verde lima, pantalón caqui y bandera de
Colombia en la manga. Proporciones de 7,5 cabezas (canon humano) con
articulaciones en hombro, codo y rodilla.

La cámara lo sigue **desde fuera**, girando ~140° alrededor de la torre
durante el recorrido y variando distancia y altura. El movimiento se
lee como una grúa de cine, no como una cámara clavada.

**Rendimiento:** las ~700 barras van en dos `InstancedMesh` (un draw
call cada uno). Medido: **60 fps** estables. Con un `Mesh` por barra
serían cientos de draw calls y caería a ~20 fps.

Coste: **347 KB gzip** frente a los 112 KB de la versión SVG previa.
Es el precio real de WebGL y se asumió a propósito.

### ⚠️ Si no ves la animación

Si tu navegador o sistema tiene activado **"reducir movimiento"**, la
página muestra a propósito una vista fija exterior y avisa en pantalla
con un enlace.

Para ver el descenso sin cambiar la configuración del sistema:

```
?motion=on
```

Ejemplo: `https://odinprojectapp.github.io/vertikal-santamarta/?motion=on`

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173/vertikal-santamarta/
npm run build
```

`vite.config.js` tiene `base: '/vertikal-santamarta/'`. Si el
repositorio cambia de nombre, hay que ajustarlo ahí.

---

## Referentes — todos verificados

Los siete logos salen de la **biblioteca de medios del propio sitio de
Vertikal** (`wp-content/uploads/2018/07/`), localizados vía la API REST
de su WordPress. No se añadió ninguna marca que ellos no publiquen.

| Empresa | Archivo original |
|---|---|
| Cerrejón — Minería responsable | `Imagen1.png` |
| Drummond Ltd. Colombia | `Imagen4.png` |
| Prodeco | `Imagen5.png` |
| Ultracem | `Imagen7.jpg` |
| Komatsu | `Imagen8.png` |
| Conconcreto | `Imagen15.png` |
| Constructora Jiménez | `Imagen9.png` |

Su biblioteca contiene además SGS, CompuRedes, Valor S.A., Conciviles,
McAllister, Soletanche Bachy y Colmena — disponibles si el cliente
quiere ampliarlos.

> Antes de publicar conviene que el cliente **confirme por escrito** que
> puede seguir mostrando estas marcas.

## Datos: qué es real y qué no

**Todo lo mostrado está verificado** en `vertikalsas.com` el 21 de agosto
de 2026. No se inventó ninguna cifra.

| Dato | Estado |
|---|---|
| Fundación: 30 de diciembre de 2009 | ✓ Verificado |
| Departamentos: Magdalena, Cesar, Atlántico, La Guajira | ✓ Verificado |
| Sedes: Santa Marta y La Mina — Cerrejón | ✓ Verificado |
| Teléfono 605 440 6984 · WhatsApp 315 314 7530 | ✓ Verificado |
| Correo info@vertikal.com.co | ✓ Verificado |
| Dirección Carrera 8B # 23-42 | ✓ Verificado |
| Servicios (formación, espacios confinados, ingeniería) | ✓ Verificado |
| **Personas certificadas** | ❌ **Marcado como PENDIENTE en la página** |

La celda "Pendiente" aparece con rayado diagonal a propósito. Es
honestidad, no un descuido: su web dice *"más de diez personas
entrenadas"*, cifra que parece tener un cero de menos y hay que
confirmar con ellos.

## Pendientes antes de producción

| # | Qué falta |
|---|---|
| 1 | **Cifra real de personas certificadas** |
| 2 | **Fotos reales** de sus sedes y operaciones |
| 3 | ~~Portafolio de clientes~~ — **hecho**: 7 logos tomados de su propia biblioteca de medios |
| 4 | Confirmar si ya operan bajo la **Resolución 4272 de 2021** (su web cita la 1409 de 2012, derogada) |
| 5 | Formulario de contacto con backend |
| 6 | Logo oficial en vectorial |

## Accesibilidad

- `prefers-reduced-motion`: se retiran parallax, pinning y Lenis; se
  conservan los fundidos. Apagar todo dejaría contenido invisible.
- La marquesina de referentes **no se detiene** con esa preferencia:
  baja a menos de la mitad de velocidad. Se mueve con
  `requestAnimationFrame`, no con animación CSS, porque Chrome congela
  las animaciones CSS cuando el sistema pide movimiento reducido — y
  al detenerse aparecía una barra de scroll manual, que era peor.
- Contraste AA en todo el texto.
- Foco visible en amarillo sobre fondo oscuro.
- SVG decorativo marcado `aria-hidden`.
- Sin `hover` como único medio de acceso a información.
