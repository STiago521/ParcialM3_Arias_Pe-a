// =====================================================================
// REGISTRO DE PETICIONES
// Escribe en la terminal una línea por cada petición recibida, cuando ya
// se envió la respuesta: método, ruta y código de estado.
// Ejemplo: [2026-11-21T22:40:01.123Z] GET /pedidos?estado=pendiente → 200 (4 ms)
// En servidor2 estas líneas se ven con: journalctl -u ms-pedidos -f
// =====================================================================
function registrarPeticion(req, res, next) {
  const inicio = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - inicio;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${ms} ms)`);
  });
  next();
}

module.exports = registrarPeticion;
