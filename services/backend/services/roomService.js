const roomRepo = require("../repositories/roomRepo");

class RoomService {
	async listRooms() {
		return roomRepo.findAll();
	}

	async getRoom(id) {
		return roomRepo.findById(id);
	}

	async getById(id) {
		return this.getRoom(id);
	}

	async createRoom(payload) {
		return roomRepo.create(payload);
	}

	async updateRoom(id, payload) {
		return roomRepo.update(id, payload);
	}

	async getDevices(id) {
		return roomRepo.getDevicesInRoom(id);
	}

	async deleteRoom(id) {
		return roomRepo.delete(id);
	}

	async roomDeviceCount() {
		return roomRepo.getRoomsWithDevicesCount();
	}

	async deleteRooms(ids) {
		return roomRepo.deleteMultiple(ids);
	}

	async commitChanges(id) {
		return roomRepo.commitChanges(id);
	}
}

module.exports = new RoomService();
