import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import api from "../../api";

interface FHIRPatient {
  resourceType: string;
  id: string;
  name: Array<{
    use: string;
    family: string;
    given: string[];
  }>;
  gender: string;
  birthDate: string;
}

interface FHIRBundle {
  resourceType: string;
  entry: Array<{
    resource: {
      resourceType: string;
      id: string;
      [key: string]: any;
    };
  }>;
}

const PatientDetailsPage = () => {
  const { id } = useParams();
  const [patientData, setPatientData] = useState<FHIRBundle | null>(null);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const response = await api.get<{ data: FHIRBundle }>(`/patients/${id}`);
        setPatientData(response.data.data);
      } catch (error) {
        console.error("Error fetching patient details:", error);
      }
    };

    if (id) {
      fetchPatientDetails();
    }
  }, [id]);

  const getPatientInfo = () => {
    if (!patientData) return null;
    return patientData.entry.find(
      (entry) => entry.resource.resourceType === "Patient"
    )?.resource as FHIRPatient;
  };

  const getObservations = () => {
    if (!patientData) return [];
    return patientData.entry.filter(
      (entry) => entry.resource.resourceType === "Observation"
    );
  };

  const getConditions = () => {
    if (!patientData) return [];
    return patientData.entry.filter(
      (entry) => entry.resource.resourceType === "Condition"
    );
  };

  const getMedications = () => {
    if (!patientData) return [];
    return patientData.entry.filter(
      (entry) => entry.resource.resourceType === "MedicationStatement"
    );
  };

  const getAllergies = () => {
    if (!patientData) return [];
    return patientData.entry.filter(
      (entry) => entry.resource.resourceType === "AllergyIntolerance"
    );
  };

  const patient = getPatientInfo();

  if (!patient) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Podrobnosti pacienta
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        <Paper sx={{ p: 2, flex: "1 1 300px" }}>
          <Typography variant="h6" gutterBottom>
            Osebni podatki
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Ime in priimek"
                secondary={`${patient.name[0].given.join(" ")} ${
                  patient.name[0].family
                }`}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Spol"
                secondary={patient.gender === "female" ? "Ženska" : "Moški"}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Datum rojstva"
                secondary={new Date(patient.birthDate).toLocaleDateString(
                  "sl-SI"
                )}
              />
            </ListItem>
          </List>
        </Paper>

        <Paper sx={{ p: 2, flex: "1 1 300px" }}>
          <Typography variant="h6" gutterBottom>
            Vitalni znaki
          </Typography>
          <List>
            {getObservations().map((obs) => (
              <ListItem key={obs.resource.id}>
                <ListItemText
                  primary={obs.resource.code.coding[0].display}
                  secondary={`${obs.resource.valueQuantity.value} ${obs.resource.valueQuantity.unit}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Paper sx={{ p: 2, flex: "1 1 300px" }}>
          <Typography variant="h6" gutterBottom>
            Diagnoze
          </Typography>
          <List>
            {getConditions().map((condition) => (
              <ListItem key={condition.resource.id}>
                <ListItemText
                  primary={condition.resource.code.coding[0].display}
                  secondary={
                    condition.resource.clinicalStatus.coding[0].code ===
                    "active"
                      ? "Aktivna"
                      : "Neaktivna"
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Paper sx={{ p: 2, flex: "1 1 300px" }}>
          <Typography variant="h6" gutterBottom>
            Alergije
          </Typography>
          <List>
            {getAllergies().map((allergy) => (
              <ListItem key={allergy.resource.id}>
                <ListItemText
                  primary={allergy.resource.code.coding[0].display}
                  secondary={`${
                    allergy.resource.type
                  } - ${allergy.resource.category.join(", ")}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Paper sx={{ p: 2, flex: "1 1 100%" }}>
          <Typography variant="h6" gutterBottom>
            Zdravila
          </Typography>
          <List>
            {getMedications().map((med) => (
              <ListItem key={med.resource.id}>
                <ListItemText
                  primary={
                    med.resource.medicationCodeableConcept.coding[0].display
                  }
                  secondary={`Status: ${med.resource.status}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </Box>
  );
};

export default PatientDetailsPage;
