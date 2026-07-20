import React, { useState } from "react";
import { Lock, Save, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import { updateSellerProfile } from "../../services/authService";

const SellerChangePassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return toast.error("New passwords do not match!");
    }

    try {
      setLoading(true);
      const data = await updateSellerProfile({ password });
      if (data.success) {
        toast.success(data.message || "Password changed successfully!");
        setPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.message || "Failed to update password.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-slate-50/50 p-4 md:p-8 flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-slate-100/40 space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-gray-800">Change Password</h2>
          <p className="text-gray-400 text-xs mt-1.5">
            Update your credentials to keep your merchant account secure
          </p>
          <div className="w-10 h-1 bg-primary rounded-full mt-3"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* New Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5" htmlFor="new-password">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full outline-none py-3 px-4 rounded-xl border border-gray-200 focus:border-primary text-sm text-gray-700 font-medium transition"
            />
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5" htmlFor="confirm-password">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              disabled={loading}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full outline-none py-3 px-4 rounded-xl border border-gray-200 focus:border-primary text-sm text-gray-700 font-medium transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3.5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-extrabold rounded-2xl shadow-xl shadow-yellow-500/10 hover:shadow-yellow-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed text-sm mt-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <Save className="w-4.5 h-4.5" />
                <span>Save New Password</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerChangePassword;
