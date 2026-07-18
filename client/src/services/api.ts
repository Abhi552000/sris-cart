import axiosInstance from "axios";
import { store } from "../store";
import { setUser, setIsSeller } from "../store/authSlice";
import { setCartItems } from "../store/cartSlice";
import toast from "react-hot-toast";

const apiClient = axiosInstance.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Response Interceptor for handling deactivated accounts and Token Expiration (401)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Handle Token Expiration (401 + TOKEN_EXPIRED)
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data?.code === "TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Determine which route group we are on to choose the correct refresh path
      const url = originalRequest.url || "";
      let refreshUrl = "/api/user/refresh";
      if (url.includes("/api/rider")) {
        refreshUrl = "/api/rider/refresh";
      } else if (url.includes("/api/seller")) {
        refreshUrl = "/api/seller/refresh";
      }

      try {
        // Request token refresh using a clean isolated axios call
        // (to prevent interceptor loops)
        await axiosInstance.get(
          `${import.meta.env.VITE_BACKEND_URL}${refreshUrl}`,
          { withCredentials: true }
        );

        isRefreshing = false;
        processQueue(null);

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);

        // Silent Refresh failed: session revoked/expired. Force log out client states.
        store.dispatch(setUser(null));
        store.dispatch(setIsSeller(false));
        store.dispatch(setCartItems({}));

        toast.error("Session expired. Please log in again.", { id: "session-expired-error" });

        const path = window.location.pathname;
        if (path.startsWith("/rider")) {
          window.location.href = "/rider";
        } else if (path.startsWith("/admin")) {
          window.location.href = "/admin";
        } else if (path.startsWith("/seller")) {
          window.location.href = "/";
        } else {
          window.location.href = "/";
        }

        return Promise.reject(refreshError);
      }
    }

    // 2. Handle Deactivated Account Check (403)
    if (error.response && error.response.status === 403) {
      const message = error.response.data?.message || "";
      if (message.toLowerCase().includes("deactivated")) {
        // Clear redux states
        store.dispatch(setUser(null));
        store.dispatch(setIsSeller(false));
        store.dispatch(setCartItems({}));

        // Display error message
        toast.error(message, { id: "deactivated-error" });

        // Redirect appropriately
        const path = window.location.pathname;
        if (path.startsWith("/rider")) {
          window.location.href = "/rider";
        } else if (path.startsWith("/admin")) {
          window.location.href = "/admin";
        } else if (path.startsWith("/seller")) {
          window.location.href = "/";
        } else {
          window.location.href = "/";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
