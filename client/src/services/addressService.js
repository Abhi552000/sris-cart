import apiClient from "./api";
import { API_ROUTES } from "./routeConstants";

export const getAddresses = async () => {
  const { data } = await apiClient.get(API_ROUTES.ADDRESS.GET);
  return data;
};

export const addAddress = async (address) => {
  const { data } = await apiClient.post(API_ROUTES.ADDRESS.ADD, { address });
  return data;
};
