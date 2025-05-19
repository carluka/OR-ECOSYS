const operationService = require("../../services/operationService");
const operationRepo = require("../../repositories/operationRepo");

// Mocking the repository
jest.mock("../../repositories/operationRepo");

// Test cases for OperationService
describe("OperationService", () => {
	// Clear mocks after each test
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("listOperations", () => {
		test("should return all operations", async () => {
			const mockOperations = [{ id: 1 }, { id: 2 }];
			operationRepo.findAll.mockResolvedValue(mockOperations);

			const result = await operationService.listOperations();

			expect(operationRepo.findAll).toHaveBeenCalled();
			expect(result).toEqual(mockOperations);
		});
	});

	describe("getOperation", () => {
		test("should return operation by id", async () => {
			const mockOperation = { id: 1 };
			operationRepo.findById.mockResolvedValue(mockOperation);

			const result = await operationService.getOperation(1);

			expect(operationRepo.findById).toHaveBeenCalledWith(1);
			expect(result).toEqual(mockOperation);
		});
	});

	describe("createOperation", () => {
		test("should create new operation", async () => {
			const payload = { patientId: 1, roomId: 1 };
			const mockCreated = { id: 1, ...payload };
			operationRepo.create.mockResolvedValue(mockCreated);

			const result = await operationService.createOperation(payload);

			expect(operationRepo.create).toHaveBeenCalledWith(payload);
			expect(result).toEqual(mockCreated);
		});
	});

	describe("updateOperation", () => {
		test("should update operation", async () => {
			const id = 1;
			const payload = { status: "completed" };
			const mockUpdated = [1];
			operationRepo.update.mockResolvedValue(mockUpdated);

			const result = await operationService.updateOperation(id, payload);

			expect(operationRepo.update).toHaveBeenCalledWith(id, payload);
			expect(result).toEqual(mockUpdated);
		});
	});

	describe("deleteOperation", () => {
		test("should delete operation", async () => {
			const id = 1;
			const mockDeleted = 1;
			operationRepo.delete.mockResolvedValue(mockDeleted);

			const result = await operationService.deleteOperation(id);

			expect(operationRepo.delete).toHaveBeenCalledWith(id);
			expect(result).toEqual(mockDeleted);
		});
	});
});
