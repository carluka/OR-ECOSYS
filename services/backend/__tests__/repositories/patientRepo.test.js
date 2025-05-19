const PatientRepo = require("../../repositories/patientRepo");

jest.mock("../../db/database", () => ({
	models: {
		Pacient: {
			findAll: jest.fn(),
			findByPk: jest.fn(),
			create: jest.fn(),
			// we still have to implement update and delete
		},
	},
}));

const { models } = require("../../db/database");

describe("PatientRepo", () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	test("findAll calls Pacient.findAll and returns data", async () => {
		const mockPatients = [{ id: 1, name: "Janez" }];
		models.Pacient.findAll.mockResolvedValue(mockPatients);

		const result = await PatientRepo.findAll();

		expect(models.Pacient.findAll).toHaveBeenCalled();
		expect(result).toBe(mockPatients);
	});

	test("findById calls Pacient.findByPk with id and returns data", async () => {
		const mockPatient = { id: 1, name: "Janez" };
		models.Pacient.findByPk.mockResolvedValue(mockPatient);

		const result = await PatientRepo.findById(1);

		expect(models.Pacient.findByPk).toHaveBeenCalledWith(1);
		expect(result).toBe(mockPatient);
	});

	test("create calls Pacient.create with data and returns created object", async () => {
		const data = { name: "Janez" };
		const mockCreated = { id: 1, ...data };
		models.Pacient.create.mockResolvedValue(mockCreated);

		const result = await PatientRepo.create(data);

		expect(models.Pacient.create).toHaveBeenCalledWith(data);
		expect(result).toBe(mockCreated);
	});

	test.skip("update - to be implemented", () => {});
	test.skip("delete - to be implemented", () => {});
});
