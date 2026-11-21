// =====================================================================
// CAPA DE LÓGICA DE NEGOCIO (servicio)
// Aplica las reglas: validaciones, número único (409), existencia (404).
// No sabe nada de HTTP (solo lanza HttpError) ni de SQL (usa el repositorio).
// =====================================================================
const repository = require('../repositories/pedidos.repository');
const { validarPedido, construirPedido, ESTADOS } = require('../models/pedido');
const HttpError = require('../utils/http-error');

async function listar(filtros) {
  if (filtros.estado !== undefined && !ESTADOS.includes(filtros.estado)) {
    throw new HttpError(400, `estado debe ser uno de: ${ESTADOS.join(', ')}`);
  }
  return repository.findAll(filtros);
}

async function obtener(id) {
  const pedido = await repository.findById(id);
  if (!pedido) throw new HttpError(404, `No existe el pedido con id ${id}`);
  return pedido;
}

async function crear(datos) {
  const errores = validarPedido(datos);
  if (errores.length) throw new HttpError(400, 'Datos inválidos', errores);
  const pedido = construirPedido(datos);
  if (await repository.findByNumero(pedido.numero)) {
    throw new HttpError(409, `Ya existe un pedido con el número ${pedido.numero}`);
  }
  return repository.create(pedido);
}

async function actualizar(id, datos) {
  await obtener(id);                                   // 404 si no existe
  const errores = validarPedido(datos);
  if (errores.length) throw new HttpError(400, 'Datos inválidos', errores);
  const pedido = construirPedido(datos);
  const otro = await repository.findByNumero(pedido.numero);
  if (otro && otro.id !== id) {                        // el número es de OTRO pedido
    throw new HttpError(409, `Ya existe un pedido con el número ${pedido.numero}`);
  }
  return repository.update(id, pedido);
}

async function eliminar(id) {
  const borrado = await repository.remove(id);
  if (!borrado) throw new HttpError(404, `No existe el pedido con id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
