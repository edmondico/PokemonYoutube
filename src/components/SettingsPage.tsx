import React, { useState, useEffect } from 'react';
import { Settings, Save, Moon, Sun, Globe, Key, FileText, Loader2, Check, BarChart3, History, Trash2 } from 'lucide-react';
import { AppSettings, getAllSettings, saveAllSettings, getStatistics, clearSearchHistory, getSavedIdeas } from '../services/supabaseService';
import { NICHES } from '../config/aiPrompts';

interface SettingsPageProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onSettingsChange: (settings: AppSettings) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ theme: currentTheme, onThemeChange, onSettingsChange }) => {
  const [settings, setSettings] = useState<AppSettings>({
    theme: currentTheme,
    aiInstructions: '',
    userApiKey: '',
    defaultNiche: 'Pokemon Investing',
    language: 'es',
    perpetualTasks: []
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'stats'>('general');

  const [stats, setStats] = useState<{
    totalSearches: number;
    totalIdeasSaved: number;
    totalIdeasCompleted: number;
    totalScriptsGenerated: number;
    totalTasksCompleted: number;
  } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'stats' && !stats) {
      loadStats();
    }
  }, [activeTab]);

  const loadSettings = async () => {
    try {
      const loadedSettings = await getAllSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const loadedStats = await getStatistics();
      setStats(loadedStats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAllSettings(settings);
      onSettingsChange(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleThemeToggle = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    setSettings(prev => ({ ...prev, theme: newTheme }));
    onThemeChange(newTheme);
  };

  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to clear all search history? This cannot be undone.')) {
      await clearSearchHistory();
      alert('Search history cleared.');
    }
  };

  const handleExportData = async () => {
    try {
      const ideas = await getSavedIdeas();
      if (!ideas || ideas.length === 0) {
        alert('No saved ideas to export.');
        return;
      }

      // Convert to CSV
      const headers = ['Title', 'Description', 'Category', 'Viral Score', 'Status', 'Created At'];
      const rows = ideas.map(idea => [
        `"${idea.title.replace(/"/g, '""')}"`,
        `"${idea.description.replace(/"/g, '""')}"`,
        idea.category,
        idea.viralScore,
        idea.status,
        idea.createdAt ? new Date(idea.createdAt).toLocaleDateString() : 'N/A'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `poketrend_ideas_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-pokemon-blue" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Settings className="text-pokemon-blue" />
          Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">Configure your preferences and AI behavior.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
            activeTab === 'general'
              ? 'bg-pokemon-blue text-white shadow'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Globe size={16} />
          General
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
            activeTab === 'ai'
              ? 'bg-pokemon-blue text-white shadow'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <FileText size={16} />
          AI Instructions
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
            activeTab === 'stats'
              ? 'bg-pokemon-blue text-white shadow'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <BarChart3 size={16} />
          Statistics
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8 transition-colors">

        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                {settings.theme === 'dark' ? (
                  <Moon className="text-yellow-400" size={24} />
                ) : (
                  <Sun className="text-orange-400" size={24} />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Dark Mode</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark themes</p>
                </div>
              </div>
              <button
                onClick={handleThemeToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.theme === 'dark' ? 'bg-pokemon-blue' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Default Niche */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Default Niche
              </label>
              <select
                value={settings.defaultNiche}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultNiche: e.target.value }))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-pokemon-blue"
              >
                {Object.entries(NICHES).map(([key, value]) => (
                  <option key={key} value={value}>{value}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This will be pre-selected when you open the app</p>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Language / Market
              </label>
              <select
                value={settings.language}
                onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-pokemon-blue"
              >
                <option value="en">English (US Market)</option>
                <option value="es">Spanish (ES/LATAM)</option>
                <option value="jp">Japanese (JP Market)</option>
              </select>
            </div>

            {/* User API Key */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Key size={16} />
                Custom Gemini API Key (Optional)
              </label>
              <input
                type="password"
                value={settings.userApiKey}
                onChange={(e) => setSettings(prev => ({ ...prev, userApiKey: e.target.value }))}
                placeholder="AIzaSy..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-pokemon-blue font-mono text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Use your own API key if the default one has rate limits. Leave empty to use the app's key.
              </p>
            </div>

            {/* Data Management */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <History size={18} />
                Data Management
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleClearHistory}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
                >
                  <Trash2 size={16} />
                  Clear Search History
                </button>
                <button
                  onClick={handleExportData}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  <FileText size={16} />
                  Export Saved Ideas (CSV)
                </button>
              </div>
            </div>

            {/* Perpetual Daily Tasks */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Check size={18} />
                Perpetual Daily Tasks
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                These tasks will automatically appear on your checklist every new day.
              </p>
              
              <div className="space-y-3 mb-4">
                {settings.perpetualTasks?.map((task, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-200 dark:border-gray-600">
                    <span className="flex-1 text-sm text-gray-800 dark:text-gray-200">{task}</span>
                    <button
                      onClick={() => {
                        const newTasks = [...(settings.perpetualTasks || [])];
                        newTasks.splice(index, 1);
                        setSettings(prev => ({ ...prev, perpetualTasks: newTasks }));
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a new daily task..."
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:border-pokemon-blue"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) {
                        setSettings(prev => ({ 
                          ...prev, 
                          perpetualTasks: [...(prev.perpetualTasks || []), val] 
                        }));
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* AI Instructions Tab */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Global AI Instructions
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                These instructions will be added to every search. Use this to customize how the AI generates ideas for your specific needs.
              </p>
              <textarea
                value={settings.aiInstructions}
                onChange={(e) => setSettings(prev => ({ ...prev, aiInstructions: e.target.value }))}
                placeholder={`Example instructions:\n\n• Focus on Japanese exclusive promos and cards not released in English\n• Avoid any PSA/grading related topics\n• Prioritize vintage cards from 1999-2003\n• Include more gameplay/competitive deck content\n• Target the European market instead of US`}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-pokemon-blue font-mono text-sm resize-none"
                rows={12}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Tip: Be specific about what you want or don't want. The AI will prioritize these instructions.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">How it works</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <li>• These instructions are sent with every search query</li>
                <li>• The AI will consider them when generating ideas</li>
                <li>• Disliked ideas are also automatically excluded from future searches</li>
                <li>• You can still add one-time instructions in the search page</li>
              </ul>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {stats ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalSearches}</div>
                    <div className="text-sm text-blue-800 dark:text-blue-300">Searches</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.totalIdeasSaved}</div>
                    <div className="text-sm text-green-800 dark:text-green-300">Ideas Saved</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.totalIdeasCompleted}</div>
                    <div className="text-sm text-purple-800 dark:text-purple-300">Videos Made</div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl text-center">
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.totalScriptsGenerated}</div>
                    <div className="text-sm text-orange-800 dark:text-orange-300">Scripts Generated</div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tasks Completed</h4>
                  <div className="text-2xl font-bold text-pokemon-blue">{stats.totalTasksCompleted}</div>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Statistics are tracked automatically as you use the app.
                </p>
              </>
            ) : (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-pokemon-blue" />
              </div>
            )}
          </div>
        )}

        {/* Save Button */}
        {activeTab !== 'stats' && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all ${
                saved
                  ? 'bg-green-500'
                  : 'bg-pokemon-blue hover:bg-blue-700'
              } disabled:opacity-70`}
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check size={20} />
                  Saved!
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
