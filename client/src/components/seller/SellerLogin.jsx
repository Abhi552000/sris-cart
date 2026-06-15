import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginSeller } from "../../services/authService";
import { setIsSeller as setIsSellerAction } from "../../store/authSlice";

const SellerLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isSeller = useSelector((state) => state.auth.isSeller);
  const setIsSeller = (val) => dispatch(setIsSellerAction(val));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const data = await loginSeller(email, password);
      if (data.success) {
        setIsSeller(true);
        navigate("/seller");
      } else {
        toast.error(data?.message);
      }
    } catch (error) {
      console.log("error", error);

      // Axios wraps backend error responses in `error.response`
      if (error.response && error.response.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSeller) {
      navigate("/seller");
    }
  }, [isSeller]);

  return (
    !isSeller && (
      <form
        onSubmit={onSubmitHandler}
        className="min-h-screen flex items-center text-sm to-gray-600"
      >
        <div className="flex flex-col gap-5 m-auto items-start p-8 py-12 min-w-80 sm:min-w-88 rounded-lg shadow-xl border border-gray-200 ">
          <p className="text-2xl font-medium m-auto">
            <span className="text-primary">Seller</span> Login
          </p>
          <div className="w-full">
            <p>Email</p>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="enter your email"
              required
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
            />
          </div>
          <div className="w-full">
            <p>Password</p>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="enter your password"
              required
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
            />
          </div>
          <button 
            disabled={loading}
            className={`bg-primary text-white w-full py-2 rounded-md cursor-pointer flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Login"
            )}
          </button>
        </div>
      </form>
    )
  );
};

export default SellerLogin;
