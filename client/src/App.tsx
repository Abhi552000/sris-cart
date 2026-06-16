import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadUserSession } from "./store/authSlice";
import { fetchProductsThunk } from "./store/productsSlice";
import { RootState, AppDispatch } from "./store";
import Loading from "./components/Loading";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isAppLoading = useSelector((state: RootState) => state.auth.isAppLoading);

  useEffect(() => {
    dispatch(loadUserSession());
    dispatch(fetchProductsThunk());
  }, [dispatch]);

  if (isAppLoading) {
    return <Loading />;
  }

  return <AppRoutes />;
};

export default App;
