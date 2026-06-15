import apiClient from "./api";
import { API_ROUTES } from "./routeConstants";

export const chatWithAI = async (message, chatHistory) => {
  const { data } = await apiClient.post(API_ROUTES.AI.CHAT, { message, chatHistory });
  return data;
};
