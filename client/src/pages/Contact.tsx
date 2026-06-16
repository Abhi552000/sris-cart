import { useState } from "react";
import toast from "react-hot-toast";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Simulate an API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.success("Thank you for reaching out! We'll get back to you shortly.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-16 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Title */}
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight">
          Contact <span className="text-primary bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Us</span>
        </h1>
        <div className="w-20 h-1 bg-primary rounded-full mt-3"></div>
        <p className="text-gray-500 mt-4 max-w-md text-sm sm:text-base">
          Have questions, feedback, or need help? We'd love to hear from you. Reach out and our team will get right back to you!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Contact Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-gray-100 shadow-xl shadow-gray-100/50 rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-3">
              Office Information
            </h2>

            {/* Address */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">Our Location</h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                  123 Fresh Way, Food District,<br />
                  Bengaluru, Karnataka 560001
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">Call Us</h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-1 hover:text-primary transition-colors">
                  <a href="tel:+919876543210">+91 98765 43210</a>
                </p>
                <p className="text-gray-400 text-[11px] mt-0.5">Mon - Sat: 9 AM - 6 PM</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">Email Support</h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-1 hover:text-primary transition-colors">
                  <a href="mailto:support@sriscart.com">support@sriscart.com</a>
                </p>
                <p className="text-gray-500 text-xs sm:text-sm hover:text-primary transition-colors">
                  <a href="mailto:info@sriscart.com">info@sriscart.com</a>
                </p>
              </div>
            </div>

            {/* Hours */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">Delivery Hours</h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                  Daily: 6:00 AM - 10:00 PM
                </p>
                <p className="text-gray-400 text-[11px] mt-0.5">30-min express deliveries</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-100 shadow-xl shadow-gray-100/50 rounded-2xl p-6 sm:p-8 space-y-5"
          >
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-3">
              Send a Message
            </h2>

            {/* Name & Email Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="name" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  disabled={loading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-primary transition text-gray-700 placeholder-gray-400 text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-primary transition text-gray-700 placeholder-gray-400 text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label htmlFor="subject" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                required
                disabled={loading}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="How can we help you?"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-primary transition text-gray-700 placeholder-gray-400 text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Message */}
            <div className="space-y-1">
              <label htmlFor="message" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Message
              </label>
              <textarea
                id="message"
                required
                rows={5}
                disabled={loading}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-primary transition text-gray-700 placeholder-gray-400 text-sm resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-yellow-500/20 hover:shadow-xl hover:shadow-yellow-500/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed text-sm`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending Message...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
