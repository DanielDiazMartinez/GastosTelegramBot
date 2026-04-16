import React, { useState } from 'react';
import { X } from 'lucide-react';

const toInputDate = (dateValue?: string) => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

export const TransactionForm = ({ categories, onSave, onClose, initialData, mode = 'create' }: any) => {
  const [formData, setFormData] = useState({
    amount: initialData?.amount ?? 0,
    type: initialData?.type ?? 0,
    categoryId: initialData?.categoryId ?? 0,
    description: initialData?.description ?? '',
    date: initialData?.date ? new Date(initialData.date).toISOString() : new Date().toISOString()
  });
  const [dateInput, setDateInput] = useState(toInputDate(initialData?.date) || toInputDate(new Date().toISOString()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) return alert("Selecciona una categoria");
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">{mode === 'edit' ? 'Editar Transacción' : 'Nueva Transacción'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Importe</label>
            <input
              type="number" step="0.01" required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date" required
                value={dateInput}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none"
                onChange={(e) => {
                  const value = e.target.value;
                  setDateInput(value);
                  setFormData({ ...formData, date: new Date(value).toISOString() });
                }}
              />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none"
              value={formData.categoryId || 0}
              onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value, 10) || 0 })}
            >
              <option value="0">Seleccionar...</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-4 py-2 outline-none resize-none"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-100 transition-all mt-4"
          >
            {mode === 'edit' ? 'Actualizar' : 'Guardar'}
          </button>
        </form>
      </div>
    </div>
  );
};