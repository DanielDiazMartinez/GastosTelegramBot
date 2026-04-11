import React, { useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { Trash2, Plus, Calendar } from 'lucide-react';
import { TransactionForm } from '../components/TransactionForm';

export const TransactionsPage = () => {
  const { transactions, categories, loading, deleteTransaction, createTransaction } = useTransactions();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const hasInvalidRange = !!startDate && !!endDate && startDate > endDate;

  const filteredTransactions = transactions.filter((t: any) => {
    if (hasInvalidRange) return false;

    const transactionDate = new Date(t.date).toISOString().split('T')[0];
    const matchesStart = !startDate || transactionDate >= startDate;
    const matchesEnd = !endDate || transactionDate <= endDate;
    const matchesCategory = !selectedCategory || t.categoryId === parseInt(selectedCategory);
    return matchesStart && matchesEnd && matchesCategory;
  });

  const handleCreate = async (formData: any) => {
    const created = await createTransaction(formData);
    if (created) {
      setIsFormOpen(false);
    } else {
      alert('No se pudo crear la transaccion');
    }
  };

  if (loading) return <div className="p-10 text-center">Conectando con la base de datos...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Mis Movimientos</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} /> Añadir Gasto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setSelectedCategory('');
            }}
            className="md:self-end bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            Limpiar filtros
          </button>
        </div>
        {hasInvalidRange && (
          <p className="text-sm text-red-600 mt-2">La fecha "Desde" no puede ser mayor que "Hasta".</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
            <tr>
              <th className="px-6 py-4">Concepto</th>
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4 text-right">Importe</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredTransactions.map((t: any) => (
              <tr key={t.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {t.description}
                  <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <Calendar size={12} /> {new Date(t.date).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <span className="bg-gray-100 px-2 py-1 rounded-md">{t.categoryName}</span>
                </td>
                <td className={`px-6 py-4 text-right font-bold ${t.type === 0 ? 'text-red-500' : 'text-green-600'}`}>
                  {t.type === 0 ? '-' : '+'}{t.amount.toFixed(2)}€
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => deleteTransaction(t.id)} className="text-gray-400 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No hay transacciones en el rango seleccionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <TransactionForm
          categories={categories}
          onSave={handleCreate}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};