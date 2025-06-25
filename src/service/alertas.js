// 📁 src/service/alertas.js
const { exec } = require('child_process');

const problemas = []; // [{ id, problema, timestamp }]
const cooldowns = new Map(); // Previene múltiples reinicios

function alertas({ id, problema }) {
  const timestamp = Date.now();
  problemas.push({ id, problema, timestamp });

  console.log(`🚨 Alerta registrada: ${id} - ${problema} - ${new Date(timestamp).toLocaleString()}`);

  if (problema === 'FALLA APP') {
    manejarFallaApp(id);
  } else if (problema === 'FALLA WP') {
    manejarFallaWP(id);
  }
}

// ⚙️ Reinicio automático de la app si falla
function manejarFallaApp(id) {
  if (cooldowns.has(id)) {
    console.log(`⏳ Reinicio en espera para ${id}, ya se está manejando.`);
    return;
  }

  console.log(`🔁 Reiniciando el proceso con pm2 restart ${id}`);
  exec(`pm2 restart ${id}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error al reiniciar ${id}:`, error.message);
      return;
    }
    console.log(`✅ Proceso ${id} reiniciado. stdout:`, stdout);
  });

  // ⏲️ Espera 1 minuto antes de verificar si volvió a funcionar
  const espera = setTimeout(() => {
    const recientes = problemas.filter(
      p => p.id === id && p.problema === 'FALLA APP' && (Date.now() - p.timestamp < 60000)
    );

    if (recientes.length > 1) {
      //LLAMAR AL SISTEMA DE NOTIFICACIONES
    } else {
      console.log(`✅ ${id} volvió a reportar, todo ok.`);
    }
    cooldowns.delete(id);
  }, 60000);

  cooldowns.set(id, espera);
}

// 📧 Notificación para errores de sesión
function manejarFallaWP(id) {
  console.warn(`📧 Notificar por mail: ${id} perdió conexión de WhatsApp.`);


  //LOGICA DE NOTIFICACION (CUANDO HAYA UNA ???? BOT ? MAIL ? TELEGRAM ?)
}

module.exports = {
  alertas,
  problemas // Exportado por si lo querés consultar desde un endpoint
};
