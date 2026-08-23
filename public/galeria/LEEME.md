# Fotos de la galería — cómo activarlas

El código **ya está listo**. En cuanto haya un archivo con el nombre
correcto en esta carpeta, la foto aparece sola y tapa el marcador.
Si no existe, se ve el marcador. No hay que tocar nada de código.

## Los 6 archivos que faltan

| Archivo a crear | Qué foto es | Dónde sale |
|---|---|---|
| `torre-antenas.webp` | Técnico con casco Petzl en torre roja *(su foto de portada)* | 42 m |
| `formacion.webp` | Instructor con casco amarillo y gafas | 34 m |
| `rescate-vertical.webp` | Rescate con trípode y camilla | 26 m |
| `espacios-confinados.webp` | Práctica con humo y equipos de respiración | 18 m |
| `labores-altura.webp` | Trabajo sobre cubierta metálica | 10 m |
| `sede.webp` | Fachada del local amarillo con el logo | 0 m |

También sirven en `.jpg` si cambias la extensión en `NIVELES`
(`src/App.jsx`), pero WebP pesa la mitad.

## Cómo bajarlas (1 minuto)

1. Busca en Google: **"JFC VERTIKAL" Santa Marta**
2. En la ficha de la derecha, pulsa **Ver fotos**
3. Abre la foto que quieras y **clic derecho → Guardar imagen como**
4. Guárdala en esta carpeta con el nombre de la tabla

> Yo no pude descargarlas automáticamente: las URLs de Google llevan
> un token de sesión que solo funciona dentro de la pestaña, y el
> navegador del entorno bloquea las descargas a disco. Guardándolas
> tú desde el navegador funciona sin problema.

## Recomendación de peso

Si alguna pesa más de 300 KB, redúcela a **900 px de ancho**. Con
seis fotos conviene no pasar de ~600 KB en total, porque se suman a
los 2,65 MB de la secuencia del descenso.

## Nota sobre permisos

Estas fotos son de Vertikal y están publicadas en su ficha de Google.
Para el demo interno no hay problema, pero **antes de publicar la web
en producción conviene pedirle autorización expresa al cliente**.
