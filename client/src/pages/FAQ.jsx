import { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState("general");
  const [openIndex, setOpenIndex] = useState(null);

  const categories = [
    { id: "general", name: "General" },
    { id: "delivery", name: "Delivery" },
    { id: "payments", name: "Payments & Refunds" }
  ];

  const faqs = {
    general: [
      {
        question: "What is SrisCart?",
        answer: "SrisCart is an express online grocery delivery service bringing fresh vegetables, organic fruits, dairy items, bakery, and daily kitchen essentials to your doorstep in under 30 minutes."
      },
      {
        question: "Are your vegetables and fruits organic?",
        answer: "Yes, we partner directly with certified organic local farms to ensure that all fresh produce is sustainably sourced, freshly harvested, and delivered under strict quality standards."
      },
      {
        question: "How do I create a seller account?",
        answer: "If you want to sell products on SrisCart, go to the seller portal at /seller, log in with administrative credentials, and you can instantly list products and manage orders."
      }
    ],
    delivery: [
      {
        question: "How does the 30-minute delivery work?",
        answer: "Once you place an order, our system assigns it to a nearby local partner store. Your groceries are packed instantly and dispatched with express riders to reach you within 30 minutes."
      },
      {
        question: "Is delivery really free?",
        answer: "Yes, there is no delivery fee or subscription required on SrisCart. All express grocery orders are delivered completely free of charge!"
      },
      {
        question: "What are your delivery hours?",
        answer: "Our riders are on the road daily from 6:00 AM to 10:00 PM, including weekends and public holidays."
      }
    ],
    payments: [
      {
        question: "What payment methods do you accept?",
        answer: "We support Cash on Delivery (COD) and Online Payments via credit/debit cards processed securely through Stripe."
      },
      {
        question: "How do refunds work?",
        answer: "If you receive a damaged or unsatisfactory item, simply submit a request through email or phone within 24 hours. Refunds are processed immediately back to your original payment method or cash equivalent."
      },
      {
        question: "Can I cancel my order?",
        answer: "Orders can be cancelled at any time before dispatch. Since we pack and ship immediately, please contact support within 5 minutes of placing your order if you need to cancel."
      }
    ]
  };

  const toggleFaq = (index) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <div className="mt-16 pb-20 max-w-4xl mx-auto px-4">
      {/* Title */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="flex items-center gap-2 text-primary">
          <HelpCircle className="w-6 h-6 animate-pulse" />
          <span className="text-sm font-bold uppercase tracking-widest">Support Center</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mt-2">
          Frequently Asked <span className="text-primary bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Questions</span>
        </h1>
        <div className="w-16 h-1 bg-primary rounded-full mt-3"></div>
      </div>

      {/* Categories Tabs */}
      <div className="flex justify-center gap-3 border-b border-gray-200 pb-4 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
              setOpenIndex(null);
            }}
            className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all cursor-pointer ${
              activeCategory === cat.id
                ? "bg-primary text-white shadow-md shadow-yellow-500/10"
                : "bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {faqs[activeCategory].map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="bg-white border border-gray-100 shadow-md shadow-gray-50/50 rounded-2xl overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50/30 transition cursor-pointer"
              >
                <span className="font-bold text-gray-700 text-sm sm:text-base pr-4">
                  {faq.question}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-primary shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-6 pb-5 pt-1 text-gray-500 text-xs sm:text-sm leading-relaxed border-t border-gray-50/50 animate-in fade-in duration-200">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQ;
