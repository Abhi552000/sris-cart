import apiClient from "./api";
import { API_ROUTES } from "./routeConstants";

export const placeCODOrder = async (payload) => {
  const { data } = await apiClient.post(API_ROUTES.ORDER.COD, payload);
  return data;
};

export const placeStripeOrder = async (payload) => {
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
