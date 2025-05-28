import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import api from "../../api";

interface Operation {
  idoperacija: number;
  datum: string;
  cas_zacetka: string;
  cas_konca: string;
  Pacient: {
    idpacient: number;
    ime: string;
    priimek: string;
  };
  Soba: {
    idsoba: number;
    naziv: string;
  };
}

interface ApiResponse {
  data: Operation[];
}

const OperationsPage = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOperations = async () => {
      try {
        const response = await api.get<ApiResponse>("/operations");
        console.log("Fetched operations:", response.data.data);
        setOperations(response.data.data);
      } catch (error) {
        console.error("Error fetching operations:", error);
      }
    };

    fetchOperations();
  }, []);

  const handleRowClick = (operationId: number) => {
    navigate(`/operations/${operationId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Operation List
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>               
            </TableRow>
          </TableHead>
          <TableBody>
            {operations.map((operation) => (
                <TableRow
                key={operation.idoperacija}
                onClick={() => handleRowClick(operation.idoperacija)}
                sx={{
                    cursor: "pointer",
                    "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                }}
                >
                <TableCell>{operation.idoperacija}</TableCell>
                <TableCell>
                    {operation.Pacient?.ime} {operation.Pacient?.priimek}
                </TableCell>
                <TableCell>{operation.Soba?.naziv}</TableCell>
                <TableCell>{operation.datum}</TableCell>
                <TableCell>{operation.cas_zacetka}</TableCell>
                <TableCell>{operation.cas_konca}</TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OperationsPage;
