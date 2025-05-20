const deviceTypeRepo = require("../repositories/deviceTypeRepo");

class DeviceTypeService {
	async listDeviceTypes() {
		return deviceTypeRepo.findAll();
	}

	async getDeviceType(id) {
		return deviceTypeRepo.findById(id);
	}
}

module.exports = new DeviceTypeService();
