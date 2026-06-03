import { ShieldAlert, RefreshCw, Sparkles, PhoneCall } from "lucide-react";
import { Link } from "react-router-dom";

const ReturnRefund = () => {
  const policies = [
    {
      icon: <RefreshCw className="w-5 h-5 text-primary" />,
      title: "Freshness Fresh Return",
      description: "For vegetables, fruits, dairy, or bakery items, reports made within 24 hours of delivery are eligible for a no-questions-asked refund or replacement if quality standards aren't met."
    },
    {
      icon: <ShieldAlert className="w-5 h-5 text-primary" />,
      title: "Packaged Goods Return",
      description: "Packaged food items, chips, cereals, grains, and beverages are eligible for returns within 7 days of delivery, provided the packages are unopened and sealed."
    },
    {
      icon: <Sparkles className="w-5 h-5 text-primary" />,
      title: "Refund Timeline",
      description: "Refunds for Cash on Delivery (COD) are paid instantly in cash or store credits. Online card payments (Stripe) are returned back to your original source in 2-5 business days."
    }
  ];

  return (
    <div className="mt-16 pb-20 max-w-4xl mx-auto px-4">
      {/* Title */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="flex items-center gap-2 text-primary">
          <RefreshCw className="w-6 h-6 animate-spin" style={{ animationDuration: "6s" }} />
          <span className="text-sm font-bold uppercase tracking-widest">Customer Guarantee</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mt-2">
          Return & Refund <span className="text-primary bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Policy</span>
        </h1>
        <div className="w-16 h-1 bg-primary rounded-full mt-3"></div>
      </div>

      {/* Guidelines list */}
      <div className="space-y-6 mb-16">
        {policies.map((policy, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-100 shadow-md shadow-gray-50/50 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:-translate-y-0.5 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              {policy.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm sm:text-base">{policy.title}</h3>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mt-1">
                {policy.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Need Help CTA */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center space-y-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
          <PhoneCall className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold text-gray-800">Need to initiate a return?</h2>
        <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
          Contact SrisCart Customer Service instantly. Our team is online 24/7 to resolve disputes, resend products, or initiate refunds.
        </p>
        <div>
          <Link
            to="/contact"
            className="inline-block px-6 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-semibold rounded-xl text-xs uppercase shadow-md shadow-yellow-500/10 cursor-pointer hover:shadow-lg"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReturnRefund;
