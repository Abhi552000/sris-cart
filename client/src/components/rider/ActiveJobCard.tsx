import React from "react";
import { MapPin, Navigation, Bike, CheckCircle } from "lucide-react";

interface ActiveJobCardProps {
  activeJob: any;
  currency: string;
  simulating: boolean;
  simProgress: number;
  startDeliverySimulation: () => void;
  markJobCompleted: () => void;
}

const ActiveJobCard: React.FC<ActiveJobCardProps> = ({
  activeJob,
  currency,
  simulating,
  simProgress,
  startDeliverySimulation,
  markJobCompleted,
}) => {
  if (!activeJob) return null;

  const status = activeJob.status?.toLowerCase() || "";

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-5">
      <div className="flex justify-between items-start">
        <div>
          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-[9px] font-black uppercase tracking-wider">
            Assigned Job
          </span>
          <h3 className="font-extrabold text-gray-800 text-lg mt-1.5">
            Order #{activeJob._id.substring(activeJob._id.length - 8).toUpperCase()}
          </h3>
        </div>
        <span className="text-lg font-black text-primary">
          {currency}{activeJob.amount}
        </span>
      </div>

      {/* Destination address */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs sm:text-sm space-y-2">
        <p className="font-bold text-gray-700 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
          <span>Deliver To:</span>
        </p>
        <div className="pl-5 text-gray-600 text-xs leading-relaxed space-y-0.5">
          <p className="font-bold text-gray-800">{activeJob.address?.firstName} {activeJob.address?.lastName}</p>
          <p>{activeJob.address?.street}</p>
          <p>{activeJob.address?.city}, {activeJob.address?.state}</p>
          <p className="text-gray-400 mt-1 font-semibold">Phone: {activeJob.address?.phone}</p>
        </div>
      </div>

      {/* Simulation status bar */}
      {simulating && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-gray-600">
            <span className="flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-emerald-500 animate-spin" /> Transit Simulation Progress
            </span>
            <span>{simProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200 shadow-inner">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${simProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="pt-2">
        {(status === "rider_assigned" || status === "rider assigned") && (
          <button
            onClick={startDeliverySimulation}
            className="w-full py-3.5 bg-primary hover:bg-amber-500 text-white font-extrabold rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 text-sm border-none"
          >
            <Bike className="w-5 h-5" /> Start Transit Simulation
          </button>
        )}

        {(status === "out_for_delivery" || status === "out for delivery") && (
          <button
            disabled={simulating || simProgress < 100}
            onClick={markJobCompleted}
            className={`w-full py-3.5 text-white font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm border-none ${
              simProgress < 100 
                ? "bg-gray-300 cursor-not-allowed shadow-none" 
                : "bg-emerald-500 hover:bg-emerald-600 cursor-pointer"
            }`}
          >
            <CheckCircle className="w-5 h-5" /> Mark Order Delivered
          </button>
        )}
      </div>
    </div>
  );
};

export default ActiveJobCard;
