const reporteManager = require('../service/reporteManager');

const recibirReporte = (req, res) => {
  const { id, estado } = req.body;

  console.log("📥 Reporte recibido:", { id });

  if (!id || !estado) {
    return res.status(400).json({ error: 'Faltan campos: id o estado' });
  }

  reporteManager.guardarEstado(id, estado);
  res.json({ success: true });
};

const listarBots = (req, res) => {
  const bots = reporteManager.obtenerEstados();
  res.json(bots);
};

module.exports = {
  recibirReporte,
  listarBots
};
