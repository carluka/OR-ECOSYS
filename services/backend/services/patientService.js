const patientRepo = require("../repositories/patientRepo");

const fhirService = require("./fhirService");

class PatientService {
	async listPatients() {
		return patientRepo.findAll();
	}

	async getPatient(id) {
		const local = await patientRepo.findById(id);
		const fhir_id = local.fhir_info; // V PRIHODNOSTI SPREMENITI NA fhir_id

		const fhirPatient = await fhirService.getPatient(fhir_id);
		if (fhirPatient) {
			return fhirPatient;
		}

		return null;
	}

	async createPatient(payload) {
		return patientRepo.create(payload);
	}

	async updatePatient(id, payload) {
		return patientRepo.update(id, payload);
	}

	async deletePatient(id) {
		return patientRepo.delete(id);
	}
}

module.exports = new PatientService();
