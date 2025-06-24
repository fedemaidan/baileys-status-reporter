const estados = {}; // { idBot: { estado, recibidoEn } }
const { appendAlertaInactividad } = require('../controllers/reporteSheet'); // Ajustá la ruta si cambia

const TIEMPO_INACTIVIDAD_MS = parseInt(process.env.TIEMPO_INACTIVIDAD_MS) || 120000; // default: 2 minutos

/**
 * Guarda o actualiza el estado de un bot.
 * ✅ Corrige estructura para mantener `estado` como objeto anidado
 */
function guardarEstado(id, estado) {
  estados[id] = {
    estado: { ...estado },   // ✅ Se guarda correctamente como propiedad `estado`
    recibidoEn: Date.now()
  };
}

/**
 * Devuelve el estado de todos los bots, marcando si están activos o inactivos.
 * Si algún bot está inactivo, lo registra en Google Sheets.
 */
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

    // Solo registra si está inactivo
    if (!estaActivo) {
      const mensaje = `Bot inactivo hace más de ${Math.floor(tiempoInactivo / 1000)} segundos.`;
      const fecha = new Date().toISOString();
      await appendAlertaInactividad({ id, mensaje, fecha });
    }
  }

  return resultado;
}

module.exports = {
  guardarEstado,
  obtenerEstados,
  estados // para acceder directamente si se necesita
};
