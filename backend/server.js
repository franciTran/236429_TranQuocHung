require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const foodRoutes = require("./routes/foodRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend API is running",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/foods", foodRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint không tồn tại",
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Thiếu biến MONGODB_URI trong file .env");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB Atlas connected successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Cannot start server:", error.message);
    process.exit(1);
  }
}

startServer();