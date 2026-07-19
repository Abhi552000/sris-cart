import apiClient from "./api";
import { API_ROUTES } from "../constants";

export const checkUserAuth = async () => {
  const { data } = await apiClient.get(API_ROUTES.USER.IS_AUTH);
  return data;
};

export const checkSellerAuth = async () => {
  const { data } = await apiClient.get(API_ROUTES.SELLER.IS_AUTH);
  return data;
};

export const loginUser = async (email: string, password: string) => {
  const { data } = await apiClient.post(API_ROUTES.USER.LOGIN, { email, password });
  return data;
};

export const registerUser = async (name: string, email: string, password: string) => {
  const { data } = await apiClient.post(API_ROUTES.USER.REGISTER, { name, email, password });
  return data;
};

export const logoutUser = async () => {
  const { data } = await apiClient.get(API_ROUTES.USER.LOGOUT);
  return data;
};

export const loginSeller = async (email: string, password: string) => {
  const { data } = await apiClient.post(API_ROUTES.SELLER.LOGIN, { email, password });
  return data;
};

export const registerSeller = async (payload: any) => {
  const { data } = await apiClient.post(API_ROUTES.SELLER.REGISTER, payload);
  return data;
};

export const logoutSeller = async () => {
  const { data } = await apiClient.post(API_ROUTES.SELLER.LOGOUT);
  return data;
};

export const getSellerProfile = async () => {
  const { data } = await apiClient.get(API_ROUTES.SELLER.PROFILE);
  return data;
};

export const updateSellerProfile = async (payload: any) => {
  const { data } = await apiClient.post(API_ROUTES.SELLER.PROFILE_UPDATE, payload);
  return data;
};

export const updateUserProfile = async (payload: any) => {
  const { data } = await apiClient.post(API_ROUTES.USER.PROFILE_UPDATE, payload);
  return data;
};
