const userTypeService = require("../../services/userTypeService");
const userTypeCtrl = require("../../controllers/userTypeCtrl");

jest.mock("../../services/userTypeService");

describe("userTypeCtrl", () => {
	let req, res, next;

	beforeEach(() => {
		req = { params: { id: "123" } };
		res = { json: jest.fn() };
		next = jest.fn();
		jest.clearAllMocks();
	});

	describe("getAll", () => {
		it("should return user types in json response", async () => {
			const mockUserTypes = [{ id: 1, name: "Admin" }];
			userTypeService.listUserTypes.mockResolvedValue(mockUserTypes);

			await userTypeCtrl.getAll(req, res, next);

			expect(userTypeService.listUserTypes).toHaveBeenCalled();
			expect(res.json).toHaveBeenCalledWith({ data: mockUserTypes });
			expect(next).not.toHaveBeenCalled();
		});

		it("should call next with error if service fails", async () => {
			const error = new Error("Service error");
			userTypeService.listUserTypes.mockRejectedValue(error);

			await userTypeCtrl.getAll(req, res, next);

			expect(next).toHaveBeenCalledWith(error);
			expect(res.json).not.toHaveBeenCalled();
		});
	});

	describe("getById", () => {
		it("should return user type by id in json response", async () => {
			const mockUserType = { id: "123", name: "User" };
			userTypeService.getUserType.mockResolvedValue(mockUserType);

			await userTypeCtrl.getById(req, res, next);

			expect(userTypeService.getUserType).toHaveBeenCalledWith("123");
			expect(res.json).toHaveBeenCalledWith({ data: mockUserType });
			expect(next).not.toHaveBeenCalled();
		});

		it("should call next with error if service fails", async () => {
			const error = new Error("Not found");
			userTypeService.getUserType.mockRejectedValue(error);

			await userTypeCtrl.getById(req, res, next);

			expect(next).toHaveBeenCalledWith(error);
			expect(res.json).not.toHaveBeenCalled();
		});
	});
});
