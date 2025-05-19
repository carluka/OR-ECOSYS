const deviceService = require("../../services/deviceService");
const deviceRepo = require("../../repositories/deviceRepo");

// Mocking the repository
jest.mock("../../repositories/deviceRepo");

// Test cases for DeviceService
describe("DeviceService", () => {
	// Clear mocks after each test
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("listDevices", () => {
		test("should return all devices", async () => {
			const mockDevices = [{ id: 1 }, { id: 2 }];
			deviceRepo.findAll.mockResolvedValue(mockDevices);

			const result = await deviceService.listDevices();

			expect(deviceRepo.findAll).toHaveBeenCalled();
			expect(result).toEqual(mockDevices);
		});
	});

	describe("getDevice", () => {
		test("should return device by id", async () => {
			const mockDevice = { id: 1 };
			deviceRepo.findById.mockResolvedValue(mockDevice);

			const result = await deviceService.getDevice(1);

			expect(deviceRepo.findById).toHaveBeenCalledWith(1);
			expect(result).toEqual(mockDevice);
		});
	});

	describe("createDevice", () => {
		test("should create new device", async () => {
			const payload = { name: "Test Device" };
			const mockCreated = { id: 1, ...payload };
			deviceRepo.create.mockResolvedValue(mockCreated);

			const result = await deviceService.createDevice(payload);

			expect(deviceRepo.create).toHaveBeenCalledWith(payload);
			expect(result).toEqual(mockCreated);
		});
	});

	describe("updateDevice", () => {
		test("should update device", async () => {
			const id = 1;
			const payload = { name: "Updated Device" };
			const mockUpdated = [1];
			deviceRepo.update.mockResolvedValue(mockUpdated);

			const result = await deviceService.updateDevice(id, payload);

			expect(deviceRepo.update).toHaveBeenCalledWith(id, payload);
			expect(result).toEqual(mockUpdated);
		});
	});

	describe("deleteDevice", () => {
		test("should delete device", async () => {
			const id = 1;
			const mockDeleted = 1;
			deviceRepo.delete.mockResolvedValue(mockDeleted);

			const result = await deviceService.deleteDevice(id);

			expect(deviceRepo.delete).toHaveBeenCalledWith(id);
			expect(result).toEqual(mockDeleted);
		});
	});

	describe("deleteDevices", () => {
		test("should delete multiple devices", async () => {
			const ids = [1, 2, 3];
			const mockDeleted = 3;
			deviceRepo.deleteMultiple.mockResolvedValue(mockDeleted);

			const result = await deviceService.deleteDevices(ids);

			expect(deviceRepo.deleteMultiple).toHaveBeenCalledWith(ids);
			expect(result).toEqual(mockDeleted);
		});
	});

	describe("getDevices", () => {
		test("should get devices with filters", async () => {
			const filters = { type: "test" };
			const mockDevices = [{ id: 1 }];
			deviceRepo.getDevices.mockResolvedValue(mockDevices);

			const result = await deviceService.getDevices(filters);

			expect(deviceRepo.getDevices).toHaveBeenCalledWith(filters);
			expect(result).toEqual(mockDevices);
		});
	});
});
