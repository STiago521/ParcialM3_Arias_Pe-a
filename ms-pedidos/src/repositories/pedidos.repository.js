// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que conoce SQL. Usa consultas con ? (parámetros) para
// evitar inyección SQL.
// =====================================================================
const pool = require('../db');

async function findAll(filtros = {}) {
  let sql = 'SELECT * FROM pedidos';
  const valores = [];
  if (filtros.estado) {
    sql += ' WHERE estado = ?';
    valores.push(filtros.estado);
  }
  sql += ' ORDER BY id';
  const [filas] = await pool.query(sql, valores);
  return filas;
}

async function findById(id) {
  const [filas] = await pool.query('SELECT * FROM pedidos WHERE id = ?', [id]);
  return filas[0] || null;
}

async function findByNumero(numero) {
  const [filas] = await pool.query('SELECT * FROM pedidos WHERE numero = ?', [numero]);
  return filas[0] || null;
}

async function create(p) {
  const [resultado] = await pool.query(
    'INSERT INTO pedidos (numero, cliente, cantidad, fecha, estado) VALUES (?, ?, ?, ?, ?)',
    [p.numero, p.cliente, p.cantidad, p.fecha, p.estado],
  );
  return findById(resultado.insertId);
}

async function update(id, p) {
  await pool.query(
    'UPDATE pedidos SET numero = ?, cliente = ?, cantidad = ?, fecha = ?, estado = ? WHERE id = ?',
    [p.numero, p.cliente, p.cantidad, p.fecha, p.estado, id],
  );
  return findById(id);
}

async function remove(id) {
  const [resultado] = await pool.query('DELETE FROM pedidos WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = { findAll, findById, findByNumero, create, update, remove };
