const patientService = require("../../services/patientService");
const patientRepo = require("../../repositories/patientRepo");
const fhirService = require("../../services/fhirService");

// Mocking the repositories and services
jest.mock("../../repositories/patientRepo");
jest.mock("../../services/fhirService");

// Test cases for PatientService
describe("PatientService", () => {
	// Clear mocks after each test
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("listPatients", () => {
		test("should return all patients", async () => {
			const mockPatients = [{ id: 1 }, { id: 2 }];
			patientRepo.findAll.mockResolvedValue(mockPatients);

			const result = await patientService.listPatients();

			expect(patientRepo.findAll).toHaveBeenCalled();
			expect(result).toEqual(mockPatients);
		});
	});

	describe("getPatient", () => {
		test("should return FHIR patient data when available", async () => {
			const mockLocalPatient = { id: 1, fhir_info: "fhir123" };
			const mockFhirPatient = { id: "fhir123", name: "John Doe" };

			patientRepo.findById.mockResolvedValue(mockLocalPatient);
			fhirService.getPatient.mockResolvedValue(mockFhirPatient);

			const result = await patientService.getPatient(1);

			expect(patientRepo.findById).toHaveBeenCalledWith(1);
			expect(fhirService.getPatient).toHaveBeenCalledWith("fhir123");
			expect(result).toEqual(mockFhirPatient);
		});

		test("should return null when FHIR data is not available", async () => {
			const mockLocalPatient = { id: 1, fhir_info: "fhir123" };

			patientRepo.findById.mockResolvedValue(mockLocalPatient);
			fhirService.getPatient.mockResolvedValue(null);

			const result = await patientService.getPatient(1);

			expect(result).toBeNull();
		});
	});

	describe("createPatient", () => {
		test("should create new patient", async () => {
			const payload = { name: "John Doe" };
			const mockCreated = { id: 1, ...payload };
			patientRepo.create.mockResolvedValue(mockCreated);

			const result = await patientService.createPatient(payload);

			expect(patientRepo.create).toHaveBeenCalledWith(payload);
			expect(result).toEqual(mockCreated);
		});
	});

	describe("updatePatient", () => {
		test("should update patient", async () => {
			const id = 1;
			const payload = { name: "Updated Name" };
			const mockUpdated = [1];
			patientRepo.update.mockResolvedValue(mockUpdated);

			const result = await patientService.updatePatient(id, payload);

			expect(patientRepo.update).toHaveBeenCalledWith(id, payload);
			expect(result).toEqual(mockUpdated);
		});
	});

	describe("deletePatient", () => {
		test("should delete patient", async () => {
			const id = 1;
			const mockDeleted = 1;
			patientRepo.delete.mockResolvedValue(mockDeleted);

			const result = await patientService.deletePatient(id);

			expect(patientRepo.delete).toHaveBeenCalledWith(id);
			expect(result).toEqual(mockDeleted);
		});
	});
});
