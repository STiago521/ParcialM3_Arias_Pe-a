// CAPA DE PRESENTACIÓN (controlador)

const service = require('../services/pedidos.service');
const HttpError = require('../utils/http-error');

function leerId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'El id debe ser un entero positivo');
  return id;
}

// La cabecera completa, "Bearer <token>", tal como llegó
const leerToken = (req) => req.headers.authorization;

// GET /pedidos, GET /pedidos?estado=pendiente
async function listar(req, res) {
  const pedidos = await service.listar({ estado: req.query.estado }, leerToken(req));
  res.status(200).json(pedidos);
}

// GET /pedidos/:id
async function obtener(req, res) {
  res.status(200).json(await service.obtener(leerId(req), leerToken(req)));
}

// POST /pedidos
async function crear(req, res) {
  const nuevo = await service.crear(req.body, leerToken(req));
  res.status(201).location(`${req.baseUrl}/${nuevo.id}`).json(nuevo);
}

// PUT /pedidos/:id
async function actualizar(req, res) {
  res.status(200).json(await service.actualizar(leerId(req), req.body, leerToken(req)));
}

// DELETE /pedidos/:id
async function eliminar(req, res) {
  await service.eliminar(leerId(req));
  res.status(204).end();                  // 204 No Content: éxito, sin cuerpo
}

module.exports = { listar, obtener, crear, actualizar, eliminar };