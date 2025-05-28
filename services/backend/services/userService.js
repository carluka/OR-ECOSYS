const userRepo = require("../repositories/userRepo");
const bcryptjs = require("bcryptjs");

class UserService {
	async listUsers() {
		return userRepo.findAll();
	}

	async getUser(id) {
		return userRepo.findById(id);
	}

	async getUserByEmail(email) {
		return userRepo.findByEmail(email);
	}

	async getUserByEmailAndType(email) {
		return userRepo.findByEmailAndType(email);
	}

	async checkGeslo(email, geslo) {
		const user = await this.getUserByEmail(email);
		if (!user) return false;
		return await bcryptjs.compare(geslo, user.geslo);
	}

	async createUser(payload) {
		if (payload.geslo) {
			payload.geslo = await bcryptjs.hash(payload.geslo, 12);
		}
		return userRepo.create(payload);
	}

	async updateUser(id, payload) {
		if (payload.geslo) {
			payload.geslo = await bcryptjs.hash(payload.geslo, 10);
		}

		const result = await userRepo.update(id, payload);
		console.log("User update completed");
		return result;
	}

	async deleteUser(id) {
		return userRepo.delete(id);
	}

	async deleteUsers(ids) {
		return userRepo.deleteMultiple(ids);
	}
}

module.exports = new UserService();
