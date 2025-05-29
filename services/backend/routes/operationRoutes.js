const { getAll, getById, create, update, remove, getWithMeasurements } = require('../controllers/operationCtrl');
const router = require('express').Router();

router.get('/',    getAll);
router.get('/:id/data', getWithMeasurements);
router.get('/:id', getById);
router.post('/',   create);
router.put('/:id', update);
router.delete('/:id', remove);


module.exports = router;
