const operationRepo = require("../repositories/operationRepo");

class OperationService {
	async listOperations() {
		return operationRepo.findAll();
	}

	async getOperation(id) {
		return operationRepo.findById(id);
	}

	async createOperation(payload) {
		return operationRepo.create(payload);
	}

	async updateOperation(id, payload) {
		return operationRepo.update(id, payload);
	}

	async deleteOperation(id) {
		return operationRepo.delete(id);
	}
}

module.exports = new OperationService();
