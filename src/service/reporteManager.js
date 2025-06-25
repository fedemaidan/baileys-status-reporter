const estados = {};
const { appendAlertaInactividad } = require('../controllers/reporteSheet');
const { alertas } = require('../service/alertas');

const TIEMPO_INACTIVIDAD_MS = parseInt(process.env.TIEMPO_INACTIVIDAD_MS) || 120000;

function guardarEstado(id, estado) {
  estados[id] = {
    estado: { ...estado },
    recibidoEn: Date.now()
  };
}

async function obtenerEstados() {
  const ahora = Date.now();
  const resultado = {};

  for (const [id, data] of Object.entries(estados)) {
    const tiempoInactivo = ahora - data.recibidoEn;
    const estaActivo = tiempoInactivo <= TIEMPO_INACTIVIDAD_MS;

    resultado[id] = {
      ...data,
      activo: estaActivo,
      segundosDesdeUltimoReporte: Math.floor(tiempoInactivo / 1000)
    };

    if (!estaActivo) {
      const mensaje = `Bot inactivo hace más de ${Math.floor(tiempoInactivo / 1000)} segundos.`;
      const fecha = new Date().toISOString();

      await appendAlertaInactividad({ id, mensaje, fecha }); //GOOGLE SHEETS

    }
  }

  return resultado;
}

module.exports = {
  guardarEstado,
  obtenerEstados,
  estados
};