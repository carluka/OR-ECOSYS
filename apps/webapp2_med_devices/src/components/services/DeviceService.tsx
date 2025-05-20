import React, { useEffect, useState } from "react";
import {
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import api from "../../api";
import AddService from "./AddService";

interface Service {
  idservis: number;
  naprava_idnaprava: number;
  datum: string;
  ura: string;
  komentar: string;
}

interface Device {
  idnaprava: number;
  naziv: string;
}

interface Props {
  device: Device;
  onServiceAdded?: () => void;
}

const DeviceService: React.FC<Props> = ({ device, onServiceAdded }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [openAdd, setOpenAdd] = useState(false);

  // Pridobi vse servise za izbrano napravo
  const fetchServices = () => {
    setLoading(true);
    api
      .get(`/services/device/${device.idnaprava}`)
      .then((res) => setServices(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(fetchServices, [device.idnaprava]);

  const handleCheckboxChange = (id: number) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    if (selectedServices.length === services.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(services.map((s) => s.idservis));
    }
  };

  const handleDelete = () => {
    if (!selectedServices.length) {
      alert("Prosim izberi vsaj en servis za brisanje.");
      return;
    }
    api
      .delete("/services/deleteMultiple", { data: { ids: selectedServices } })
      .then(() => {
        fetchServices();
        setSelectedServices([]);
        //if (onServiceAdded) onServiceAdded();  //ČE ODSTRANIM KOMENTAR SE MODAL WINDOW ZAPRE
      })
      .catch(console.error);
  };

  const openAddModal = () => setOpenAdd(true);
  const closeAddModal = () => setOpenAdd(false);

  const onAdded = () => {
    fetchServices();
    closeAddModal();
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Servisi za: <strong>{device.naziv}</strong>
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={
                    services.length > 0 &&
                    selectedServices.length === services.length
                  }
                  indeterminate={
                    selectedServices.length > 0 &&
                    selectedServices.length < services.length
                  }
                  onChange={handleToggleAll}
                />
              </TableCell>
              <TableCell>Datum</TableCell>
              <TableCell>Ura</TableCell>
              <TableCell>Komentar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4}>Nalagam…</TableCell>
              </TableRow>
            ) : services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>Ni servisnih vnosov.</TableCell>
              </TableRow>
            ) : (
              services.map((svc) => (
                <TableRow key={svc.idservis}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedServices.includes(svc.idservis)}
                      onChange={() => handleCheckboxChange(svc.idservis)}
                    />
                  </TableCell>
                  <TableCell>{svc.datum}</TableCell>
                  <TableCell>{svc.ura}</TableCell>
                  <TableCell>{svc.komentar}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, textAlign: "right" }}>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={handleDelete} color="error">
            Odstrani servis
          </Button>
          <Button variant="outlined" onClick={openAddModal}>
            Dodaj servis
          </Button>
        </Stack>
      </Box>

      {/* AddService modal */}
      <Dialog open={openAdd} onClose={closeAddModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Dodaj servis za: {device.naziv}
          <IconButton
            aria-label="close"
            onClick={closeAddModal}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <AddService deviceId={device.idnaprava} onServiceAdded={onAdded} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DeviceService;
