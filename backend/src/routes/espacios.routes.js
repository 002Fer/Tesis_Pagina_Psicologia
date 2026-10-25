const { Router } = require('express');
const espaciosController = require('../controllers/espacios.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = Router();

router.use(authenticate);

// Disponibilidad de espacios (abierta a usuarios autenticados)
router.get('/disponibles', espaciosController.getDisponibles);

// Listar y ver detalles
router.get('/', espaciosController.getAll);
router.get('/:id', espaciosController.getById);

// Gestión de espacios (solo ADMINISTRADOR)
router.post('/', authorize('ADMINISTRADOR'), espaciosController.create);
router.patch('/:id', authorize('ADMINISTRADOR'), espaciosController.update);

module.exports = router;
