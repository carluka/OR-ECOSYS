import axios from "axios";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL,
	//baseURL: "http://localhost:3000/api",
	withCredentials: true,
});

export default api;
