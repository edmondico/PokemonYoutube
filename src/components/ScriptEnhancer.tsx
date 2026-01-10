import React, { useState } from 'react';
import { Wand2, CheckCircle2, Copy, FileText, Loader2 } from 'lucide-react';
import { enhanceScript } from '../services/geminiService';
import { ScriptImprovement } from '../types';

export const ScriptEnhancer: React.FC = () => {
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScriptImprovement | null>(null);

  const handleEnhance = async () => {
    if (!script.trim() || script.length < 50) {
        alert("Please enter a script or bullet points (at least 50 characters).");
        return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await enhanceScript(script);
      setResult(data);
    } catch (error) {
      alert("Enhancement failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.improvedScript);
      alert("Script copied to clipboard!");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] animate-fade-in">
      {/* Input Side */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText size={18} className="text-gray-500" />
                Original Draft / Notes
            </h3>
            <span className="text-xs text-gray-400">{script.length} chars</span>
        </div>
        <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Paste your rough script, bullet points, or video outline here..."
            className="flex-1 p-4 bg-transparent resize-none focus:outline-none text-sm text-gray-800 dark:text-gray-200 font-mono"
        />
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
                onClick={handleEnhance}
                disabled={loading || !script.trim()}
                className="w-full py-3 bg-pokemon-blue text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
                {loading ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
                Enhance Script with AI
            </button>
        </div>
      </div>

      {/* Output Side */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden relative">
        {!result ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50 dark:bg-gray-900/30">
                <Wand2 size={48} className="mb-4 text-gray-300 dark:text-gray-700" />
                <p className="max-w-xs">AI will rewrite your script for better flow, stronger hooks, and higher retention.</p>
            </div>
        ) : (
            <>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20 flex justify-between items-center">
                    <h3 className="font-bold text-green-700 dark:text-green-400 flex items-center gap-2">
                        <CheckCircle2 size={18} />
                        Improved Version
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300">
                            Hook: <span className="font-bold text-pokemon-blue">{result.hookScore}/100</span>
                        </span>
                        <span className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300">
                            Est: {result.estimatedDuration}
                        </span>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-800">
                    <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap font-mono leading-relaxed">
                        {result.improvedScript}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                     <div className="flex-1 w-full">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Key Improvements:</p>
                        <div className="flex flex-wrap gap-2">
                            {result.changesMade.slice(0, 3).map((change, i) => (
                                <span key={i} className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                                    {change}
                                </span>
                            ))}
                        </div>
                     </div>
                     <button
                        onClick={copyToClipboard}
                        className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
                    >
                        <Copy size={16} />
                        Copy
                    </button>
                </div>
            </>
        )}

        {loading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10 backdrop-blur-sm">
                <Loader2 className="animate-spin text-pokemon-blue w-12 h-12" />
            </div>
        )}
      </div>
    </div>
  );
};
