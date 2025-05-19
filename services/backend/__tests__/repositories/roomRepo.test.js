const RoomRepo = require("../../repositories/roomRepo");

jest.mock("../../db/database", () => ({
	models: {
		Soba: {
			findAll: jest.fn(),
			findByPk: jest.fn(),
			create: jest.fn(),
			// we still have to implement update and delete
		},
	},
}));

const { models } = require("../../db/database");

describe("RoomRepo", () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	test("findAll calls Soba.findAll and returns data", async () => {
		const mockRooms = [{ idsoba: 1, naziv: "Soba 1" }];
		models.Soba.findAll.mockResolvedValue(mockRooms);

		const result = await RoomRepo.findAll();

		expect(models.Soba.findAll).toHaveBeenCalled();
		expect(result).toBe(mockRooms);
	});

	test("findById calls Soba.findByPk with id and returns data", async () => {
		const mockRoom = { idsoba: 1, naziv: "Soba 1" };
		models.Soba.findByPk.mockResolvedValue(mockRoom);

		const result = await RoomRepo.findById(1);

		expect(models.Soba.findByPk).toHaveBeenCalledWith(1);
		expect(result).toBe(mockRoom);
	});

	test("create calls Soba.create with data and returns created object", async () => {
		const data = { naziv: "Soba 1" };
		const mockCreated = { idsoba: 1, ...data };
		models.Soba.create.mockResolvedValue(mockCreated);

		const result = await RoomRepo.create(data);

		expect(models.Soba.create).toHaveBeenCalledWith(data);
		expect(result).toBe(mockCreated);
	});

	test.skip("update - to be implemented", () => {});
	test.skip("delete - to be implemented", () => {});
});
