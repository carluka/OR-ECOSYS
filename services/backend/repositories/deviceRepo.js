const { models } = require('../db/database');

class DeviceRepo {
  async findAll() {
    return models.Naprava.findAll();
  }

  async findById(id) {
    return models.Naprava.findByPk(id);
  }

  async create(data) {
    return models.Naprava.create(data);
  }

  async update(id, data) {
    // TODO: implement update logic, e.g. models.Naprava.update(data, { where: { idNaprava: id } })
  }

  async delete(id) {
    // TODO: implement delete or soft-delete
  }
}

module.exports = new DeviceRepo();
