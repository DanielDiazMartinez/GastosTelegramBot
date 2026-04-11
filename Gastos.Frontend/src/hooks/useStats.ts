import { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/Stats';

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

if (!isFullYear) {
  setMonthData(stats);
  
  // Usamos Number() y verificamos ambas posibilidades de nombre (type/Type)
  const totalGastos = stats
    .filter((s: any) => Number(s.type ?? s.Type) === 0)
    .reduce((acc: number, curr: any) => acc + (curr.totalAmount ?? curr.TotalAmount ?? 0), 0);

  const totalIngresos = stats
    .filter((s: any) => Number(s.type ?? s.Type) === 1)
    .reduce((acc: number, curr: any) => acc + (curr.totalAmount ?? curr.TotalAmount ?? 0), 0);

  console.log("Totales calculados:", { totalIngresos, totalGastos }); // Esto te dirá en la consola si hay datos

  setComparisonData([{
    name: startDate.substring(0, 7), // Ejemplo: "2026-04"
    ingresos: totalIngresos,
    gastos: totalGastos
  }]);
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