const { models } = require("../db/database");

class DeviceTypeRepo {
	async findAll() {
		return models.TipNaprave.findAll();
	}

	async findById(id) {
		return models.TipNaprave.findByPk(id);
	}
}

module.exports = new DeviceTypeRepo();
