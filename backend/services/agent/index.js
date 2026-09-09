import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import router from "./routes/agent.route.js";
import pdfRouter from "./pdf/routes/pdf.route.js";

dotenv.config();

const port = process.env.PORT || 8003;

const app = express();

app.use(express.json());

app.use("/", router);
app.use("/pdf", pdfRouter);

app.get("/", (req, res) => {
  res.json({ message: "hello from agent" });
});

app.listen(port, "0.0.0.0", async () => {
  console.log(`agent started at ${port}`);
  await connectDb();
});