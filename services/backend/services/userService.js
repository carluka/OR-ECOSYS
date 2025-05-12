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

	async checkGeslo(email, geslo) {
		const user = await this.getUserByEmail(email);
		return user && (await bcryptjs.compare(geslo, user.geslo));
	}

	async createUser(payload) {
		// TODO: hash password
		if (payload.geslo) {
			payload.geslo = await bcryptjs.hash(payload.geslo, 12);
		}
		return userRepo.create(payload);
	}

	async updateUser(id, payload) {
		// TODO: if changing password, hash again
		if (payload.geslo) {
			payload.geslo = await bcryptjs.hash(payload.geslo, 10);
		}
		return userRepo.update(id, payload);
	}

	async deleteUser(id) {
		// TODO: check if user has pending operations
		return userRepo.delete(id);
	}
}

module.exports = new UserService();
