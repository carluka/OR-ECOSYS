const DeviceTypeRepo = require("../../repositories/deviceTypeRepo");

// Mocking the database
jest.mock("../../db/database", () => ({
	models: {
		TipNaprave: {
			findAll: jest.fn(),
			findByPk: jest.fn(),
		},
	},
}));

const { models } = require("../../db/database");

// Test cases for DeviceRepo
describe("DeviceTypeRepo", () => {
	// Clear mocks after each test
	afterEach(() => {
		jest.clearAllMocks();
	});

	test("findAll calls TipNaprave.findAll and returns data", async () => {
		const mockTypes = [{ idtip_naprave: 1, naziv: "Type1" }];
		models.TipNaprave.findAll.mockResolvedValue(mockTypes);

		const result = await DeviceTypeRepo.findAll();

		expect(models.TipNaprave.findAll).toHaveBeenCalled();
		expect(result).toBe(mockTypes);
	});

	test("findById calls TipNaprave.findByPk with id and returns data", async () => {
		const mockType = { idtip_naprave: 1, naziv: "Type1" };
		models.TipNaprave.findByPk.mockResolvedValue(mockType);

		const result = await DeviceTypeRepo.findById(1);

		expect(models.TipNaprave.findByPk).toHaveBeenCalledWith(1);
		expect(result).toBe(mockType);
	});
});
