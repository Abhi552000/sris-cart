import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import productsReducer from "./productsSlice";
import cartReducer from "./cartSlice";
import { syncCart } from "../services/cartService";

const cartSyncMiddleware = (store) => (next) => async (action) => {
  const result = next(action);

  const cartActions = [
    "cart/addToCart",
    "cart/updateCartItem",
    "cart/removeFromCart",
  ];

  if (cartActions.includes(action.type)) {
    const state = store.getState();
    const user = state.auth.user;

    if (user) {
      try {
        const cartItems = state.cart.cartItems;
        await syncCart(cartItems);
      } catch (error) {
        console.error("Failed to synchronize cart with database:", error);
      }
    }
  }

  return result;
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(cartSyncMiddleware),
});

export default store;
