import React, { useEffect, useState } from 'react';
import { useStats } from '../hooks/useStats';
import { CategoryPieChart } from '../components/stats/CategoryPieChart';
import { IncomeExpenseChart } from '../components/stats/IncomeExpenseChart';

const getCurrentLocalMonth = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
};

const formatDateLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const StatsPage = () => {
  const {
    yearData,
    monthData,
    comparisonData,
    annualSummary,
    availableYears,
    fetchAnnualStats,
    fetchMonthStats,
    fetchAvailableYears
  } = useStats();
  
  const [selectedMonth, setSelectedMonth] = useState(getCurrentLocalMonth());
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));

  useEffect(() => {
    void fetchAvailableYears();
  }, []);

  useEffect(() => {
    void fetchAnnualStats(Number(selectedYear));
  }, [selectedYear]);

  useEffect(() => {
    void updateMonthData(selectedMonth);
  }, []);

  const updateMonthData = async (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const firstDay = `${year}-${month}-01`;
    const lastDay = formatDateLocal(new Date(Number(year), Number(month), 0));

    await fetchMonthStats(firstDay, lastDay);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedMonth(val);
    void updateMonthData(val);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value);
  };

  return (
    <div className="p-8 space-y-12 bg-slate-50 min-h-screen">
      
      <section>
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Resumen Anual {selectedYear}</h2>
            <p className="text-slate-500">Distribución total de gastos del año seleccionado</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
            <label className="text-sm font-bold text-slate-600 ml-2">Cambiar Año:</label>
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="outline-none bg-slate-100 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-8 max-w-sm rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Tasa de ahorro anual</p>
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