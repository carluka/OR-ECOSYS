const userService = require("../services/userService");

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
			.json({ message: "Ustvarjen novo uporabnik", id: novi.iduporabnik });
	} catch (err) {
		next(err);
	}
};

exports.login = async (req, res, next) => {
	try {
		const { email, geslo } = req.body;
		const user = await userService.getUserByEmail(email);
		if (!user) return res.status(401).json({ message: "Napačni email" });

		const ok = await userService.checkGeslo(email, geslo);
		if (!ok) return res.status(401).json({ message: "Napačno geslo" });

		const token = user.generateJWT();
		res.json({ token });
	} catch (err) {
		next(err);
	}
};
