const { models, sequelize } = require("../db/database");
const { QueryTypes } = require("sequelize");

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

	async getDevices(filters = {}) {
		try {
			const { tip_naprave, servis } = filters;
			const filterConditions = [];
			if (tip_naprave) {
				filterConditions.push(`tn.naziv = :tip_naprave`);
			}
			if (servis !== undefined) {
				filterConditions.push(
					`(sv.datum >= CURRENT_DATE - INTERVAL '2 months') = :servis`
				);
			}
			const whereSQL = filterConditions.length
				? "WHERE " + filterConditions.join(" AND ")
				: "";

			const sql = `
				SELECT
					n.idnaprava,
					n.naziv       AS naprava,
					tn.naziv      AS tip_naprave,
					(sb.naziv || ' ' || sb.lokacija) AS soba,
					bool_or(sv.datum >= CURRENT_DATE - INTERVAL '2 months') AS servis
				FROM naprava n
				JOIN tip_naprave tn ON n.tip_naprave_idtip_naprave = tn.idtip_naprave
				JOIN soba sb ON n.soba_idsoba = sb.idsoba
				LEFT JOIN servis sv ON sv.naprava_idnaprava = n.idnaprava
				${whereSQL}
				GROUP BY n.idnaprava, n.naziv, tn.naziv, sb.naziv, sb.lokacija
				ORDER BY n.naziv;
			`;

			const results = await sequelize.query(sql, {
				replacements: {
					tip_naprave,
					servis: servis === "true",
				},
				type: QueryTypes.SELECT,
			});

			return results;
		} catch (err) {
			console.error("Error in getDevices:", err);
			throw err;
		}
	}
}

module.exports = new DeviceRepo();
