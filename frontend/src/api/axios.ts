import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      const cleanToken = token.replace(/^"(.*)"$/, "$1").trim();
      config.headers = config.headers || {};
      if (typeof config.headers.set === "function") {
        config.headers.set("Authorization", `Bearer ${cleanToken}`);
      }
      config.headers["Authorization"] = `Bearer ${cleanToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-change"));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
