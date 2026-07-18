import Order from "../models/Order.js";
import Product from "../models/product.js";
import stripe from "stripe";
import User from "../models/user.js";

//Placed order COD : /api/order/cod
export const placeOrderCOD = async (req, res) => {
  try {
    const { userId, items, address, discount = 0 } = req.body;
    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Inalid data" });
    }

    // Calculate Amount Using Items
    let baseAmount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    // Apply Discount
    let discountedAmount = Math.max(0, baseAmount - discount);

    // Add Tax charges(2%)
    let finalAmount = discountedAmount + Math.round(discountedAmount * 0.02);

    await Order.create({
      userId,
      items,
      amount: finalAmount,
      address,
      paymentType: "COD",
    });

    return res.json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    console.log("error", error.message);
    res.json({ success: false, message: error.message });
  }
};

//Placed order STRIPE : /api/order/stripe
export const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, address, discount = 0 } = req.body;
    const origin = req.headers.origin;

    console.log("origin", origin);

    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Inalid data" });
    }

    let productData = [];

    // Calculate Amount Using Items
    let baseAmount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    // Apply Discount
    let discountedAmount = Math.max(0, baseAmount - discount);

    // Add Tax charges(2%)
    let finalAmount = discountedAmount + Math.round(discountedAmount * 0.02);

    const order = await Order.create({
      userId,
      items,
      amount: finalAmount,
      address,
      paymentType: "Online",
    });

    // Stripe Gateway Initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    // Calculate proportional discount ratio for line items
    const discountRatio = baseAmount > 0 ? discountedAmount / baseAmount : 1;

    // create line items for stripe
    const line_items = productData.map((item) => {
      const adjustedPrice = item.price * discountRatio;
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(adjustedPrice * 1.02 * 100),
        },
        quantity: item.quantity,
      };
    });

    // create session
    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    return res.json({ success: true, url: session.url });
  } catch (error) {
    console.log("error", error.message);
    res.json({ success: false, message: error.message });
  }
};

// Stripe webhook to verify payment action:"/stripe"
export const stripeWebhooks = async (request, response) => {
  // Stripe Gateway Initialize
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

  const sig = request.headers["stripe-signature"];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    response.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      // Getting Session Metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { orderId, userId } = session.data[0].metadata;

      // Make payment as paid
      await Order.findByIdAndUpdate(orderId, { isPaid: true });

      // Clear user cart
      await User.findByIdAndUpdate(userId, { cartItems: {} });
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      // Getting Session Metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { orderId } = session.data[0].metadata;
      await Order.findByIdAndDelete(orderId, { isPaid: true });
      break;
    }

    default:
      console.error(`Unhandled event type ${event.type}`);
      break;
  }
  response.json({ received: true });
};

// Get Orders by User ID : /api/order/user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.log("error", error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get All Orders(for seller/admin) : /api/order/seller
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.log("error", error.message);
    res.json({ success: false, message: error.message });
  }
};

// Update Order Status (for seller/admin) : /api/order/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }
    return res.json({ success: true, message: "Order status updated successfully", order });
  } catch (error) {
    console.log("error", error.message);
    res.json({ success: false, message: error.message });
  }
};
