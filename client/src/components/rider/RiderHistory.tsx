import React from "react";

interface RiderHistoryProps {
  history: any[];
  historyLoading: boolean;
  currency: string;
}

const RiderHistory: React.FC<RiderHistoryProps> = ({
  history,
  historyLoading,
  currency,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-8">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Completed Deliveries Log</h3>
      
      {historyLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-primary"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          No completed deliveries on record.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-gray-500">
            <thead className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="pb-3 pr-2">Order ID</th>
                <th className="pb-3 pr-2">Date</th>
                <th className="pb-3 pr-2">Customer</th>
                <th className="pb-3 pr-2">Address</th>
                <th className="pb-3 pr-2">Payment</th>
                <th className="pb-3 pr-2">Amount</th>
                <th className="pb-3 text-right">Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {history.map((order) => (
                <tr key={order._id}>
                  <td className="py-4 pr-2 font-bold text-gray-800">
                    #{order._id.substring(order._id.length - 8).toUpperCase()}
                  </td>
                  <td className="py-4 pr-2 text-gray-500">
                    {new Date(order.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 pr-2 font-medium">
                    {order.address?.firstName} {order.address?.lastName}
                  </td>
                  <td className="py-4 pr-2 text-xs text-gray-400 max-w-xs truncate">
                    {order.address?.street}, {order.address?.city}
                  </td>
                  <td className="py-4 pr-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      order.paymentType === "COD" 
                        ? "bg-purple-55 text-purple-700 border border-purple-200" 
                        : "bg-emerald-55 text-emerald-700 border border-emerald-200"
                    }`}>
                      {order.paymentType}
                    </span>
                  </td>
                  <td className="py-4 pr-2 font-semibold">
                    {currency}{order.amount}
                  </td>
                  <td className="py-4 text-right font-bold text-emerald-600">
                    +{currency}50.00
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RiderHistory;
