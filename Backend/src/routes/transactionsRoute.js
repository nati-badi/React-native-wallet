import express from "express";

import {
  createTransaction,
  getAllTransactions,
  getTransactionByUserId,
  deleteTransactionById,
  transactionSummary,
} from "../controllers/transactionsController.js";

const router = express.Router();

router.post("/", createTransaction);

router.get("/", getAllTransactions);

router.get("/:user_id", getTransactionByUserId);

router.delete("/:id", deleteTransactionById);

router.get("/summary/:user_id", transactionSummary);

export default router;
