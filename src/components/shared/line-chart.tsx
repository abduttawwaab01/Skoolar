'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface AttendanceData {
  day: string;
  present: number;
  absent: number;
}

interface LineChartComponentProps {
  data: AttendanceData[];
}

export default function LineChartComponent({ data }: LineChartComponentProps) {
  if (data.length === 0) {
    return <div className="flex items-center justify-center h-[280px]"><p className="text-sm text-gray-400">No attendance data available</p></div>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 700 }} />
        <Legend iconType="circle" />
        <Line type="monotone" dataKey="present" stroke="hsl(152, 69%, 31%)" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: 'hsl(0, 0%, 100%)' }} name="Present" />
        <Line type="monotone" dataKey="absent" stroke="hsl(0, 74%, 50%)" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: 'hsl(0, 0%, 100%)' }} name="Absent" />
      </LineChart>
    </ResponsiveContainer>
  );
}