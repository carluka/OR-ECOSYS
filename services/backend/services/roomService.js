const roomRepo = require("../repositories/roomRepo");
const operationRepo = require("../repositories/operationRepo");
const { models } = require("../db/database");
const influx = require("../utils/influx");

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

	async findOperationsByRoomId(roomId) {
		try {
			const operations = await models.Operacija.findAll({
				where: {
					soba_idsoba: roomId
				}
			});
			return operations;
		} catch (error) {
			throw error;
		}
	}

	async deleteRoom(id) {
		try {
			const room = await roomRepo.findById(id);
			if (!room) {
				throw new Error("Room not found");
			}

			const roomUuid = room.uuid;
			const operations = await this.findOperationsByRoomId(id);

			for (const operation of operations) {
				await models.Operacija.destroy({
					where: { idoperacija: operation.idoperacija }
				});
			}

			await influx.deleteRoomData(roomUuid);

			const result = await models.Soba.destroy({
				where: { idsoba: id }
			});

			return result;
		} catch (error) {
			throw error;
		}
	}

	async roomDeviceCount() {
		return roomRepo.getRoomsWithDevicesCount();
	}

	async deleteRooms(ids) {
		try {
			const results = [];
			for (const id of ids) {

				const room = await roomRepo.findById(id);
				if (!room) {
					continue;
				}

				const roomUuid = room.uuid;
				const operations = await this.findOperationsByRoomId(id);

				for (const operation of operations) {
					await models.Operacija.destroy({
						where: { idoperacija: operation.idoperacija }
					});
				}

				await influx.deleteRoomData(roomUuid);

				const result = await models.Soba.destroy({
					where: { idsoba: id }
				});
				results.push(result);
			}

			return results;
		} catch (error) {
			throw error;
		}
	}

	async commitChanges(id) {
		return roomRepo.commitChanges(id);
	}
}

module.exports = new RoomService();