const patientRepo = require("../repositories/patientRepo");

// TO-DO
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

    return null; // Če ni podatkov niti v bazi niti na FHIR
  }

  async createPatient(payload) {
    // TODO: optionally push to FHIR
    return patientRepo.create(payload);
  }

  async updatePatient(id, payload) {
    // TODO: sync with FHIR if used
    return patientRepo.update(id, payload);
  }

  async deletePatient(id) {
    // TODO: ensure no operations exist
    return patientRepo.delete(id);
  }
}

module.exports = new PatientService();
