const fhirService = require("../../services/fhirService");
const axios = require("axios");

// Mocking axios
jest.mock("axios");

// Test cases for FhirService
describe("FhirService", () => {
	let consoleSpy;

	beforeEach(() => {
		consoleSpy = jest.spyOn(console, "error").mockImplementation();
	});

	// Clear mocks after each test
	afterEach(() => {
		jest.clearAllMocks();
		consoleSpy.mockRestore();
	});

	describe("getPatient", () => {
		test("should return patient data when successful", async () => {
			const mockPatientData = {
				id: "123",
				name: [{ given: ["John"], family: "Doe" }],
				gender: "male",
				birthDate: "1990-01-01",
			};

			axios.get.mockResolvedValue({ status: 200, data: mockPatientData });

			const result = await fhirService.getPatient("123");

			expect(axios.get).toHaveBeenCalledWith(
				"https://hapi.fhir.org/baseR4/Patient/123/$everything?"
			);
			expect(result).toEqual(mockPatientData);
		});

		test("should log error and return null when request fails", async () => {
			const networkError = new Error("Network error");
			axios.get.mockRejectedValue(networkError);

			const result = await fhirService.getPatient("123");

			expect(consoleSpy).toHaveBeenCalledWith(
				"Error fetching patient from FHIR:",
				networkError
			);
			expect(result).toBeNull();
		});

		test("should return null when status is not 200", async () => {
			axios.get.mockResolvedValue({ status: 404 });

			const result = await fhirService.getPatient("123");

			expect(result).toBeNull();
		});
	});
});
