import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Box, Typography, Paper, Alert, CircularProgress, Chip, Card, CardContent, Divider } from "@mui/material"
import { Person, AccessibilityNew, MedicalServices, Warning, Medication, CalendarToday, Wc } from "@mui/icons-material"
import api from "../../api"

interface FHIRPatient {
  resourceType: string
  id: string
  name: Array<{
    use: string
    family: string
    given: string[]
  }>
  gender: string
  birthDate: string
}

interface FHIRBundle {
  resourceType: string
  entry: Array<{
    resource: {
      resourceType: string
      id: string
      [key: string]: any
    }
  }>
}

const PatientDetailsPage = () => {
  const { id } = useParams()
  const [patientData, setPatientData] = useState<FHIRBundle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get<{ data: FHIRBundle }>(`/patients/${id}`)
        setPatientData(response.data.data)
      } catch (error) {
        console.error("Error fetching patient details:", error)
        setError("Error loading patient data")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPatientDetails()
    }
  }, [id])

  const getPatientInfo = () => {
    if (!patientData) return null
    return patientData.entry.find((entry) => entry.resource.resourceType === "Patient")?.resource as FHIRPatient
  }

  const getObservations = () => {
    if (!patientData) return []
    return patientData.entry.filter((entry) => entry.resource.resourceType === "Observation")
  }

  const getConditions = () => {
    if (!patientData) return []
    return patientData.entry.filter((entry) => entry.resource.resourceType === "Condition")
  }

  const getMedications = () => {
    if (!patientData) return []
    return patientData.entry.filter((entry) => entry.resource.resourceType === "MedicationStatement")
  }

  const getAllergies = () => {
    if (!patientData) return []
    return patientData.entry.filter((entry) => entry.resource.resourceType === "AllergyIntolerance")
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const patient = getPatientInfo()

  if (loading) {
    return (
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading patient data...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  if (!patient) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Patient not found</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
        <Person sx={{ mr: 1 }} color="primary" />
        Patient Details
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Basic Information
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <Box
            sx={{
              flex: "1 1 300px",
              minWidth: "250px",
              p: 2,
              bgcolor: "primary.50",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "primary.100",
            }}
          >
            <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 600, mb: 1 }}>
              Patient Identity
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 500, mb: 0.5 }}>
              {`${patient.name[0].given.join(" ")} ${patient.name[0].family}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ID: {patient.id}
            </Typography>
          </Box>

          <Box
            sx={{
              flex: "1 1 200px",
              minWidth: "180px",
              p: 2,
              bgcolor: "info.50",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "info.100",
            }}
          >
            <Typography variant="subtitle2" color="info.main" sx={{ fontWeight: 600, mb: 1 }}>
              Demographics
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Wc fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {patient.gender === "female" ? "Female" : "Male"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <CalendarToday fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Age: {calculateAge(patient.birthDate)} years
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              flex: "1 1 200px",
              minWidth: "180px",
              p: 2,
              bgcolor: "success.50",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "success.100",
            }}
          >
            <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 600, mb: 1 }}>
              Birth Information
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
              {new Date(patient.birthDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Date of Birth
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: 3,
          mb: 3,
        }}
      >
        <Card variant="outlined">
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
              <AccessibilityNew sx={{ mr: 1 }} color="primary" />
              Body Metrics
              <Chip label={getObservations().length} size="small" variant="outlined" sx={{ ml: 2 }} />
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {getObservations().length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {getObservations().map((obs) => (
                  <Box
                    key={obs.resource.id}
                    sx={{
                      p: 2,
                      bgcolor: "grey.50",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "grey.200",
                      minHeight: 80,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="medium">
                      {obs.resource.code.coding[0].display}
                    </Typography>
                    <Typography variant="h6" color="error.main">
                      {obs.resource.valueQuantity.value} {obs.resource.valueQuantity.unit}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                No body metrics recorded
              </Typography>
            )}
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
              <MedicalServices sx={{ mr: 1 }} color="primary" />
              Diagnoses
              <Chip label={getConditions().length} size="small" variant="outlined" sx={{ ml: 2 }} />
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {getConditions().length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {getConditions().map((condition) => (
                  <Box
                    key={condition.resource.id}
                    sx={{
                      p: 2,
                      bgcolor: "grey.50",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "grey.200",
                      minHeight: 80,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="medium">
                      {condition.resource.code.coding[0].display}
                    </Typography>
                    <Chip
                      label={condition.resource.clinicalStatus.coding[0].code === "active" ? "Active" : "Inactive"}
                      size="small"
                      color={condition.resource.clinicalStatus.coding[0].code === "active" ? "error" : "default"}
                      variant="outlined"
                      sx={{ mt: 1, alignSelf: "flex-start" }}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                No diagnoses recorded
              </Typography>
            )}
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
              <Warning sx={{ mr: 1 }} color="warning" />
              Allergies
              <Chip label={getAllergies().length} size="small" variant="outlined" sx={{ ml: 2 }} />
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {getAllergies().length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {getAllergies().map((allergy) => (
                  <Box
                    key={allergy.resource.id}
                    sx={{
                      p: 2,
                      bgcolor: "grey.50",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "grey.200",
                      minHeight: 80,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="medium">
                      {allergy.resource.code.coding[0].display}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Type: {allergy.resource.type} • Category: {allergy.resource.category.join(", ")}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                No known allergies
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      <Card variant="outlined">
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
            <Medication sx={{ mr: 1 }} color="success" />
            Medications
            <Chip label={getMedications().length} size="small" variant="outlined" sx={{ ml: 2 }} />
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {getMedications().length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 2,
              }}
            >
              {getMedications().map((med) => (
                <Box
                  key={med.resource.id}
                  sx={{
                    p: 2,
                    bgcolor: "grey.50",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "grey.200",
                    minHeight: 80,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="medium">
                    {med.resource.medicationCodeableConcept.coding[0].display}
                  </Typography>
                  <Chip
                    label={`Status: ${med.resource.status}`}
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ mt: 1, alignSelf: "flex-start" }}
                  />
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              No medications recorded
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default PatientDetailsPage
