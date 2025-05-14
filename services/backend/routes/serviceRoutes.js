const {
	getAll,
	getById,
	create,
	update,
	remove,
	getByDeviceId,
	removeMultiple,
	getBooleanServices,
} = require("../controllers/serviceCtrl");
const router = require("express").Router();

router.get("/booleanServices", getBooleanServices);
router.get("/", getAll);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", update);
router.delete("/deleteMultiple", removeMultiple);
router.delete("/:id", remove);
router.get("/device/:id", getByDeviceId);

module.exports = router;
