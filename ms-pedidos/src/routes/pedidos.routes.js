// =====================================================================
// CAPA DE RUTAS
// Asocia cada método + URI con la función del controlador.
// Seguridad: todas las rutas exigen token; GET para cualquier rol;
// POST, PUT y DELETE solo para el rol administrador.
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/pedidos.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

router.use(verificarToken);                       // 401 si no hay token válido

router.get('/', controller.listar);               // GET /pedidos  (?estado=)
router.get('/:id', controller.obtener);           // GET /pedidos/:id
router.post('/', requiereRol('administrador'), controller.crear);
router.put('/:id', requiereRol('administrador'), controller.actualizar);
router.delete('/:id', requiereRol('administrador'), controller.eliminar);

module.exports = router;
