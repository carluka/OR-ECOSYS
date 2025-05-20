const { models } = require('../db/database');

class RoomRepo {
  async findAll() {
    return models.Soba.findAll(); // TODO: add pagination
  }

  async findById(id) {
    return models.Soba.findByPk(id);
  }

  async create(data) {
    return models.Soba.create(data);
  }

  async update(id, data) {
    // TODO: implement update logic
  }

  async delete(id) {
    // TODO: implement delete logic (soft/hard)
  }
}

module.exports = new RoomRepo();