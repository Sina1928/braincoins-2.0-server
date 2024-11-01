import axios from "axios";
const api = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
    },
});
// Add response interceptor for error handling
api.interceptors.response.use((response) => response, // Type the response based on its default type
(error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error); // Return a rejected promise for error handling
});
export default api;
//# sourceMappingURL=api.js.map