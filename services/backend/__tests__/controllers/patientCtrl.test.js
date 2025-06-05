const patientCtrl = require("../../controllers/patientCtrl");
const patientService = require("../../services/patientService");

jest.mock("../../services/patientService");

describe("patientCtrl", () => {
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
		it("should return all patients", async () => {
			const patients = [{ id: 1 }, { id: 2 }];
			patientService.listPatients.mockResolvedValue(patients);

			await patientCtrl.getAll(req, res, next);

			expect(patientService.listPatients).toHaveBeenCalled();
			expect(res.json).toHaveBeenCalledWith({ data: patients });
		});

		it("should call next with error on failure", async () => {
			const error = new Error("fail");
			patientService.listPatients.mockRejectedValue(error);

			await patientCtrl.getAll(req, res, next);

			expect(next).toHaveBeenCalledWith(error);
		});
	});

	describe("getById", () => {
		it("should return patient by id", async () => {
			const patient = { id: "123" };
			req.params.id = "123";
			patientService.getPatient.mockResolvedValue(patient);

			await patientCtrl.getById(req, res, next);

			expect(patientService.getPatient).toHaveBeenCalledWith("123");
			expect(res.json).toHaveBeenCalledWith({ data: patient });
		});

		it("should call next with error on failure", async () => {
			const error = new Error("fail");
			req.params.id = "123";
			patientService.getPatient.mockRejectedValue(error);

			await patientCtrl.getById(req, res, next);

			expect(next).toHaveBeenCalledWith(error);
		});
	});

	describe("create", () => {
		it("should create a new patient", async () => {
			const newPatient = { id: "1", name: "John" };
			req.body = { name: "John" };
			patientService.createPatient.mockResolvedValue(newPatient);

			await patientCtrl.create(req, res, next);

			expect(patientService.createPatient).toHaveBeenCalledWith(req.body);
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith({ data: newPatient });
		});

		it("should call next with error on failure", async () => {
			const error = new Error("fail");
			patientService.createPatient.mockRejectedValue(error);

			await patientCtrl.create(req, res, next);

			expect(next).toHaveBeenCalledWith(error);
		});
	});

	describe("update", () => {
		it("should update a patient", async () => {
			req.params.id = "1";
			req.body = { name: "Jane" };
			patientService.updatePatient.mockResolvedValue();

			await patientCtrl.update(req, res, next);

			expect(patientService.updatePatient).toHaveBeenCalledWith("1", req.body);
			expect(res.status).toHaveBeenCalledWith(204);
			expect(res.end).toHaveBeenCalled();
		});

		it("should call next with error on failure", async () => {
			const error = new Error("fail");
			req.params.id = "1";
			patientService.updatePatient.mockRejectedValue(error);

			await patientCtrl.update(req, res, next);

			expect(next).toHaveBeenCalledWith(error);
		});
	});

	describe("remove", () => {
		it("should delete a patient", async () => {
			req.params.id = "1";
			patientService.deletePatient.mockResolvedValue();

			await patientCtrl.remove(req, res, next);

			expect(patientService.deletePatient).toHaveBeenCalledWith("1");
			expect(res.status).toHaveBeenCalledWith(204);
			expect(res.end).toHaveBeenCalled();
		});

		it("should call next with error on failure", async () => {
			const error = new Error("fail");
			req.params.id = "1";
			patientService.deletePatient.mockRejectedValue(error);

			await patientCtrl.remove(req, res, next);

			expect(next).toHaveBeenCalledWith(error);
		});
	});
});
