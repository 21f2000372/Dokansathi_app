import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import inventoryRoutes from "./routes/inventoryRoutes";
import orderRoutes from "./routes/orderRoutes";
import queueRoutes from "./routes/queueRoutes";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/products", productRoutes);
app.use("/inventory",inventoryRoutes);
app.use("/orders",orderRoutes);
app.use("/queue",queueRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "DokanSathi API is running",
  });
});

app.use("/api/auth", authRoutes);

export default app;