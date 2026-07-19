import apiClient from "./api";
import { API_ROUTES } from "../constants";

export const adminLogin = async (payload: any) => {
  const { data } = await apiClient.post(API_ROUTES.ADMIN.LOGIN, payload);
  return data;
};

export const isAdminAuth = async () => {
  const { data } = await apiClient.get(API_ROUTES.ADMIN.IS_AUTH);
  return data;
};

export const adminLogout = async () => {
  const { data } = await apiClient.post(API_ROUTES.ADMIN.LOGOUT);
  return data;
};

export const getAdminUsers = async () => {
  const { data } = await apiClient.get(API_ROUTES.ADMIN.USERS);
  return data;
};

export const toggleUserStatus = async (userId: string, remarks?: string) => {
  const { data } = await apiClient.post(API_ROUTES.ADMIN.USER_TOGGLE, { userId, remarks });
  return data;
};

export const getAdminSellers = async () => {
  const { data } = await apiClient.get(API_ROUTES.ADMIN.SELLERS);
  return data;
};

export const toggleSellerStatus = async (sellerId: string, remarks?: string) => {
  const { data } = await apiClient.post(API_ROUTES.ADMIN.SELLER_TOGGLE, { sellerId, remarks });
  return data;
};

export const getAdminRiders = async () => {
  const { data } = await apiClient.get(API_ROUTES.ADMIN.RIDERS);
  return data;
};

export const toggleRiderStatus = async (riderId: string, remarks?: string) => {
  const { data } = await apiClient.post(API_ROUTES.ADMIN.RIDER_TOGGLE, { riderId, remarks });
  return data;
};

export const getAdminStats = async () => {
  const { data } = await apiClient.get(API_ROUTES.ADMIN.STATS);
  return data;
};
