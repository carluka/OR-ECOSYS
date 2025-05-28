const {
	getAll,
	getById,
	create,
	update,
	remove,
	register,
	login,
	loginAdmin,
	logout,
	removeMultiple,
} = require("../controllers/userCtrl");
const { cookieJwtAuth } = require("../middlewares/auth");
const router = require("express").Router();

router.get("/me", (req, res) => {
	res.json({ user: req.user });
});

router.post("/logout", logout);
router.get("/", getAll);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", update);
router.delete("/deleteMultiple", removeMultiple);
router.delete("/:id", remove);
router.post("/register", register);

module.exports = router;
