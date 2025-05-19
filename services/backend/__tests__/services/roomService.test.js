const roomService = require("../../services/roomService");
const roomRepo = require("../../repositories/roomRepo");

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

	describe("deleteRoom", () => {
		test("should delete room", async () => {
			const id = 1;
			const mockDeleted = 1;
			roomRepo.delete.mockResolvedValue(mockDeleted);

			const result = await roomService.deleteRoom(id);

			expect(roomRepo.delete).toHaveBeenCalledWith(id);
			expect(result).toEqual(mockDeleted);
		});
	});
});
