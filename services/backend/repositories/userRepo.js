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

	async create(data) {
		return models.Uporabnik.create(data);
	}

	async update(id, data) {
		return models.Uporabnik.update(data, {
			where: { iduporabnik: id },
		});
	}

	async delete(id) {
		// TODO: implement delete logic
	}

	async deleteMultiple(ids) {
		// TODO: implement delete or soft-delete
		return models.Uporabnik.destroy({
			where: {
				iduporabnik: ids,
			},
		});
	}
}

module.exports = new UserRepo();
