const { Router } = require('express');
const pacientesController = require('../controllers/pacientes.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = Router();

router.use(authenticate);

// Solicitudes de atención
router.post('/solicitud', pacientesController.createSolicitud);
router.get('/solicitudes', authorize('ADMINISTRADOR', 'PROFESIONAL'), pacientesController.getSolicitudes);

// Pacientes
router.get('/', pacientesController.getAll);
router.post('/', authorize('ADMINISTRADOR', 'PROFESIONAL'), pacientesController.create);
router.get('/:id', pacientesController.getById);
router.patch('/:id', pacientesController.update);

// Responsables
router.post('/:id/responsables', pacientesController.addResponsable);

// Historial administrativo
router.get('/:id/historial', pacientesController.getHistorial);

module.exports = router;
