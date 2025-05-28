const operationService = require("../../services/operationService");
const operationCtrl = require("../../controllers/operationCtrl");

jest.mock("../../services/operationService");

describe("operationCtrl", () => {
	let req, res, next;

	beforeEach(() => {
		req = { params: {}, body: {} };
		res = {
			json: jest.fn(),
			status: jest.fn().mockReturnThis(),
			end: jest.fn(),
		};
		next = jest.fn();
		jest.clearAllMocks();
	});

	describe("getAll", () => {
		it("should return all operations", async () => {
			const ops = [{ id: 1 }, { id: 2 }];
			operationService.listOperations.mockResolvedValue(ops);

			await operationCtrl.getAll(req, res, next);

			expect(operationService.listOperations).toHaveBeenCalled();
			expect(res.json).toHaveBeenCalledWith({ data: ops });
		});

		it("should call next on error", async () => {
			const error = new Error("fail");
			operationService.listOperations.mockRejectedValue(error);

			await operationCtrl.getAll(req, res, next);

			expect(next).toHaveBeenCalledWith(error);
		});
	});

	describe("getById", () => {
		it("should return operation by id", async () => {
			const op = { id: 1 };
			req.params.id = "1";
			operationService.getOperation.mockResolvedValue(op);

			await operationCtrl.getById(req, res, next);

			expect(operationService.getOperation).toHaveBeenCalledWith("1");
			expect(res.json).toHaveBeenCalledWith({ data: op });
		});

		it("should call next on error", async () => {
			const error = new Error("fail");
			req.params.id = "1";
			operationService.getOperation.mockRejectedValue(error);

			await operationCtrl.getById(req, res, next);

			expect(next).toHaveBeenCalledWith(error);
		});
	});

	describe("create", () => {
		it("should create a new operation", async () => {
			const newOp = { id: 1, name: "test" };
			req.body = { name: "test" };
			operationService.createOperation.mockResolvedValue(newOp);

			await operationCtrl.create(req, res, next);

			expect(operationService.createOperation).toHaveBeenCalledWith(req.body);
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith({ data: newOp });
		});

		it("should call next on error", async () => {
			const error = new Error("fail");
			operationService.createOperation.mockRejectedValue(error);

			await operationCtrl.create(req, res, next);

			expect(next).toHaveBeenCalledWith(error);
		});
	});

	describe("update", () => {
		it("should update an operation", async () => {
			req.params.id = "1";
			req.body = { name: "updated" };
			operationService.updateOperation.mockResolvedValue();

			await operationCtrl.update(req, res, next);

			expect(operationService.updateOperation).toHaveBeenCalledWith(
				"1",
				req.body
			);
			expect(res.status).toHaveBeenCalledWith(204);
			expect(res.end).toHaveBeenCalled();
		});

		it("should call next on error", async () => {
			const error = new Error("fail");
			req.params.id = "1";
			operationService.updateOperation.mockRejectedValue(error);

			await operationCtrl.update(req, res, next);

			expect(next).toHaveBeenCalledWith(error);
		});
	});

	describe("remove", () => {
		it("should delete an operation", async () => {
			req.params.id = "1";
			operationService.deleteOperation.mockResolvedValue();

			await operationCtrl.remove(req, res, next);

			expect(operationService.deleteOperation).toHaveBeenCalledWith("1");
			expect(res.status).toHaveBeenCalledWith(204);
			expect(res.end).toHaveBeenCalled();
		});

		it("should call next on error", async () => {
			const error = new Error("fail");
			req.params.id = "1";
			operationService.deleteOperation.mockRejectedValue(error);

			await operationCtrl.remove(req, res, next);

			expect(next).toHaveBeenCalledWith(error);
		});
	});
});
