import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export const CategoryPieChart = ({ data, title }: { data: any[], title: string }) => {
  if (!data || data.length === 0) return (
    <div className="h-[300px] flex items-center justify-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
      No hay datos para este periodo
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-slate-700 mb-4">{title}</h3>
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="totalAmount"
              nameKey="categoryName"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={5}
              label={({ payload }) => `${payload.categoryName} (${payload.percentage.toFixed(1)}%)`}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || entry.Color || '#3b82f6'} 
                />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => `${parseFloat(value).toFixed(2)}€`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};