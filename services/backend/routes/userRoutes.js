const {
	getAll,
	getById,
	create,
	update,
	remove,
	register,
	login,
} = require("../controllers/userCtrl");
const authenticateJWT = require("../middlewares/auth");
const router = require("express").Router();

// 1) Javne rute – brez potrebe po JWT:
router.post("/login", login);

// 2) Zdaj zaščitimo vse nadaljnje rute:
router.use(authenticateJWT);

// 3) Tukaj sledijo tiste rute, ki rabijo veljaven token:
router.get("/", getAll);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);
router.get("/me", (req, res) => {
	res.json({ user: req.user });
});
router.post("/register", register);

module.exports = router;
