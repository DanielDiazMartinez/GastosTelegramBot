import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_TRANSACTION_URL, API_STATS_URL } from '../config/api';

interface Transaction {
  id: string;
  categoryId: number;
  categoryName: string;
  type: number;
  amount: number;
  description: string;
  date: string;
  status: string;
}

interface Category {
  id: number;
  name: string;
  type: number;
}

interface ConfirmTriageDto {
  categoryId: number;
  type: number;
  amount: number;
  description?: string;
  date?: string;
}

export const useTriageTransactions = () => {
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTriageData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [triageRes, catRes] = await Promise.all([
        axios.get<Transaction[]>(`${API_TRANSACTION_URL}/pending-triage`),
        axios.get<Category[]>(`${API_STATS_URL}/categories`)
      ]);
      setPendingTransactions(triageRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error("Error fetching triage data:", err);
      setError("Error al cargar las transacciones de triaje o categorías.");
    } finally {
      setLoading(false);
    }
  };

  const confirmTriageTransaction = async (id: string, formData: ConfirmTriageDto) => {
    setLoading(true);
    setError(null);
    try {
      await axios.put(`${API_TRANSACTION_URL}/confirm-triage/${id}`, formData);
      await fetchTriageData(); // Refresh the list after confirmation
      return true;
    } catch (err) {
      console.error("Error confirming triage transaction:", err);
      setError("Error al confirmar la transacción de triaje.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTriageData();
  }, []);

  return {
    pendingTransactions,
    categories,
    loading,
    error,
    confirmTriageTransaction,
    refreshTriageData: fetchTriageData,
  };
};
