import apiClient from "./api";
import { API_ROUTES } from "../constants";

export const chatWithAI = async (message: string, chatHistory: any[]) => {
  const { data } = await apiClient.post(API_ROUTES.AI.CHAT, { message, chatHistory });
  return data;
};
