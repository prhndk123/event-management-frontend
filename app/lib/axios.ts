import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const axiosInstance2 = axios.create({
  baseURL:
    import.meta.env.VITE_BACKENDLESS_API_URL ||
    "https://hotshotfinger-us.backendless.app",
  headers: {
    "Content-Type": "application/json",
  },
});
