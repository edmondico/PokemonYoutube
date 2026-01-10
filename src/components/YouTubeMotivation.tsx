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
  RefreshCcw
} from 'lucide-react';

interface ChannelStats {
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

const YouTubeMotivation: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Channel stats - can be updated with real API data later
  const [stats] = useState<ChannelStats>({
    subscribers: 1240,
    totalViews: 89500,
    totalVideos: 47,
    channelName: 'PokeBim',
    channelHandle: '@PokeBim',
    profileImage: 'https://yt3.googleusercontent.com/ytc/AIdro_nQPz8Y2q3Y_Yr8V8G8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8=s176-c-k-c0x00ffffff-no-rj',
    bannerImage: '',
    joinDate: '2023',
    country: 'Spain'
  });

  // Milestones progression
  const milestones: Milestone[] = [
    {
      id: '1',
      title: 'First 1K Subscribers',
      target: 1000,
      current: stats.subscribers,
      icon: <Users className="text-blue-500" size={20} />,
      unit: 'subs',
      achieved: stats.subscribers >= 1000
    },
    {
      id: '2',
      title: '5K Subscribers',
      target: 5000,
      current: stats.subscribers,
      icon: <Users className="text-purple-500" size={20} />,
      unit: 'subs',
      achieved: stats.subscribers >= 5000
    },
    {
      id: '3',
      title: '10K Subscribers',
      target: 10000,
      current: stats.subscribers,
      icon: <Users className="text-yellow-500" size={20} />,
      unit: 'subs',
      achieved: stats.subscribers >= 10000
    },
    {
      id: '4',
      title: '100K Views Total',
      target: 100000,
      current: stats.totalViews,
      icon: <Eye className="text-green-500" size={20} />,
      unit: 'views',
      achieved: stats.totalViews >= 100000
    },
    {
      id: '5',
      title: '50 Videos Published',
      target: 50,
      current: stats.totalVideos,
      icon: <Video className="text-red-500" size={20} />,
      unit: 'videos',
      achieved: stats.totalVideos >= 50
    },
    {
      id: '6',
      title: '100 Videos Published',
      target: 100,
      current: stats.totalVideos,
      icon: <Video className="text-pokemon-red" size={20} />,
      unit: 'videos',
      achieved: stats.totalVideos >= 100
    }
  ];

  // Achievements system
  const achievements: Achievement[] = [
    {
      id: 'first-video',
      title: 'First Steps',
      description: 'Published your first video',
      icon: <Star className="text-yellow-400" size={24} />,
      unlockedAt: '2023',
      locked: false
    },
    {
      id: '10-videos',
      title: 'Content Creator',
      description: 'Published 10 videos',
      icon: <Video className="text-blue-400" size={24} />,
      unlockedAt: '2023',
      locked: stats.totalVideos < 10
    },
    {
      id: '1k-subs',
      title: 'Community Builder',
      description: 'Reached 1,000 subscribers',
      icon: <Users className="text-purple-400" size={24} />,
      unlockedAt: stats.subscribers >= 1000 ? '2024' : undefined,
      locked: stats.subscribers < 1000
    },
    {
      id: 'consistent',
      title: 'Consistency King',
      description: 'Posted weekly for a month',
      icon: <Calendar className="text-green-400" size={24} />,
      locked: false
    },
    {
      id: 'viral',
      title: 'Viral Moment',
      description: 'Got a video with 10K+ views',
      icon: <Flame className="text-orange-400" size={24} />,
      locked: true
    },
    {
      id: 'monetized',
      title: 'Monetization Ready',
      description: 'Reached 1K subs + 4K watch hours',
      icon: <Trophy className="text-yellow-500" size={24} />,
      locked: stats.subscribers < 1000
    },
    {
      id: '10k-subs',
      title: 'Rising Star',
      description: 'Reached 10,000 subscribers',
      icon: <Award className="text-pink-400" size={24} />,
      locked: stats.subscribers < 10000
    },
    {
      id: '100k-subs',
      title: 'Silver Play Button',
      description: 'Reached 100,000 subscribers',
      icon: <Sparkles className="text-gray-400" size={24} />,
      locked: stats.subscribers < 100000
    }
  ];

  // Motivational quotes for Pokemon YouTubers
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
    setIsLoading(true);
    // Simulate API call - in the future, connect to YouTube API
    setTimeout(() => {
      setIsLoading(false);
      setLastUpdated(new Date());
    }, 1500);
  };

  const unlockedCount = achievements.filter(a => !a.locked).length;
  const nextMilestone = milestones.find(m => !m.achieved);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Channel Header */}
      <div className="bg-gradient-to-r from-red-600 via-pokemon-red to-red-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            {/* Profile */}
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30 shadow-lg">
              <Youtube size={40} className="text-white" />
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
              href="https://www.youtube.com/@PokeBim"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-red-600 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition-all shadow-lg flex items-center gap-2"
            >
              <Youtube size={18} />
              Visit Channel
            </a>
          </div>

          {/* Stats Grid */}
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

      {/* Quick Stats Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock size={16} />
          <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>
        <button
          onClick={refreshStats}
          disabled={isLoading}
          className="flex items-center gap-2 text-sm text-pokemon-blue hover:text-blue-700 disabled:opacity-50"
        >
          <RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} />
          Refresh Stats
        </button>
      </div>

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
                      <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                        {milestone.title}
                      </span>
                      {milestone.achieved && (
                        <CheckCircle2 className="text-green-500" size={16} />
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatNumber(milestone.current)} / {formatNumber(milestone.target)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        milestone.achieved
                          ? 'bg-green-500'
                          : 'bg-gradient-to-r from-pokemon-blue to-blue-400'
                      }`}
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
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {unlockedCount} of {achievements.length} unlocked
              </p>
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
              >
                <div className={`mx-auto mb-2 ${achievement.locked ? 'grayscale' : ''}`}>
                  {achievement.icon}
                </div>
                <div className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                  {achievement.title}
                </div>
                {!achievement.locked && achievement.unlockedAt && (
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                    {achievement.unlockedAt}
                  </div>
                )}
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
          <blockquote className="text-xl sm:text-2xl font-bold mb-2">
            "{quotes[currentQuote].text}"
          </blockquote>
          <p className="text-white/80 text-sm">- {quotes[currentQuote].author}</p>
        </div>

        {/* Quote navigation dots */}
        <div className="flex justify-center gap-2 mt-4">
          {quotes.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuote(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentQuote === idx ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Growth Tips */}
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
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Keep pushing forward! Your content matters.
        </p>
        <a
          href="https://www.youtube.com/@PokeBim"
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
