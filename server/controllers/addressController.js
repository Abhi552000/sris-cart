import Address from "../models/Address.js";

// Add Address : /api/address/add
export const addAddress = async (req, res) => {
  try {
    const { address } = req.body;
    console.log("addAddress received address:", address);
    const userId = req.user.id;
    const newAddress = await Address.create({ ...address, userId });
    console.log("addAddress created newAddress:", newAddress);
    res.json({ success: true, message: "Address added successfully" });
  } catch (error) {
    console.log("error", error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get Address : /api/address/get
export const getAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const address = await Address.find({ userId });
    console.log("getAddress fetched addresses:", address);
    res.json({ success: true, address });
  } catch (error) {
    console.log("error", error.message);
    res.json({ success: false, message: error.message });
  }
};
