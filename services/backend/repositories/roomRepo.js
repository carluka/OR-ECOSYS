const { models, sequelize } = require("../db/database");
const { QueryTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

class RoomRepo {
  async findAll() {
    return models.Soba.findAll(); // TODO: add pagination
  }

  async findById(id) {
    return models.Soba.findByPk(id);
  }

  async create(data) {
    data.uuid = uuidv4();

    return models.Soba.create(data);
  }

  async update(id, data) {
    // TODO: implement update logic
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
          COUNT(n.idnaprava) AS st_naprav
        FROM soba s
        LEFT JOIN naprava n ON s.idsoba = n.soba_idsoba
        GROUP BY s.idsoba, s.naziv, s.lokacija, s.unsaved_changes
        ORDER BY s.idsoba, s.naziv, s.lokacija, s.unsaved_changes;
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

  async commitChanges(id) {
    return models.Soba.update(
      { unsaved_changes: false },
      { where: { idsoba: id } }
    );
  }
}

module.exports = new RoomRepo();
