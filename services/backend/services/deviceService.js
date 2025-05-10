const deviceRepo = require('../repositories/deviceRepo');

class DeviceService {
  async listDevices() {
    return deviceRepo.findAll();
  }

  async getDevice(id) {
    return deviceRepo.findById(id);
  }

  async createDevice(payload) {
    // TODO: validate payload (e.g. serial number unique)
    return deviceRepo.create(payload);
  }

  async updateDevice(id, payload) {
    // TODO: business rules (e.g. prevent changing room if active)
    return deviceRepo.update(id, payload);
  }

  async deleteDevice(id) {
    // TODO: check for active operations before delete
    return deviceRepo.delete(id);
  }

  async togglePower(id, action) {
    // TODO: integrate with simulatorRepo or SDC provider
    return deviceRepo.togglePower(id, action);
  }
}

module.exports = new DeviceService();
