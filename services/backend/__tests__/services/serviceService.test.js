const serviceService = require("../../services/serviceService");
const serviceRepo = require("../../repositories/serviceRepo");

// Mocking the repository
jest.mock("../../repositories/serviceRepo");

// Test cases for ServiceService
describe("ServiceService", () => {
	// Clear mocks after each test
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("listServices", () => {
		test("should return all services", async () => {
			const mockServices = [{ id: 1 }, { id: 2 }];
			serviceRepo.findAll.mockResolvedValue(mockServices);

			const result = await serviceService.listServices();

			expect(serviceRepo.findAll).toHaveBeenCalled();
			expect(result).toEqual(mockServices);
		});
	});

	describe("getService", () => {
		test("should return service by id", async () => {
			const mockService = { id: 1 };
			serviceRepo.findById.mockResolvedValue(mockService);

			const result = await serviceService.getService(1);

			expect(serviceRepo.findById).toHaveBeenCalledWith(1);
			expect(result).toEqual(mockService);
		});
	});

	describe("createService", () => {
		test("should create new service", async () => {
			const payload = { deviceId: 1, name: "Test Service" };
			const mockCreated = { id: 1, ...payload };
			serviceRepo.create.mockResolvedValue(mockCreated);

			const result = await serviceService.createService(payload);

			expect(serviceRepo.create).toHaveBeenCalledWith(payload);
			expect(result).toEqual(mockCreated);
		});
	});

	describe("updateService", () => {
		test("should update service", async () => {
			const id = 1;
			const payload = { name: "Updated Service" };
			const mockUpdated = [1];
			serviceRepo.update.mockResolvedValue(mockUpdated);

			const result = await serviceService.updateService(id, payload);

			expect(serviceRepo.update).toHaveBeenCalledWith(id, payload);
			expect(result).toEqual(mockUpdated);
		});
	});

	describe("deleteService", () => {
		test("should delete service", async () => {
			const id = 1;
			const mockDeleted = 1;
			serviceRepo.delete.mockResolvedValue(mockDeleted);

			const result = await serviceService.deleteService(id);

			expect(serviceRepo.delete).toHaveBeenCalledWith(id);
			expect(result).toEqual(mockDeleted);
		});
	});

	describe("getServicesByDeviceId", () => {
		test("should return services for device", async () => {
			const deviceId = 1;
			const mockServices = [{ id: 1, deviceId: 1 }];
			serviceRepo.findByDeviceId.mockResolvedValue(mockServices);

			const result = await serviceService.getServicesByDeviceId(deviceId);

			expect(serviceRepo.findByDeviceId).toHaveBeenCalledWith(deviceId);
			expect(result).toEqual(mockServices);
		});
	});

	describe("deleteServices", () => {
		test("should delete multiple services", async () => {
			const ids = [1, 2, 3];
			const mockDeleted = 3;
			serviceRepo.deleteMultiple.mockResolvedValue(mockDeleted);

			const result = await serviceService.deleteServices(ids);

			expect(serviceRepo.deleteMultiple).toHaveBeenCalledWith(ids);
			expect(result).toEqual(mockDeleted);
		});
	});

	describe("getBooleanServices", () => {
		test("should return boolean services", async () => {
			const mockServices = [{ id: 1, type: "boolean" }];
			serviceRepo.getBooleanServices.mockResolvedValue(mockServices);

			const result = await serviceService.getBooleanServices();

			expect(serviceRepo.getBooleanServices).toHaveBeenCalled();
			expect(result).toEqual(mockServices);
		});
	});
});
