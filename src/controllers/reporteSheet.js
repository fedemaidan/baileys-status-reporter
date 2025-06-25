require('dotenv').config();
const {
  addRow,
  getSheetData,
  updateRow,
} = require('../service/google/General');

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Alertas';
const RANGO = `${SHEET_NAME}!A1:Z`;

/**
 * Agrega o actualiza una alerta de inactividad en la hoja "Alertas"
 * @param {Object} data - { id, mensaje, fecha }
 */
async function appendAlertaInactividad({ id, mensaje, fecha }) {
  try {
    console.log(`📥 Iniciando registro de alerta para ${id}`);

    const rows = await getSheetData(SPREADSHEET_ID, RANGO);

    const rowIndex = rows.findIndex((row) => row[0] === id);
    const nuevaFila = [id, mensaje, fecha];

    if (rowIndex !== -1) {
      await updateRow(
        SPREADSHEET_ID,
        [nuevaFila],      // valores a escribir
        RANGO,            // rango base (usado para leer y ubicar la fila)
        0,                // columna donde está el ID
        id                // valor del ID a buscar
      );
    } else {
      await addRow(SPREADSHEET_ID, nuevaFila, RANGO);
      console.log(`➕ Alerta registrada para ${id}`);
    }
  } catch (err) {
    console.error('❌ Error al registrar alerta de inactividad:', err);
  }
}

module.exports = { appendAlertaInactividad };
