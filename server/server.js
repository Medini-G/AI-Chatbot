import express from "express";
import cors from "cors";

import env from "./config/env.js";
import chatRoutes from "./routes/chatRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// ================================
// Middleware
// ================================

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin === env.clientUrl ||
        origin === "http://127.0.0.1:5173" ||
        origin === "http://localhost:5173"
      ) {
        callback(null, true);
      } else {
        callback(
          new Error(
            `CORS policy does not allow origin ${origin}`
          )
        );
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ================================
// Health Check
// ================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Realtime AI Chatbot Backend is running.",
    status: "online",
    timestamp: new Date().toISOString(),
  });
});

// ================================
// Chat Routes
// ================================

app.use("/api/chat", chatRoutes);

// ================================
// Error Handler
// ================================

app.use(errorHandler);

// ================================
// Start Server
// ================================

app.listen(env.port, () => {
  console.log("");
  console.log("=================================");
  console.log("Realtime AI Chatbot Backend");
  console.log("=================================");
  console.log(`Server: http://localhost:${env.port}`);
  console.log(`Client: ${env.clientUrl}`);
  console.log(`AI Model: ${env.geminiModel}`);
  console.log("=================================");
  console.log("");
});