# PokeTrend AI

**PokeTrend AI** is a React-based web application designed to help Pokemon content creators (investing, collecting, TCG) find viral video ideas. It leverages Google's **Gemini 2.0 Flash / 3.0 Preview** with **Google Search Grounding** to analyze real-time market data and trends.

## 🏗️ Tech Stack

*   **Frontend**: React 18, Vite, TypeScript
*   **Styling**: Tailwind CSS
*   **AI Engine**: Google Gemini API (`@google/genai`)
*   **Data Persistence**: Supabase (PostgreSQL)
*   **Visualization**: Recharts
*   **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Google Gemini API Key (from Google AI Studio)
*   Supabase Project (for data persistence)

### Installation

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Configuration**:
    Create a `.env` file based on `.env.example`:
    ```env
    API_KEY=your_gemini_api_key_here
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

3.  **Database Setup**:
    Run the SQL scripts located in the root directory in your Supabase SQL Editor to set up the necessary tables (`saved_ideas`, `daily_todos`, `tasks`, etc.).

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## 📂 Project Structure

*   **`src/App.tsx`**: Main entry point managing global state, routing (views), and initialization.
*   **`src/services/`**:
    *   `geminiService.ts`: Handles interactions with the Gemini API (search and script generation).
    *   `supabaseService.ts`: Manages all database operations (CRUD for ideas, tasks, settings).
*   **`src/components/`**:
    *   `PlannerBoard.tsx`: Kanban board for managing video production stages.
    *   `IdeaCard.tsx`: UI for displaying individual video ideas.
    *   `TasksChecklist.tsx`: Date-based task management system.
    *   `StatsChart.tsx`: Visual analytics of search results.
*   **`src/config/aiPrompts.ts`**: Centralized location for AI system instructions and prompt templates.
*   **`src/types.ts`**: TypeScript definitions for the project.

## 🤖 AI Workflow

1.  **Search & Grounding**:
    *   User selects a niche (e.g., "Pokemon Investing").
    *   `geminiService` sends a prompt to Gemini with `tools: [{ googleSearch: {} }]`.
    *   Gemini retrieves real-time data from Google Search.
    *   Results are categorized into: **Outliers**, **General Ideas**, **Trending**, and **Most Searched**.

2.  **Training (Dislikes)**:
    *   When a user dislikes an idea, its title is added to a "negative constraint" list.
    *   Future searches include these constraints to refine results (`dislikedContext`).

3.  **Script Generation**:
    *   Users can generate a structured script (Hook, Intro, Key Points, Conclusion) for any saved idea.

## 💾 Data Persistence

The application uses **Supabase** to persist:
*   **Saved Ideas**: Ideas moved to the planner.
*   **Search History**: Previous search results.
*   **Tasks/Todos**: Daily and date-specific tasks.
*   **Settings**: User preferences (theme, API key, custom instructions).
*   **Statistics**: Usage metrics (searches performed, ideas saved).

*Note: The application includes a migration utility (`migrateFromLocalStorage`) in `supabaseService.ts` to transition data from older local-storage-based versions.*

## 📝 Development Conventions

*   **Styling**: Use Tailwind CSS utility classes. Support Dark Mode (`dark:` prefix).
*   **State**: Prefer local state for UI components and pass handlers down. Use `App.tsx` for global state orchestration.
*   **Async Operations**: Use `async/await` and handle errors gracefully (loading states, error messages).
*   **Type Safety**: Strictly define interfaces in `types.ts` and share them across components.
