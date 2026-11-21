import axios from "axios";
import { getToken, setToken } from "./session";

// Local requests use the Vite proxy. Vercel uses the deployed backend URL.
const apiUrl = import.meta.env.VITE_API_URL || "/api";
const api = axios.create({ baseURL: apiUrl.replace(/\/+$/, "") });

// Attach the saved login token to every API request.
api.interceptors.request.use((request) => {
  const token = getToken();
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isUnauthorized = error.response?.status === 401;
    const requestToken = error.config?.headers?.Authorization;
    const currentToken = `Bearer ${getToken()}`;
    const isPrivatePage = ["/todos", "/profile"].includes(
      window.location.pathname,
    );

    // An old failed request must not sign out a more recent login.
    if (isUnauthorized && requestToken === currentToken && isPrivatePage) {
      setToken(null);
      window.location.replace("/login?expired=1");
    }
    return Promise.reject(error);
  },
);

export default api;
