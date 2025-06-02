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

		const updateResult = await models.Naprava.update(data, {
			where: { idnaprava: id },
		});

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

		return updateResult;
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

			if (tip_naprave) {
				whereConditions.push(`tn.naziv = :tip_naprave`);
			}

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
			COALESCE(sb.naziv || ' ' || sb.lokacija, 'NO ROOM') AS soba,
			COALESCE(sb.naziv, '') AS soba_naziv,
			COALESCE(sb.lokacija, '') AS soba_lokacija,
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
			ORDER BY n.idnaprava DESC;
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

	async getReportData(idnaprava) {
		let replacements = { idnaprava };

		const sql = `
			SELECT
				n.idnaprava,
				n.naziv,
				tn.naziv AS tip_naprave,
				sb.naziv AS soba_naziv,
				sb.lokacija AS soba_lokacija,
				COALESCE(bool_or(sv.datum >= CURRENT_DATE - INTERVAL '2 months'), FALSE) AS servis,

				COALESCE(
					json_agg(
						json_build_object(
							'idservis', sv.idservis,
							'datum', sv.datum,
							'ura', sv.ura,
							'komentar', sv.komentar
						)
						ORDER BY sv.datum DESC, sv.ura DESC
					) FILTER (WHERE sv.idservis IS NOT NULL), '[]'
				) AS servisi,

				(
					SELECT json_agg(ops ORDER BY (ops->>'datum')::date DESC, (ops->>'cas_zacetka') DESC)
					FROM (
						SELECT
							jsonb_build_object(
								'idoperacija', op2.idoperacija,
								'datum', op2.datum,
								'cas_zacetka', op2.cas_zacetka,
								'cas_konca', op2.cas_konca,
								'pacient_idpacient', op2.pacient_idpacient
							) AS ops
						FROM operacija op2
						WHERE op2.soba_idsoba = n.soba_idsoba
						GROUP BY op2.idoperacija, op2.datum, op2.cas_zacetka, op2.cas_konca, op2.pacient_idpacient
					) sub
				) AS operacije

			FROM naprava n
			JOIN tip_naprave tn ON n.tip_naprave_idtip_naprave = tn.idtip_naprave
			LEFT JOIN soba sb ON n.soba_idsoba = sb.idsoba
			LEFT JOIN servis sv ON sv.naprava_idnaprava = n.idnaprava
			LEFT JOIN operacija op ON op.soba_idsoba = n.soba_idsoba
			WHERE n.idnaprava = :idnaprava
			GROUP BY
				n.idnaprava,
				n.naziv,
				tn.naziv,
				sb.naziv,
				sb.lokacija
			ORDER BY n.idnaprava DESC;
    	`;

		const [results] = await sequelize.query(sql, {
			replacements,
			type: QueryTypes.SELECT,
		});

		return results || null;
	}
}

module.exports = new DeviceRepo();
