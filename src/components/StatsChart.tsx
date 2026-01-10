import React, { useState } from 'react';
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
import { VideoIdea, SearchState } from '../types';
import { Zap, Youtube, Search, TrendingUp } from 'lucide-react';

interface StatsChartProps {
  ideas: VideoIdea[];
  analytics?: SearchState['analytics'];
}

type ChartType = 'potential' | 'google' | 'youtube' | 'trends';

export const StatsChart: React.FC<StatsChartProps> = ({ ideas, analytics }) => {
  const [activeTab, setActiveTab] = useState<ChartType>('potential');

  const getChartData = () => {
    switch (activeTab) {
      case 'potential':
        return ideas.map(idea => ({
          name: idea.title.length > 20 ? idea.title.substring(0, 20) + '...' : idea.title,
          fullTitle: idea.title,
          value: idea.viralScore,
          color: idea.viralScore > 85 ? '#8B5CF6' : '#3B82F6'
        }));
      case 'google':
        return (analytics?.googleKeywords || []).map(item => ({
          name: item.keyword,
          fullTitle: item.keyword,
          value: item.volume,
          color: '#EA4335'
        }));
      case 'youtube':
        return (analytics?.youtubeKeywords || []).map(item => ({
          name: item.keyword,
          fullTitle: item.keyword,
          value: item.volume,
          color: '#FF0000'
        }));
      case 'trends':
        return (analytics?.risingTrends || []).map(item => ({
          name: item.keyword,
          fullTitle: item.keyword,
          value: item.volume,
          color: '#10B981'
        }));
      default:
        return [];
    }
  };

  const data = getChartData();
  const isHorizontal = activeTab !== 'potential';

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 text-white p-3 rounded-lg shadow-xl border border-gray-700 text-xs z-50">
          <p className="font-bold mb-1">{payload[0].payload.fullTitle}</p>
          <p>Score/Volume: <span className="font-mono text-pokemon-blue">{payload[0].value}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-96 w-full bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">
          {activeTab === 'potential' && 'Viral Potential Analysis'}
          {activeTab === 'google' && 'Top Google Searches'}
          {activeTab === 'youtube' && 'Top YouTube Searches'}
          {activeTab === 'trends' && 'Rising Trends'}
        </h3>
        
        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('potential')}
            className={`p-1.5 rounded-md transition-all ${activeTab === 'potential' ? 'bg-white dark:bg-gray-600 text-pokemon-blue shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            title="Viral Potential"
          >
            <Zap size={16} />
          </button>
          <button
            onClick={() => setActiveTab('google')}
            disabled={!analytics?.googleKeywords?.length}
            className={`p-1.5 rounded-md transition-all ${activeTab === 'google' ? 'bg-white dark:bg-gray-600 text-red-500 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'} disabled:opacity-30 disabled:cursor-not-allowed`}
            title="Google Search Volume"
          >
            <Search size={16} />
          </button>
          <button
            onClick={() => setActiveTab('youtube')}
            disabled={!analytics?.youtubeKeywords?.length}
            className={`p-1.5 rounded-md transition-all ${activeTab === 'youtube' ? 'bg-white dark:bg-gray-600 text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'} disabled:opacity-30 disabled:cursor-not-allowed`}
            title="YouTube Volume"
          >
            <Youtube size={16} />
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            disabled={!analytics?.risingTrends?.length}
            className={`p-1.5 rounded-md transition-all ${activeTab === 'trends' ? 'bg-white dark:bg-gray-600 text-green-500 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'} disabled:opacity-30 disabled:cursor-not-allowed`}
            title="Rising Trends"
          >
            <TrendingUp size={16} />
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            layout={isHorizontal ? "vertical" : "horizontal"} 
            data={data} 
            margin={{ top: 5, right: 30, bottom: 5, left: isHorizontal ? 100 : 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={!isHorizontal} vertical={isHorizontal} stroke="#374151" strokeOpacity={0.1} />
            
            {isHorizontal ? (
              // Horizontal Chart (Y-Axis has labels)
              <>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fill: '#9CA3AF', fontSize: 11, width: 100 }} 
                  width={100}
                  axisLine={false}
                  tickLine={false}
                />
              </>
            ) : (
              // Vertical Chart (X-Axis has labels)
              <>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#9CA3AF', fontSize: 10 }} 
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis hide />
              </>
            )}

            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
            
            <Bar dataKey="value" radius={isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} barSize={isHorizontal ? 20 : undefined}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {!data.length && (
         <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            No data available for this metric
         </div>
      )}
    </div>
  );
};
