import { Truck, ShieldCheck, Timer, MapPin } from "lucide-react";

const DeliveryInfo = () => {
  const steps = [
    {
      icon: <Timer className="w-6 h-6 text-primary" />,
      title: "Under 30 Minutes",
      description: "We deliver all fresh fruits, veggies, dairy, and pantry stables in 30 minutes flat."
    },
    {
      icon: <Truck className="w-6 h-6 text-primary" />,
      title: "100% Free Shipping",
      description: "Absolutely no delivery charges or subscription fees apply on SrisCart."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-primary" />,
      title: "Freshness Guaranteed",
      description: "Our cold-chain and express transit system ensures your greens remain crispy and ice cream stays cold."
    }
  ];

  return (
    <div className="mt-16 pb-20 max-w-4xl mx-auto px-4">
      {/* Title */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="flex items-center gap-2 text-primary">
          <Truck className="w-6 h-6 animate-pulse" />
          <span className="text-sm font-bold uppercase tracking-widest">Shipping Guide</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mt-2">
          Delivery <span className="text-primary bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Information</span>
        </h1>
        <div className="w-16 h-1 bg-primary rounded-full mt-3"></div>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-100 shadow-lg shadow-gray-50/50 rounded-2xl p-6 text-center flex flex-col items-center space-y-4 hover:-translate-y-1 transition-transform"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              {step.icon}
            </div>
            <h3 className="font-bold text-gray-800 text-base">{step.title}</h3>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      {/* Area & Hours */}
      <div className="bg-white border border-gray-100 shadow-xl shadow-gray-100/50 rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span>Delivery Coverage</span>
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-4">
            We currently deliver express groceries in major residential zones across Bengaluru, Karnataka, including Indiranagar, HSR Layout, Koramangala, Whitefield, and surrounding neighborhoods.
          </p>
          <p className="text-gray-400 text-xs leading-relaxed">
            *If your address is outside our 30-min express radius, delivery might take up to 45 minutes. Enter your location at checkout to check coverage.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Timer className="w-5 h-5 text-primary" />
            <span>Timing & Slots</span>
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
            Deliveries are made from **6:00 AM to 10:00 PM** every single day. Orders placed after 9:45 PM will automatically be scheduled for the early morning slot starting at 6:00 AM.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryInfo;
