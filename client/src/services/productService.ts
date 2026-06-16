import apiClient from "./api";
import { API_ROUTES } from "../constants";

export const getProductsList = async () => {
  const { data } = await apiClient.get(API_ROUTES.PRODUCT.LIST);
  return data;
};

export const addProduct = async (formData: FormData) => {
  const { data } = await apiClient.post(API_ROUTES.PRODUCT.ADD, formData);
  return data;
};

export const toggleStock = async (id: string, inStock: boolean) => {
  const { data } = await apiClient.post(API_ROUTES.PRODUCT.STOCK, { id, inStock });
  return data;
};

export const toggleBestseller = async (id: string, bestseller: boolean) => {
  const { data } = await apiClient.post(API_ROUTES.PRODUCT.BESTSELLER, { id, bestseller });
  return data;
};
