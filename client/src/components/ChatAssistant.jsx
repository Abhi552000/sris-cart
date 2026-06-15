import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, User, Loader2 } from "lucide-react";
import { chatWithAI } from "../services/aiService";

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "Hi there! 👋 I am your SrisCart AI Grocery Assistant. How can I help you shop today? You can ask me about in-stock products, recipes, or delivery info!"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    "What fresh fruits are in stock?",
    "Recommend a quick recipe",
    "Tell me about delivery times & fees"
  ];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || message;
    if (!text.trim()) return;

    // Add user message to state
    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: text
    };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setLoading(true);

    try {
      const data = await chatWithAI(
        text,
        messages.map((m) => ({
          sender: m.sender,
          text: m.text
        }))
      );

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "bot",
            text: data.reply
          }
        ]);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "Sorry, I had trouble connecting to my brain. Please try again in a moment!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedLine = (line, idx) => {
    // Check if line is a bullet point
    const isBullet = line.trim().startsWith("* ") || line.trim().startsWith("- ");
    const cleanLine = isBullet ? line.trim().substring(2) : line;

    const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
    const formattedParts = parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-extrabold text-gray-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    if (isBullet) {
      return (
        <li className="list-disc ml-4 mt-1" key={idx}>
          {formattedParts}
        </li>
      );
    }

    return (
      <p key={idx} className={idx > 0 ? "mt-1.5" : ""}>
        {formattedParts}
      </p>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-yellow-500/20 hover:scale-105 transition-all duration-300 cursor-pointer relative group border-2 border-white"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
          {/* Tooltip */}
          <span className="absolute -top-12 right-0 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md">
            Ask SrisCart AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[320px] sm:w-[380px] h-[500px] bg-white/90 backdrop-blur-md border border-gray-100 shadow-2xl rounded-2xl flex flex-col justify-between overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">SrisCart AI Assistant</h3>
                <p className="text-[10px] text-white/80">Online & Free</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    msg.sender === "user"
                      ? "bg-primary text-white"
                      : "bg-gradient-to-r from-yellow-400 to-amber-500 text-white"
                  }`}
                >
                  {msg.sender === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-3.5 h-3.5" />}
                </div>

                {/* Bubble Text */}
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-primary text-white rounded-tr-none"
                      : "bg-white border border-gray-100 text-gray-700 rounded-tl-none"
                  }`}
                >
                  {msg.text.split("\n").map((line, idx) => renderFormattedLine(line, idx))}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white flex items-center justify-center shrink-0">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white border border-gray-100 text-gray-400 rounded-2xl rounded-tl-none px-3.5 py-2 text-sm shadow-sm flex items-center gap-1.5 font-medium">
                  Assistant is typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input & Quick Suggestions */}
          <div className="p-3 bg-white border-t border-gray-100 space-y-3">
            {/* Quick suggestions chips */}
            {messages.length === 1 && !loading && (
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                  Suggestions:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-200 cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                disabled={loading}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about groceries, delivery..."
                type="text"
                className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-primary transition disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="w-9 h-9 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-yellow-500/10 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatAssistant;
