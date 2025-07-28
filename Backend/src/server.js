import express from "express";
import dotenv from "dotenv";
import { initDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

import transactionsRoute from "./routes/transactionsRoute.js";

dotenv.config();

const app = express();

// Middleware
app.use(rateLimiter);
app.use(express.json());

app.use("/api/transactions", transactionsRoute);

const PORT = process.env.PORT || 5001;

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on Port:${PORT}`);
  });
});
