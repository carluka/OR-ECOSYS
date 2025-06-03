const { models } = require("../db/database");

class OperationRepo {
  async findAll() {
    return models.Operacija.findAll({
      include: [models.Pacient, models.Soba, models.Uporabnik],
    });
  }

  async findById(id) {
    return models.Operacija.findByPk(id, {
      include: [models.Pacient, models.Soba, models.Uporabnik],
    });
  }

  async create(data) {
    return models.Operacija.create(data);
  }

  async update(id, data) {
    await models.Operacija.update(data, { where: { idoperacija: id } });
    return;
  }

  async delete(id) {
    // TODO
  }
}

module.exports = new OperationRepo();
