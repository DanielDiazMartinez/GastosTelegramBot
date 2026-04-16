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
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const fetchAnnualStats = async (year: number) => {
    setLoading(true);
    try {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const [statsRes, balanceRes, summaryRes] = await Promise.all([
        axios.get(`${API_URL}/category-stats`, {
          params: { startDate, endDate }
        }),
          axios.get(`${API_URL}/income-expense-balance/yearly`, {
            params: { year }
          }),
          axios.get(`${API_URL}/summary/yearly`, {
            params: { year }
          })
        ]);

      const stats = statsRes.data;
        const yearlyBalance = Array.isArray(balanceRes.data) ? balanceRes.data : [];

      setYearData(stats);
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
    } catch (error) {
      console.error("Error al obtener estadísticas anuales:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthStats = async (startDate: string, endDate: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/category-stats`, {
        params: { startDate, endDate }
      });

      setMonthData(res.data);
    } catch (error) {
      console.error("Error al obtener estadísticas mensuales:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableYears = async () => {
    try {
      const res = await axios.get(`${API_URL}/available-years`);
      const years = Array.isArray(res.data)
        ? res.data.map((year: number | string) => Number(year)).filter((year: number) => !Number.isNaN(year))
        : [];

      setAvailableYears(years);
    } catch (error) {
      console.error("Error al obtener años disponibles:", error);
    }
  };

  return { 
    yearData, 
    monthData, 
    comparisonData, 
    annualSummary,
    availableYears,
    loading, 
    fetchAnnualStats,
    fetchMonthStats,
    fetchAvailableYears
  };
};