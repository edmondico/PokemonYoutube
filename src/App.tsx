import React, { useState, useEffect, useCallback } from 'react';
import { generateVideoIdeas, generateScript } from './services/geminiService';
import * as db from './services/supabaseService';
import { AppSettings } from './services/supabaseService';
import { IdeaCard } from './components/IdeaCard';
import { StatsChart } from './components/StatsChart';
import { PlannerBoard } from './components/PlannerBoard';
import { ScriptModal } from './components/ScriptModal';
import { TasksChecklist } from './components/TasksChecklist';
import { SettingsPage } from './components/SettingsPage';
import { VideoIdea, SearchState, NicheType, IdeaStatus, Theme } from './types';
import { LayoutGrid, Sparkles, Search, TrendingUp, Link as LinkIcon, RefreshCcw, Globe, Zap, Lightbulb, KanbanSquare, Moon, Sun, Settings2, Database, Settings, Dices, ListTodo } from 'lucide-react';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>('dark');
  const [activeView, setActiveView] = useState<'search' | 'planner' | 'checklist' | 'settings'>('search');
  const [selectedNiche, setSelectedNiche] = useState<NicheType>(NicheType.INVESTING);
  const [globalAiInstructions, setGlobalAiInstructions] = useState('');

  // Custom Instructions State
  const [showCustomInstructions, setShowCustomInstructions] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');

  // Tab State: Supports 4 types now
  const [searchTab, setSearchTab] = useState<'outliers' | 'videoIdeas' | 'trending' | 'mostSearched'>('outliers');

  // Persist saved ideas (loaded from Supabase)
  const [savedIdeas, setSavedIdeas] = useState<VideoIdea[]>([]);

  // Track Disliked Ideas for "Training"
  const [dislikedIdeas, setDislikedIdeas] = useState<string[]>([]);

  // Search State
  const [state, setState] = useState<SearchState>({
    loading: false,
    error: null,
    outliers: null,
    videoIdeas: null,
    trending: null,
    mostSearched: null,
    groundingSources: null
  });

  const [modalData, setModalData] = useState<{ isOpen: boolean; title: string; content: string }>({
    isOpen: false,
    title: '',
    content: ''
  });

  // Initialize Supabase and load data
  useEffect(() => {
    const initializeData = async () => {
      try {
        await db.initDB();
        await db.migrateFromLocalStorage();

        const [ideas, disliked, settings] = await Promise.all([
          db.getSavedIdeas(),
          db.getDislikedIdeas(),
          db.getAllSettings()
        ]);

        setSavedIdeas(ideas);
        setDislikedIdeas(disliked);

        // Apply loaded settings
        setTheme(settings.theme);
        setGlobalAiInstructions(settings.aiInstructions);
      } catch (error) {
        console.error('Failed to load data from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Dark Mode Logic
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await db.setSetting('theme', newTheme);
  };

  const handleSettingsChange = (settings: AppSettings) => {
    setTheme(settings.theme);
    setGlobalAiInstructions(settings.aiInstructions);
  };

  const handleSearch = async (nicheOverride?: NicheType) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const nicheToSearch = nicheOverride || selectedNiche;

    // Combine global AI instructions with one-time custom instructions
    const combinedInstructions = [
      globalAiInstructions,
      showCustomInstructions ? customInstructions : ''
    ].filter(Boolean).join('\n\n');

    try {
      const result = await generateVideoIdeas(nicheToSearch, dislikedIdeas, combinedInstructions);

      // Track the search event
      await db.trackEvent('search', { niche: nicheToSearch });
      setState(result);

      // Save search to history
      await db.saveSearchResult(
        nicheToSearch,
        result.outliers || [],
        result.videoIdeas || [],
        result.trending || [],
        result.mostSearched || []
      );

      // Default to Outliers on new search
      setSearchTab('outliers');
      setActiveView('search');
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Unknown error occurred'
      }));
    }
  };

  // --- Actions ---

  const handleSaveIdea = useCallback(async (idea: VideoIdea) => {
    if (savedIdeas.find(i => i.id === idea.id)) return;
    const newIdea = { ...idea, status: 'saved' as IdeaStatus, createdAt: Date.now() };

    setSavedIdeas(prev => [newIdea, ...prev]);
    await db.saveIdea(newIdea);
  }, [savedIdeas]);

  const handleDislikeIdea = useCallback(async (idea: VideoIdea) => {
    const newDisliked = [...dislikedIdeas, idea.title];
    setDislikedIdeas(newDisliked);
    await db.addDislikedIdea(idea.title);

    // Remove from ALL lists in state to be safe
    const filterList = (list: VideoIdea[] | null) => list ? list.filter(i => i.id !== idea.id) : null;

    setState(prev => ({
        ...prev,
        outliers: filterList(prev.outliers),
        videoIdeas: filterList(prev.videoIdeas),
        trending: filterList(prev.trending),
        mostSearched: filterList(prev.mostSearched),
    }));
  }, [dislikedIdeas]);

  const handleManualAdd = useCallback(async (title: string, description: string) => {
    const newIdea: VideoIdea = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        description,
        category: 'Manual',
        viralScore: 50,
        competition: 'Medium',
        reasoning: 'Manually added by user',
        tags: ['manual'],
        status: 'saved',
        createdAt: Date.now()
    };

    setSavedIdeas(prev => [newIdea, ...prev]);
    await db.saveIdea(newIdea);
  }, []);

  const handleDeleteIdea = useCallback(async (id: string) => {
    setSavedIdeas(prev => prev.filter(i => i.id !== id));
    await db.deleteIdea(id);
  }, []);

  const handleUpdateStatus = useCallback(async (idea: VideoIdea, status: IdeaStatus) => {
    const updatedIdea = { ...idea, status };
    setSavedIdeas(prev => prev.map(i => i.id === idea.id ? updatedIdea : i));
    await db.updateIdea(updatedIdea);
  }, []);

  const handleGenerateScript = async (idea: VideoIdea) => {
    if (idea.script) {
        setModalData({ isOpen: true, title: idea.title, content: idea.script });
        return;
    }

    try {
        const script = await generateScript(idea);

        // Update wherever it exists
        const updateList = (list: VideoIdea[] | null) => list?.map(i => i.id === idea.id ? { ...i, script } : i) || null;

        const savedIdea = savedIdeas.find(i => i.id === idea.id);
        if (savedIdea) {
            const updatedIdea = { ...savedIdea, script };
            setSavedIdeas(prev => prev.map(i => i.id === idea.id ? updatedIdea : i));
            await db.updateIdea(updatedIdea);
        } else {
            setState(prev => ({
                ...prev,
                outliers: updateList(prev.outliers),
                videoIdeas: updateList(prev.videoIdeas),
                trending: updateList(prev.trending),
                mostSearched: updateList(prev.mostSearched),
            }));
        }

        setModalData({ isOpen: true, title: idea.title, content: script });
    } catch (error) {
        alert("Failed to generate script. Try again.");
    }
  };

  // Helper to get current list
  const getCurrentList = () => {
    switch (searchTab) {
        case 'outliers': return state.outliers;
        case 'videoIdeas': return state.videoIdeas;
        case 'trending': return state.trending;
        case 'mostSearched': return state.mostSearched;
        default: return [];
    }
  };

  const currentSearchList = getCurrentList();

  // Loading screen while Supabase initializes
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Database className="w-12 h-12 text-pokemon-blue mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-400">Connecting to cloud database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-12 transition-colors duration-300">
      <ScriptModal
        isOpen={modalData.isOpen}
        onClose={() => setModalData(prev => ({ ...prev, isOpen: false }))}
        title={modalData.title}
        content={modalData.content}
      />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveView('search')}>
            <div className="bg-pokemon-red text-white p-1.5 rounded-lg shadow-md">
              <Sparkles size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">PokeTrend <span className="text-pokemon-blue">AI</span></h1>
          </div>

          <div className="flex items-center gap-4">
             {/* Navigation */}
             <div className="hidden md:flex gap-2">
                <button
                    onClick={() => setActiveView('search')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'search' ? 'bg-pokemon-dark dark:bg-pokemon-blue text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                    <Search size={18} />
                    Find Ideas
                </button>
                <button
                    onClick={() => setActiveView('planner')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'planner' ? 'bg-pokemon-dark dark:bg-pokemon-blue text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                    <KanbanSquare size={18} />
                    My Planner <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">{savedIdeas.length}</span>
                </button>
                <button
                    onClick={() => setActiveView('checklist')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'checklist' ? 'bg-pokemon-dark dark:bg-pokemon-blue text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                    <ListTodo size={18} />
                    Tasks
                </button>
                <button
                    onClick={() => setActiveView('settings')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'settings' ? 'bg-pokemon-dark dark:bg-pokemon-blue text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                    <Settings size={18} />
                    Settings
                </button>
             </div>

             {/* Theme Toggle */}
             <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Toggle Dark Mode"
             >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* VIEW: PLANNER */}
        {activeView === 'planner' && (
             <div className="animate-fade-in">
                <div className="mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">My Content Planner</h2>
                    <p className="text-gray-600 dark:text-gray-400">Organize your chosen ideas from research to upload.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Planner Board (Full Width) */}
                    <div className="flex-1 min-w-0">
                         <PlannerBoard
                            ideas={savedIdeas}
                            onUpdateStatus={handleUpdateStatus}
                            onDelete={handleDeleteIdea}
                            onGenerateScript={handleGenerateScript}
                            onManualAdd={handleManualAdd}
                        />
                    </div>
                </div>
             </div>
        )}

        {/* VIEW: CHECKLIST */}
        {activeView === 'checklist' && (
             <div className="animate-fade-in">
                <div className="mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Daily Tasks</h2>
                    <p className="text-gray-600 dark:text-gray-400">Stay organized with your daily content creation goals.</p>
                </div>

                <div className="max-w-3xl mx-auto">
                    <TasksChecklist />
                </div>
             </div>
        )}

        {/* VIEW: SEARCH */}
        {activeView === 'search' && (
            <div className="animate-fade-in">
                {/* Search Controls */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8 mb-8 transition-colors">
                    <div className="max-w-3xl mx-auto text-center mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
                        Find Your Next Viral Video
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                        AI analyzes the current US Pokemon market (Google Search trends) to find low competition, high demand opportunities.
                        </p>
                    </div>

                    <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
                        {/* Niche Selection */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full">
                        {Object.values(NicheType)
                            .filter(niche => niche !== NicheType.ALL)
                            .map((niche) => (
                            <button
                                key={niche}
                                onClick={() => setSelectedNiche(niche)}
                                className={`px-4 py-3 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 border ${
                                selectedNiche === niche
                                    ? 'bg-pokemon-dark dark:bg-pokemon-blue text-white border-transparent shadow-md transform scale-105'
                                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                }`}
                            >
                                {niche.replace('Pokemon ', '')}
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                const randomNiches = [
                                    "Pokemon Plushies & Merchandise",
                                    "Pokemon ROM Hacks & Fan Games",
                                    "Pokemon Nuzlocke Challenges",
                                    "Pokemon Sealed Product Investing",
                                    "Pokemon Grading (PSA/BGS/CGC)",
                                    "Pokemon Manga & Lore",
                                    "Competitive Pokemon VGC"
                                ];
                                const random = randomNiches[Math.floor(Math.random() * randomNiches.length)];
                                handleSearch(random as any);
                            }}
                            className="px-4 py-3 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 border bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-200 dark:hover:bg-purple-900/50 flex items-center justify-center gap-2"
                        >
                            <Dices size={16} />
                            Surprise Me
                        </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                            <button
                                onClick={() => handleSearch()}
                                disabled={state.loading}
                                className="w-full md:w-auto min-w-[240px] bg-pokemon-blue text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {state.loading ? (
                                <>
                                    <RefreshCcw className="animate-spin" size={24} />
                                    Scanning...
                                </>
                                ) : (
                                <>
                                    <Search size={24} />
                                    Scan {selectedNiche.replace('Pokemon ', '')}
                                </>
                                )}
                            </button>

                            <button
                                onClick={() => handleSearch(NicheType.ALL)}
                                disabled={state.loading}
                                className="w-full md:w-auto min-w-[200px] bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-2 border-pokemon-blue dark:border-pokemon-blue px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 dark:hover:bg-gray-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                <Globe size={24} className="text-pokemon-blue" />
                                Scan Everything
                            </button>
                        </div>

                        {/* Custom Instructions */}
                        <div className="w-full max-w-lg mx-auto">
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <input
                                    type="checkbox"
                                    id="customInfo"
                                    checked={showCustomInstructions}
                                    onChange={(e) => setShowCustomInstructions(e.target.checked)}
                                    className="w-4 h-4 text-pokemon-blue rounded border-gray-300 focus:ring-pokemon-blue cursor-pointer"
                                />
                                <label htmlFor="customInfo" className="text-sm font-medium text-gray-600 dark:text-gray-300 cursor-pointer flex items-center gap-1.5">
                                    <Settings2 size={14} />
                                    Add Custom Instructions
                                </label>
                            </div>

                            {showCustomInstructions && (
                                <textarea
                                    value={customInstructions}
                                    onChange={(e) => setCustomInstructions(e.target.value)}
                                    placeholder="E.g., 'Focus specifically on Japanese promo cards' or 'Avoid any PSA grading topics'..."
                                    className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-pokemon-blue dark:bg-gray-700/50 dark:text-white transition-all animate-fade-in resize-none"
                                    rows={3}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {state.error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-8 border border-red-100 dark:border-red-900 text-center">
                    {state.error}
                </div>
                )}

                {/* Results Area */}
                {currentSearchList && currentSearchList.length > 0 && (
                <div className="space-y-8 animate-fade-in">

                    {/* Tabs */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-gray-200 dark:bg-gray-800 p-1.5 rounded-xl flex flex-wrap justify-center gap-1">
                            {[
                                { id: 'outliers', label: '10 Market Outliers', icon: <Zap size={16}/> },
                                { id: 'videoIdeas', label: '10 General Ideas', icon: <Lightbulb size={16}/> },
                                { id: 'trending', label: 'Top 10 Trending', icon: <TrendingUp size={16}/> },
                                { id: 'mostSearched', label: 'Top 10 Searched', icon: <Search size={16}/> },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setSearchTab(tab.id as any)}
                                    className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
                                        searchTab === tab.id
                                        ? 'bg-white dark:bg-gray-700 text-pokemon-blue dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Stats Chart */}
                        <div className="w-full md:w-2/3">
                            <StatsChart ideas={currentSearchList} analytics={state.analytics} />
                        </div>

                        {/* Summary / Stats */}
                        <div className="w-full md:w-1/3 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center transition-colors">
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp className="text-green-500" />
                                <span className="font-bold text-lg text-gray-800 dark:text-white">
                                    {searchTab === 'outliers' && 'Anomaly Report'}
                                    {searchTab === 'videoIdeas' && 'Idea Bank'}
                                    {searchTab === 'trending' && 'Viral Report'}
                                    {searchTab === 'mostSearched' && 'SEO Analysis'}
                                </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                {searchTab === 'outliers' && "Statistical anomalies showing unusual price/interest spikes."}
                                {searchTab === 'videoIdeas' && "Evergreen content structures that consistently perform."}
                                {searchTab === 'trending' && "Real-time viral topics and breaking news."}
                                {searchTab === 'mostSearched' && "High volume search queries people are asking right now."}
                            </p>
                            <div className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Top Tag</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">#{currentSearchList[0]?.tags[0] || 'N/A'}</div>
                        </div>
                    </div>

                    {/* Idea Grid */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <LayoutGrid size={20} />
                            Results
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentSearchList.map((idea) => (
                            <IdeaCard
                                key={idea.id}
                                idea={idea}
                                onSave={handleSaveIdea}
                                onDislike={handleDislikeIdea}
                                onGenerateScript={handleGenerateScript}
                                isSaved={savedIdeas.some(saved => saved.id === idea.id)}
                            />
                            ))}
                        </div>
                    </div>

                    {/* Sources */}
                    {state.groundingSources && state.groundingSources.length > 0 && (
                    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase flex items-center gap-2">
                        <LinkIcon size={14} /> Analyzed Sources
                        </h4>
                        <div className="flex flex-wrap gap-2">
                        {state.groundingSources.slice(0, 5).map((source, idx) => (
                            <a
                            key={idx}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-full text-gray-600 dark:text-gray-300 hover:text-pokemon-blue dark:hover:text-pokemon-blue hover:border-pokemon-blue transition-colors truncate max-w-[200px]"
                            >
                            {source.title}
                            </a>
                        ))}
                        </div>
                    </div>
                    )}
                </div>
                )}

                {/* Empty State */}
                {!state.loading && (!currentSearchList || currentSearchList.length === 0) && (
                <div className="text-center py-20 opacity-50">
                    <div className="inline-block p-4 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 transition-colors">
                        <Search size={32} className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Select a niche and click Scan.</p>
                </div>
                )}
            </div>
        )}

        {/* VIEW: SETTINGS */}
        {activeView === 'settings' && (
          <SettingsPage
            theme={theme}
            onThemeChange={setTheme}
            onSettingsChange={handleSettingsChange}
          />
        )}

      </main>
    </div>
  );
};

export default App;
