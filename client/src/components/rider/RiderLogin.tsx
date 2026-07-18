import React from "react";
import { Info } from "lucide-react";

interface RiderLoginProps {
  authState: string;
  setAuthState: (state: string) => void;
  name: string;
  setName: (name: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  loginLoading: boolean;
  handleAuthSubmit: (e: React.FormEvent) => void;
}

const RiderLogin: React.FC<RiderLoginProps> = ({
  authState,
  setAuthState,
  name,
  setName,
  phone,
  setPhone,
  email,
  setEmail,
  password,
  setPassword,
  loginLoading,
  handleAuthSubmit,
}) => {
  return (
    <form
      onSubmit={handleAuthSubmit}
      className="min-h-screen flex items-center text-sm text-gray-600 bg-slate-50"
    >
      <div className="flex flex-col gap-5 m-auto items-start p-8 py-12 min-w-80 sm:min-w-88 rounded-lg shadow-xl border border-gray-200 bg-white">
        <p className="text-2xl font-medium m-auto">
          <span className="text-primary">Welcome Back,</span> Rider
        </p>

        {authState === "register" && (
          <>
            <div className="w-full">
              <p>Full Name</p>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                placeholder="enter your full name"
                required
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary text-gray-750 font-medium"
              />
            </div>
            <div className="w-full">
              <p>Phone Number</p>
              <input
                onChange={(e) => setPhone(e.target.value)}
                value={phone}
                type="tel"
                placeholder="enter your phone number"
                required
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary text-gray-750 font-medium"
              />
            </div>
          </>
        )}

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
          disabled={loginLoading}
          className={`bg-primary text-white w-full py-2 rounded-md cursor-pointer flex items-center justify-center gap-2 font-bold ${loginLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loginLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            authState === "login" ? "Login" : "Sign Up"
          )}
        </button>

        <div className="text-center pt-2 w-full">
          <button
            type="button"
            onClick={() => setAuthState(authState === "login" ? "register" : "login")}
            className="text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            {authState === "login"
              ? "Don't have an account? Sign Up"
              : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default RiderLogin;
