const userTypeService = require("../services/userTypeService");

exports.getAll = async (req, res, next) => {
	try {
		const userTypes = await userTypeService.listUserTypes();
		res.json({ data: userTypes });
	} catch (err) {
		next(err);
	}
};

exports.getById = async (req, res, next) => {
	try {
		const userType = await userTypeService.getUserType(req.params.id);
		res.json({ data: userType });
	} catch (err) {
		next(err);
	}
};
