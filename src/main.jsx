import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import PruebaTexto from './PruebaTexto.jsx'

/* ?prueba=texto abre el banco de pruebas de efectos, sin tocar
   la landing. Se retira una vez elegido el efecto. */
const prueba = new URLSearchParams(location.search).get('prueba')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {prueba === 'texto' ? <PruebaTexto /> : <App />}
  </StrictMode>,
)
