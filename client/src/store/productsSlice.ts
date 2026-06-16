import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getProductsList } from "../services/productService";
import toast from "react-hot-toast";
import { Product } from "../types";

export const fetchProductsThunk = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getProductsList();
      if (data.success) {
        return data.products;
      } else {
        toast.error(data.message);
        return rejectWithValue(data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: any;
}

const initialState: ProductsState = {
  products: [],
  loading: false,
  error: null,
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProductsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setProducts } = productsSlice.actions;
export default productsSlice.reducer;
