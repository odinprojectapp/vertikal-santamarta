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
| **Parallax por capas** | Tres capas SVG de la torre a velocidades distintas (−8%, −20%, −42%) |
| **Lenis** | Inercia de scroll cinematográfica, sincronizada al ticker de GSAP |
| **Revelado por línea** | El titular entra línea a línea con máscara de overflow |
| **Stagger** | Tarjetas escalonadas a 90 ms |

## Stack

- **React 19** + **Vite 8**
- **GSAP 3 + ScrollTrigger** — todo el scroll
- **Lenis** — scroll suave
- SVG dibujado por código, sin imágenes externas
- **112 KB gzip** · sin dependencias de iconos

### Por qué SVG y no Three.js

Se evaluó WebGL. Se descartó a propósito: el público objetivo entra
desde celulares de gama media en Santa Marta. SVG + GSAP da el mismo
impacto narrativo a 112 KB con 60 fps garantizados, frente a ~600 KB y
riesgo real de caída de frames.

Si el cliente lo pide, la versión 3D es viable sobre esta misma base.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173/vertikal-santamarta/
npm run build
```

`vite.config.js` tiene `base: '/vertikal-santamarta/'`. Si el
repositorio cambia de nombre, hay que ajustarlo ahí.

---

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
| 3 | **Portafolio de clientes** — su sección "Referentes" está vacía |
| 4 | Confirmar si ya operan bajo la **Resolución 4272 de 2021** (su web cita la 1409 de 2012, derogada) |
| 5 | Formulario de contacto con backend |
| 6 | Logo oficial en vectorial |

## Accesibilidad

- `prefers-reduced-motion`: se retiran parallax, pinning y Lenis; se
  conservan los fundidos. Apagar todo dejaría contenido invisible.
- Contraste AA en todo el texto.
- Foco visible en amarillo sobre fondo oscuro.
- SVG decorativo marcado `aria-hidden`.
- Sin `hover` como único medio de acceso a información.
