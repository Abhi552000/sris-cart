import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

const initialState = {
  cartItems: {},
  searchQuery: "",
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const itemId = action.payload;
      if (state.cartItems[itemId]) {
        state.cartItems[itemId] += 1;
      } else {
        state.cartItems[itemId] = 1;
      }
      toast.success("Added to Cart");
    },
    updateCartItem: (state, action) => {
      const { itemId, quantity } = action.payload;
      state.cartItems[itemId] = quantity;
      toast.success("Cart Updated");
    },
    removeFromCart: (state, action) => {
      const itemId = action.payload;
      if (state.cartItems[itemId]) {
        state.cartItems[itemId] -= 1;
        if (state.cartItems[itemId] === 0) {
          delete state.cartItems[itemId];
        }
      }
      toast.success("Removed from Cart");
    },
    setCartItems: (state, action) => {
      state.cartItems = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
  },
});

export const { addToCart, updateCartItem, removeFromCart, setCartItems, setSearchQuery } = cartSlice.actions;

// Selector helpers
export const selectCartCount = (state) => {
  let totalCount = 0;
  for (const item in state.cart.cartItems) {
    totalCount += state.cart.cartItems[item];
  }
  return totalCount;
};

export const selectCartAmount = (state) => {
  let totalAmount = 0;
  for (const item in state.cart.cartItems) {
    const itemInfo = state.products.products.find((product) => product._id === item);
    if (itemInfo && state.cart.cartItems[item] > 0) {
      totalAmount += itemInfo.offerPrice * state.cart.cartItems[item];
    }
  }
  return Math.floor(totalAmount * 100) / 100;
};

export default cartSlice.reducer;
