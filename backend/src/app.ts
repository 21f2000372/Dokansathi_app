import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import inventoryRoutes from "./routes/inventoryRoutes";
import orderRoutes from "./routes/orderRoutes";
import queueRoutes from "./routes/queueRoutes";
import taskRoutes from "./routes/taskRoutes";
import billRoutes from "./routes/billRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import aiRoutes from "./routes/aiRoutes";





const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// app.use("/products", productRoutes);
// app.use("/inventory",inventoryRoutes);
// app.use("/orders",orderRoutes);
// app.use("/queue",queueRoutes);
// app.use("/tasks",taskRoutes);
// app.use("/bills", billRoutes);
// app.use("/payments", paymentRoutes);


app.use("/api/products", productRoutes);

app.use("/api/inventory", inventoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);



app.get("/", (_req, res) => {
  res.json({
    message: "DokanSathi API is running",
  });
});



export default app;