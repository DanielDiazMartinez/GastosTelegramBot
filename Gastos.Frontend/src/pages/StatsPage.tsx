import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { TrendingUp, AlertCircle } from 'lucide-react';

const STATS_URL = 'http://localhost:8080/api/Stats';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export const StatsPage = () => {
  const [categoryStats, setCategoryStats] = useState([]);
  const [weeklyHeatmap, setWeeklyHeatmap] = useState([]);
  const [dailyHeatmap, setDailyHeatmap] = useState([]);
  const [monthlyHeatmap, setMonthlyHeatmap] = useState([]);
  const [topLeaks, setTopLeaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Set default date range (last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      if (startDate && endDate) {
        const catRes = await axios.get(
          `${STATS_URL}/category-stats?startDate=${startDate}&endDate=${endDate}`
        );
        setCategoryStats(catRes.data);
      }

      const [weekRes, dailyRes, monthRes, leaksRes] = await Promise.all([
        axios.get(`${STATS_URL}/heatmap/weekly`),
        axios.get(`${STATS_URL}/heatmap/daily?month=${selectedMonth}&year=${selectedYear}`),
        axios.get(`${STATS_URL}/heatmap/monthly?year=${selectedYear}`),
        axios.get(`${STATS_URL}/top-leaks?count=5`),
      ]);

      const weekData = weekRes.data.map((item: any) => ({
        ...item,
        name: DAYS_OF_WEEK[item.dayOfWeek] || `Día ${item.dayOfWeek}`,
      }));
      setWeeklyHeatmap(weekData);

      const dailyData = dailyRes.data.map((item: any) => ({
        ...item,
        name: `${item.day}`,
      }));
      setDailyHeatmap(dailyData);

      const monthData = monthRes.data.map((item: any) => ({
        ...item,
        name: MONTHS[item.month - 1] || `Mes ${item.month}`,
      }));
      setMonthlyHeatmap(monthData);

      setTopLeaks(leaksRes.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate, selectedMonth, selectedYear]);

  if (loading) {
    return <div className="p-10 text-center">Cargando estadísticas...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Estadísticas</h1>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mes</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[2023, 2024, 2025, 2026].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gastos por Categoría */}
        {categoryStats.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Gastos por Categoría</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryStats}
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="totalAmount"
                  nameKey="categoryName"
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `€${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Leaks */}
        {topLeaks.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={24} className="text-red-500" />
              <h2 className="text-xl font-bold text-gray-800">Top Fugas (Este Mes vs Anterior)</h2>
            </div>
            <div className="space-y-3">
              {topLeaks.map((leak: any, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{leak.categoryName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-bold">+{leak.increasePercentage.toFixed(1)}%</span>
                    <TrendingUp size={18} className="text-red-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Heatmap Semanal */}
        {weeklyHeatmap.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Gastos por Día de la Semana</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyHeatmap}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `€${value.toFixed(2)}`} />
                <Bar dataKey="totalAmount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Heatmap Diario */}
        {dailyHeatmap.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Gastos por Día del Mes</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyHeatmap}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `€${value.toFixed(2)}`} />
                <Bar dataKey="totalAmount" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Heatmap Mensual */}
        {monthlyHeatmap.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Gastos por Mes del Año</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyHeatmap}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `€${value.toFixed(2)}`} />
                <Line type="monotone" dataKey="totalAmount" stroke="#FFBB28" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Tabla de estadísticas por categoría */}
      {categoryStats.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Desglose por Categoría</h2>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
              <tr>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4 text-right">Gasto Total</th>
                <th className="px-6 py-4 text-right">Transacciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categoryStats.map((stat: any, index) => (
                <tr key={index} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <span
                      className="inline-block w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></span>
                    {stat.categoryName}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-red-600">
                    €{stat.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">{stat.transactionCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
