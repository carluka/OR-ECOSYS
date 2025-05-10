const { models } = require('../db/database');

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
    // TODO: implement update logic
  }

  async delete(id) {
    // TODO: implement delete logic
  }
}

module.exports = new ServiceRepo();
