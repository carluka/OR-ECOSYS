const axios = require("axios");

const FHIR_BASE_URL = "https://hapi.fhir.org/baseR4";

async function getPatient(id) {
	try {
		const response = await axios.get(
			`${FHIR_BASE_URL}/Patient/${id}/$everything?`
		);
		if (response.status === 200) {
			return response.data;
		} else {
			return null;
		}
	} catch (error) {
		console.error("Error fetching patient from FHIR:", error);
		return null;
	}
}

function mapFhirPatientToLocal(fhirPatient) {
	const patient = {
		id: fhirPatient.id,
		name:
			fhirPatient.name[0]?.given?.join(" ") + " " + fhirPatient.name[0]?.family,
		gender: fhirPatient.gender,
		birthDate: fhirPatient.birthDate,
		height: getObservation(fhirPatient, "8302-2"),
		weight: getObservation(fhirPatient, "29463-7"),
		allergies: getAllergies(fhirPatient),
		conditions: getConditions(fhirPatient),
		medications: getMedications(fhirPatient),
	};

	return patient;
}

function getObservation(fhirPatient, loincCode) {
	const observation = fhirPatient.extension?.find(
		(e) => e.url === `http://loinc.org/${loincCode}`
	);
	return observation ? observation.valueQuantity.value : null;
}

function getAllergies(fhirPatient) {
	return fhirPatient.allergyIntolerance
		? fhirPatient.allergyIntolerance.map((a) => a.code.text).join(", ")
		: null;
}

function getConditions(fhirPatient) {
	return fhirPatient.condition
		? fhirPatient.condition.map((c) => c.code.text).join(", ")
		: null;
}

function getMedications(fhirPatient) {
	return fhirPatient.medicationStatement
		? fhirPatient.medicationStatement
				.map((m) => m.medicationCodeableConcept.text)
				.join(", ")
		: null;
}

module.exports = {
	getPatient,
};
