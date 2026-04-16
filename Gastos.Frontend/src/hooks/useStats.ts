import { useState } from 'react';
import axios from 'axios';
import { API_STATS_URL } from '../config/api';

const API_URL = API_STATS_URL;

export const useStats = () => {
  const [yearData, setYearData] = useState([]);
  const [monthData, setMonthData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState<{name: string, ingresos: number, gastos: number}[]>([]);
  const [annualSummary, setAnnualSummary] = useState<{ savingsRate: number }>({ savingsRate: 0 });

  const fetchStats = async (startDate: string, endDate: string, isFullYear: boolean) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/category-stats`, {
        params: { startDate, endDate }
      });

      const stats = res.data;

      if (isFullYear) {
        setYearData(stats);
        const year = Number(startDate.substring(0, 4));
        const [balanceRes, summaryRes] = await Promise.all([
          axios.get(`${API_URL}/income-expense-balance/yearly`, {
            params: { year }
          }),
          axios.get(`${API_URL}/summary/yearly`, {
            params: { year }
          })
        ]);

        const yearlyBalance = Array.isArray(balanceRes.data) ? balanceRes.data : [];
        setComparisonData(
          yearlyBalance.map((item: any) => ({
            name: item.name ?? '',
            ingresos: Number(item.ingresos ?? 0),
            gastos: Number(item.gastos ?? 0)
          }))
        );
        setAnnualSummary({
          savingsRate: Number(summaryRes.data?.savingsRate ?? 0)
        });
      } else {
        setMonthData(stats);
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
    annualSummary,
    loading, 
    fetchStats 
  };
};