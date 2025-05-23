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
    // TODO: add validation
    return roomRepo.create(payload);
  }

  async updateRoom(id, payload) {
    // TODO: business rules
    return roomRepo.update(id, payload);
  }

  async getDevices(id) {
    return roomRepo.getDevicesInRoom(id);
  }

  async deleteRoom(id) {
    // TODO: check constraints before delete
    return roomRepo.delete(id);
  }

  async roomDeviceCount() {
    return roomRepo.getRoomsWithDevicesCount();
  }

  async deleteRooms(ids) {
    // TODO: check for active operations before delete
    return roomRepo.deleteMultiple(ids);
  }

  async commitChanges(id) {
    return roomRepo.commitChanges(id);
  }
}

module.exports = new RoomService();
