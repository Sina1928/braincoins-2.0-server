import axios from "axios";
const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
});
// Add response interceptor for error handling
api.interceptors.response.use((response) => response, (error) => {
    console.error("API Error:", error.response?.data || error.message);
    throw error;
});
export default api;
//# sourceMappingURL=api.js.map