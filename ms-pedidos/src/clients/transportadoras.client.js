const HttpError = require('../utils/http-error');
const TRANSPORTADORAS_URL = process.env.TRANSPORTADORAS_URL;

const NO_DISPONIBLE = 'ms-transportadoras no está disponible';

// Hace una petición GET a ms-transportadoras reenviando el token del usuario
// Devuelve la respuesta de fetch, o null si ms-transportadoras no respondió
async function pedir(ruta, token) {
  try {
    return await fetch(`${TRANSPORTADORAS_URL}${ruta}`, {
      headers: { Authorization: token }, //el token de la petición original
      signal: AbortSignal.timeout(3000),
    });
  } catch (error) {
    return null;
  }
}

//Solo los atributos que la ficha pide mostrar dentro del pedido
const aResumen = (t) => ({ id: t.id, nombre_empresa: t.nombre_empresa, nit: t.nit });

async function validar(id, token) {
  const respuesta = await pedir(`/transportadoras/${id}`, token);
  if (!respuesta) throw new HttpError(503, NO_DISPONIBLE);
  if (respuesta.status === 404) {
    throw new HttpError(400, `No existe la transportadora con id ${id}`);
  }
  if (!respuesta.ok) throw new HttpError(503, NO_DISPONIBLE);
  return respuesta.json();
}

async function buscarPorIds(ids, token) {
  if (!ids.length) return new Map();
  const respuesta = await pedir(`/transportadoras?ids=${ids.join(',')}`, token);
  if (!respuesta || !respuesta.ok) return null;
  const lista = await respuesta.json();
  return new Map(lista.map((t) => [t.id, t]));
}

module.exports = { pedir, validar, buscarPorIds, aResumen, NO_DISPONIBLE };