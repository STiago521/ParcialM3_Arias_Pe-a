// =====================================================================
// CAPA DE MODELO (entidad)
// Define qué campos tiene un Pedido y qué reglas deben cumplir.
// No sabe nada de HTTP ni de bases de datos.
// No tiene ningún campo _id hacia otra entidad.
// =====================================================================

const ESTADOS = ['pendiente', 'enviado', 'entregado'];

// Fecha AAAA-MM-DD que además exista en el calendario (rechaza 2026-02-30)
function fechaValida(texto) {
  if (typeof texto !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const fecha = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === texto;
}

function textoNoVacio(valor) {
  return typeof valor === 'string' && valor.trim() !== '';
}

// Devuelve una lista de errores de validación (vacía si todo está bien)
function validarPedido(datos) {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    return ['Se esperaba un objeto JSON con los datos del pedido'];
  }
  const errores = [];
  if (!textoNoVacio(datos.numero)) errores.push('numero es obligatorio (texto)');
  if (!textoNoVacio(datos.cliente)) errores.push('cliente es obligatorio (texto)');
  if (!Number.isInteger(datos.cantidad) || datos.cantidad <= 0) {
    errores.push('cantidad es obligatoria y debe ser un entero mayor que 0');
  }
  if (!fechaValida(datos.fecha)) errores.push('fecha es obligatoria con formato AAAA-MM-DD');
  if (!ESTADOS.includes(datos.estado)) {
    errores.push(`estado es obligatorio y debe ser uno de: ${ESTADOS.join(', ')}`);
  }
  return errores;
}

// Construye un pedido "limpio" solo con los campos permitidos
function construirPedido(datos) {
  return {
    numero: datos.numero.trim(),
    cliente: datos.cliente.trim(),
    cantidad: datos.cantidad,
    fecha: datos.fecha,
    estado: datos.estado,
  };
}

module.exports = { validarPedido, construirPedido, ESTADOS };
