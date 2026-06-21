import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useTriageTransactions } from '../hooks/useTriageTransactions';

interface Transaction {
  id: string;
  categoryId: number;
  categoryName: string;
  type: number;
  amount: number;
  description: string;
  date: string;
  status: string;
}

interface ConfirmTriageDto {
  categoryId: number;
  type: number;
  amount: number;
  description?: string;
  date?: string;
}

const TriagePage: React.FC = () => {
  const { pendingTransactions, categories, loading, error, confirmTriageTransaction, refreshTriageData } = useTriageTransactions();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState<ConfirmTriageDto>({
    categoryId: 0,
    type: 0,
    amount: 0,
    description: '',
    date: '',
  });

  useEffect(() => {
    if (categories.length > 0) {
      setFormData((prev) => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories]);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      categoryId: transaction.categoryId,
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description || '',
      date: new Date(transaction.date).toISOString().split('T')[0],
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'amount' || name === 'type' || name === 'categoryId' ? parseFloat(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTransaction) {
      const success = await confirmTriageTransaction(editingTransaction.id, formData);
      if (success) {
        setEditingTransaction(null);
        setFormData({
          categoryId: categories.length > 0 ? categories[0].id : 0,
          type: 0,
          amount: 0,
          description: '',
          date: '',
        });
      }
    }
  };

  if (loading) return <Layout><p>Cargando transacciones de triaje...</p></Layout>;
  if (error) return <Layout><p className="text-red-500">Error: {error}</p></Layout>;

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Transacciones Pendientes de Triaje</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Lista de Transacciones</h2>
          {pendingTransactions.length === 0 ? (
            <p>No hay transacciones pendientes de triaje.</p>
          ) : (
            <ul>
              {pendingTransactions.map((transaction) => (
                <li key={transaction.id} className="p-3 border rounded-md mb-2 flex justify-between items-center">
                  <div>
                    <p><strong>Descripción:</strong> {transaction.description}</p>
                    <p><strong>Monto:</strong> {transaction.amount}</p>
                    <p><strong>Fecha:</strong> {new Date(transaction.date).toLocaleDateString()}</p>
                    <p><strong>Categoría:</strong> {transaction.categoryName}</p>
                  </div>
                  <button
                    onClick={() => handleEdit(transaction)}
                    className="ml-4 bg-blue-500 text-white px-3 py-1 rounded-md"
                  >
                    Editar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {editingTransaction && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Confirmar Transacción (ID: {editingTransaction.id.substring(0, 8)}...)</h2>
            <form onSubmit={handleSubmit} className="p-4 border rounded-md shadow-md">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">Monto:</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">Tipo:</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                >
                  <option value={0}>Gasto</option>
                  <option value={1}>Ingreso</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">Categoría:</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                >
                  {categories.filter(c => c.type === formData.type).map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">Descripción:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                ></textarea>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">Fecha:</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Confirmar Transacción
              </button>
              <button
                type="button"
                onClick={() => setEditingTransaction(null)}
                className="ml-2 bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TriagePage;
