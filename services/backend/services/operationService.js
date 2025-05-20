const operationRepo = require('../repositories/operationRepo');

class OperationService {
  async listOperations() {
    return operationRepo.findAll();
  }

  async getOperation(id) {
    return operationRepo.findById(id);
  }

  async createOperation(payload) {
    // TODO: check patient and room availability
    return operationRepo.create(payload);
  }

  async updateOperation(id, payload) {
    // TODO: enforce business rules (e.g. no overlapping times)
    return operationRepo.update(id, payload);
  }

  async deleteOperation(id) {
    // TODO: clean up related operation_staff entries
    return operationRepo.delete(id);
  }
}

module.exports = new OperationService();
