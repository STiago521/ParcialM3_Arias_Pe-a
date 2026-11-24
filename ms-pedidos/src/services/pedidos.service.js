// CAPA DE LÓGICA DE NEGOCIO (servicio)
// Reglas propias como validaciones, número único (409) y existencia (404)
// Relación con ms-transportadoras ficha 9
const repository = require('../repositories/pedidos.repository');
const { validarPedido, construirPedido, ESTADOS } = require('../models/pedido');
const HttpError = require('../utils/http-error');
const cliente = require('../clients/transportadoras.client');


async function buscar(id) {
  const pedido = await repository.findById(id);
  if (!pedido) throw new HttpError(404, `No existe el pedido con id ${id}`);
  return pedido;
}

async function componer(pedidos, token) {
  const ids = [...new Set(pedidos.map((p) => p.transportadora_id))];
  const mapa = await cliente.buscarPorIds(ids, token);
  if (!mapa) {
    return pedidos.map((p) => ({ ...p, transportadora: null, aviso: cliente.NO_DISPONIBLE }));
  }
  return pedidos.map((p) => {
    const t = mapa.get(p.transportadora_id);
    return { ...p, transportadora: t ? cliente.aResumen(t) : null };
  });
}

// Regla de negocio de la ficha 9 que la cantidad del pedido no puede superar max_unidades de la transportadora. Se aplica al crear y al actualizar
function verificarCupo(pedido, transportadora) {
  if (pedido.cantidad > transportadora.max_unidades) {
    throw new HttpError(400, `La cantidad ${pedido.cantidad} supera el máximo de ${transportadora.max_unidades} unidades de la transportadora ${transportadora.nombre_empresa}`,
    );
  }
}

async function listar(filtros, token) {
  if (filtros.estado !== undefined && !ESTADOS.includes(filtros.estado)) {
    throw new HttpError(400, `estado debe ser uno de: ${ESTADOS.join(', ')}`);
  }
  const pedidos = await repository.findAll(filtros);
  return componer(pedidos, token);
}

async function obtener(id, token) {
  const [pedido] = await componer([await buscar(id)], token);
  return pedido;
}

async function crear(datos, token) {
  const errores = validarPedido(datos);
  if (errores.length) throw new HttpError(400, 'Datos inválidos', errores);
  const pedido = construirPedido(datos);

  //La relación se valida antes que el número repetido, 400 si no existe, 503 si esta caído
  const transportadora = await cliente.validar(pedido.transportadora_id, token);
  verificarCupo(pedido, transportadora);

  if (await repository.findByNumero(pedido.numero)) {
    throw new HttpError(409, `Ya existe un pedido con el número ${pedido.numero}`);
  }
  const creado = await repository.create(pedido);
  return { ...creado, transportadora: cliente.aResumen(transportadora) };
}

async function actualizar(id, datos, token) {
  await buscar(id); //404 si no existe
  const errores = validarPedido(datos);
  if (errores.length) throw new HttpError(400, 'Datos inválidos', errores);
  const pedido = construirPedido(datos);

  const transportadora = await cliente.validar(pedido.transportadora_id, token);
  verificarCupo(pedido, transportadora);

  const otro = await repository.findByNumero(pedido.numero);
  if (otro && otro.id !== id) { //el número es de otro pedido
    throw new HttpError(409, `Ya existe un pedido con el número ${pedido.numero}`);
  }
  const actualizado = await repository.update(id, pedido);
  return { ...actualizado, transportadora: cliente.aResumen(transportadora) };
}

async function eliminar(id) {
  const borrado = await repository.remove(id);
  if (!borrado) throw new HttpError(404, `No existe el pedido con id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
