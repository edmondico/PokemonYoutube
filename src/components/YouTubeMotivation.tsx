import React, { useState, useEffect } from 'react';
import {
  Youtube,
  Users,
  Eye,
  Video,
  TrendingUp,
  Trophy,
  Target,
  Star,
  Flame,
  Calendar,
  Award,
  Zap,
  Heart,
  CheckCircle2,
  Clock,
  ArrowUp,
  Sparkles,
  RefreshCcw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Play,
  BarChart3,
  CalendarDays,
  TrendingDown,
  Minus,
  ThumbsUp
} from 'lucide-react';
import {
  fetchChannelByHandle,
  fetchChannelVideos,
  analyzeChannelData,
  YouTubeVideo,
  ChannelAnalytics
} from '../services/youtubeService';

interface ChannelStats {
  channelId: string;
  subscribers: number;
  totalViews: number;
  totalVideos: number;
  channelName: string;
  channelHandle: string;
  profileImage: string;
  bannerImage: string;
  joinDate: string;
  country: string;
}

interface Milestone {
  id: string;
  title: string;
  target: number;
  current: number;
  icon: React.ReactNode;
  unit: string;
  achieved: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlockedAt?: string;
  locked: boolean;
}

const CHANNEL_HANDLE = '@PokeBim';

const YouTubeMotivation: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'analytics'>('overview');

  const [stats, setStats] = useState<ChannelStats>({
    channelId: '',
    subscribers: 0,
    totalViews: 0,
    totalVideos: 0,
    channelName: 'Loading...',
    channelHandle: CHANNEL_HANDLE,
    profileImage: '',
    bannerImage: '',
    joinDate: '',
    country: ''
  });

  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [analytics, setAnalytics] = useState<ChannelAnalytics | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const loadChannelStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const channelData = await fetchChannelByHandle(CHANNEL_HANDLE);

      if (channelData) {
        setStats({
          channelId: channelData.channelId,
          subscribers: channelData.subscribers,
          totalViews: channelData.totalViews,
          totalVideos: channelData.totalVideos,
          channelName: channelData.channelName,
          channelHandle: channelData.channelHandle,
          profileImage: channelData.profileImage,
          bannerImage: channelData.bannerImage,
          joinDate: channelData.joinDate,
          country: channelData.country
        });

        // Fetch videos for calendar and analytics
        const channelVideos = await fetchChannelVideos(channelData.channelId, 100);
        setVideos(channelVideos);

        const channelAnalytics = analyzeChannelData(channelVideos);
        setAnalytics(channelAnalytics);

        setLastUpdated(new Date());
      } else {
        setError('Could not load channel data. Check your YouTube API key.');
      }
    } catch (err) {
      setError('Error connecting to YouTube API');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChannelStats();
  }, []);

  // Procedural milestone generation
  const generateMilestones = (): Milestone[] => {
    const subMilestones = [100, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];
    const viewMilestones = [1000, 10000, 50000, 100000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000];
    const videoMilestones = [10, 25, 50, 100, 150, 200, 300, 500, 1000];

    const formatMilestone = (n: number): string => {
      if (n >= 1000000) return `${n / 1000000}M`;
      if (n >= 1000) return `${n / 1000}K`;
      return n.toString();
    };

    const milestones: Milestone[] = [];

    const nextSubIdx = subMilestones.findIndex(m => m > stats.subscribers);
    const subStart = Math.max(0, nextSubIdx - 1);
    const subTargets = subMilestones.slice(subStart, subStart + 2);

    subTargets.forEach((target, i) => {
      milestones.push({
        id: `sub-${target}`,
        title: `${formatMilestone(target)} Subscribers`,
        target,
        current: stats.subscribers,
        icon: <Users className={i === 0 ? "text-blue-500" : "text-purple-500"} size={20} />,
        unit: 'subs',
        achieved: stats.subscribers >= target
      });
    });

    const nextViewIdx = viewMilestones.findIndex(m => m > stats.totalViews);
    const viewStart = Math.max(0, nextViewIdx - 1);
    const viewTargets = viewMilestones.slice(viewStart, viewStart + 2);

    viewTargets.forEach((target, i) => {
      milestones.push({
        id: `view-${target}`,
        title: `${formatMilestone(target)} Total Views`,
        target,
        current: stats.totalViews,
        icon: <Eye className={i === 0 ? "text-green-500" : "text-emerald-500"} size={20} />,
        unit: 'views',
        achieved: stats.totalViews >= target
      });
    });

    const nextVideoIdx = videoMilestones.findIndex(m => m > stats.totalVideos);
    const videoStart = Math.max(0, nextVideoIdx - 1);
    const videoTargets = videoMilestones.slice(videoStart, videoStart + 2);

    videoTargets.forEach((target, i) => {
      milestones.push({
        id: `video-${target}`,
        title: `${formatMilestone(target)} Videos Published`,
        target,
        current: stats.totalVideos,
        icon: <Video className={i === 0 ? "text-red-500" : "text-orange-500"} size={20} />,
        unit: 'videos',
        achieved: stats.totalVideos >= target
      });
    });

    return milestones;
  };

  const milestones = generateMilestones();

  // Achievements system
  const achievements: Achievement[] = [
    { id: 'first-video', title: 'First Steps', description: 'Published your first video', icon: <Star className="text-yellow-400" size={24} />, locked: stats.totalVideos < 1 },
    { id: '10-videos', title: 'Content Creator', description: 'Published 10 videos', icon: <Video className="text-blue-400" size={24} />, locked: stats.totalVideos < 10 },
    { id: '50-videos', title: 'Dedicated Trainer', description: 'Published 50 videos', icon: <Video className="text-indigo-400" size={24} />, locked: stats.totalVideos < 50 },
    { id: '100-videos', title: 'Pokemon Master', description: 'Published 100 videos', icon: <Award className="text-red-500" size={24} />, locked: stats.totalVideos < 100 },
    { id: '100-subs', title: 'Starter Pokemon', description: 'Reached 100 subscribers', icon: <Users className="text-green-400" size={24} />, locked: stats.subscribers < 100 },
    { id: '1k-subs', title: 'Gym Leader', description: 'Reached 1,000 subscribers', icon: <Users className="text-purple-400" size={24} />, locked: stats.subscribers < 1000 },
    { id: '5k-subs', title: 'Elite Four', description: 'Reached 5,000 subscribers', icon: <Users className="text-blue-500" size={24} />, locked: stats.subscribers < 5000 },
    { id: '10k-subs', title: 'Champion', description: 'Reached 10,000 subscribers', icon: <Trophy className="text-yellow-500" size={24} />, locked: stats.subscribers < 10000 },
    { id: '25k-subs', title: 'Regional Champion', description: 'Reached 25,000 subscribers', icon: <Award className="text-pink-400" size={24} />, locked: stats.subscribers < 25000 },
    { id: '100k-subs', title: 'Silver Play Button', description: 'Reached 100,000 subscribers', icon: <Sparkles className="text-gray-400" size={24} />, locked: stats.subscribers < 100000 },
    { id: '10k-views', title: 'First Catch', description: 'Reached 10,000 total views', icon: <Eye className="text-cyan-400" size={24} />, locked: stats.totalViews < 10000 },
    { id: '100k-views', title: 'Rare Spawn', description: 'Reached 100,000 total views', icon: <Eye className="text-teal-400" size={24} />, locked: stats.totalViews < 100000 },
    { id: '1m-views', title: 'Legendary Encounter', description: 'Reached 1,000,000 total views', icon: <Flame className="text-orange-500" size={24} />, locked: stats.totalViews < 1000000 },
    { id: 'consistent', title: 'Consistency King', description: 'Posted regularly for a month', icon: <Calendar className="text-green-400" size={24} />, locked: stats.totalVideos < 4 },
    { id: 'monetized', title: 'Monetization Ready', description: 'Reached 1K subs (halfway to YPP!)', icon: <Zap className="text-yellow-500" size={24} />, locked: stats.subscribers < 1000 },
    { id: 'shiny-hunter', title: 'Shiny Hunter', description: 'Over 10K views per video average', icon: <Sparkles className="text-pink-400" size={24} />, locked: stats.totalVideos === 0 || (stats.totalViews / stats.totalVideos) < 10000 }
  ];

  const quotes = [
    { text: "Every viral video started with pressing record.", author: "Keep creating!" },
    { text: "The algorithm favors consistency over perfection.", author: "Post regularly!" },
    { text: "Your next video could be the one that changes everything.", author: "Don't give up!" },
    { text: "Small channels become big channels one subscriber at a time.", author: "Be patient!" },
    { text: "The best time to start was yesterday. The next best time is now.", author: "Take action!" },
    { text: "Gotta catch 'em all - views, subs, and watch time!", author: "Pokemon wisdom" }
  ];

  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % quotes.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getProgressPercentage = (current: number, target: number): number => {
    return Math.min((current / target) * 100, 100);
  };

  const refreshStats = () => {
    loadChannelStats();
  };

  const unlockedCount = achievements.filter(a => !a.locked).length;
  const nextMilestone = milestones.find(m => !m.achieved);

  // Calendar helpers - Monday first
  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    // Convert Sunday=0 to Monday=0 format (Monday first)
    const startingDay = (firstDay.getDay() + 6) % 7;

    const days: { date: Date; videos: YouTubeVideo[] }[] = [];

    // Empty days before month starts
    for (let i = 0; i < startingDay; i++) {
      days.push({ date: new Date(year, month, -startingDay + i + 1), videos: [] });
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dayVideos = videos.filter(v => {
        const vDate = new Date(v.publishedAt);
        return vDate.getDate() === i && vDate.getMonth() === month && vDate.getFullYear() === year;
      });
      days.push({ date, videos: dayVideos });
    }

    return days;
  };

  // Target upload frequency: every 2 days
  const TARGET_UPLOAD_FREQUENCY = 2;

  const getSuggestedUploadDates = (): Date[] => {
    if (videos.length === 0) return [];

    const sortedVideos = [...videos].sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    const lastUpload = new Date(sortedVideos[0].publishedAt);
    const suggestions: Date[] = [];

    // Generate next 5 suggested upload dates
    let nextDate = new Date(lastUpload);
    for (let i = 0; i < 5; i++) {
      nextDate = new Date(nextDate.getTime() + TARGET_UPLOAD_FREQUENCY * 24 * 60 * 60 * 1000);
      if (nextDate >= new Date()) {
        suggestions.push(new Date(nextDate));
      }
    }

    // If all dates are in the past, start from today
    if (suggestions.length === 0) {
      nextDate = new Date();
      for (let i = 0; i < 5; i++) {
        nextDate = new Date(nextDate.getTime() + TARGET_UPLOAD_FREQUENCY * 24 * 60 * 60 * 1000);
        suggestions.push(new Date(nextDate));
      }
    }

    return suggestions;
  };

  const suggestedDates = getSuggestedUploadDates();

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <div className="flex-1">
            <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
            <p className="text-red-600 dark:text-red-400 text-sm">Make sure YouTube Data API v3 is enabled in your Google Cloud project.</p>
          </div>
          <button onClick={refreshStats} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium">
            Retry
          </button>
        </div>
      )}

      {/* Channel Header */}
      <div className="bg-gradient-to-r from-red-600 via-pokemon-red to-red-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30 shadow-lg overflow-hidden">
              {stats.profileImage ? (
                <img src={stats.profileImage} alt={stats.channelName} className="w-full h-full object-cover" />
              ) : (
                <Youtube size={40} className="text-white" />
              )}
            </div>

            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-bold">{stats.channelName}</h2>
              <p className="text-white/80">{stats.channelHandle}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 text-sm text-white/70">
                <Calendar size={14} />
                <span>Since {stats.joinDate}</span>
                <span className="mx-2">|</span>
                <span>{stats.country}</span>
              </div>
            </div>

            <a
              href={`https://www.youtube.com/${CHANNEL_HANDLE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-red-600 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition-all shadow-lg flex items-center gap-2"
            >
              <Youtube size={18} />
              Visit Channel
            </a>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <Users size={24} className="mx-auto mb-2 opacity-80" />
              <div className="text-2xl sm:text-3xl font-bold">{formatNumber(stats.subscribers)}</div>
              <div className="text-xs sm:text-sm opacity-80">Subscribers</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <Eye size={24} className="mx-auto mb-2 opacity-80" />
              <div className="text-2xl sm:text-3xl font-bold">{formatNumber(stats.totalViews)}</div>
              <div className="text-xs sm:text-sm opacity-80">Total Views</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <Video size={24} className="mx-auto mb-2 opacity-80" />
              <div className="text-2xl sm:text-3xl font-bold">{stats.totalVideos}</div>
              <div className="text-xs sm:text-sm opacity-80">Videos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-2 border border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'overview'
                ? 'bg-pokemon-red text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Trophy size={16} className="inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'calendar'
                ? 'bg-pokemon-red text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <CalendarDays size={16} className="inline mr-2" />
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'analytics'
                ? 'bg-pokemon-red text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <BarChart3 size={16} className="inline mr-2" />
            Analytics
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock size={16} />
            <span>{lastUpdated.toLocaleTimeString()}</span>
          </div>
          <button
            onClick={refreshStats}
            disabled={isLoading}
            className="flex items-center gap-2 text-sm text-pokemon-blue hover:text-blue-700 disabled:opacity-50"
          >
            <RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Milestones Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Target className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Milestones</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Track your progress</p>
                </div>
              </div>

              <div className="space-y-4">
                {milestones.map((milestone) => {
                  const progress = getProgressPercentage(milestone.current, milestone.target);
                  return (
                    <div key={milestone.id} className={`relative ${milestone.achieved ? 'opacity-60' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {milestone.icon}
                          <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">{milestone.title}</span>
                          {milestone.achieved && <CheckCircle2 className="text-green-500" size={16} />}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatNumber(milestone.current)} / {formatNumber(milestone.target)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${milestone.achieved ? 'bg-green-500' : 'bg-gradient-to-r from-pokemon-blue to-blue-400'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {nextMilestone && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-medium mb-1">
                    <Zap size={16} />
                    Next Goal
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {nextMilestone.title} - Only {formatNumber(nextMilestone.target - nextMilestone.current)} {nextMilestone.unit} to go!
                  </p>
                </div>
              )}
            </div>

            {/* Achievements */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Trophy className="text-yellow-600 dark:text-yellow-400" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Achievements</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{unlockedCount} of {achievements.length} unlocked</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`relative p-3 rounded-xl border text-center transition-all ${
                      achievement.locked
                        ? 'bg-gray-100 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 opacity-50'
                        : 'bg-gradient-to-b from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800'
                    }`}
                    title={achievement.description}
                  >
                    <div className={`mx-auto mb-2 ${achievement.locked ? 'grayscale' : ''}`}>{achievement.icon}</div>
                    <div className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{achievement.title}</div>
                    {achievement.locked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl opacity-30">🔒</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Motivational Quote */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <Heart className="absolute right-4 top-4 opacity-20" size={64} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3 text-white/80">
                <Sparkles size={18} />
                <span className="text-sm font-medium">Daily Motivation</span>
              </div>
              <blockquote className="text-xl sm:text-2xl font-bold mb-2">"{quotes[currentQuote].text}"</blockquote>
              <p className="text-white/80 text-sm">- {quotes[currentQuote].author}</p>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {quotes.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuote(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${currentQuote === idx ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/60'}`}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <CalendarDays className="text-indigo-600 dark:text-indigo-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Upload Calendar</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your video publishing history</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="font-medium text-gray-800 dark:text-gray-200 min-w-[140px] text-center">
                {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
              </span>
              <button
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {getCalendarDays().map((day, idx) => {
              const isCurrentMonth = day.date.getMonth() === calendarMonth.getMonth();
              const isToday = day.date.toDateString() === new Date().toDateString();
              const hasVideos = day.videos.length > 0;
              const isSuggestedDate = suggestedDates.some(d => d.toDateString() === day.date.toDateString());

              return (
                <div
                  key={idx}
                  className={`min-h-[80px] p-2 rounded-lg border transition-all ${
                    !isCurrentMonth
                      ? 'bg-gray-50 dark:bg-gray-900/50 border-transparent opacity-40'
                      : isToday
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                      : hasVideos
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                      : isSuggestedDate
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 border-dashed'
                      : 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 flex items-center gap-1 ${
                    isToday ? 'text-blue-600 dark:text-blue-400' :
                    isSuggestedDate ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-gray-700 dark:text-gray-300'
                  }`}>
                    {day.date.getDate()}
                    {isSuggestedDate && !hasVideos && <Zap size={12} className="text-yellow-500" />}
                  </div>
                  {day.videos.map((video, vIdx) => (
                    <a
                      key={vIdx}
                      href={`https://youtube.com/watch?v=${video.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs bg-red-500 text-white rounded px-1 py-0.5 truncate hover:bg-red-600 mb-1"
                      title={video.title}
                    >
                      <Play size={10} className="inline mr-1" />
                      {video.title.substring(0, 15)}...
                    </a>
                  ))}
                  {isSuggestedDate && !hasVideos && (
                    <div className="text-[10px] text-yellow-600 dark:text-yellow-400 font-medium">
                      Upload!
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
              <span className="text-gray-600 dark:text-gray-400">Video uploaded</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-50 border border-yellow-300 border-dashed"></div>
              <span className="text-gray-600 dark:text-gray-400">Suggested upload</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300"></div>
              <span className="text-gray-600 dark:text-gray-400">Today</span>
            </div>
          </div>

          {/* Suggested Upload Schedule */}
          {suggestedDates.length > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <Zap className="text-white" size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-yellow-800 dark:text-yellow-200">Upload Schedule (every {TARGET_UPLOAD_FREQUENCY} days)</h4>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Your next suggested upload dates:
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedDates.slice(0, 5).map((date, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      idx === 0
                        ? 'bg-yellow-500 text-white'
                        : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200'
                    }`}
                  >
                    {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                <Flame size={16} />
                <span className="text-sm">Current Streak</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.currentStreak} weeks</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                <Trophy size={16} />
                <span className="text-sm">Best Streak</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.longestStreak} weeks</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                <Eye size={16} />
                <span className="text-sm">Avg Views/Video</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(analytics.averageViewsPerVideo)}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                <Calendar size={16} />
                <span className="text-sm">Upload Frequency</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">Every {analytics.uploadFrequency}d</div>
            </div>
          </div>

          {/* Trend & Best Day */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${
                  analytics.recentTrend === 'growing' ? 'bg-green-100 dark:bg-green-900/30' :
                  analytics.recentTrend === 'declining' ? 'bg-red-100 dark:bg-red-900/30' :
                  'bg-gray-100 dark:bg-gray-700'
                }`}>
                  {analytics.recentTrend === 'growing' ? <TrendingUp className="text-green-600" size={24} /> :
                   analytics.recentTrend === 'declining' ? <TrendingDown className="text-red-600" size={24} /> :
                   <Minus className="text-gray-600" size={24} />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Channel Trend</h3>
                  <p className={`text-sm font-medium ${
                    analytics.recentTrend === 'growing' ? 'text-green-600' :
                    analytics.recentTrend === 'declining' ? 'text-red-600' :
                    'text-gray-500'
                  }`}>
                    {analytics.recentTrend === 'growing' ? 'Growing! Keep it up!' :
                     analytics.recentTrend === 'declining' ? 'Views declining - try new content?' :
                     'Stable performance'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Based on comparing your last 10 videos to the previous 10.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Star className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Best Upload Day</h3>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">{analytics.bestPerformingDay}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Videos uploaded on {analytics.bestPerformingDay} get the most views on average.
              </p>
            </div>
          </div>

          {/* Upload Distribution by Day */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Uploads by Day of Week</h3>
            <div className="grid grid-cols-7 gap-2">
              {Object.entries(analytics.uploadsByDayOfWeek).map(([day, count]) => {
                const maxCount = Math.max(...Object.values(analytics.uploadsByDayOfWeek));
                const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div key={day} className="text-center">
                    <div className="h-24 flex items-end justify-center mb-2">
                      <div
                        className="w-8 bg-gradient-to-t from-pokemon-red to-red-400 rounded-t-lg transition-all"
                        style={{ height: `${Math.max(height, 5)}%` }}
                      />
                    </div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400">{day.substring(0, 3)}</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Videos */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Play className="text-red-600 dark:text-red-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Performing Videos</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your most viewed content</p>
              </div>
            </div>
            <div className="space-y-3">
              {analytics.topVideos.map((video, idx) => (
                <a
                  key={video.videoId}
                  href={`https://youtube.com/watch?v=${video.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
                >
                  <div className="text-2xl font-bold text-gray-300 dark:text-gray-600 w-8">#{idx + 1}</div>
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-24 h-14 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">{video.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Eye size={14} />
                        {formatNumber(video.viewCount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp size={14} />
                        {formatNumber(video.likeCount)}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Growth Tips (visible on all tabs) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Growth Tips</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Based on your current stats</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium mb-2">
              <ArrowUp size={16} />
              Increase Upload Frequency
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Posting 2-3 times per week can boost your algorithm visibility significantly.
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium mb-2">
              <Eye size={16} />
              Optimize Thumbnails
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Use bright colors, expressive faces, and clear text to improve click-through rates.
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium mb-2">
              <Users size={16} />
              Engage Community
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Reply to comments in the first hour after posting to boost engagement.
            </p>
          </div>
        </div>
      </div>

      {/* Channel Link CTA */}
      <div className="text-center py-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Keep pushing forward! Your content matters.</p>
        <a
          href={`https://www.youtube.com/${CHANNEL_HANDLE}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-pokemon-red hover:text-red-700 font-medium"
        >
          <Youtube size={18} />
          View your channel
        </a>
      </div>
    </div>
  );
};

export { YouTubeMotivation };
