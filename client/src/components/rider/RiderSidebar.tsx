import React from "react";

interface SidebarLink {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface RiderSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarLinks: SidebarLink[];
}

const RiderSidebar: React.FC<RiderSidebarProps> = ({
  activeTab,
  setActiveTab,
  sidebarLinks,
}) => {
  return (
    <div className="md:w-64 w-16 border-r text-base border-gray-300 pt-4 flex flex-col bg-white shrink-0">
      {sidebarLinks.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-center md:justify-start py-3.5 px-2 md:px-4 gap-3 transition-all outline-none text-left cursor-pointer border-y-0 border-l-0 border-r-4 md:border-r-[6px] ${
              isActive
                ? "bg-primary/10 border-primary text-primary"
                : "bg-white hover:bg-gray-100/90 border-white text-gray-500"
            }`}
          >
            {item.icon}
            <p className="md:block hidden text-sm font-bold">{item.name}</p>
          </button>
        );
      })}
    </div>
  );
};

export default RiderSidebar;
