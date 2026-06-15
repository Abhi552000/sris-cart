export const API_ROUTES = {
  USER: {
    IS_AUTH: "/api/user/is-auth",
    LOGIN: "/api/user/login",
    REGISTER: "/api/user/register",
    LOGOUT: "/api/user/logout",
    PROFILE_UPDATE: "/api/user/profile/update",
  },
  SELLER: {
    IS_AUTH: "/api/seller/is-auth",
    LOGIN: "/api/seller/login",
    LOGOUT: "/api/seller/logout",
    PROFILE: "/api/seller/profile",
    PROFILE_UPDATE: "/api/seller/profile/update",
  },
  PRODUCT: {
    LIST: "/api/product/list",
    ADD: "/api/product/add",
    STOCK: "/api/product/stock",
    BESTSELLER: "/api/product/bestseller",
  },
  CART: {
    UPDATE: "/api/cart/update",
  },
  ADDRESS: {
    GET: "/api/address/get",
    ADD: "/api/address/add",
  },
  ORDER: {
    COD: "/api/order/cod",
    STRIPE: "/api/order/stripe",
    USER_ORDERS: "/api/order/user",
    SELLER_ORDERS: "/api/order/seller",
  },
  AI: {
    CHAT: "/api/ai/chat",
  },
};
