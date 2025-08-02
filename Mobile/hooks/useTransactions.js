// react custom hook file for fetching and manipulating transactions data

import { useCallback, useState } from "react";
import { Alert } from "react-native";

const apiURL = "https://wallet-api-rrwn.onrender.com/api";

export const useTransactions = ({ userId }) => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expense: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // useCallback is used for performance optimization reasons
  // it memoizes the function and returns a new function only if the dependencies change
  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch(`${apiURL}/transactions/${userId}`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.log("Error fetching transactions: ", error);
    }
  }, [userId]);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch(`${apiURL}/transactions/summary/${userId}`);
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.log("Error fetching summary: ", error);
    }
  }, [userId]);

  const loadData = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      await Promise.all([fetchTransactions(), fetchSummary()]);
    } catch (error) {
      console.log("Error loading data: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchTransactions, fetchSummary, userId]);

  const deleteTransaction = async (id) => {
    try {
      const response = await fetch(`${apiURL}/transactions/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }

      // Refresh data after deleting transaction
      loadData();
      Alert.alert("Transaction deleted successfully");
    } catch (error) {
      console.log("Error deleting transaction: ", error);
      Alert.alert("Failed to delete transaction", error.message);
    }
  };
  return { transactions, summary, isLoading, loadData, deleteTransaction };
};
