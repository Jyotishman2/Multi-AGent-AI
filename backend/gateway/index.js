import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import proxy from "express-http-proxy";
import morgan from "morgan";

import { getCurrentUser } from "./controllers/user.Controller.js";
import protect from "./middleware/auth.middleware.js";
import { proxyWithHeader } from "./utils/proxyWithHeaders.js";

dotenv.config();

const port = process.env.PORT;

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(morgan("dev"));

app.use(cookieParser());

app.use("/api/auth", proxy(process.env.AUTH_SERVICE));

app.use("/api/chat", protect, proxyWithHeader(process.env.CHAT_SERVICE));

app.use("/api/agent", protect, proxyWithHeader(process.env.AGENT_SERVICE));

app.use("/api/billing", protect, proxyWithHeader(process.env.BILLING_SERVICE));

app.use("/api/me", protect, getCurrentUser);

app.get("/", (req, res) => {
  res.json({
    message: "hello from gateway",
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Gateway running on port ${port}`);
});
