import React from "react";
import { User, Camera, Award } from "lucide-react";

interface RiderProfileProps {
  rider: any;
  editName: string;
  setEditName: (val: string) => void;
  editPhone: string;
  setEditPhone: (val: string) => void;
  editImage: string;
  setEditImage: (val: string) => void;
  presetAvatars: string[];
  isUpdating: boolean;
  handleUpdateProfile: (e: React.FormEvent) => void;
  todayDeliveriesCount: number;
}

const RiderProfile: React.FC<RiderProfileProps> = ({
  rider,
  editName,
  setEditName,
  editPhone,
  setEditPhone,
  editImage,
  setEditImage,
  presetAvatars,
  isUpdating,
  handleUpdateProfile,
  todayDeliveriesCount,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Interactive Avatar & Edit Profile Form */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-4">Update Profile Details</h3>
        
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {/* Select Avatar Image */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Select Profile Avatar</label>
            <div className="flex flex-wrap items-center gap-4">
              {/* Current Avatar circle */}
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary bg-slate-100 flex items-center justify-center shrink-0 shadow-md">
                {editImage ? (
                  <img src={editImage} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-gray-400" />
                )}
                <div className="absolute bottom-0 inset-x-0 bg-black/45 py-0.5 text-center">
                  <Camera className="w-3.5 h-3.5 text-white mx-auto" />
                </div>
              </div>

              {/* Preset avatars selection */}
              <div className="flex flex-wrap gap-2.5">
                {presetAvatars.map((url, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setEditImage(url)}
                    className={`w-12 h-12 rounded-full overflow-hidden border-2 transition hover:scale-105 cursor-pointer shadow-sm ${
                      editImage === url ? "border-primary scale-110 shadow" : "border-gray-200"
                    }`}
                  >
                    <img src={url} alt={`Avatar Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Custom URL Input option */}
            <div className="space-y-1 pt-2">
              <label className="text-[10px] font-bold text-gray-400">Or Paste Image URL</label>
              <input
                type="url"
                value={editImage}
                onChange={(e) => setEditImage(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition text-gray-600"
              />
            </div>
          </div>

          {/* Name and Mobile fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Rahul Kumar"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition text-sm text-gray-700 font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Contact Number (Mobile)</label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition text-sm text-gray-700 font-medium"
                required
              />
            </div>
          </div>

          {/* Email row (Disabled) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Email Address (Read-only)</label>
            <input
              type="email"
              value={rider?.email || ""}
              className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl outline-none text-sm text-gray-405 font-medium cursor-not-allowed"
              disabled
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-3 bg-primary hover:bg-amber-500 text-white font-extrabold rounded-xl transition cursor-pointer text-xs shadow-md shadow-amber-500/10 flex items-center gap-2 border-none"
            >
              {isUpdating ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Stats & Target Card */}
      <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-3xl shadow-xl shadow-amber-500/20 p-8 space-y-6 flex flex-col justify-between h-fit">
        <div className="space-y-4">
          <div className="inline-flex w-12 h-12 bg-white/20 rounded-2xl items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black">Partner Level</h3>
            <p className="text-white/80 text-xs mt-1">SrisCart Logistics Delivery Agent</p>
          </div>
        </div>

        <div className="space-y-3 pt-6 border-t border-white/20">
          <div className="flex justify-between text-xs font-bold text-white/90">
            <span>Performance Rating:</span>
            <span>4.9 ★</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-white/90">
            <span>Daily Target:</span>
            <span>{todayDeliveriesCount} / 5 Deliveries</span>
          </div>
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mt-1">
            <div 
              className="h-full bg-white transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, (todayDeliveriesCount / 5) * 100)}%` }}
            />
          </div>
        </div>

        <p className="text-[10px] text-white/60 leading-normal pt-2">
          Maintain your active duty state and complete daily goals to earn premium milestone bonuses!
        </p>
      </div>
    </div>
  );
};

export default RiderProfile;
