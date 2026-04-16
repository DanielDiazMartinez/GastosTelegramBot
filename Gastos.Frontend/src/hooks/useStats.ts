import { useState } from 'react';
import axios from 'axios';
import { API_STATS_URL } from '../config/api';

const API_URL = API_STATS_URL;

export const useStats = () => {
  const [yearData, setYearData] = useState([]);
  const [monthData, setMonthData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState<{name: string, ingresos: number, gastos: number}[]>([]);

  const fetchStats = async (startDate: string, endDate: string, isFullYear: boolean) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/category-stats`, {
        params: { startDate, endDate }
      });

      const stats = res.data;

      if (isFullYear) {
        setYearData(stats);
      } else {
        setMonthData(stats);

        const balanceRes = await axios.get(`${API_URL}/income-expense-balance`, {
          params: { startDate, endDate }
        });

        const balance = balanceRes.data;
        setComparisonData([
          {
            name: balance.name ?? startDate.substring(0, 7),
            ingresos: Number(balance.ingresos ?? 0),
            gastos: Number(balance.gastos ?? 0)
          }
        ]);
      }
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  return { 
    yearData, 
    monthData, 
    comparisonData, 
    loading, 
    fetchStats 
  };
};