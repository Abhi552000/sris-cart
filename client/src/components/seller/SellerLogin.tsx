import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginSeller, registerSeller } from "../../services/authService";
import { setIsSeller as setIsSellerAction } from "../../store/authSlice";
import { RootState } from "../../store";

const SellerLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isSeller = useSelector((state: RootState) => state.auth.isSeller);
  const setIsSeller = (val: boolean) => dispatch(setIsSellerAction(val));

  // Form Mode: 'Login' or 'Sign Up'
  const [state, setState] = useState<"Login" | "Sign Up">("Login");
  
  // Input fields
  const [name, setName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [branch, setBranch] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (state === "Login") {
        const data = await loginSeller(email, password);
        if (data.success) {
          setIsSeller(true);
          toast.success("Welcome back to your Seller Portal!");
          navigate("/seller");
        } else {
          toast.error(data?.message || "Login failed.");
        }
      } else {
        const payload = {
          name,
          storeName,
          email,
          password,
          gstNumber,
          branch,
        };
        const data = await registerSeller(payload);
        if (data.success) {
          setIsSeller(true);
          toast.success("Seller account registered successfully! Welcome onboard.");
          navigate("/seller");
        } else {
          toast.error(data?.message || "Registration failed.");
        }
      }
    } catch (error: any) {
      console.log("error", error);
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
  }, [isSeller, navigate]);

  return (
    !isSeller && (
      <form
        onSubmit={onSubmitHandler}
        className="min-h-screen flex items-center justify-center text-sm text-gray-600 bg-gradient-to-br from-slate-50 to-slate-100/50 p-4"
      >
        <div className="flex flex-col gap-4 w-full max-w-md p-8 py-10 rounded-2xl shadow-xl border border-gray-100 bg-white transition-all duration-300">
          <div className="flex flex-col items-center mb-2">
            <h2 className="text-2xl font-bold text-gray-800">
              {state === "Login" ? "Seller Login" : "Seller Onboarding"}
            </h2>
            <p className="text-gray-400 text-xs mt-1 text-center">
              {state === "Login"
                ? "Sign in to manage your inventory and store orders"
                : "Register your branch store and start selling instantly"}
            </p>
            <div className="w-12 h-1 bg-primary rounded-full mt-3"></div>
          </div>

          {state === "Sign Up" ? (
            <>
              {/* Proprietor Name */}
              <div className="w-full">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Proprietor / Contact Name
                </label>
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  type="text"
                  placeholder="e.g. John Doe"
                  required
                  className="border border-gray-200 rounded-lg w-full p-2.5 outline-none focus:border-primary transition"
                />
              </div>

              {/* Store Name */}
              <div className="w-full">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Store / Company Name
                </label>
                <input
                  onChange={(e) => setStoreName(e.target.value)}
                  value={storeName}
                  type="text"
                  placeholder="e.g. SrisCart Fresh Hub"
                  required
                  className="border border-gray-200 rounded-lg w-full p-2.5 outline-none focus:border-primary transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                {/* GST Number */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    GST Number
                  </label>
                  <input
                    onChange={(e) => setGstNumber(e.target.value)}
                    value={gstNumber}
                    type="text"
                    placeholder="e.g. 19AAAAA1111A1Z1"
                    required
                    className="border border-gray-200 rounded-lg w-full p-2.5 outline-none focus:border-primary transition"
                  />
                </div>

                {/* Branch Location */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Branch / Area
                  </label>
                  <input
                    onChange={(e) => setBranch(e.target.value)}
                    value={branch}
                    type="text"
                    placeholder="e.g. Baghbazar"
                    required
                    className="border border-gray-200 rounded-lg w-full p-2.5 outline-none focus:border-primary transition"
                  />
                </div>
              </div>
            </>
          ) : null}

          {/* Email */}
          <div className="w-full">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              Store Email
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="name@example.com"
              required
              className="border border-gray-200 rounded-lg w-full p-2.5 outline-none focus:border-primary transition"
            />
          </div>

          {/* Password */}
          <div className="w-full">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              Password
            </label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="••••••••"
              required
              className="border border-gray-200 rounded-lg w-full p-2.5 outline-none focus:border-primary transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`bg-primary text-white w-full py-2.5 rounded-lg cursor-pointer flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : state === "Login" ? (
              "Login to Dashboard"
            ) : (
              "Complete Onboarding"
            )}
          </button>

          {/* Mode Switcher */}
          <div className="text-center mt-2">
            {state === "Login" ? (
              <p className="text-xs text-gray-500">
                Don't have a seller account?{" "}
                <button
                  type="button"
                  onClick={() => setState("Sign Up")}
                  className="text-primary font-bold hover:underline bg-transparent border-none cursor-pointer"
                >
                  Onboard here
                </button>
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => setState("Login")}
                  className="text-primary font-bold hover:underline bg-transparent border-none cursor-pointer"
                >
                  Login here
                </button>
              </p>
            )}
          </div>
        </div>
      </form>
    )
  );
};

export default SellerLogin;
