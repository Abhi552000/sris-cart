import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isAppLoading, setIsAppLoading] = useState(true);

  // 🔹 Fetch Seller
  const fetchSeller = async () => {
    try {
      const { data } = await axios.get("/api/seller/is-auth");

      if (data.success) {
        setIsSeller(true);
      } else {
        setIsSeller(false);
      }
    } catch {
      setIsSeller(false);
    }
  };

  // 🔹 Fetch User
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/is-auth");

      if (data.success) {
        setUser(data.user);

        const mergedCart = { ...data.user.cartItems };

        for (const item in cartItems) {
          if (mergedCart[item]) {
            mergedCart[item] += cartItems[item];
          } else {
            mergedCart[item] = cartItems[item];
          }
        }

        setCartItems(mergedCart);

        await axios.post("/api/cart/update", { cartItems: mergedCart });
      }
    } catch {
      setUser(null);
    }
  };

  // 🔹 Fetch Products
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/product/list");

      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // 🔹 Add To Cart
  const addToCart = (itemId) => {
    const cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }

    setCartItems(cartData);
    toast.success("Added to Cart");
  };

  // 🔹 Update Cart Item
  const updateCartItem = (itemId, quantity) => {
    const cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;

    setCartItems(cartData);
    toast.success("Cart Updated");
  };

  // 🔹 Remove From Cart
  const removeFromCart = (itemId) => {
    const cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      cartData[itemId] -= 1;

      if (cartData[itemId] === 0) {
        delete cartData[itemId];
      }
    }

    setCartItems(cartData);
    toast.success("Removed from Cart");
  };

  // 🔹 Cart Count
  const getCartCount = () => {
    let totalCount = 0;

    for (const item in cartItems) {
      totalCount += cartItems[item];
    }

    return totalCount;
  };

  // 🔹 Cart Amount
  const getCartAmount = () => {
    let totalAmount = 0;

    for (const item in cartItems) {
      const itemInfo = products.find((product) => product._id === item);

      if (itemInfo && cartItems[item] > 0) {
        totalAmount += itemInfo.offerPrice * cartItems[item];
      }
    }

    return Math.floor(totalAmount * 100) / 100;
  };

  // 🔹 Update Cart In DB
  const updateCart = async () => {
    try {
      const payload = { cartItems: { ...cartItems } };

      const { data } = await axios.post("/api/cart/update", payload);

      if (!data.success) {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // 🔹 Logout User
  const logout = async () => {
    try {
      const { data } = await axios.get("/api/user/logout");
      if (data.success) {
        toast.success(data.message);
        setUser(null);
        setCartItems({});
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // 🔹 Initial Load
  useEffect(() => {
    const initData = async () => {
      try {
        await Promise.allSettled([
          fetchUser(),
          fetchSeller(),
          fetchProducts(),
        ]);
      } catch (error) {
        console.error("Error loading app data:", error);
      } finally {
        setIsAppLoading(false);
      }
    };
    initData();
  }, []);

  // 🔹 Sync Cart with DB
  useEffect(() => {
    if (user) {
      updateCart();
    }
  }, [cartItems]);

  const value = {
    navigate,
    user,
    setUser,
    fetchUser,
    isSeller,
    setIsSeller,
    showUserLogin,
    setShowUserLogin,
    products,
    setProducts,
    fetchProducts,
    currency,
    cartItems,
    setCartItems,
    addToCart,
    updateCartItem,
    removeFromCart,
    searchQuery,
    setSearchQuery,
    getCartCount,
    getCartAmount,
    axios,
    isAppLoading,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
