const { models } = require("../db/database");

class UserRepo {
	async findAll() {
		return models.Uporabnik.findAll({
			include: [
				{
					model: models.TipUporabnika,
					attributes: ["naziv"],
				},
			],
		});
	}

	async findById(id) {
		return models.Uporabnik.findByPk(id, { include: models.TipUporabnika });
	}

	async findByEmail(email) {
		return models.Uporabnik.findOne({ where: { email } });
	}

	async findByEmailAndType(email) {
		return models.Uporabnik.findOne({
			where: { email },
			include: [
				{
					model: models.TipUporabnika,
					where: { naziv: "Administrator" },
					required: true,
				},
			],
		});
	}

	async create(data) {
		return models.Uporabnik.create(data);
	}

	async update(id, data) {
		return models.Uporabnik.update(data, {
			where: { iduporabnik: id },
		});
	}

	async delete(id) {
		// TODO
	}

	async deleteMultiple(ids) {
		return models.Uporabnik.destroy({
			where: {
				iduporabnik: ids,
			},
		});
	}
}

module.exports = new UserRepo();
