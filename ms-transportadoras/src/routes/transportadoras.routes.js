// CAPA DE PRESENTACIÓN: rutas de transportadoras (solo lectura, cualquier rol autenticado)
const { Router } = require('express');
const controller = require('../controllers/transportadoras.controller');
const { verificarToken } = require('../middlewares/auth');

const router = Router();

router.use(verificarToken);                // todas las rutas exigen token

router.get('/', controller.listar);       // GET /transportadoras  y  GET /transportadoras?ids=1,3
router.get('/:id', controller.obtener);   // GET /transportadoras/:id

module.exports = router;
