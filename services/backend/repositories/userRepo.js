const { models } = require("../db/database");

class UserRepo {
	async findAll() {
		return models.Uporabnik.findAll({ include: models.TipUporabnika });
	}

	async findById(id) {
		return models.Uporabnik.findByPk(id, { include: models.TipUporabnika });
	}

	async findByEmail(email) {
		return models.Uporabnik.findOne({ where: { email } });
	}

	async create(data) {
		return models.Uporabnik.create(data);
	}

	async update(id, data) {
		// TODO: implement update logic
	}

	async delete(id) {
		// TODO: implement delete logic
	}
}

module.exports = new UserRepo();
