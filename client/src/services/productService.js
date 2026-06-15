import apiClient from "./api";
import { API_ROUTES } from "./routeConstants";

export const getProductsList = async () => {
  const { data } = await apiClient.get(API_ROUTES.PRODUCT.LIST);
  return data;
};

export const addProduct = async (formData) => {
  const { data } = await apiClient.post(API_ROUTES.PRODUCT.ADD, formData);
  return data;
};

export const toggleStock = async (id, inStock) => {
  const { data } = await apiClient.post(API_ROUTES.PRODUCT.STOCK, { id, inStock });
  return data;
};

export const toggleBestseller = async (id, bestseller) => {
  const { data } = await apiClient.post(API_ROUTES.PRODUCT.BESTSELLER, { id, bestseller });
  return data;
};
