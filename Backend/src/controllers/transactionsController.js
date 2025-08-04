import { sql } from "../config/db.js";

export async function createTransaction(req, res) {
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
}

export async function getAllTransactions(req, res) {
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
}

export async function getTransactionByUserId(req, res) {
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
}

export async function deleteTransactionById(req, res) {
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
}

export async function transactionSummary(req, res) {
  try {
    const { user_id } = req.params;

    // const balanceResult = await sql`
    //   SELECT COALESCE(SUM(amount), 0) as balance FROM transactions WHERE user_id = ${user_id}
    // `;

    // const incomeResult = await sql`
    //   SELECT COALESCE(SUM(amount), 0) as income FROM transactions WHERE user_id = ${user_id} AND amount > 0
    // `;

    // const expenseResult = await sql`
    //   SELECT COALESCE(SUM(amount), 0) as expense FROM transactions WHERE user_id = ${user_id} AND amount < 0
    // `;

    const Result = await sql`SELECT
      COALESCE(SUM(amount),0) AS balance,
      COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END),0) AS income,
      COALESCE(SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END),0) AS expense
      FROM transactions WHERE user_id = ${user_id}`;

    const summary = {
      balance: Result[0].balance,
      income: Result[0].income,
      expense: Result[0].expense,
    };

    res.status(200).json({
      message: "Transaction summary retrieved successfully",
      summary,
    });
  } catch (error) {
    console.log("Error retrieving transaction summary", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
