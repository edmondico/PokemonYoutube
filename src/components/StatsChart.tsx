import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { VideoIdea } from '../types';

interface StatsChartProps {
  ideas: VideoIdea[];
}

export const StatsChart: React.FC<StatsChartProps> = ({ ideas }) => {
  const data = ideas.map(idea => ({
    name: idea.title.substring(0, 15) + '...',
    score: idea.viralScore,
    fullTitle: idea.title,
    competition: idea.competition
  }));

  return (
    <div className="h-64 w-full bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase">Potential Analysis</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.2} />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#9CA3AF', fontSize: 10 }} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: '#9CA3AF', fontSize: 10 }} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              color: '#F3F4F6'
            }}
          />
          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.score > 85 ? '#8B5CF6' : '#3B82F6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};