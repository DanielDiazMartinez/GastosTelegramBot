import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { API_STATS_URL } from '../config/api';

export const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    const fetchStats = async () => {
      const start = '2024-03-01'; 
      const end = '2024-03-31';
      const res = await axios.get(`${API_STATS_URL}/category-stats`, {
        params: { startDate: start, endDate: end }
      });
      setStats(res.data);
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Resumen de Gastos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
          <h3 className="text-lg font-semibold mb-4">Gastos por Categoría</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="totalAmount"
                nameKey="categoryName"
              >
                {stats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Desglose</h3>
          <div className="space-y-4">
            {stats.map((item: any, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                  <span className="text-gray-600">{item.categoryName}</span>
                </div>
                <span className="font-bold">{item.totalAmount.toFixed(2)}€</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};