import type React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import api from "../..//api";

interface Patient {
  idpacient: number;
  ime: string;
  priimek: string;
  gender?: string;
  birthDate?: string;
}

interface ApiResponse {
  patients?: Patient[];
  data?: Patient[];
}

interface PatientSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onPatientSelected?: (patient: Patient) => void;
  operationID: number | null;
}

const PatientSelectionModal: React.FC<PatientSelectionModalProps> = ({
  open,
  onClose,
  onPatientSelected,
  operationID,
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchPatients();
    }
  }, [open]);

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<ApiResponse>("/patients");
      // Handle different possible response structures
      const patientsData =
        response.data?.patients || response.data?.data || response.data || [];
      setPatients(Array.isArray(patientsData) ? patientsData : []);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
      setError("Failed to load patients. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleConfirm = async () => {
    if (!selectedPatient) return;

    setSubmitting(true);
    try {
      await api.put(`/operations/${operationID}`, {
        patientId: selectedPatient.idpacient,
      });

      onPatientSelected?.(selectedPatient);
      onClose();
    } catch (err) {
      console.error("Failed to add patient to operation:", err);
      setError("Failed to add patient to operation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting && selectedPatient) {
      setSelectedPatient(null);
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: "400px" },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          Select Patient for Operation
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {loading && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && patients.length === 0 && (
          <Typography variant="body1" color="text.secondary" textAlign="center">
            No patients found.
          </Typography>
        )}

        {!loading && patients.length > 0 && (
          <List>
            {patients.map((patient) => (
              <ListItem key={patient.idpacient} disablePadding>
                <ListItemButton
                  selected={selectedPatient?.idpacient === patient.idpacient}
                  onClick={() => handlePatientSelect(patient)}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    "&.Mui-selected": {
                      backgroundColor: "primary.light",
                      "&:hover": {
                        backgroundColor: "primary.light",
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary={`${patient.ime} ${patient.priimek}`}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          ID: {patient.idpacient}
                        </Typography>
                        {(patient.gender || patient.birthDate) && (
                          <Typography variant="body2" color="text.secondary">
                            {patient.gender && `Gender: ${patient.gender}`}
                            {patient.gender && patient.birthDate && " • "}
                            {patient.birthDate &&
                              `Birth Date: ${new Date(
                                patient.birthDate
                              ).toLocaleDateString()}`}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={submitting} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!selectedPatient || submitting}
          variant="contained"
          color="primary"
        >
          {submitting ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Adding Patient...
            </>
          ) : (
            "Confirm Selection"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PatientSelectionModal;
