const { models } = require("../db/database");

class DeviceRepo {
	async findAll() {
		return models.Naprava.findAll({
			include: [
				{
					model: models.Soba,
					attributes: ["lokacija", "naziv"],
				},
				{
					model: models.TipNaprave,
					attributes: ["naziv"],
				},
			],
		});
	}

	async findById(id) {
		return models.Naprava.findByPk(id);
	}

	async create(data) {
		return models.Naprava.create(data);
	}

	async update(id, data) {
		return models.Naprava.update(data, { where: { idnaprava: id } });
	}

	async delete(id) {
		// TODO: implement delete or soft-delete
		return models.Naprava.destroy({ where: { idnaprava: id } });
	}

	async deleteMultiple(ids) {
		// TODO: implement delete or soft-delete
		return models.Naprava.destroy({
			where: {
				idnaprava: ids,
			},
		});
	}
}

module.exports = new DeviceRepo();
