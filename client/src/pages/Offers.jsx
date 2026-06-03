import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import ProductCard from "../components/ProductCard";
import { Tag, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

const Offers = () => {
  const { products } = useAppContext();
  const [copiedCode, setCopiedCode] = useState(null);

  const coupons = [
    {
      code: "FREESHIP",
      description: "Free delivery on all grocery orders with no minimum order value.",
      tag: "Free Shipping"
    },
    {
      code: "SRIS20",
      description: "Get 20% off on your first order of fresh fruits and organic vegetables.",
      tag: "New User Offer"
    },
    {
      code: "FESTIVE10",
      description: "Flat $10 cashback on orders above $100 using online payment.",
      tag: "Cashback Deal"
    }
  ];

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filter products where there is an active discount (offerPrice < price)
  const discountedProducts = products
    ? products.filter((p) => p.offerPrice < p.price && p.inStock)
    : [];

  return (
    <div className="mt-16 pb-20 max-w-6xl mx-auto px-4">
      {/* Title */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="flex items-center gap-2 text-primary">
          <Tag className="w-6 h-6 animate-pulse" />
          <span className="text-sm font-bold uppercase tracking-widest">Offers & Deals</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mt-2">
          Deals of the <span className="text-primary bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Day</span>
        </h1>
        <div className="w-16 h-1 bg-primary rounded-full mt-3"></div>
      </div>

      {/* Coupons Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {coupons.map((coupon) => (
          <div
            key={coupon.code}
            className="border-2 border-dashed border-primary/40 bg-primary/5 rounded-2xl p-6 relative flex flex-col justify-between overflow-hidden shadow-sm"
          >
            {/* Tag */}
            <span className="self-start text-[10px] font-bold uppercase bg-primary text-white px-2.5 py-1 rounded-full mb-4">
              {coupon.tag}
            </span>

            <div>
              {/* Code */}
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-xl font-black text-gray-800 tracking-wider">
                  {coupon.code}
                </span>
                <button
                  onClick={() => handleCopyCode(coupon.code)}
                  className="p-2 bg-white border border-gray-100 rounded-xl shadow-sm text-gray-500 hover:text-primary transition-colors cursor-pointer"
                >
                  {copiedCode === coupon.code ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                {coupon.description}
              </p>
            </div>

            {/* Circular cutouts for coupon aesthetic */}
            <div className="w-4 h-4 bg-white border-r border-gray-300/40 rounded-full absolute -left-2 top-1/2 -translate-y-1/2"></div>
            <div className="w-4 h-4 bg-white border-l border-gray-300/40 rounded-full absolute -right-2 top-1/2 -translate-y-1/2"></div>
          </div>
        ))}
      </div>

      {/* Active Store Discounts */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span>Active Discounts</span>
          <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
            SAVE BIG
          </span>
        </h2>

        {discountedProducts.length === 0 ? (
          <p className="text-gray-500 text-sm">No promotional discounts are active today. Check back later!</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] gap-6 w-full">
            {discountedProducts.map((product) => (
              <div key={product._id} className="min-w-0 w-full h-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;
