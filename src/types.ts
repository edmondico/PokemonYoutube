export type IdeaStatus = 'saved' | 'scripting' | 'filming' | 'done';

export interface VideoIdea {
  id: string; // Unique ID for tracking
  title: string;
  description: string;
  category: 'Investing' | 'Collecting' | 'Gameplay' | 'News' | 'Manual';
  viralScore: number; // 0-100
  competition: 'Low' | 'Medium' | 'High';
  reasoning: string;
  tags: string[];
  status?: IdeaStatus; // For the planner
  script?: string; // Generated script content
  createdAt?: number;
  isDisliked?: boolean; // For training the AI
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

// New Task type with date support
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  date: string; // YYYY-MM-DD format
  createdAt?: string;
  completedAt?: string | null;
}

export interface AnalyticsItem {
  keyword: string;
  volume: number; // 0-100 relative score
}

export interface SearchState {
  loading: boolean;
  error: string | null;
  outliers: VideoIdea[] | null;      // ORIGINAL: Market Anomalies
  videoIdeas: VideoIdea[] | null;    // ORIGINAL: General Ideas
  trending: VideoIdea[] | null;      // NEW: Viral Now
  mostSearched: VideoIdea[] | null;  // NEW: SEO / Search Volume
  analytics?: {
    googleKeywords: AnalyticsItem[];
    youtubeKeywords: AnalyticsItem[];
    risingTrends: AnalyticsItem[];
  } | null;
  groundingSources: Array<{ uri: string; title: string }> | null;
}

export enum NicheType {
  ALL = 'Entire Pokemon Market (Investing, Collecting, Gameplay)',
  INVESTING = 'Pokemon Investing',
  COLLECTING = 'Pokemon Collecting',
  TCG_PLAY = 'Pokemon TCG Meta/Gameplay',
  VINTAGE = 'Vintage Pokemon Cards'
}

export type Theme = 'light' | 'dark';

// AI Analyzer Types
export interface ContentAnalysis {
  score: number; // 0-100
  prediction: 'Viral' | 'High Performing' | 'Average' | 'Low Potential';
  strengths: string[];
  weaknesses: string[];
  alternativeTitles: string[];
  improvementTips: string[];
}

// Script Enhancer Types
export interface ScriptImprovement {
  improvedScript: string;
  changesMade: string[];
  hookScore: number; // 0-100
  pacingScore: number; // 0-100
  estimatedDuration: string;
}