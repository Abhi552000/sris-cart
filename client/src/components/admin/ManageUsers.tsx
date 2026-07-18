import React from "react";
import { UserCheck, UserX } from "lucide-react";

interface ManageUsersProps {
  users: any[];
  handleUserToggle: (id: string) => void;
  loading: boolean;
}

const ManageUsers: React.FC<ManageUsersProps> = ({
  users,
  handleUserToggle,
  loading,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-8">
      {users.length === 0 ? (
        <p className="text-center py-10 text-gray-400 text-sm">No users registered.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-gray-500">
            <thead className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="pb-3 pr-2">Name</th>
                <th className="pb-3 pr-2">Email</th>
                <th className="pb-3 pr-2">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {users.map((item) => (
                <tr key={item._id}>
                  <td className="py-4 pr-2 font-bold text-gray-800">{item.name}</td>
                  <td className="py-4 pr-2 text-gray-500">{item.email}</td>
                  <td className="py-4 pr-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.status === "Active" 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      {item.status || "Active"}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => handleUserToggle(item._id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer inline-flex items-center gap-1 border-none ${
                        item.status === "Active" 
                          ? "bg-red-50 hover:bg-red-100 text-red-600" 
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                      }`}
                    >
                      {item.status === "Active" ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      {item.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
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

export default ManageUsers;
