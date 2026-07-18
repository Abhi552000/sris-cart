import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import connectDB from "./configs/db.js";
import "dotenv/config";
import userRouter from "./routes/userRoute.js";
import sellerRouter from "./routes/sellerRoute.js";
import connectCloudinary from "./configs/cloudinary.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import addressRouter from "./routes/addressRoute.js";
import orderRouter from "./routes/orderRoute.js";
import aiRouter from "./routes/aiRoute.js";
import riderRouter from "./routes/riderRoute.js";
import adminRouter from "./routes/adminRoute.js";
import { stripeWebhooks } from "./controllers/orderController.js";

// Middlewares
import logger from "./middlewares/logger.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();
const port = process.env.PORT || 4000;

await connectDB();
await connectCloudinary();

const allowedOrigins = ["http://localhost:5173","https://sris-cart.vercel.app"];

app.post("/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

// Apply Security and Performance Optimization Middlewares
app.use(helmet({ contentSecurityPolicy: false })); // allows OpenStreetMap loading
app.use(compression());
app.use(logger);

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.get("/", (req, res) => res.send("API is Working"));
app.use("/api/user", userRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);
app.use("/api/ai", aiRouter);
app.use("/api/rider", riderRouter);
app.use("/api/admin", adminRouter);

// Global Error Handler Middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
