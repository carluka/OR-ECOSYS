import "./HomePage.css";
import { useEffect, useState } from "react";
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
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../api";

interface Room {
  idsoba: number;
  naziv: string;
  lokacija: string;
}

interface ApiResponse {
  data: Room[];
}

const HomePage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get<ApiResponse>("/rooms");
        setRooms(response.data.data);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    fetchRooms();
  }, []);

  const handleRoomSelect = (roomName: number) => {
    navigate(`/operation/${encodeURIComponent(roomName)}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Operacijske sobe
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Ime sobe</TableCell>
              <TableCell>Lokacija</TableCell>
              <TableCell>Akcije</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.idsoba}>
                <TableCell>{room.idsoba}</TableCell>
                <TableCell>{room.naziv}</TableCell>
                <TableCell>{room.lokacija}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleRoomSelect(room.idsoba)}
                  >
                    Odpri sobo
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default HomePage;
