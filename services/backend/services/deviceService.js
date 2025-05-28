const deviceRepo = require("../repositories/deviceRepo");

class DeviceService {
	async listDevices() {
		return deviceRepo.findAll();
	}

	async getDevice(id) {
		return deviceRepo.findById(id);
	}

	async createDevice(payload) {
		return deviceRepo.create(payload);
	}

	async updateDevice(id, payload) {
		return deviceRepo.update(id, payload);
	}

	async deleteDevice(id) {
		return deviceRepo.delete(id);
	}

	async togglePower(id, action) {
		// TODO
		return deviceRepo.togglePower(id, action);
	}

	async deleteDevices(ids) {
		return deviceRepo.deleteMultiple(ids);
	}

	async getDevices(filters = {}) {
		return deviceRepo.getDevices(filters);
	}

	async getDeviceReportData(id) {
		return deviceRepo.getReportData(id);
	}
}

module.exports = new DeviceService();
