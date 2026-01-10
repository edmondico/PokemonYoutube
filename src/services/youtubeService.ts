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

export async function fetchChannelVideos(channelId: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
  try {
    // Get upload playlist ID
    const channelUrl = `${YOUTUBE_API_BASE}/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    const channelResponse = await fetch(channelUrl);
    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      return [];
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // Get videos from uploads playlist
    const playlistUrl = `${YOUTUBE_API_BASE}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`;
    const playlistResponse = await fetch(playlistUrl);
    const playlistData = await playlistResponse.json();

    if (!playlistData.items) {
      return [];
    }

    // Get video statistics
    const videoIds = playlistData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');
    const statsUrl = `${YOUTUBE_API_BASE}/videos?part=statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    const statsResponse = await fetch(statsUrl);
    const statsData = await statsResponse.json();

    const statsMap = new Map<string, any>();
    statsData.items?.forEach((item: any) => {
      statsMap.set(item.id, item.statistics);
    });

    return playlistData.items.map((item: any) => {
      const videoId = item.snippet.resourceId.videoId;
      const stats = statsMap.get(videoId) || {};

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
