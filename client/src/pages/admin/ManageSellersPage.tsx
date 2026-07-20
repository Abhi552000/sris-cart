import React, { useEffect, useState } from "react";
import { getAdminSellers, toggleSellerStatus } from "../../services/adminService";
import toast from "react-hot-toast";
import { AlertTriangle, Info, X } from "lucide-react";

// Components
import ManageSellers from "../../components/admin/ManageSellers";

const ManageSellersPage = () => {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<any | null>(null);
  const [remarks, setRemarks] = useState("");
  const [toggling, setToggling] = useState(false);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const data = await getAdminSellers();
      if (data.success) {
        setSellers(data.sellers || []);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load sellers list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const triggerToggleModal = (seller: any) => {
    setSelectedSeller(seller);
    setRemarks("");
    setShowModal(true);
  };

  const handleConfirmToggle = async () => {
    if (!selectedSeller) return;

    const willDeactivate = selectedSeller.status === "Active";
    if (willDeactivate && !remarks.trim()) {
      return toast.error("Please enter a deactivation reason/remarks!");
    }

    try {
      setToggling(true);
      const data = await toggleSellerStatus(selectedSeller._id, willDeactivate ? remarks : undefined);
      if (data.success) {
        toast.success(data.message);
        setShowModal(false);
        setSelectedSeller(null);
        setRemarks("");
        fetchSellers();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle seller status");
    } finally {
      setToggling(false);
    }
  };

  const onToggleTrigger = (sellerId: string) => {
    const sellerObj = sellers.find((s) => s._id === sellerId);
    if (sellerObj) {
      triggerToggleModal(sellerObj);
    }
  };

  return (
    <div className="md:p-10 p-4 space-y-6 flex-1 relative">
      <div className="flex flex-col items-start">
        <h2 className="text-2xl font-bold text-gray-800">Manage Sellers</h2>
        <div className="w-12 h-1 bg-primary rounded-full mt-2"></div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-primary"></div>
        </div>
      ) : (
        <ManageSellers
          sellers={sellers}
          handleSellerToggle={onToggleTrigger}
          loading={loading}
        />
      )}

      {/* Confirmation & Remarks Modal */}
      {showModal && selectedSeller && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden transform scale-100 transition-all">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <AlertTriangle className={`w-5 h-5 ${selectedSeller.status === "Active" ? "text-amber-500" : "text-emerald-500"}`} />
                <span>Confirm Status Change</span>
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                Are you sure you want to {selectedSeller.status === "Active" ? (
                  <span className="text-red-600 font-bold">deactivate</span>
                ) : (
                  <span className="text-emerald-600 font-bold">activate</span>
                )}{" "}
                seller <strong className="text-gray-800">{selectedSeller.storeName}</strong> ({selectedSeller.email})?
              </p>

              {selectedSeller.status === "Active" ? (
                <div className="flex flex-col gap-1.5 pt-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-gray-400" />
                    Deactivation Reason / Remarks
                  </label>
                  <textarea
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g. Failure to comply with platform standards, shop closure"
                    required
                    className="w-full text-sm outline-none border border-gray-255 rounded-xl py-2 px-3 focus:border-red-400 focus:ring-2 focus:ring-red-100 transition resize-none text-gray-700"
                  ></textarea>
                </div>
              ) : (
                <p className="text-xs text-gray-400 bg-emerald-50 text-emerald-700 p-3 rounded-lg border border-emerald-100">
                  * Activating this merchant will instantly restore their ability to manage products and fulfill customer orders.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-50 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-semibold rounded-lg cursor-pointer transition bg-transparent"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={toggling}
                onClick={handleConfirmToggle}
                className={`px-5 py-2 text-white text-sm font-bold rounded-lg cursor-pointer transition flex items-center gap-1 border-none shadow-md ${
                  selectedSeller.status === "Active"
                    ? "bg-red-500 hover:bg-red-600 shadow-red-500/10"
                    : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10"
                }`}
              >
                {toggling ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : selectedSeller.status === "Active" ? (
                  "Confirm Deactivate"
                ) : (
                  "Confirm Activate"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSellersPage;
