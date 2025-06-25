require('dotenv').config();

const express = require('express');
const apiRoutes = require('./routes/api');
const { estados } = require('./service/reporteManager');
const { appendAlertaInactividad } = require('./controllers/reporteSheet');

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use('/api', apiRoutes);

// Página principal
app.get('/', (req, res) => {
  res.send('🟦 AZUL está corriendo');
});

// Inicio del servidor
app.listen(port, () => {
  console.log(`🟦 Servidor AZUL corriendo en http://localhost:${port}`);
});

// ✅ Esperamos 15 segundos antes de empezar el primer chequeo
setTimeout(() => {
  evaluarBots(); // primer chequeo manual
  setInterval(evaluarBots, 119900); // chequeos regulares cada 2 minutos
}, 15000);

// 🧠 Función principal de evaluación
async function evaluarBots() {
  const ahora = Date.now();

  for (const [id, data] of Object.entries(estados)) {
    const tiempoInactivo = ahora - data.recibidoEn;
    const estado = data.estado || {};
    const conectado = estado.conectado

    let mensaje = "OK";

console.log(`\n🔍 Evaluando bot ${id}...`);
console.log(`\n🔍 conectado: ${conectado}`);

    if (!conectado && tiempoInactivo > 60000) {
      mensaje = "ERROR APP CAIDA";
    } else if (!conectado && tiempoInactivo <= 60000) {
      mensaje = "ERROR EN SESION";
    }
  
    const fecha = new Date().toLocaleString('es-AR', {timeZone: 'America/Argentina/Buenos_Aires'});

    console.log(`📤 Registrando estado en hoja de cálculo para ${id}...`);
  
await appendAlertaInactividad({
  id,
  mensaje,
  fecha
});

  }

  console.log(`✅ Evaluación completada.\n`);
}
