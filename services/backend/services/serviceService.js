const serviceRepo = require('../repositories/serviceRepo');

class ServiceService {
  async listServices() {
    return serviceRepo.findAll();
  }

  async getService(id) {
    return serviceRepo.findById(id);
  }

  async createService(payload) {
    // TODO: validate device exists
    return serviceRepo.create(payload);
  }

  async updateService(id, payload) {
    // TODO: business rules for service editing
    return serviceRepo.update(id, payload);
  }

  async deleteService(id) {
    // TODO: ensure reporting history is archived
    return serviceRepo.delete(id);
  }
}

module.exports = new ServiceService();
