const roomService = require("../../services/roomService");
const roomRepo = require("../../repositories/roomRepo");
const influx = require("../../utils/influx");
const { models } = require("../../db/database");

// Mocking the repository
jest.mock("../../repositories/roomRepo");

// Test cases for RoomService
describe("RoomService", () => {
	// Clear mocks after each test
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("listRooms", () => {
		test("should return all rooms", async () => {
			const mockRooms = [{ id: 1 }, { id: 2 }];
			roomRepo.findAll.mockResolvedValue(mockRooms);

			const result = await roomService.listRooms();

			expect(roomRepo.findAll).toHaveBeenCalled();
			expect(result).toEqual(mockRooms);
		});
	});

	describe("getRoom", () => {
		test("should return room by id", async () => {
			const mockRoom = { id: 1 };
			roomRepo.findById.mockResolvedValue(mockRoom);

			const result = await roomService.getRoom(1);

			expect(roomRepo.findById).toHaveBeenCalledWith(1);
			expect(result).toEqual(mockRoom);
		});
	});

	describe("createRoom", () => {
		test("should create new room", async () => {
			const payload = { name: "Room 101" };
			const mockCreated = { id: 1, ...payload };
			roomRepo.create.mockResolvedValue(mockCreated);

			const result = await roomService.createRoom(payload);

			expect(roomRepo.create).toHaveBeenCalledWith(payload);
			expect(result).toEqual(mockCreated);
		});
	});

	describe("updateRoom", () => {
		test("should update room", async () => {
			const id = 1;
			const payload = { name: "Updated Room" };
			const mockUpdated = [1];
			roomRepo.update.mockResolvedValue(mockUpdated);

			const result = await roomService.updateRoom(id, payload);

			expect(roomRepo.update).toHaveBeenCalledWith(id, payload);
			expect(result).toEqual(mockUpdated);
		});
	});

	describe("deleteRooms", () => {
		test("should delete multiple rooms (calls repo and cleans up)", async () => {
			const ids = [1, 2, 3];
			const mockRooms = [
				{ id: 1, uuid: "uuid-1" },
				{ id: 2, uuid: "uuid-2" },
				{ id: 3, uuid: "uuid-3" },
			];
			const mockOperations = [
				[{ idoperacija: 10 }, { idoperacija: 11 }],
				[],
				[{ idoperacija: 12 }],
			];

			jest
				.spyOn(roomRepo, "findById")
				.mockImplementation((id) =>
					Promise.resolve(mockRooms.find((r) => r.id === id))
				);
			jest
				.spyOn(roomService, "findOperationsByRoomId")
				.mockImplementation((id) =>
					Promise.resolve(mockOperations[ids.indexOf(id)])
				);
			jest.spyOn(models.Operacija, "destroy").mockResolvedValue(1);
			jest.spyOn(influx, "deleteRoomData").mockResolvedValue();
			jest.spyOn(models.Soba, "destroy").mockResolvedValue(1);

			const result = await roomService.deleteRooms(ids);

			expect(roomRepo.findById).toHaveBeenCalledTimes(3);
			expect(roomService.findOperationsByRoomId).toHaveBeenCalledTimes(3);
			expect(models.Operacija.destroy).toHaveBeenCalledTimes(3);
			expect(influx.deleteRoomData).toHaveBeenCalledTimes(3);
			expect(models.Soba.destroy).toHaveBeenCalledTimes(3);
			expect(result).toEqual([1, 1, 1]);
		});
	});
});
