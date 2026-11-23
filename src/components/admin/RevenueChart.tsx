"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface RevenueChartProps {
  data: {
    month: string
    ca: number
  }[]
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#78716c', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#78716c', fontSize: 12 }}
            tickFormatter={(value) => `${value}€`}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
            formatter={(value) => [`${value ?? 0} €`, "Chiffre d'affaires"]}
            labelStyle={{ color: '#57534e', fontWeight: 600, marginBottom: '4px' }}
          />
          <Line 
            type="monotone" 
            dataKey="ca" 
            stroke="#db2777" 
            strokeWidth={3}
            dot={{ fill: '#db2777', strokeWidth: 2, r: 4, stroke: '#fff' }}
            activeDot={{ r: 6, stroke: '#fbcfe8', strokeWidth: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

