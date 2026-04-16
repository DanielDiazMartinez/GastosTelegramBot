import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_STATS_URL, API_TRANSACTION_URL } from '../config/api';

const API_URL = API_TRANSACTION_URL;
const STATS_URL = API_STATS_URL;

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {

      const [transRes, catRes] = await Promise.all([
        axios.get(API_URL),
        axios.get(`${STATS_URL}/categories?type=0`)
      ]);
      setTransactions(transRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error("Error al conectar con el Backend:", error);
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (formData: any) => {
    try {
      await axios.post(API_URL, formData);
      await loadData();
      return true;
    } catch (error) {
      console.error("Error al crear:", error);
      return false;
    }
  };

  const updateTransaction = async (id: string, formData: any) => {
    try {
      await axios.put(`${API_URL}/${id}`, formData);
      await loadData();
      return true;
    } catch (error) {
      console.error("Error al editar:", error);
      return false;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      await loadData();
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  useEffect(() => { loadData(); }, []);

  return { 
    transactions, 
    categories, 
    loading, 
    deleteTransaction, 
    createTransaction, 
    updateTransaction,
    refresh: loadData 
  };
};