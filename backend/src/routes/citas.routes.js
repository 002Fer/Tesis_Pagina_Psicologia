const { Router } = require('express');
const citasController = require('../controllers/citas.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = Router();

router.use(authenticate);

router.get('/', citasController.getAll);
router.get('/:id', citasController.getById);
router.post('/', citasController.create);
router.post('/:id/cancelar', citasController.cancelar);
router.post('/:id/reprogramar', citasController.reprogramar);

module.exports = router;
