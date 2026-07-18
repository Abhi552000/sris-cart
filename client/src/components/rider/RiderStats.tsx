import React from "react";
import { DollarSign, Bike, TrendingUp } from "lucide-react";

interface RiderStatsProps {
  currency: string;
  todayEarnings: number;
  totalDeliveries: number;
  totalEarnings: number;
  cashCollected: number;
}

const RiderStats: React.FC<RiderStatsProps> = ({
  currency,
  todayEarnings,
  totalDeliveries,
  totalEarnings,
  cashCollected,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-md flex items-center gap-4">
        <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
          <DollarSign className="w-6 h-6" />
        </div>
        <div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Today's Earnings</p>
          <p className="text-2xl font-black text-gray-800">{currency}{todayEarnings}</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-md flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
          <Bike className="w-6 h-6" />
        </div>
        <div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Total Deliveries</p>
          <p className="text-2xl font-black text-gray-800">{totalDeliveries}</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-md flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Total Earnings</p>
          <p className="text-2xl font-black text-gray-800">{currency}{totalEarnings}</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-md flex items-center gap-4">
        <div className="w-12 h-12 bg-purple-500/10 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
          <DollarSign className="w-6 h-6" />
        </div>
        <div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">COD Collected</p>
          <p className="text-2xl font-black text-gray-800">{currency}{cashCollected}</p>
        </div>
      </div>
    </div>
  );
};

export default RiderStats;
