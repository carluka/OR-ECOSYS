const userTypeRepo = require("../repositories/userTypeRepo");

class UserTypeService {
	async listUserTypes() {
		return userTypeRepo.findAll();
	}

	async getUserType(id) {
		return userTypeRepo.findById(id);
	}
}

module.exports = new UserTypeService();
