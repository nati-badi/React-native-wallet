import express from "express";
import dotenv from "dotenv";
import { sql } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();

// Middleware
app.use(rateLimiter);
app.use(express.json());

async function initDB() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS transactions(
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      title  VARCHAR(255) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      category VARCHAR(255) NOT NULL,
      created_at DATE NOT NULL DEFAULT CURRENT_DATE
    )`;

    console.log("Database initialized successfully");
  } catch (error) {
    console.log("Error initializing DB", error);
    process.exit(1); // status code 1 means failure, 0 means succuss
  }
}

app.post("/api/transactions", async (req, res) => {
  // title, amount, category, user_id
  try {
    const { title, amount, category, user_id } = req.body;

    if (!title || !user_id || !category || amount === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const transaction = await sql`
      INSERT INTO transactions (title, amount, category, user_id) 
      VALUES (${title}, ${amount}, ${category}, ${user_id}) 
      RETURNING *
      `;

    res.status(201).json({
      message: "Transaction created successfully",
      transaction: transaction[0],
    });
  } catch (error) {
    console.log("Error creating the transaction", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/transactions", async (req, res) => {
  try {
    const transactions = await sql`SELECT * FROM transactions`;

    res.status(200).json({
      message: "Transactions retrieved successfully",
      transactions,
    });
  } catch (error) {
    console.log("Error retrieving transactions", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/transactions/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const transactions =
      await sql`SELECT * FROM transactions WHERE user_id = ${user_id} ORDER BY created_at DESC`;

    if (transactions.length === 0) {
      return res
        .status(404)
        .json({ message: "No transactions found for this user" });
    }

    res.status(200).json({
      message: "Transactions retrieved successfully",
      transactions,
    });
  } catch (error) {
    console.log("Error retrieving transactions", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
      return res.status(500).json({ message: "id is not a number!" });
    }

    const transaction =
      await sql`DELETE FROM transactions WHERE id = ${id} RETURNING *`;

    if (transaction.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({
      message: "Transaction deleted successfully",
      transaction: transaction[0],
    });
  } catch (error) {
    console.log("Error deleting transaction", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/transactions/summary/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const balanceResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as balance FROM transactions WHERE user_id = ${user_id}
    `;

    const incomeResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as income FROM transactions WHERE user_id = ${user_id} AND category = 'income'
    `;

    const expenseResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as expense FROM transactions WHERE user_id = ${user_id} AND category = 'expense'
    `;

    const summary = {
      balance: balanceResult[0].balance,
      income: incomeResult[0].income,
      expense: expenseResult[0].expense,
    };

    res.status(200).json({
      message: "Transaction summary retrieved successfully",
      summary,
    });
  } catch (error) {
    console.log("Error retrieving transaction summary", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const PORT = process.env.PORT || 5001;

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on Port:${PORT}`);
  });
});
