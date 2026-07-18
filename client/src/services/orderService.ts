import apiClient from "./api";
import { API_ROUTES } from "../constants";

export const placeCODOrder = async (payload: any) => {
  const { data } = await apiClient.post(API_ROUTES.ORDER.COD, payload);
  return data;
};

export const placeStripeOrder = async (payload: any) => {
  const { data } = await apiClient.post(API_ROUTES.ORDER.STRIPE, payload);
  return data;
};

export const getUserOrders = async () => {
  const { data } = await apiClient.get(API_ROUTES.ORDER.USER_ORDERS);
  return data;
};

export const getSellerOrders = async () => {
  const { data } = await apiClient.get(API_ROUTES.ORDER.SELLER_ORDERS);
  return data;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const { data } = await apiClient.post(API_ROUTES.ORDER.UPDATE_STATUS, { orderId, status });
  return data;
};
