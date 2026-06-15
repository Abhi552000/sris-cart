import Product from "../models/product.js";

// AI Chat handler: /api/ai/chat
export const chatWithAssistant = async (req, res) => {
  try {
    const { message, chatHistory } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        success: true,
        reply: "Hello! I am your SrisCart Grocery Assistant. Note: SrisCart AI is currently running in offline simulation mode because the GEMINI_API_KEY is not set in the server's .env file. Go to Google AI Studio (aistudio.google.com) to get a free API key and set it as GEMINI_API_KEY in your server/.env file to start chatting with real AI!"
      });
    }

    // 1. Fetch current active product list to teach Gemini our inventory
    const products = await Product.find({ inStock: true }).select("name price offerPrice category description");
    const inventoryText = products
      .map(
        (p) =>
          `- ${p.name} (Category: ${p.category}, Price: $${p.offerPrice}, Description: ${p.description.join(
            " "
          )})`
      )
      .join("\n");

    // 2. Build Gemini request payload
    // We add instructions as a system context prepended to user history
    const systemPrompt = `You are "SrisCart AI Assistant", a friendly, helpful grocery store helper.
Your job is to assist customers shopping on SrisCart.
Answer user questions about our inventory, suggest products, and provide helpful recipe ideas.

IMPORTANT: You ONLY recommend or refer to items that are currently in stock in our store database.
Here is our current active inventory of products in stock:
${inventoryText}

Store policies:
- Delivery time is under 30 minutes.
- Delivery is free for all orders.
- Orders can be paid with Cash On Delivery (COD) or Online via Stripe.

Be brief, concise, and helpful. Keep responses under 4 sentences unless asked for a detailed recipe. Format text clean (use bolding or bullet points where helpful).`;

    // Map chatHistory to Gemini API contents format
    // Gemini API structure: contents: [{ role: "user" | "model", parts: [{ text: "..." }] }]
    const contents = [];

    // Inject system prompt first
    contents.push({
      role: "user",
      parts: [{ text: systemPrompt }]
    });
    contents.push({
      role: "model",
      parts: [{ text: "Understood! I will act as SrisCart AI Assistant and only recommend products from the provided inventory." }]
    });

    // Add chat history
    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach((msg) => {
        contents.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      });
    }

    // Append the latest user message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({ contents }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error status:", response.status, data);
      throw new Error(data.error?.message || "Failed to fetch response from Gemini API");
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't process that. Please try again.";

    return res.json({ success: true, reply });
  } catch (error) {
    console.error("AI Assistant error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
