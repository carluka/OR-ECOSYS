const { getAll, getById } = require("../controllers/userTypeCtrl");

const router = require("express").Router();

router.get("/", getAll);
router.get("/:id", getById);

module.exports = router;
