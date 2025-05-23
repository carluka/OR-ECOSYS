const userService = require("../services/userService");
const jwt = require("jsonwebtoken");

exports.getAll = async (req, res, next) => {
	try {
		const users = await userService.listUsers();
		res.json({ data: users });
	} catch (err) {
		next(err);
	}
};

exports.getById = async (req, res, next) => {
	try {
		const user = await userService.getUser(req.params.id);
		res.json({ data: user });
	} catch (err) {
		next(err);
	}
};

exports.create = async (req, res, next) => {
	try {
		const newUser = await userService.createUser(req.body);
		res.status(201).json({ data: newUser });
	} catch (err) {
		next(err);
	}
};

exports.update = async (req, res, next) => {
	try {
		await userService.updateUser(req.params.id, req.body);
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};

exports.remove = async (req, res, next) => {
	try {
		await userService.deleteUser(req.params.id);
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};

exports.register = async (req, res, next) => {
	try {
		const { ime, priimek, email, geslo, tip_uporabnika_idtip_uporabnika } =
			req.body;
		const novi = await userService.createUser({
			ime,
			priimek,
			email,
			geslo,
			tip_uporabnika_idtip_uporabnika,
		});
		res
			.status(201)
			.json({ message: "Ustvarjen nov uporabnik", id: novi.iduporabnik });
	} catch (err) {
		next(err);
	}
};

// controllers/userCtrl.js
exports.login = async (req, res, next) => {
	try {
		const { email, geslo } = req.body;

		const user = await userService.getUserByEmail(email);
		if (!user)
			return res.status(401).json({ message: "Napačen email ali geslo" });

		const ok = await userService.checkGeslo(email, geslo);
		if (!ok)
			return res.status(401).json({ message: "Napačen email ali geslo" });

		const payload = { email: user.email };
		const token = jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: "1h",
		});

		res.cookie("token", token, {
			httpOnly: true,
		});

		// Pošlji odgovor
		res.json({ message: "Prijava uspešna" });
	} catch (err) {
		console.error("Login error:", err);
		next(err);
	}
};

exports.loginAdmin = async (req, res, next) => {
	try {
		const { email, geslo } = req.body;

		const user = await userService.getUserByEmailAndType(email);
		if (!user)
			return res.status(401).json({ message: "Napačen email ali geslo" });

		const ok = await userService.checkGeslo(email, geslo);
		if (!ok)
			return res.status(401).json({ message: "Napačen email ali geslo" });

		const payload = { email: user.email };
		const token = jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: "1h",
		});

		res.cookie("token", token, {
			httpOnly: true,
		});

		// Pošlji odgovor
		res.json({ message: "Prijava uspešna" });
	} catch (err) {
		console.error("Login error:", err);
		next(err);
	}
};

// controllers/userCtrl.js
exports.logout = (req, res) => {
	console.log("Logout request received");
	console.log("Current cookies:", req.cookies);

	const cookieOptions = {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		domain:
			process.env.NODE_ENV === "production"
				? process.env.COOKIE_DOMAIN
				: "localhost",
	};

	console.log("Clearing cookie with options:", cookieOptions);

	res.clearCookie("token", cookieOptions).json({ message: "Odjava uspešna" });

	console.log(
		"Cookie cleared in response headers:",
		res.getHeaders()["set-cookie"]
	);
};

exports.removeMultiple = async (req, res, next) => {
	try {
		const { ids } = req.body;
		await userService.deleteUsers(ids);
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};
