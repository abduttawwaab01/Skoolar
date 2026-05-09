'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface GradeData {
  grade: string;
  value: number;
  color: string;
}

interface PieChartComponentProps {
  data: GradeData[];
}

export default function PieChartComponent({ data }: PieChartComponentProps) {
  if (data.length === 0) {
    return <div className="flex items-center justify-center h-[220px]"><p className="text-sm text-gray-400">No distribution data</p></div>;
  }

  return (
    <div className="flex flex-col items-center sm:flex-row gap-4">
      <ResponsiveContainer width="100%" height={220} className="sm:w-1/2">
        <PieChart>
          <Pie 
            data={data} 
            cx="50%" 
            cy="50%" 
            innerRadius={60} 
            outerRadius={80} 
            paddingAngle={5}
            dataKey="value" 
            nameKey="grade"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex-1 grid grid-cols-2 gap-3 w-full">
        {data.map(g => (
          <div key={g.grade} className="flex flex-col p-3 rounded-2xl bg-gray-50/50 border border-gray-50 transition-transform hover:scale-105">
            <div className="flex items-center gap-2 mb-1">
              <span className="size-2 rounded-full" style={{ backgroundColor: g.color }} />
              <span className="text-xs font-semibold text-gray-900 uppercase">Grade {g.grade}</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">{g.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}