import apiClient from "./api";
import { API_ROUTES } from "../constants";
import { Address } from "../types";

export const getAddresses = async () => {
  const { data } = await apiClient.get(API_ROUTES.ADDRESS.GET);
  return data;
};

export const addAddress = async (address: Address) => {
  const { data } = await apiClient.post(API_ROUTES.ADDRESS.ADD, { address });
  return data;
};
