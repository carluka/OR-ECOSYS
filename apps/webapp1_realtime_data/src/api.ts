import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, //"http://localhost:3000/api", //import.meta.env.VITE_API_BASE_URL,//"https://or-ecosystem.eu/api",
  withCredentials: true,
});

export default api;
