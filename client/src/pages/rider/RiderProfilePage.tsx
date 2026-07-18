import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { updateRiderProfile, getRiderHistory } from "../../services/riderService";
import toast from "react-hot-toast";

// Components
import RiderProfile from "../../components/rider/RiderProfile";

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
];

const RiderProfilePage = () => {
  const { rider, setRider } = useOutletContext<any>();

  // Profile Edit states
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editImage, setEditImage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (rider) {
      setEditName(rider.name || "");
      setEditPhone(rider.phone || "");
      setEditImage(rider.image || "");
    }
  }, [rider]);

  const fetchHistory = async () => {
    try {
      const data = await getRiderHistory();
      if (data.success) {
        setHistory(data.orders || []);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      const data = await updateRiderProfile({
        name: editName,
        phone: editPhone,
        image: editImage
      });
      if (data.success) {
        setRider(data.rider);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred while updating profile");
    } finally {
      setIsUpdating(false);
    }
  };

  // Calculate today's deliveries
  const todayDateString = new Date().toDateString();
  const todayDeliveriesCount = history.filter(
    (o) => new Date(o.updatedAt).toDateString() === todayDateString
  ).length;

  return (
    <div className="md:p-10 p-4 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">My Profile Settings</h2>
      <RiderProfile
        rider={rider}
        editName={editName}
        setEditName={setEditName}
        editPhone={editPhone}
        setEditPhone={setEditPhone}
        editImage={editImage}
        setEditImage={setEditImage}
        presetAvatars={PRESET_AVATARS}
        isUpdating={isUpdating}
        handleUpdateProfile={handleUpdateProfile}
        todayDeliveriesCount={todayDeliveriesCount}
      />
    </div>
  );
};

export default RiderProfilePage;
