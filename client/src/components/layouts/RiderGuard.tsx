import React, { useEffect, useState } from "react";
import { getRiderProfile, riderLogin, riderRegister } from "../../services/riderService";
import RiderLayout from "./RiderLayout";
import RiderLogin from "../rider/RiderLogin";
import toast from "react-hot-toast";

const RiderGuard = () => {
  const [rider, setRider] = useState<any>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Auth states
  const [authState, setAuthState] = useState("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const checkAuth = async () => {
    try {
      setAuthLoading(true);
      const data = await getRiderProfile();
      if (data.success) {
        setRider(data.rider);
        setIsAuth(true);
      }
    } catch (error) {
      console.log("Rider not logged in");
      setIsAuth(false);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoginLoading(true);
      if (authState === "register") {
        const data = await riderRegister({ name, phone, email, password });
        if (data.success) {
          setRider(data.rider);
          setIsAuth(true);
          toast.success("Account created successfully!");
        } else {
          toast.error(data.message);
        }
      } else {
        const data = await riderLogin({ email, password });
        if (data.success) {
          setRider(data.rider);
          setIsAuth(true);
          toast.success("Logged in successfully!");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoginLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary"></div>
      </div>
    );
  }

  return isAuth ? (
    <RiderLayout rider={rider} setRider={setRider} setIsAuth={setIsAuth} />
  ) : (
    <RiderLogin
      authState={authState}
      setAuthState={setAuthState}
      name={name}
      setName={setName}
      phone={phone}
      setPhone={setPhone}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      loginLoading={loginLoading}
      handleAuthSubmit={handleAuthSubmit}
    />
  );
};

export default RiderGuard;
