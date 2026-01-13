import React, { useState, useEffect } from 'react';
import {
  Zap,
  Video,
  Target,
  TrendingUp,
  CheckCircle2,
  Circle,
  Sparkles,
  Youtube,
  Flame,
  ArrowRight,
  ListTodo,
  Search,
  Wand2,
  KanbanSquare,
  Play,
  AlertTriangle,
  Clock,
  Calendar,
  XCircle
} from 'lucide-react';
import { VideoIdea } from '../types';
import { fetchChannelByHandle, fetchChannelVideos, YouTubeVideo } from '../services/youtubeService';
import { ensureDailyTasksForDate, getTasksByDate, toggleTaskComplete } from '../services/supabaseService';

interface DashboardProps {
  savedIdeas: VideoIdea[];
  onNavigate: (view: 'search' | 'planner' | 'checklist' | 'analyzer' | 'enhancer' | 'motivation') => void;
}

interface DashboardTask {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  isDbTask?: boolean;
}

const CHANNEL_HANDLE = '@PokeBim';
const TARGET_UPLOAD_FREQUENCY = 2; // days between uploads

export const Dashboard: React.FC<DashboardProps> = ({ savedIdeas, onNavigate }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [channelStats, setChannelStats] = useState<{ subscribers: number; totalViews: number; totalVideos: number } | null>(null);
  const [recentVideos, setRecentVideos] = useState<YouTubeVideo[]>([]);
  const [dashboardTasks, setDashboardTasks] = useState<DashboardTask[]>([]);
  const [lastVideoDate, setLastVideoDate] = useState<Date | null>(null);

  // Motivational quotes
  const quotes = [
    { text: "The algorithm rewards those who show up consistently.", author: "YouTube Wisdom" },
    { text: "Your next video could change everything.", author: "Keep Creating" },
    { text: "Every big channel started with 0 subscribers.", author: "Stay Patient" },
    { text: "Content is king, but consistency is the kingdom.", author: "Creator Mindset" },
    { text: "The best time to upload was yesterday. The second best is today.", author: "Take Action" }
  ];

  const [dailyQuote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const channel = await fetchChannelByHandle(CHANNEL_HANDLE);
        if (channel) {
          setChannelStats({
            subscribers: channel.subscribers,
            totalViews: channel.totalViews,
            totalVideos: channel.totalVideos
          });

          const videos = await fetchChannelVideos(channel.channelId, 10);
          setRecentVideos(videos);

          // Set last video date for upload schedule
          if (videos.length > 0) {
            const sortedVideos = [...videos].sort((a, b) =>
              new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
            );
            setLastVideoDate(new Date(sortedVideos[0].publishedAt));
          }
        }
      } catch (error) {
        console.error('Failed to load channel data:', error);
      }
    };

    loadData();
  }, []);

  // Generate daily tasks based on content pipeline AND fetch real DB tasks
  useEffect(() => {
    const loadTasks = async () => {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const tasks: DashboardTask[] = [];

      // 1. Ensure and fetch DB tasks (Checklist + Perpetual)
      try {
        await ensureDailyTasksForDate(today);
        const dbTasks = await getTasksByDate(today);
        
        dbTasks.forEach(t => {
          tasks.push({
            id: t.id,
            title: t.text,
            completed: t.completed,
            priority: 'medium',
            isDbTask: true
          });
        });
      } catch (error) {
        console.error("Failed to load DB tasks:", error);
      }

      // 2. Generate Pipeline Tasks (Dynamic)
      // Check ideas in different stages
      const inScripting = savedIdeas.filter(i => i.status === 'scripting');
      const inFilming = savedIdeas.filter(i => i.status === 'filming');
      const savedCount = savedIdeas.filter(i => i.status === 'saved').length;

      // Only add pipeline tasks if not already done in the session (simplified tracking via localStorage for pipeline only)
      const storedPipelineStatus = JSON.parse(localStorage.getItem(`dashboard_pipeline_${today}`) || '{}');

      if (inFilming.length > 0) {
        const id = `filming-${inFilming[0].id}`;
        tasks.unshift({
          id,
          title: `Film video: "${inFilming[0].title.substring(0, 40)}..."`,
          completed: !!storedPipelineStatus[id],
          priority: 'high',
          isDbTask: false
        });
      }

      if (inScripting.length > 0) {
        const id = `scripting-${inScripting[0].id}`;
        tasks.unshift({
          id,
          title: `Finish script for: "${inScripting[0].title.substring(0, 35)}..."`,
          completed: !!storedPipelineStatus[id],
          priority: 'high',
          isDbTask: false
        });
      }

      if (savedCount < 5) {
        const id = 'research-goal';
        tasks.push({
          id,
          title: 'Find new video ideas (aim for 5+ saved)',
          completed: !!storedPipelineStatus[id] || savedCount >= 5,
          priority: 'medium',
          isDbTask: false
        });
      }

      setDashboardTasks(tasks);
    };

    loadTasks();
  }, [savedIdeas]);

  const toggleTask = async (taskId: string, isDbTask?: boolean) => {
    // Optimistic update
    setDashboardTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));

    if (isDbTask) {
      // Update in DB
      const task = dashboardTasks.find(t => t.id === taskId);
      if (task) {
        await toggleTaskComplete(taskId, !task.completed);
      }
    } else {
      // Update in LocalStorage (for pipeline tasks)
      const today = new Date().toISOString().split('T')[0];
      const stored = JSON.parse(localStorage.getItem(`dashboard_pipeline_${today}`) || '{}');
      const task = dashboardTasks.find(t => t.id === taskId);
      if (task) {
        stored[taskId] = !task.completed;
        localStorage.setItem(`dashboard_pipeline_${today}`, JSON.stringify(stored));
      }
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Calculate pipeline stats
  const pipelineStats = {
    saved: savedIdeas.filter(i => i.status === 'saved').length,
    scripting: savedIdeas.filter(i => i.status === 'scripting').length,
    filming: savedIdeas.filter(i => i.status === 'filming').length,
    done: savedIdeas.filter(i => i.status === 'done').length
  };

  const completedTasks = dashboardTasks.filter(t => t.completed).length;
  const totalTasks = dashboardTasks.length;

  // Upload Schedule Calculations
  const getUploadStatus = () => {
    if (!lastVideoDate) return null;

    const now = new Date();
    const diffMs = now.getTime() - lastVideoDate.getTime();
    const daysSinceUpload = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Check if video was uploaded today
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const videoDay = new Date(lastVideoDate.getFullYear(), lastVideoDate.getMonth(), lastVideoDate.getDate());
    const uploadedToday = today.getTime() === videoDay.getTime();

    // Calculate next upload dates
    const getNextUploadDates = (): Date[] => {
      const suggestions: Date[] = [];
      let nextDate = new Date(lastVideoDate);
      for (let i = 0; i < 5; i++) {
        nextDate = new Date(nextDate.getTime() + TARGET_UPLOAD_FREQUENCY * 24 * 60 * 60 * 1000);
        if (nextDate >= today) {
          suggestions.push(new Date(nextDate));
        }
      }
      return suggestions;
    };

    const nextUploadDates = getNextUploadDates();
    const isUploadDay = nextUploadDates.some(d => {
      const uploadDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      return uploadDay.getTime() === today.getTime();
    });

    // Determine urgency level
    let urgency: 'ok' | 'warning' | 'urgent' | 'critical' = 'ok';
    let message = '';
    let subMessage = '';

    if (uploadedToday) {
      urgency = 'ok';
      message = '¡Video subido hoy!';
      subMessage = 'Buen trabajo. Próximo video en 2 días.';
    } else if (daysSinceUpload === 0) {
      urgency = 'ok';
      message = 'Todo bien';
      subMessage = `Último video: hoy. Próximo: ${nextUploadDates[0]?.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}`;
    } else if (daysSinceUpload === 1) {
      urgency = 'ok';
      message = 'Vas bien';
      subMessage = `Último video: ayer. Mañana toca subir.`;
    } else if (daysSinceUpload === 2) {
      urgency = 'warning';
      message = '¡HOY TOCA SUBIR VIDEO!';
      subMessage = `Llevas ${daysSinceUpload} días sin subir. ¡Es hora de crear!`;
    } else if (daysSinceUpload === 3) {
      urgency = 'urgent';
      message = '¡LLEVAS 3 DÍAS SIN SUBIR!';
      subMessage = `Te estás retrasando. ¡El algoritmo penaliza la inconsistencia!`;
    } else if (daysSinceUpload >= 4) {
      urgency = 'critical';
      message = `¡¡${daysSinceUpload} DÍAS SIN VIDEO!!`;
      subMessage = `Estás perdiendo momentum. ¡Sube algo HOY!`;
    }

    return {
      daysSinceUpload,
      uploadedToday,
      isUploadDay,
      nextUploadDates,
      urgency,
      message,
      subMessage,
      lastVideoDate
    };
  };

  const uploadStatus = getUploadStatus();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-pokemon-blue via-blue-600 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <Sparkles className="absolute right-8 bottom-8 opacity-20" size={80} />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">{getGreeting()}, Creator!</h1>
              <p className="text-white/80">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold">{completedTasks}/{totalTasks}</div>
                <div className="text-xs text-white/70">Tasks Done</div>
              </div>
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                {completedTasks === totalTasks && totalTasks > 0 ? (
                  <CheckCircle2 size={32} className="text-green-300" />
                ) : (
                  <Target size={32} className="text-white/80" />
                )}
              </div>
            </div>
          </div>

          {/* Daily Quote */}
          <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
            <p className="text-lg font-medium">"{dailyQuote.text}"</p>
            <p className="text-sm text-white/70 mt-1">- {dailyQuote.author}</p>
          </div>
        </div>
      </div>

      {/* Upload Accountability Banner */}
      {uploadStatus && (
        <div className={`rounded-2xl p-6 border-2 relative overflow-hidden ${
          uploadStatus.urgency === 'ok'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
            : uploadStatus.urgency === 'warning'
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-600 animate-pulse'
            : uploadStatus.urgency === 'urgent'
            ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 dark:border-orange-600'
            : 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-600 animate-pulse'
        }`}>
          {/* Urgency indicator bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${
            uploadStatus.urgency === 'ok' ? 'bg-green-500' :
            uploadStatus.urgency === 'warning' ? 'bg-yellow-500' :
            uploadStatus.urgency === 'urgent' ? 'bg-orange-500' :
            'bg-red-600'
          }`} />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl ${
                uploadStatus.urgency === 'ok' ? 'bg-green-100 dark:bg-green-800/30' :
                uploadStatus.urgency === 'warning' ? 'bg-yellow-100 dark:bg-yellow-800/30' :
                uploadStatus.urgency === 'urgent' ? 'bg-orange-100 dark:bg-orange-800/30' :
                'bg-red-100 dark:bg-red-800/30'
              }`}>
                {uploadStatus.urgency === 'ok' ? (
                  <CheckCircle2 className="text-green-600 dark:text-green-400" size={32} />
                ) : uploadStatus.urgency === 'warning' ? (
                  <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={32} />
                ) : uploadStatus.urgency === 'urgent' ? (
                  <AlertTriangle className="text-orange-600 dark:text-orange-400" size={32} />
                ) : (
                  <XCircle className="text-red-600 dark:text-red-400" size={32} />
                )}
              </div>

              <div>
                <h2 className={`text-xl md:text-2xl font-bold ${
                  uploadStatus.urgency === 'ok' ? 'text-green-700 dark:text-green-300' :
                  uploadStatus.urgency === 'warning' ? 'text-yellow-700 dark:text-yellow-300' :
                  uploadStatus.urgency === 'urgent' ? 'text-orange-700 dark:text-orange-300' :
                  'text-red-700 dark:text-red-300'
                }`}>
                  {uploadStatus.message}
                </h2>
                <p className={`text-sm md:text-base ${
                  uploadStatus.urgency === 'ok' ? 'text-green-600 dark:text-green-400' :
                  uploadStatus.urgency === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                  uploadStatus.urgency === 'urgent' ? 'text-orange-600 dark:text-orange-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {uploadStatus.subMessage}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              {/* Days counter */}
              <div className={`text-center px-4 py-2 rounded-xl ${
                uploadStatus.urgency === 'ok' ? 'bg-green-100 dark:bg-green-800/40' :
                uploadStatus.urgency === 'warning' ? 'bg-yellow-100 dark:bg-yellow-800/40' :
                uploadStatus.urgency === 'urgent' ? 'bg-orange-100 dark:bg-orange-800/40' :
                'bg-red-100 dark:bg-red-800/40'
              }`}>
                <div className={`text-3xl font-bold ${
                  uploadStatus.urgency === 'ok' ? 'text-green-700 dark:text-green-300' :
                  uploadStatus.urgency === 'warning' ? 'text-yellow-700 dark:text-yellow-300' :
                  uploadStatus.urgency === 'urgent' ? 'text-orange-700 dark:text-orange-300' :
                  'text-red-700 dark:text-red-300'
                }`}>
                  {uploadStatus.daysSinceUpload}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">días sin video</div>
              </div>

              {/* Optimal upload time */}
              {uploadStatus.urgency !== 'ok' && (
                <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Clock size={16} />
                    <span className="text-sm font-medium">Hora óptima:</span>
                  </div>
                  <div className="text-lg font-bold text-pokemon-blue">21:00-22:00</div>
                  <div className="text-xs text-gray-500">3PM EST para USA</div>
                </div>
              )}
            </div>
          </div>

          {/* Next upload dates */}
          {!uploadStatus.uploadedToday && uploadStatus.nextUploadDates.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Próximas fechas de subida:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {uploadStatus.nextUploadDates.slice(0, 4).map((date, idx) => {
                  const isToday = new Date().toDateString() === date.toDateString();
                  return (
                    <span
                      key={idx}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        isToday
                          ? 'bg-red-500 text-white animate-pulse'
                          : idx === 0
                          ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {isToday ? '¡HOY!' : date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats Row */}
      {channelStats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
            <Youtube className="mx-auto mb-2 text-red-500" size={24} />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(channelStats.subscribers)}</div>
            <div className="text-xs text-gray-500">Subscribers</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
            <TrendingUp className="mx-auto mb-2 text-green-500" size={24} />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(channelStats.totalViews)}</div>
            <div className="text-xs text-gray-500">Total Views</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
            <Video className="mx-auto mb-2 text-blue-500" size={24} />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{channelStats.totalVideos}</div>
            <div className="text-xs text-gray-500">Videos</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Focus */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Zap className="text-yellow-600 dark:text-yellow-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Today's Focus</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your daily tasks</p>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-500">
              {completedTasks}/{totalTasks} done
            </span>
          </div>

          <div className="space-y-3">
            {dashboardTasks.map(task => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id, task.isDbTask)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  task.completed
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : task.priority === 'high'
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
                }`}
              >
                {task.completed ? (
                  <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />
                ) : (
                  <Circle className={`flex-shrink-0 ${task.priority === 'high' ? 'text-red-400' : 'text-gray-400'}`} size={20} />
                )}
                <span className={`flex-1 text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                  {task.title}
                </span>
                {task.priority === 'high' && !task.completed && (
                  <span className="text-xs px-2 py-0.5 bg-red-500 text-white rounded-full">Priority</span>
                )}
                {!task.isDbTask && !task.completed && (
                  <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">Auto</span>
                )}
              </div>
            ))}
            
            {dashboardTasks.length === 0 && (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                No tasks for today. Relax or check your settings!
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('checklist')}
            className="mt-4 w-full py-2 text-sm text-pokemon-blue hover:text-blue-700 font-medium flex items-center justify-center gap-2"
          >
            <ListTodo size={16} />
            View Full Task List
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Content Pipeline */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <KanbanSquare className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Content Pipeline</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your video ideas progress</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{pipelineStats.saved}</div>
              <div className="text-xs text-blue-600/70">Saved</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <div className="text-2xl font-bold text-yellow-600">{pipelineStats.scripting}</div>
              <div className="text-xs text-yellow-600/70">Scripting</div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">{pipelineStats.filming}</div>
              <div className="text-xs text-purple-600/70">Filming</div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="text-2xl font-bold text-green-600">{pipelineStats.done}</div>
              <div className="text-xs text-green-600/70">Done</div>
            </div>
          </div>

          {/* Next up in pipeline */}
          {(pipelineStats.filming > 0 || pipelineStats.scripting > 0) && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-medium mb-2">
                <Flame size={16} />
                Next Up
              </div>
              {pipelineStats.filming > 0 ? (
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  {savedIdeas.find(i => i.status === 'filming')?.title.substring(0, 50)}...
                  <span className="text-xs ml-2 px-2 py-0.5 bg-purple-200 dark:bg-purple-800 rounded">Ready to Film</span>
                </p>
              ) : pipelineStats.scripting > 0 ? (
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  {savedIdeas.find(i => i.status === 'scripting')?.title.substring(0, 50)}...
                  <span className="text-xs ml-2 px-2 py-0.5 bg-yellow-200 dark:bg-yellow-800 rounded">Writing Script</span>
                </p>
              ) : null}
            </div>
          )}

          <button
            onClick={() => onNavigate('planner')}
            className="mt-4 w-full py-2 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center justify-center gap-2"
          >
            <KanbanSquare size={16} />
            Open Planner Board
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('search')}
            className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all border border-blue-200 dark:border-blue-800"
          >
            <Search className="text-blue-600" size={24} />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Find Ideas</span>
          </button>
          <button
            onClick={() => onNavigate('analyzer')}
            className="flex flex-col items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all border border-green-200 dark:border-green-800"
          >
            <Target className="text-green-600" size={24} />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Analyze Title</span>
          </button>
          <button
            onClick={() => onNavigate('enhancer')}
            className="flex flex-col items-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all border border-purple-200 dark:border-purple-800"
          >
            <Wand2 className="text-purple-600" size={24} />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Enhance Script</span>
          </button>
          <button
            onClick={() => onNavigate('motivation')}
            className="flex flex-col items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all border border-red-200 dark:border-red-800"
          >
            <Youtube className="text-red-600" size={24} />
            <span className="text-sm font-medium text-red-700 dark:text-red-300">Channel Stats</span>
          </button>
        </div>
      </div>

      {/* Recent Videos */}
      {recentVideos.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Play className="text-red-600 dark:text-red-400" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Uploads</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your latest videos</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {recentVideos.slice(0, 5).map(video => (
              <a
                key={video.videoId}
                href={`https://youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="relative rounded-lg overflow-hidden mb-2">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full aspect-video object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                    {formatNumber(video.viewCount)} views
                  </div>
                </div>
                <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-pokemon-blue">
                  {video.title}
                </h4>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
