import apiClient from "./api";
import { API_ROUTES } from "../constants";

export const riderLogin = async (payload: any) => {
  const { data } = await apiClient.post(API_ROUTES.RIDER.LOGIN, payload);
  return data;
};

export const riderRegister = async (payload: any) => {
  const { data } = await apiClient.post(API_ROUTES.RIDER.REGISTER, payload);
  return data;
};

export const getRiderProfile = async () => {
  const { data } = await apiClient.get(API_ROUTES.RIDER.PROFILE);
  return data;
};

export const updateRiderLocation = async (latitude: number, longitude: number) => {
  const { data } = await apiClient.post(API_ROUTES.RIDER.LOCATION_UPDATE, { latitude, longitude });
  return data;
};

export const getAvailableOrders = async () => {
  const { data } = await apiClient.get(API_ROUTES.RIDER.AVAILABLE_ORDERS);
  return data;
};

export const acceptOrder = async (orderId: string) => {
  const { data } = await apiClient.post(API_ROUTES.RIDER.ACCEPT_ORDER, { orderId });
  return data;
};

export const updateDeliveryStep = async (orderId: string, payload: { status?: string; latitude?: number; longitude?: number }) => {
  const { data } = await apiClient.post(API_ROUTES.RIDER.DELIVERY_STEP, { orderId, ...payload });
  return data;
};

export const riderLogout = async () => {
  const { data } = await apiClient.post(API_ROUTES.RIDER.LOGOUT);
  return data;
};

export const updateRiderProfile = async (payload: { status?: string; name?: string; phone?: string; image?: string }) => {
  const { data } = await apiClient.post(API_ROUTES.RIDER.PROFILE_UPDATE, payload);
  return data;
};

export const getRiderHistory = async () => {
  const { data } = await apiClient.get(API_ROUTES.RIDER.HISTORY);
  return data;
};
