const { Router } = require('express');
const profesionalesController = require('../controllers/profesionales.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = Router();

// Rutas protegidas por autenticación
router.use(authenticate);

// Listar profesionales (Pacientes, Profesionales y Administradores pueden verlos)
router.get('/', profesionalesController.getAll);
router.get('/:id', profesionalesController.getById);

// Disponibilidad pública para usuarios autenticados (pacientes necesitan verla para agendar)
router.get('/:id/disponibilidad', profesionalesController.getDisponibilidad);
router.get('/:id/horarios-libres', profesionalesController.getHorariosDisponibles);

// Crear profesional (solo ADMINISTRADOR)
router.post('/', authorize('ADMINISTRADOR'), profesionalesController.create);

// Actualizar profesional (ADMINISTRADOR o el mismo PROFESIONAL)
router.patch('/:id', authorize('ADMINISTRADOR', 'PROFESIONAL'), profesionalesController.update);

// Configurar disponibilidad (ADMINISTRADOR o PROFESIONAL)
router.post('/:id/disponibilidad', authorize('ADMINISTRADOR', 'PROFESIONAL'), profesionalesController.addDisponibilidad);
router.delete('/:id/disponibilidad/:idDisponibilidad', authorize('ADMINISTRADOR', 'PROFESIONAL'), profesionalesController.deleteDisponibilidad);

module.exports = router;
