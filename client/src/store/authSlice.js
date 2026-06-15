import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { checkUserAuth, checkSellerAuth, logoutUser } from "../services/authService";
import { syncCart } from "../services/cartService";
import { setCartItems } from "./cartSlice";

export const loadUserSession = createAsyncThunk(
  "auth/loadUserSession",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const [userRes, sellerRes] = await Promise.allSettled([
        checkUserAuth(),
        checkSellerAuth(),
      ]);

      let user = null;
      let isSeller = false;

      if (sellerRes.status === "fulfilled" && sellerRes.value.success) {
        isSeller = true;
      }

      if (userRes.status === "fulfilled" && userRes.value.success) {
        user = userRes.value.user;

        // Merge cart items from local state and DB
        const localCart = getState().cart.cartItems;
        const dbCart = userRes.value.user.cartItems || {};
        const mergedCart = { ...dbCart };

        for (const item in localCart) {
          if (mergedCart[item]) {
            mergedCart[item] += localCart[item];
          } else {
            mergedCart[item] = localCart[item];
          }
        }

        dispatch(setCartItems(mergedCart));
        await syncCart(mergedCart);
      }

      return { user, isSeller };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserThunk = createAsyncThunk(
  "auth/fetchUser",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const data = await checkUserAuth();
      if (data.success) {
        const localCart = getState().cart.cartItems;
        const dbCart = data.user.cartItems || {};
        const mergedCart = { ...dbCart };

        for (const item in localCart) {
          if (mergedCart[item]) {
            mergedCart[item] += localCart[item];
          } else {
            mergedCart[item] = localCart[item];
          }
        }

        dispatch(setCartItems(mergedCart));
        await syncCart(mergedCart);
        return data.user;
      }
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSellerThunk = createAsyncThunk(
  "auth/fetchSeller",
  async (_, { rejectWithValue }) => {
    try {
      const data = await checkSellerAuth();
      return data.success;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUserThunk = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const data = await logoutUser();
      if (data.success) {
        dispatch(setCartItems({}));
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: null,
  isSeller: false,
  showUserLogin: false,
  isAppLoading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setIsSeller: (state, action) => {
      state.isSeller = action.payload;
    },
    setShowUserLogin: (state, action) => {
      state.showUserLogin = action.payload;
    },
    setIsAppLoading: (state, action) => {
      state.isAppLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // loadUserSession
      .addCase(loadUserSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isSeller = action.payload.isSeller;
        state.isAppLoading = false;
      })
      .addCase(loadUserSession.rejected, (state) => {
        state.isAppLoading = false;
      })
      // fetchUserThunk
      .addCase(fetchUserThunk.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(fetchUserThunk.rejected, (state) => {
        state.user = null;
      })
      // fetchSellerThunk
      .addCase(fetchSellerThunk.fulfilled, (state, action) => {
        state.isSeller = action.payload;
      })
      .addCase(fetchSellerThunk.rejected, (state) => {
        state.isSeller = false;
      })
      // logoutUserThunk
      .addCase(logoutUserThunk.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.user = null;
        }
      });
  },
});

export const { setUser, setIsSeller, setShowUserLogin, setIsAppLoading } = authSlice.actions;
export default authSlice.reducer;
