const { getAll, getById, create, update, remove } = require('../controllers/patientCtrl');
const router = require('express').Router();

router.get('/',    getAll);
router.get('/:id', getById);
router.post('/',   create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
