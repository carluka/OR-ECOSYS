const userTypeService = require("../../services/userTypeService");
const userTypeRepo = require("../../repositories/userTypeRepo");

// Mocking the repository
jest.mock("../../repositories/userTypeRepo");

// Test cases for UserTypeService
describe("UserTypeService", () => {
	// Clear mocks after each test
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("listUserTypes", () => {
		test("should return all user types", async () => {
			const mockTypes = [
				{ id: 1, name: "Admin" },
				{ id: 2, name: "User" },
			];
			userTypeRepo.findAll.mockResolvedValue(mockTypes);

			const result = await userTypeService.listUserTypes();

			expect(userTypeRepo.findAll).toHaveBeenCalled();
			expect(result).toEqual(mockTypes);
		});
	});

	describe("getUserType", () => {
		test("should return user type by id", async () => {
			const mockType = { id: 1, name: "Admin" };
			userTypeRepo.findById.mockResolvedValue(mockType);

			const result = await userTypeService.getUserType(1);

			expect(userTypeRepo.findById).toHaveBeenCalledWith(1);
			expect(result).toEqual(mockType);
		});
	});
});
