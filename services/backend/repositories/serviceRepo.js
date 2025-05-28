const { models, sequelize } = require("../db/database");
const { QueryTypes } = require("sequelize");

class ServiceRepo {
	async findAll() {
		return models.Servis.findAll({ include: models.Naprava });
	}

	async findById(id) {
		return models.Servis.findByPk(id, { include: models.Naprava });
	}

	async create(data) {
		return models.Servis.create(data);
	}

	async update(id, data) {
		// TODO
	}

	async delete(id) {
		// TODO
	}

	async findByDeviceId(id) {
		return models.Servis.findAll({
			where: { naprava_idnaprava: id },
			include: models.Naprava,
		});
	}

	async deleteMultiple(ids) {
		await models.Servis.destroy({
			where: { idservis: ids },
		});
	}

	async getBooleanServices() {
		try {
			const sql = `
				SELECT
					idservis,
					naprava_idnaprava,
					datum,
					ura,
					komentar,
					(datum >= (CURRENT_DATE - INTERVAL '2 months')) AS servis
				FROM servis;
			`;

			const [results] = await sequelize.query(sql, {
				type: QueryTypes.SELECT,
			});

			return results;
		} catch (err) {
			console.error(err);
		}
	}
}

module.exports = new ServiceRepo();
