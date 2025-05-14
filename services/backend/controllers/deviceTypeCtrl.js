const deviceTypeService = require("../services/deviceTypeService");

exports.getAll = async (req, res, next) => {
	try {
		const deviceTypes = await deviceTypeService.listDeviceTypes();
		res.json({ data: deviceTypes });
	} catch (err) {
		next(err);
	}
};

exports.getById = async (req, res, next) => {
	try {
		const deviceType = await deviceTypeService.getDeviceType(req.params.id);
		res.json({ data: deviceType });
	} catch (err) {
		next(err);
	}
};
