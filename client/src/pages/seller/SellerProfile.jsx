import { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { User, Mail, Lock, Store, Phone, MapPin, Save } from "lucide-react";
import toast from "react-hot-toast";

const SellerProfile = () => {
  const { axios } = useAppContext();
  const [name, setName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchProfile = async () => {
    try {
      setFetching(true);
      const { data } = await axios.get("/api/seller/profile");
      if (data.success) {
        setName(data.seller.name || "");
        setStoreName(data.seller.storeName || "");
        setEmail(data.seller.email || "");
        setPhone(data.seller.phone || "");
        setAddress(data.seller.address || "");
      } else {
        toast.error("Failed to load seller profile settings");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    try {
      setLoading(true);
      const payload = {
        name,
        storeName,
        email,
        phone,
        address,
      };

      if (password) {
        payload.password = password;
      }

      const { data } = await axios.post("/api/seller/profile/update", payload);
      if (data.success) {
        toast.success(data.message || "Profile updated successfully!");
        setPassword("");
        setConfirmPassword("");
        fetchProfile();
      } else {
        toast.error(data.message || "Failed to update profile.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-[50vh] flex-1">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4 space-y-6 max-w-2xl">
        {/* Header Title */}
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2 text-primary">
            <Store className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Store Settings</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-1">Seller Profile</h2>
          <div className="w-16 h-1 bg-primary rounded-full mt-2"></div>
        </div>

        <form
          onSubmit={handleUpdate}
          className="bg-white border border-gray-500/20 rounded-xl p-6 sm:p-8 space-y-5"
        >
          <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2">
            Store & Business Details
          </h3>

          {/* Store Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5" htmlFor="store-name">
              <Store className="w-3.5 h-3.5 text-gray-400" />
              Store / Business Name
            </label>
            <input
              id="store-name"
              type="text"
              required
              disabled={loading}
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. SrisCart Fresh Store"
              className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-primary text-sm text-gray-700 disabled:bg-gray-50"
            />
          </div>

          {/* Seller Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5" htmlFor="seller-name">
              <User className="w-3.5 h-3.5 text-gray-400" />
              Seller / Contact Name
            </label>
            <input
              id="seller-name"
              type="text"
              required
              disabled={loading}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-primary text-sm text-gray-700 disabled:bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5" htmlFor="store-phone">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                Store Phone
              </label>
              <input
                id="store-phone"
                type="text"
                disabled={loading}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-primary text-sm text-gray-700 disabled:bg-gray-50"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5" htmlFor="store-email">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                Admin Email
              </label>
              <input
                id="store-email"
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-primary text-sm text-gray-700 disabled:bg-gray-50"
              />
            </div>
          </div>

          {/* Store Address */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5" htmlFor="store-address">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              Store Physical Address
            </label>
            <textarea
              id="store-address"
              rows={2}
              disabled={loading}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Store layout address detail"
              className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-primary text-sm text-gray-700 resize-none disabled:bg-gray-50"
            ></textarea>
          </div>

          <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2 pt-2">
            Change Login Password (Optional)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5" htmlFor="store-password">
                <Lock className="w-3.5 h-3.5 text-gray-400" />
                New Password
              </label>
              <input
                id="store-password"
                type="password"
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-primary text-sm text-gray-700 disabled:bg-gray-50"
              />
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5" htmlFor="confirm-store-password">
                <Lock className="w-3.5 h-3.5 text-gray-400" />
                Confirm Password
              </label>
              <input
                id="confirm-store-password"
                type="password"
                disabled={loading || !password}
                required={!!password}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="outline-none py-2 px-3 rounded border border-gray-300 focus:border-primary text-sm text-gray-700 disabled:bg-gray-50"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg shadow-yellow-500/10 hover:shadow-xl hover:shadow-yellow-500/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed text-sm mt-3"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving Store Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Settings</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerProfile;
