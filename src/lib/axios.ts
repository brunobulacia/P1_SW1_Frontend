import axios from "axios";
import { getAuthToken } from "@/store/auth.store";

const baseURL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api/";
const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

export default axiosInstance;
