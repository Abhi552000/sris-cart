import apiClient from "./api";
import { API_ROUTES } from "./routeConstants";

export const syncCart = async (cartItems) => {
  const { data } = await apiClient.post(API_ROUTES.CART.UPDATE, { cartItems });
  return data;
};
