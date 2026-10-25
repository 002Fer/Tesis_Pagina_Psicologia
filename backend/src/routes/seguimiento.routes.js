const { Router } = require('express');
const seguimientoController = require('../controllers/seguimiento.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = Router();

router.use(authenticate);

// Vinculación (Admin o Profesional)
router.post('/vincular', authorize('ADMINISTRADOR', 'PROFESIONAL'), seguimientoController.vincular);

// Planes de seguimiento
router.post('/planes', authorize('ADMINISTRADOR', 'PROFESIONAL'), seguimientoController.createPlan);
router.get('/planes/:id', seguimientoController.getPlanById);
router.patch('/planes/:id/frecuencia', authorize('ADMINISTRADOR', 'PROFESIONAL'), seguimientoController.updateFrecuencia);
router.post('/planes/:id/finalizar', authorize('ADMINISTRADOR', 'PROFESIONAL'), seguimientoController.finalizar);
router.post('/planes/:id/generar-citas', authorize('ADMINISTRADOR', 'PROFESIONAL'), seguimientoController.generarCitas);

module.exports = router;
