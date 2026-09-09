import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import billingRoutes from "./routes/billing.route.js";

dotenv.config();

const port = process.env.PORT;

const app = express();

app.use(express.json());

app.use("/", billingRoutes);

app.get("/", (req, res) => {
  res.json({ message: "hello from billing" });
});

app.listen(port, () => {
  console.log(`billing started at ${port}`);
  connectDb();
});