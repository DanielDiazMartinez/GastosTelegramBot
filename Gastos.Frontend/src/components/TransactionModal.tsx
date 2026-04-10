import React, { useState } from 'react';
import { X } from 'lucide-react';

export const TransactionModal = ({ isOpen, onClose, onSubmit }: any) => {
  const [formData, setFormData] = useState({
    amount: 0,
    type: 0, 
    categoryId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    description: "",
    date: new Date().toISOString().split('T')[0]
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Nuevo Movimiento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Importe (€)</label>
            <input 
              type="number" step="0.01" required
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <select 
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
              onChange={e => setFormData({...formData, type: parseInt(e.target.value)})}
            >
              <option value="0">Gasto</option>
              <option value="1">Ingreso</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <input 
              type="text" required
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha</label>
            <input 
              type="date" required
              value={formData.date}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors pt-4"
          >
            Guardar Transacción
          </button>
        </form>
      </div>
    </div>
  );
};