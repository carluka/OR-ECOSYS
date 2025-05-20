const { models } = require('../db/database');

class PatientRepo {
  async findAll() {
    return models.Pacient.findAll();
  }

  async findById(id) {
    return models.Pacient.findByPk(id);
  }

  async create(data) {
    return models.Pacient.create(data);
  }

  async update(id, data) {
    // TODO: implement update logic
  }

  async delete(id) {
    // TODO: implement delete logic
  }
}

module.exports = new PatientRepo();
