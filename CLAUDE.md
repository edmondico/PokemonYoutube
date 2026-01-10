# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PokeTrend AI is a React/TypeScript web application that uses Google's Gemini AI (gemini-3-flash-preview) with Google Search grounding to generate YouTube video ideas for Pokemon content creators. It analyzes real-time trends to suggest content opportunities.

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:5173)
npm run build        # TypeScript check + production build
npm run preview      # Preview production build
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Set `API_KEY` to your Google Gemini API key (get from https://aistudio.google.com/app/apikey)

## Architecture

### Tech Stack
- React 18 + TypeScript with Vite
- Google Gemini AI (`@google/genai`) with Google Search grounding for real-time data
- Tailwind CSS (via CDN in index.html with custom config)
- Recharts for data visualization
- Lucide React for icons

### Source Structure (`src/`)
- `App.tsx` - Main app with two views: Search (idea discovery) and Planner (Kanban board)
- `services/geminiService.ts` - Gemini AI integration with two functions:
  - `generateVideoIdeas()` - Returns 4 categories: outliers, videoIdeas, trending, mostSearched
  - `generateScript()` - Generates YouTube script outline for an idea
- `types.ts` - Core interfaces: `VideoIdea`, `SearchState`, `NicheType`, `IdeaStatus`

### Key Components
- `IdeaCard.tsx` - Displays video idea with viral score, save/dislike/script actions
- `PlannerBoard.tsx` - Kanban board with stages: saved → scripting → filming → done
- `DailyTodoList.tsx` - Task lists for today/tomorrow
- `StatsChart.tsx` - Recharts visualization of idea metrics
- `ScriptModal.tsx` - Modal for viewing generated scripts

### State Management
- Local state in App.tsx with localStorage persistence for saved ideas and todos
- "Dislike" feature trains AI by passing rejected topics to next search
- Custom instructions can be added to refine AI searches

### Data Flow
1. User selects niche (Investing, Collecting, TCG, Vintage) and clicks Scan
2. Gemini searches Google in real-time and returns categorized ideas
3. User can save ideas to Planner, generate scripts, or dislike to train AI
4. Saved ideas move through Kanban stages until marked done
