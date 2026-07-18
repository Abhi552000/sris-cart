import React from "react";

interface AvailableJobsListProps {
  jobs: any[];
  jobsLoading: boolean;
  currency: string;
  handleAcceptOrder: (id: string) => void;
  riderStatus: string;
}

const AvailableJobsList: React.FC<AvailableJobsListProps> = ({
  jobs,
  jobsLoading,
  currency,
  handleAcceptOrder,
  riderStatus,
}) => {
  const openJobs = jobs.filter(
    (j: any) => j.status?.toLowerCase() === "order_accepted" || j.status?.toLowerCase() === "order accepted"
  );

  if (riderStatus !== "Active") return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md flex-1">
      <h3 className="font-bold text-gray-800 mb-4 text-base flex justify-between items-center">
        <span>Available Delivery Jobs</span>
        <span className="px-2 py-0.5 bg-gray-105 border border-gray-200 text-gray-500 font-bold rounded text-xs shrink-0">
          {openJobs.length} Open
        </span>
      </h3>

      {jobsLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-primary"></div>
        </div>
      ) : openJobs.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-xs">
          No new jobs pending accept at this time.
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto max-h-[300px] no-scrollbar pr-1">
          {openJobs.map((job: any) => (
            <div
              key={job._id}
              className="border border-gray-200 rounded-xl p-4 flex justify-between items-center hover:border-primary/50 hover:bg-amber-50/5 transition duration-150"
            >
              <div className="space-y-1">
                <p className="font-bold text-gray-800 text-xs sm:text-sm">
                  Order #{job._id.substring(job._id.length - 8).toUpperCase()}
                </p>
                <p className="text-[11px] text-gray-500">
                  {job.address?.street}, {job.address?.city}
                </p>
                <p className="text-[10px] font-bold text-primary">
                  Value: {currency}{job.amount}
                </p>
              </div>
              <button
                onClick={() => handleAcceptOrder(job._id)}
                className="px-3.5 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-extrabold rounded-lg text-xs transition cursor-pointer shrink-0 shadow-sm border-none"
              >
                Accept Job
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableJobsList;
