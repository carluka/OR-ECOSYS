import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, //"https://or-ecosystem.eu/api", "http://localhost:3000/api",
  withCredentials: true,
});

export default api;
