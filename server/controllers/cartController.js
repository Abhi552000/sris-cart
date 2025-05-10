import User from "../models/user.js";

// Update User Cart data: /api/cart/update
export const updateCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItems } = req.body;
    console.log("userId", userId, cartItems);
    await User.findByIdAndUpdate(userId, { cartItems });
    res.json({ success: true, message: "Cart Updated" });
  } catch (error) {
    console.log("error", error.message);
    res.json({ success: false, message: error.message });
  }
};
