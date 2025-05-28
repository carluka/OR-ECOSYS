const serviceRepo = require("../repositories/serviceRepo");

class ServiceService {
	async listServices() {
		return serviceRepo.findAll();
	}

	async getService(id) {
		return serviceRepo.findById(id);
	}

	async createService(payload) {
		return serviceRepo.create(payload);
	}

	async updateService(id, payload) {
		return serviceRepo.update(id, payload);
	}

	async deleteService(id) {
		return serviceRepo.delete(id);
	}

	async getServicesByDeviceId(id) {
		return serviceRepo.findByDeviceId(id);
	}

	async deleteServices(ids) {
		return serviceRepo.deleteMultiple(ids);
	}

	async getBooleanServices() {
		return serviceRepo.getBooleanServices();
	}
}

module.exports = new ServiceService();
