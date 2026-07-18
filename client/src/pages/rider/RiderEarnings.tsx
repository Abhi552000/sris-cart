import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getRiderHistory } from "../../services/riderService";
import { CURRENCY } from "../../constants";
import RiderStats from "../../components/rider/RiderStats";
import RiderHistory from "../../components/rider/RiderHistory";

const RiderEarnings = () => {
  const currency = CURRENCY;
  const { rider } = useOutletContext<any>();

  // States
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const data = await getRiderHistory();
      if (data.success) {
        setHistory(data.orders);
      }
    } catch (err: any) {
      console.error("Failed to load rider history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Calculate earnings stats
  const todayDateString = new Date().toDateString();
  const todayDeliveries = history.filter(
    (o) => new Date(o.updatedAt).toDateString() === todayDateString
  );
  
  const todayEarnings = todayDeliveries.length * 50;
  const totalEarnings = history.length * 50;
  
  const cashCollected = history
    .filter((o) => o.paymentType === "COD")
    .reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="md:p-10 p-4 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Earnings & History</h2>
      
      <RiderStats
        currency={currency}
        todayEarnings={todayEarnings}
        totalDeliveries={history.length}
        totalEarnings={totalEarnings}
        cashCollected={cashCollected}
      />

      <RiderHistory
        history={history}
        historyLoading={historyLoading}
        currency={currency}
      />
    </div>
  );
};

export default RiderEarnings;
