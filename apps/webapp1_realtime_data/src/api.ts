import axios from "axios";

const api = axios.create({
  baseURL: "http://or-ecosystem.eu/api", //import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

export default api;
