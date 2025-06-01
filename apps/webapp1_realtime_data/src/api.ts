import axios from "axios";

const api = axios.create({
  baseURL:  "http://localhost:3000/api", //import.meta.env.VITE_API_BASE_URL,//"https://or-ecosystem.eu/api",  <--- CHANGE TO SECOND OPTION FOR PRODUCTION
  withCredentials: true,
});

export default api;
