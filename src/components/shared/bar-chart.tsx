'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface TermData {
  subject: string;
  term1: number;
  term2: number;
}

interface BarChartComponentProps {
  data: TermData[];
}

export default function BarChartComponent({ data }: BarChartComponentProps) {
  if (data.length === 0) {
    return <div className="flex items-center justify-center h-[280px]"><p className="text-sm text-gray-400">No performance data available</p></div>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100" vertical={false} />
        <XAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
        <Tooltip 
          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 700 }} 
          cursor={{ fill: 'rgba(0,0,0,0.02)' }}
        />
        <Legend iconType="circle" />
        <Bar dataKey="term1" fill="hsl(239, 84%, 67%)" radius={[6, 6, 0, 0]} name="Term 1" />
        <Bar dataKey="term2" fill="hsl(152, 69%, 31%)" radius={[6, 6, 0, 0]} name="Term 2" />
      </BarChart>
    </ResponsiveContainer>
  );
}