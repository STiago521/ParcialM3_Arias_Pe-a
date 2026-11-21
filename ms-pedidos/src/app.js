// =====================================================================
// Configuración de la aplicación Express.
// Por ahora solo el endpoint de salud; las rutas de /pedidos, la
// seguridad y el registro de peticiones se agregan en la siguiente parte.
// =====================================================================
const express = require('express');

const app = express();

app.use(express.json());

// Endpoint de salud: permite verificar que el microservicio está vivo
app.get('/health', (req, res) => {
  res.json({ servicio: 'ms-pedidos', estado: 'ok' });
});

// Cualquier otra ruta: 404 Not Found
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

module.exports = app;
