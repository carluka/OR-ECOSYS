const deviceTypeService = require("../../services/deviceTypeService");
const deviceTypeCtrl = require("../../controllers/deviceTypeCtrl");

jest.mock("../../services/deviceTypeService");

describe("deviceTypeCtrl", () => {
	let req, res, next;

	beforeEach(() => {
		req = { params: { id: "123" } };
		res = { json: jest.fn() };
		next = jest.fn();
		jest.clearAllMocks();
	});

	describe("getAll", () => {
		it("should return device types in json response", async () => {
			const mockDeviceTypes = [{ id: 1, name: "Type1" }];
			deviceTypeService.listDeviceTypes.mockResolvedValue(mockDeviceTypes);

			await deviceTypeCtrl.getAll(req, res, next);

			expect(deviceTypeService.listDeviceTypes).toHaveBeenCalled();
			expect(res.json).toHaveBeenCalledWith({ data: mockDeviceTypes });
			expect(next).not.toHaveBeenCalled();
		});

		it("should call next with error if service throws", async () => {
			const error = new Error("Service error");
			deviceTypeService.listDeviceTypes.mockRejectedValue(error);

			await deviceTypeCtrl.getAll(req, res, next);

			expect(next).toHaveBeenCalledWith(error);
			expect(res.json).not.toHaveBeenCalled();
		});
	});

	describe("getById", () => {
		it("should return device type by id in json response", async () => {
			const mockDeviceType = { id: "123", name: "TypeA" };
			deviceTypeService.getDeviceType.mockResolvedValue(mockDeviceType);

			await deviceTypeCtrl.getById(req, res, next);

			expect(deviceTypeService.getDeviceType).toHaveBeenCalledWith("123");
			expect(res.json).toHaveBeenCalledWith({ data: mockDeviceType });
			expect(next).not.toHaveBeenCalled();
		});

		it("should call next with error if service throws", async () => {
			const error = new Error("Not found");
			deviceTypeService.getDeviceType.mockRejectedValue(error);

			await deviceTypeCtrl.getById(req, res, next);

			expect(next).toHaveBeenCalledWith(error);
			expect(res.json).not.toHaveBeenCalled();
		});
	});
});
