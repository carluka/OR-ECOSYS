const serviceCtrl = require("../../controllers/serviceCtrl");
const servisService = require("../../services/serviceService");

jest.mock("../../services/serviceService");

const mockRes = () => {
	const res = {};
	res.status = jest.fn().mockReturnValue(res);
	res.json = jest.fn().mockReturnValue(res);
	res.end = jest.fn();
	return res;
};

const mockNext = jest.fn();

describe("serviceCtrl", () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("getAll", () => {
		it("should return all services", async () => {
			const services = [{ id: 1 }, { id: 2 }];
			servisService.listServices.mockResolvedValue(services);
			const req = {};
			const res = mockRes();

			await serviceCtrl.getAll(req, res, mockNext);

			expect(servisService.listServices).toHaveBeenCalled();
			expect(res.json).toHaveBeenCalledWith({ data: services });
		});

		it("should call next on error", async () => {
			const error = new Error("fail");
			servisService.listServices.mockRejectedValue(error);
			const req = {};
			const res = mockRes();

			await serviceCtrl.getAll(req, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});

	describe("getById", () => {
		it("should return service by id", async () => {
			const service = { id: 1 };
			servisService.getService.mockResolvedValue(service);
			const req = { params: { id: 1 } };
			const res = mockRes();

			await serviceCtrl.getById(req, res, mockNext);

			expect(servisService.getService).toHaveBeenCalledWith(1);
			expect(res.json).toHaveBeenCalledWith({ data: service });
		});

		it("should call next on error", async () => {
			const error = new Error("fail");
			servisService.getService.mockRejectedValue(error);
			const req = { params: { id: 1 } };
			const res = mockRes();

			await serviceCtrl.getById(req, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});

	describe("create", () => {
		it("should create a new service", async () => {
			const newService = { id: 1, name: "test" };
			servisService.createService.mockResolvedValue(newService);
			const req = { body: { name: "test" } };
			const res = mockRes();

			await serviceCtrl.create(req, res, mockNext);

			expect(servisService.createService).toHaveBeenCalledWith({
				name: "test",
			});
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith({ data: newService });
		});

		it("should call next on error", async () => {
			const error = new Error("fail");
			servisService.createService.mockRejectedValue(error);
			const req = { body: {} };
			const res = mockRes();

			await serviceCtrl.create(req, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});

	describe("update", () => {
		it("should update a service", async () => {
			servisService.updateService.mockResolvedValue();
			const req = { params: { id: 1 }, body: { name: "updated" } };
			const res = mockRes();

			await serviceCtrl.update(req, res, mockNext);

			expect(servisService.updateService).toHaveBeenCalledWith(1, {
				name: "updated",
			});
			expect(res.status).toHaveBeenCalledWith(204);
			expect(res.end).toHaveBeenCalled();
		});

		it("should call next on error", async () => {
			const error = new Error("fail");
			servisService.updateService.mockRejectedValue(error);
			const req = { params: { id: 1 }, body: {} };
			const res = mockRes();

			await serviceCtrl.update(req, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});

	describe("remove", () => {
		it("should remove a service", async () => {
			servisService.deleteService.mockResolvedValue();
			const req = { params: { id: 1 } };
			const res = mockRes();

			await serviceCtrl.remove(req, res, mockNext);

			expect(servisService.deleteService).toHaveBeenCalledWith(1);
			expect(res.status).toHaveBeenCalledWith(204);
			expect(res.end).toHaveBeenCalled();
		});

		it("should call next on error", async () => {
			const error = new Error("fail");
			servisService.deleteService.mockRejectedValue(error);
			const req = { params: { id: 1 } };
			const res = mockRes();

			await serviceCtrl.remove(req, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});

	describe("getByDeviceId", () => {
		it("should return services by device id", async () => {
			const services = [{ id: 1 }];
			servisService.getServicesByDeviceId.mockResolvedValue(services);
			const req = { params: { id: 2 } };
			const res = mockRes();

			await serviceCtrl.getByDeviceId(req, res, mockNext);

			expect(servisService.getServicesByDeviceId).toHaveBeenCalledWith(2);
			expect(res.json).toHaveBeenCalledWith({ data: services });
		});

		it("should call next on error", async () => {
			const error = new Error("fail");
			servisService.getServicesByDeviceId.mockRejectedValue(error);
			const req = { params: { id: 2 } };
			const res = mockRes();

			await serviceCtrl.getByDeviceId(req, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});

	describe("removeMultiple", () => {
		it("should remove multiple services", async () => {
			servisService.deleteServices.mockResolvedValue();
			const req = { body: { ids: [1, 2, 3] } };
			const res = mockRes();

			await serviceCtrl.removeMultiple(req, res, mockNext);

			expect(servisService.deleteServices).toHaveBeenCalledWith([1, 2, 3]);
			expect(res.status).toHaveBeenCalledWith(204);
			expect(res.end).toHaveBeenCalled();
		});

		it("should call next on error", async () => {
			const error = new Error("fail");
			servisService.deleteServices.mockRejectedValue(error);
			const req = { body: { ids: [1, 2, 3] } };
			const res = mockRes();

			await serviceCtrl.removeMultiple(req, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});

	describe("getBooleanServices", () => {
		it("should return boolean services", async () => {
			const services = [{ id: 1, type: "boolean" }];
			servisService.getBooleanServices.mockResolvedValue(services);
			const req = {};
			const res = mockRes();

			await serviceCtrl.getBooleanServices(req, res, mockNext);

			expect(servisService.getBooleanServices).toHaveBeenCalled();
			expect(res.json).toHaveBeenCalledWith({ data: services });
		});

		it("should call next on error", async () => {
			const error = new Error("fail");
			servisService.getBooleanServices.mockRejectedValue(error);
			const req = {};
			const res = mockRes();

			await serviceCtrl.getBooleanServices(req, res, mockNext);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});
});
