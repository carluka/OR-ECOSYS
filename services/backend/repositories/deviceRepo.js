const { models, sequelize } = require("../db/database");
const { QueryTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

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
		data.uuid = uuidv4();
		return models.Naprava.create(data);
	}

	async update(id, data) {
		const device = await models.Naprava.findByPk(id);

		await models.Naprava.update(data, { where: { idnaprava: id } });

		const oldSobaId = device.soba_idsoba;
		const newSobaId = data.hasOwnProperty("soba_idsoba")
			? data.soba_idsoba
			: oldSobaId;

		// If room assignment changed, update both old and new rooms
		if (oldSobaId !== newSobaId) {
			if (oldSobaId !== null && oldSobaId !== undefined) {
				await models.Soba.update(
					{ unsaved_changes: true },
					{ where: { idsoba: oldSobaId } }
				);
			}
			if (newSobaId !== null && newSobaId !== undefined) {
				await models.Soba.update(
					{ unsaved_changes: true },
					{ where: { idsoba: newSobaId } }
				);
			}
		} else {
			// If room didn't change but device is assigned to a room, mark that room unsaved_changes
			if (oldSobaId !== null && oldSobaId !== undefined) {
				await models.Soba.update(
					{ unsaved_changes: true },
					{ where: { idsoba: oldSobaId } }
				);
			}
		}

		return;
	}

	async deleteMultiple(ids) {
		const devices = await models.Naprava.findAll({
			where: {
				idnaprava: ids,
			},
			attributes: ["soba_idsoba"],
		});

		const sobaIds = [
			...new Set(
				devices
					.map((d) => d.soba_idsoba)
					.filter((id) => id !== null && id !== undefined)
			),
		];

		if (sobaIds.length > 0) {
			await models.Soba.update(
				{ unsaved_changes: true },
				{ where: { idsoba: sobaIds } }
			);
		}

		return models.Naprava.destroy({
			where: {
				idnaprava: ids,
			},
		});
	}

	async getDevices(filters = {}) {
		try {
			const { tip_naprave, servis } = filters;
			const whereConditions = [];
			const havingConditions = [];

			// simple WHERE on device type
			if (tip_naprave) {
				whereConditions.push(`tn.naziv = :tip_naprave`);
			}

			// filter on the aggregated "servis" flag
			if (servis !== undefined) {
				havingConditions.push(
					`COALESCE(bool_or(sv.datum >= CURRENT_DATE - INTERVAL '2 months'), FALSE) = :servis`
				);
			}

			const whereSQL = whereConditions.length
				? "WHERE " + whereConditions.join(" AND ")
				: "";

			const havingSQL = havingConditions.length
				? "HAVING " + havingConditions.join(" AND ")
				: "";

			const sql = `
			SELECT
			  n.idnaprava,
			  n.naziv              AS naprava,
			  tn.naziv             AS tip_naprave,
			  n.soba_idsoba,
			  -- Use COALESCE to show empty string if no room assigned
			  COALESCE(sb.naziv || ' ' || sb.lokacija, 'NO ROOM') AS soba,
			  -- default to false if no servis rows at all
			  COALESCE(
				bool_or(sv.datum >= CURRENT_DATE - INTERVAL '2 months'),
				FALSE
			  ) AS servis
			FROM naprava n
			JOIN tip_naprave tn
			  ON n.tip_naprave_idtip_naprave = tn.idtip_naprave
			LEFT JOIN soba sb
			  ON n.soba_idsoba = sb.idsoba
			LEFT JOIN servis sv
			  ON sv.naprava_idnaprava = n.idnaprava
			${whereSQL}
			GROUP BY
			  n.idnaprava,
			  n.naziv,
			  tn.naziv,
			  n.soba_idsoba,
			  sb.naziv,
			  sb.lokacija
			${havingSQL}
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
