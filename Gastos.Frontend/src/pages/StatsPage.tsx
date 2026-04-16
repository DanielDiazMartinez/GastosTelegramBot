import React, { useEffect, useState } from 'react';
import { useStats } from '../hooks/useStats';
import { CategoryPieChart } from '../components/stats/CategoryPieChart';
import { IncomeExpenseChart } from '../components/stats/IncomeExpenseChart';

export const StatsPage = () => {
  const { yearData, monthData, comparisonData, annualSummary, fetchStats } = useStats();
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const selectedYear = selectedMonth.substring(0, 4);

  useEffect(() => {
    void updateMonthData(selectedMonth);
  }, []);

  const updateMonthData = async (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const firstDay = `${year}-${month}-01`;
    const lastDay = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];

    await Promise.all([
      fetchStats(`${year}-01-01`, `${year}-12-31`, true),
      fetchStats(firstDay, lastDay, false)
    ]);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedMonth(val);
    void updateMonthData(val);
  };

  return (
    <div className="p-8 space-y-12 bg-slate-50 min-h-screen">
      
      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-black text-slate-800">Resumen Anual {selectedYear}</h2>
          <p className="text-slate-500">Distribución total de gastos este año</p>
        </div>
        <div className="mb-8 max-w-sm rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Tasa de ahorro</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-4xl font-black text-emerald-600">{annualSummary.savingsRate.toFixed(2)}%</span>
          </div>
        </div>
        <div className="space-y-8">
          <CategoryPieChart data={yearData} title="Gastos del Año" />
          <IncomeExpenseChart data={comparisonData} />
        </div>
      </section>

      <hr className="border-slate-200" />

  
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Análisis Mensual</h2>
            <p className="text-slate-500">Detalle de gastos por mes seleccionado</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
            <label className="text-sm font-bold text-slate-600 ml-2">Cambiar Mes:</label>
            <input 
              type="month" 
              value={selectedMonth}
              onChange={handleMonthChange}
              className="outline-none bg-slate-100 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="space-y-8">
          <CategoryPieChart data={monthData} title={`Gastos de ${selectedMonth}`} />
        </div>
      </section>

    </div>
  );
};  