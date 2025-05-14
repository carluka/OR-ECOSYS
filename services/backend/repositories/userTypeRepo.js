const { models } = require("../db/database");

class UserTypeRepo {
	async findAll() {
		return models.TipUporabnika.findAll();
	}

	async findById(id) {
		return models.TipUporabnika.findByPk(id);
	}
}

module.exports = new UserTypeRepo();
