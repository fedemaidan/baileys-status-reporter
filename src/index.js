require('dotenv').config();

const express = require('express');
const apiRoutes = require('./routes/api');
const { estados } = require('./service/reporteManager');
const { appendAlertaInactividad } = require('./controllers/reporteSheet');
const { alertas } = require('./service/alertas');

const app = express();
const port = process.env.PORT || 4000;
const TIEMPO_LIMITE_MS = 120000; // 2 minutos

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

// 🧠 Función principal de evaluación
async function evaluarBots() {
  const ahora = Date.now();

  for (const [id, data] of Object.entries(estados)) {
    const tiempoInactivo = ahora - data.recibidoEn;
    const estado = data.estado || {};
    const fecha = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });

    let mensaje = "OK";

    console.log(`\n🔍 Evaluando bot ${id}...`);
    console.log(`⏱️ Tiempo inactivo: ${Math.floor(tiempoInactivo / 1000)}s`);
    console.log(`📶 Estado de sesión: ${estado.estadoSesion}`);

    if (tiempoInactivo > TIEMPO_LIMITE_MS) {
      mensaje = "ERROR APP CAIDA";
      alertas({ id, problema: "FALLA APP" });
    } else if (estado.estadoSesion !== 'SESION ACTIVA') {
      mensaje = "ERROR EN SESION";
      alertas({ id, problema: "FALLA WP" });
    }

    console.log(`📤 Registrando estado: ${mensaje}`);
    await appendAlertaInactividad({ id, mensaje, fecha });
  }

  console.log(`✅ Evaluación completada.\n`);
}

// ✅ Esperamos 15 segundos antes de empezar el primer chequeo
setTimeout(() => {
  evaluarBots(); // primer chequeo manual
  setInterval(evaluarBots, 119900); // chequeos regulares cada 2 minutos
}, 15000);
