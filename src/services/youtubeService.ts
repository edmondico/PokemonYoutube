const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeChannelStats {
  channelId: string;
  channelName: string;
  channelHandle: string;
  description: string;
  customUrl: string;
  profileImage: string;
  bannerImage: string;
  subscribers: number;
  totalViews: number;
  totalVideos: number;
  joinDate: string;
  country: string;
}

export interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

export async function fetchChannelByHandle(handle: string): Promise<YouTubeChannelStats | null> {
  try {
    // Remove @ if present
    const cleanHandle = handle.startsWith('@') ? handle.substring(1) : handle;

    // First, search for the channel by handle
    const searchUrl = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics,brandingSettings&forHandle=${cleanHandle}&key=${YOUTUBE_API_KEY}`;

    const response = await fetch(searchUrl);

    if (!response.ok) {
      console.error('YouTube API error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.error('Channel not found for handle:', handle);
      return null;
    }

    const channel = data.items[0];
    const snippet = channel.snippet;
    const statistics = channel.statistics;
    const branding = channel.brandingSettings;

    return {
      channelId: channel.id,
      channelName: snippet.title,
      channelHandle: `@${snippet.customUrl || cleanHandle}`,
      description: snippet.description,
      customUrl: snippet.customUrl || cleanHandle,
      profileImage: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || '',
      bannerImage: branding?.image?.bannerExternalUrl || '',
      subscribers: parseInt(statistics.subscriberCount) || 0,
      totalViews: parseInt(statistics.viewCount) || 0,
      totalVideos: parseInt(statistics.videoCount) || 0,
      joinDate: new Date(snippet.publishedAt).getFullYear().toString(),
      country: snippet.country || 'Unknown'
    };
  } catch (error) {
    console.error('Error fetching YouTube channel:', error);
    return null;
  }
}

export async function fetchChannelVideos(channelId: string, maxResults: number = 50): Promise<YouTubeVideo[]> {
  try {
    // Get upload playlist ID
    const channelUrl = `${YOUTUBE_API_BASE}/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    const channelResponse = await fetch(channelUrl);
    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      return [];
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // Get videos from uploads playlist with pagination
    let allVideos: any[] = [];
    let nextPageToken: string | undefined;
    const perPage = Math.min(maxResults, 50);

    do {
      const playlistUrl = `${YOUTUBE_API_BASE}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${perPage}&key=${YOUTUBE_API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
      const playlistResponse = await fetch(playlistUrl);
      const playlistData = await playlistResponse.json();

      if (playlistData.items) {
        allVideos = [...allVideos, ...playlistData.items];
      }

      nextPageToken = playlistData.nextPageToken;
    } while (nextPageToken && allVideos.length < maxResults);

    if (allVideos.length === 0) {
      return [];
    }

    // Get video statistics in batches of 50
    const allStats = new Map<string, any>();
    for (let i = 0; i < allVideos.length; i += 50) {
      const batch = allVideos.slice(i, i + 50);
      const videoIds = batch.map((item: any) => item.snippet.resourceId.videoId).join(',');
      const statsUrl = `${YOUTUBE_API_BASE}/videos?part=statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
      const statsResponse = await fetch(statsUrl);
      const statsData = await statsResponse.json();

      statsData.items?.forEach((item: any) => {
        allStats.set(item.id, item.statistics);
      });
    }

    return allVideos.map((item: any) => {
      const videoId = item.snippet.resourceId.videoId;
      const stats = allStats.get(videoId) || {};

      return {
        videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || '',
        publishedAt: item.snippet.publishedAt,
        viewCount: parseInt(stats.viewCount) || 0,
        likeCount: parseInt(stats.likeCount) || 0,
        commentCount: parseInt(stats.commentCount) || 0
      };
    });
  } catch (error) {
    console.error('Error fetching channel videos:', error);
    return [];
  }
}

// Analytics helper functions
export interface ChannelAnalytics {
  uploadsByDayOfWeek: Record<string, number>;
  uploadsByMonth: Record<string, number>;
  averageViewsPerVideo: number;
  averageLikesPerVideo: number;
  bestPerformingDay: string;
  uploadFrequency: number; // days between uploads on average
  currentStreak: number;
  longestStreak: number;
  lastUploadDate: Date | null;
  suggestedNextUpload: Date | null;
  recentTrend: 'growing' | 'stable' | 'declining';
  topVideos: YouTubeVideo[];
}

export function analyzeChannelData(videos: YouTubeVideo[]): ChannelAnalytics {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const uploadsByDayOfWeek: Record<string, number> = {};
  const uploadsByMonth: Record<string, number> = {};

  dayNames.forEach(day => uploadsByDayOfWeek[day] = 0);

  if (videos.length === 0) {
    return {
      uploadsByDayOfWeek,
      uploadsByMonth: {},
      averageViewsPerVideo: 0,
      averageLikesPerVideo: 0,
      bestPerformingDay: 'N/A',
      uploadFrequency: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastUploadDate: null,
      suggestedNextUpload: null,
      recentTrend: 'stable',
      topVideos: []
    };
  }

  // Sort videos by date (newest first)
  const sortedVideos = [...videos].sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  let totalViews = 0;
  let totalLikes = 0;

  // Analyze each video
  sortedVideos.forEach(video => {
    const date = new Date(video.publishedAt);
    const dayName = dayNames[date.getDay()];
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    uploadsByDayOfWeek[dayName]++;
    uploadsByMonth[monthKey] = (uploadsByMonth[monthKey] || 0) + 1;
    totalViews += video.viewCount;
    totalLikes += video.likeCount;
  });

  // Find best performing day (by views per video on that day)
  const viewsByDay: Record<string, { views: number; count: number }> = {};
  dayNames.forEach(day => viewsByDay[day] = { views: 0, count: 0 });

  sortedVideos.forEach(video => {
    const dayName = dayNames[new Date(video.publishedAt).getDay()];
    viewsByDay[dayName].views += video.viewCount;
    viewsByDay[dayName].count++;
  });

  let bestDay = 'Monday';
  let bestAvg = 0;
  Object.entries(viewsByDay).forEach(([day, data]) => {
    if (data.count > 0) {
      const avg = data.views / data.count;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestDay = day;
      }
    }
  });

  // Calculate upload frequency
  const dates = sortedVideos.map(v => new Date(v.publishedAt).getTime());
  let totalGap = 0;
  for (let i = 0; i < dates.length - 1; i++) {
    totalGap += dates[i] - dates[i + 1];
  }
  const avgGapMs = dates.length > 1 ? totalGap / (dates.length - 1) : 0;
  const uploadFrequency = Math.round(avgGapMs / (1000 * 60 * 60 * 24));

  // Calculate streaks (weekly upload = streak continues)
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < dates.length - 1; i++) {
    if (dates[i] - dates[i + 1] <= oneWeek * 1.5) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak + 1);
      tempStreak = 0;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak + 1);

  // Current streak (from most recent)
  const now = Date.now();
  if (dates.length > 0 && now - dates[0] <= oneWeek * 1.5) {
    currentStreak = 1;
    for (let i = 0; i < dates.length - 1; i++) {
      if (dates[i] - dates[i + 1] <= oneWeek * 1.5) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Suggested next upload
  const lastUploadDate = dates.length > 0 ? new Date(dates[0]) : null;
  let suggestedNextUpload: Date | null = null;
  if (lastUploadDate && uploadFrequency > 0) {
    suggestedNextUpload = new Date(lastUploadDate.getTime() + uploadFrequency * 24 * 60 * 60 * 1000);
    if (suggestedNextUpload < new Date()) {
      suggestedNextUpload = new Date();
      suggestedNextUpload.setDate(suggestedNextUpload.getDate() + 1);
    }
  }

  // Recent trend (compare last 10 videos to previous 10)
  let recentTrend: 'growing' | 'stable' | 'declining' = 'stable';
  if (sortedVideos.length >= 20) {
    const recent10 = sortedVideos.slice(0, 10);
    const previous10 = sortedVideos.slice(10, 20);
    const recentAvg = recent10.reduce((sum, v) => sum + v.viewCount, 0) / 10;
    const previousAvg = previous10.reduce((sum, v) => sum + v.viewCount, 0) / 10;

    if (recentAvg > previousAvg * 1.1) recentTrend = 'growing';
    else if (recentAvg < previousAvg * 0.9) recentTrend = 'declining';
  }

  // Top 5 videos by views
  const topVideos = [...sortedVideos].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);

  return {
    uploadsByDayOfWeek,
    uploadsByMonth,
    averageViewsPerVideo: Math.round(totalViews / videos.length),
    averageLikesPerVideo: Math.round(totalLikes / videos.length),
    bestPerformingDay: bestDay,
    uploadFrequency,
    currentStreak,
    longestStreak,
    lastUploadDate,
    suggestedNextUpload,
    recentTrend,
    topVideos
  };
}

export async function fetchVideoStats(videoId: string): Promise<YouTubeVideo | null> {
  try {
    const url = `${YOUTUBE_API_BASE}/videos?part=snippet,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const video = data.items[0];
    const snippet = video.snippet;
    const stats = video.statistics;

    return {
      videoId: video.id,
      title: snippet.title,
      description: snippet.description,
      thumbnail: snippet.thumbnails?.high?.url || '',
      publishedAt: snippet.publishedAt,
      viewCount: parseInt(stats.viewCount) || 0,
      likeCount: parseInt(stats.likeCount) || 0,
      commentCount: parseInt(stats.commentCount) || 0
    };
  } catch (error) {
    console.error('Error fetching video stats:', error);
    return null;
  }
}
