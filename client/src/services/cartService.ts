import apiClient from "./api";
import { API_ROUTES } from "../constants";

export const syncCart = async (cartItems: Record<string, number>) => {
  const { data } = await apiClient.post(API_ROUTES.CART.UPDATE, { cartItems });
  return data;
};
