const {
	getAll,
	getById,
	create,
	update,
	remove,
	removeMultiple,
	prikaz,
	reportData,
	reportPDF,
} = require("../controllers/deviceCtrl");
const router = require("express").Router();

router.get("/prikaz", prikaz);
router.get("/:id/report-data", reportData);
router.get("/:id/report-pdf", reportPDF);
router.get("/", getAll);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", update);
router.delete("/deleteMultiple", removeMultiple);
router.delete("/:id", remove);

module.exports = router;
