const deviceTypeService = require("../../services/deviceTypeService");
const deviceTypeRepo = require("../../repositories/deviceTypeRepo");

// Mocking the repository
jest.mock("../../repositories/deviceTypeRepo");

// Test cases for DeviceTypeService
describe("DeviceTypeService", () => {
	// Clear mocks after each test
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("listDeviceTypes", () => {
		test("should return all device types", async () => {
			const mockTypes = [
				{ id: 1, name: "Type 1" },
				{ id: 2, name: "Type 2" },
			];
			deviceTypeRepo.findAll.mockResolvedValue(mockTypes);

			const result = await deviceTypeService.listDeviceTypes();

			expect(deviceTypeRepo.findAll).toHaveBeenCalled();
			expect(result).toEqual(mockTypes);
		});
	});

	describe("getDeviceType", () => {
		test("should return device type by id", async () => {
			const mockType = { id: 1, name: "Type 1" };
			deviceTypeRepo.findById.mockResolvedValue(mockType);

			const result = await deviceTypeService.getDeviceType(1);

			expect(deviceTypeRepo.findById).toHaveBeenCalledWith(1);
			expect(result).toEqual(mockType);
		});
	});
});
