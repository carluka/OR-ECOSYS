const roomRepo = require('../repositories/roomRepo');

class RoomService {
  async listRooms() {
    return roomRepo.findAll();
  }

  async getRoom(id) {
    return roomRepo.findById(id);
  }

  async createRoom(payload) {
    // TODO: add validation
    return roomRepo.create(payload);
  }

  async updateRoom(id, payload) {
    // TODO: business rules
    return roomRepo.update(id, payload);
  }

  async deleteRoom(id) {
    // TODO: check constraints before delete
    return roomRepo.delete(id);
  }
}

module.exports = new RoomService();