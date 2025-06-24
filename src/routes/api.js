const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');

// Ruta para recibir reportes desde los VERDES
router.post('/reportar', reporteController.recibirReporte);

// Ruta para consultar el estado actual de todos los bots
router.get('/bots', reporteController.listarBots);

module.exports = router;
