import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { adminLogin } from "../../services/adminService";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setLoading(true);
      const data = await adminLogin({ email, password });
      if (data.success) {
        toast.success("Admin login successful!");
        onLoginSuccess();
        navigate("/admin");
      } else {
        toast.error(data?.message || "Invalid credentials");
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

  return (
    <form
      onSubmit={onSubmitHandler}
      className="min-h-screen flex items-center text-sm text-gray-600 bg-slate-50"
    >
      <div className="flex flex-col gap-5 m-auto items-start p-8 py-12 min-w-80 sm:min-w-88 rounded-lg shadow-xl border border-gray-200 bg-white">
        <p className="text-2xl font-medium m-auto">
          <span className="text-primary">Welcome Back,</span> Admin
        </p>
        <div className="w-full">
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            placeholder="enter your email"
            required
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary text-gray-750 font-medium"
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
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary text-gray-750 font-medium"
          />
        </div>
        <button 
          disabled={loading}
          className={`bg-primary text-white w-full py-2 rounded-md cursor-pointer flex items-center justify-center gap-2 font-bold border-none ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Login"
          )}
        </button>
      </div>
    </form>
  );
};

export default AdminLogin;
