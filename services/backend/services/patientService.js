const patientRepo = require('../repositories/patientRepo');

// TO-DO
//const fhirService = require('./fhirService');

class PatientService {
  async listPatients() {
    // TODO: you might merge FHIR and local data
    return patientRepo.findAll();
  }

  async getPatient(id) {
    // TODO: fetch from local DB or fallback to FHIR
    const local = await patientRepo.findById(id);
    if (local) return local;
    return fhirService.getPatient(id);
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
