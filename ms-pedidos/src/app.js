// =====================================================================
// Configuración de la aplicación Express.
// Aquí se registran los middlewares, las rutas y el manejo de errores.
// =====================================================================
const express = require('express');
const registrarPeticion = require('./middlewares/registro');
const pedidosRoutes = require('./routes/pedidos.routes');

const app = express();

// Primero el registro, para que quede la línea de TODAS las peticiones
app.use(registrarPeticion);

// Convierte el cuerpo JSON de la petición en un objeto (req.body)
app.use(express.json());

// Endpoint de salud: permite verificar que el microservicio está vivo
app.get('/health', (req, res) => {
  res.json({ servicio: 'ms-pedidos', estado: 'ok' });
});

// Rutas del recurso. Todas las URIs de este microservicio empiezan por /pedidos
app.use('/pedidos', pedidosRoutes);

// Cualquier otra ruta: 404 Not Found
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Manejo centralizado de errores (los lanzan el servicio y los middlewares)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: err.message, detalles: err.detalles });
});

module.exports = app;
