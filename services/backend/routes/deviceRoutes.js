const {
	getAll,
	getById,
	create,
	update,
	remove,
	removeMultiple,
	prikaz,
} = require("../controllers/deviceCtrl");
const router = require("express").Router();

router.get("/prikaz", prikaz);
router.get("/", getAll);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", update);
router.delete("/deleteMultiple", removeMultiple);
router.delete("/:id", remove);

module.exports = router;
