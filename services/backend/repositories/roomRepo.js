const { models, sequelize } = require("../db/database");
const { QueryTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const K8sTemplateGenerator = require("../utils/K8sTemplateGenerator");
const { kubectlApply } = require("../utils/kubectl");

class RoomRepo {
	async findAll() {
		return models.Soba.findAll();
	}

	async findById(id) {
		return models.Soba.findByPk(id);
	}

	async create(data) {
		let uuid = uuidv4();
		uuid = "a" + uuid.slice(1);

		data.uuid = uuid;
		return models.Soba.create(data);
	}

	async update(id, data) {
		// TODO
	}

	async deleteMultiple(ids) {
		return models.Soba.destroy({
			where: {
				idsoba: ids,
			},
		});
	}

	async getRoomsWithDevicesCount() {
		try {
			const sql = `
      SELECT
        s.idsoba,
        s.naziv,
        s.lokacija,
        s.unsaved_changes,
        COUNT(n.idnaprava) AS st_naprav,
        EXISTS (
          SELECT 1
          FROM operacija o
          WHERE o.soba_idsoba = s.idsoba AND o.cas_konca IS NULL
        ) AS aktivno
      FROM soba s
      LEFT JOIN naprava n ON s.idsoba = n.soba_idsoba
      GROUP BY s.idsoba, s.naziv, s.lokacija, s.unsaved_changes
      ORDER BY s.idsoba DESC;
    `;

			const results = await sequelize.query(sql, {
				type: QueryTypes.SELECT,
			});

			return results;
		} catch (err) {
			console.error("Error in getRoomsWithDeviceCount:", err);
			throw err;
		}
	}

	async commitChanges(roomId) {
		const room = await models.Soba.findByPk(roomId);
		if (!room) {
			throw new Error(`Room with id ${roomId} not found`);
		}

		const devices = await sequelize.query(
			`SELECT n.idnaprava, n.uuid, t.naziv_k8s AS tipnaprave
      FROM naprava n
      JOIN tip_naprave t ON n.tip_naprave_idtip_naprave = t.idtip_naprave
      WHERE n.soba_idsoba = :roomId`,
			{
				replacements: { roomId },
				type: sequelize.QueryTypes.SELECT,
			}
		);

		const consumerDeviceUuids = devices.map((d) => d.uuid);

		const providers = devices.map((d) => ({
			type: d.tipnaprave,
			uuid: d.uuid,
		}));

		const generator = new K8sTemplateGenerator(
			path.resolve("/mnt/k8s-templates/templates"),
			path.resolve("/mnt/k8s-templates/generated")
		);

		const { consumerYamlPath, providerYamlPaths } =
			await generator.generateDeployment(
				room.uuid,
				consumerDeviceUuids,
				providers,
				room.idsoba
			);

		await kubectlApply(consumerYamlPath, "or-ecosys");

		for (const yamlPath of providerYamlPaths) {
			await kubectlApply(yamlPath, "or-ecosys");
		}

		const { consumerYamlPathService } = await generator.generateService(
			room.uuid,
			room.idsoba
		);

		await kubectlApply(consumerYamlPathService, "or-ecosys");

		await models.Soba.update(
			{ unsaved_changes: false },
			{ where: { idsoba: roomId } }
		);
	}
	async getDevicesInRoom(roomId) {
		const sql = `
      SELECT n.uuid,
             t.naziv_k8s AS tipnaprave
      FROM naprava n
      JOIN tip_naprave t
        ON n.tip_naprave_idtip_naprave = t.idtip_naprave
      WHERE n.soba_idsoba = :roomId
    `;
		return sequelize.query(sql, {
			replacements: { roomId },
			type: QueryTypes.SELECT,
		});
	}
}

module.exports = new RoomRepo();
