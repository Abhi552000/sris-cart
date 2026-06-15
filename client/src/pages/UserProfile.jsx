import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { User, Mail, Lock, Save } from "lucide-react";
import toast from "react-hot-toast";
import { updateUserProfile } from "../services/authService";
import { fetchUserThunk } from "../store/authSlice";

const UserProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    try {
      setLoading(true);
      const payload = { name, email };
      if (password) {
        payload.password = password;
      }

      const data = await updateUserProfile(payload);
      if (data.success) {
        toast.success(data.message || "Profile updated successfully!");
        setPassword("");
        setConfirmPassword("");
        dispatch(fetchUserThunk()); // Sync Redux state
      } else {
        toast.error(data.message || "Failed to update profile.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-16 pb-20 max-w-2xl mx-auto px-4">
      {/* Title */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="flex items-center gap-2 text-primary">
          <User className="w-6 h-6 animate-pulse" />
          <span className="text-sm font-bold uppercase tracking-widest">My Profile</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mt-2">
          Account <span className="text-primary bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Settings</span>
        </h1>
        <div className="w-16 h-1 bg-primary rounded-full mt-3"></div>
      </div>

      <form
        onSubmit={handleUpdate}
        className="bg-white border border-gray-100 shadow-xl shadow-gray-100/50 rounded-2xl p-6 sm:p-8 space-y-6"
      >
        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-3">
          Personal Information
        </h2>

        {/* Name input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-gray-400" />
            Full Name
          </label>
          <input
            type="text"
            required
            disabled={loading}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-primary transition text-gray-700 placeholder-gray-400 text-sm disabled:bg-gray-50"
          />
        </div>

        {/* Email input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-gray-400" />
            Email Address
          </label>
          <input
            type="email"
            required
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-primary transition text-gray-700 placeholder-gray-400 text-sm disabled:bg-gray-50"
          />
        </div>

        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-3 pt-2">
          Change Password (Optional)
        </h2>

        {/* Password input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-gray-400" />
            New Password
          </label>
          <input
            type="password"
            disabled={loading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-primary transition text-gray-700 placeholder-gray-400 text-sm disabled:bg-gray-50"
          />
        </div>

        {/* Confirm Password input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-gray-400" />
            Confirm New Password
          </label>
          <input
            type="password"
            disabled={loading || !password}
            required={!!password}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-primary transition text-gray-700 placeholder-gray-400 text-sm disabled:bg-gray-50"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg shadow-yellow-500/10 hover:shadow-xl hover:shadow-yellow-500/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed text-sm"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Profile</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default UserProfile;
