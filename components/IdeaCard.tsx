import React, { useState } from 'react';
import { VideoIdea, IdeaStatus } from '../types';
import { Heart, FileText, Loader2, ThumbsDown } from 'lucide-react';

interface IdeaCardProps {
  idea: VideoIdea;
  isSaved?: boolean;
  onSave?: (idea: VideoIdea) => void;
  onDislike?: (idea: VideoIdea) => void;
  onGenerateScript?: (idea: VideoIdea) => void;
  onUpdateStatus?: (idea: VideoIdea, status: IdeaStatus) => void;
  onDelete?: (id: string) => void;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ 
  idea, 
  isSaved = false, 
  onSave, 
  onDislike,
  onGenerateScript,
  onUpdateStatus,
  onDelete
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleScriptClick = async () => {
    if (!onGenerateScript) return;
    setIsGenerating(true);
    await onGenerateScript(idea);
    setIsGenerating(false);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Investing': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'Collecting': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      case 'Gameplay': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      case 'Manual': return 'bg-gray-800 text-white border-gray-700 dark:bg-gray-700 dark:border-gray-600';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-purple-600 dark:text-purple-400';
    if (score >= 75) return 'text-green-600 dark:text-green-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden group flex flex-col h-full">
      {/* Holographic effect only on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 holographic z-0 pointer-events-none"></div>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getCategoryColor(idea.category)}`}>
          {idea.category}
        </span>
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Viral Score</span>
          <span className={`text-2xl font-black ${getScoreColor(idea.viralScore)}`}>
            {idea.viralScore}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-grow">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
          {idea.title}
        </h3>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
          {idea.description}
        </p>

        {/* Reasoning Box - Only show in search view or if not completed */}
        {idea.status !== 'done' && idea.category !== 'Manual' && (
           <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 mb-4 border border-gray-100 dark:border-gray-700">
             <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">💡 Why it works:</p>
             <p className="text-sm text-gray-700 dark:text-gray-300 italic">{idea.reasoning}</p>
           </div>
        )}
      </div>

      {/* Action Area */}
      <div className="relative z-10 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center">
            
            {/* Left: Tags */}
            <div className="flex gap-1">
                 {idea.tags.slice(0, 1).map(tag => (
                    <span key={tag} className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-2 py-1 rounded">#{tag}</span>
                ))}
            </div>

            {/* Right: Actions */}
            <div className="flex gap-2">
                {/* Status Switcher (For Saved Ideas) */}
                {isSaved && onUpdateStatus && (
                    <select 
                        value={idea.status || 'saved'}
                        onChange={(e) => onUpdateStatus(idea, e.target.value as IdeaStatus)}
                        className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-900 dark:text-white cursor-pointer hover:border-pokemon-blue outline-none"
                    >
                        <option value="saved">Inbox</option>
                        <option value="scripting">To Script</option>
                        <option value="filming">Filming</option>
                        <option value="done">Done</option>
                    </select>
                )}

                {/* Script Button */}
                {onGenerateScript && (
                    <button 
                        onClick={handleScriptClick}
                        disabled={isGenerating}
                        className={`p-2 rounded-full transition-colors ${idea.script ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-pokemon-blue hover:text-white dark:hover:bg-pokemon-blue dark:hover:text-white'}`}
                        title={idea.script ? "View Script" : "Generate Script"}
                    >
                        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                    </button>
                )}

                {/* Dislike Button (Only in Search Mode) */}
                {!isSaved && onDislike && (
                     <button 
                        onClick={() => onDislike(idea)}
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-800 hover:text-white dark:hover:bg-gray-600 dark:hover:text-white transition-colors"
                        title="Dislike (Train AI to avoid this)"
                     >
                        <ThumbsDown size={18} />
                     </button>
                )}

                {/* Save/Delete Button */}
                {isSaved ? (
                     <button 
                        onClick={() => onDelete && onDelete(idea.id)}
                        className="p-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        title="Remove from Planner"
                     >
                        <span className="sr-only">Delete</span>
                        &times;
                     </button>
                ) : (
                    <button 
                        onClick={() => onSave && onSave(idea)}
                        className="p-2 rounded-full bg-pink-50 dark:bg-pink-900/20 text-pink-500 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/40 hover:text-pink-600 transition-colors"
                        title="Save to Planner"
                    >
                        <Heart size={18} />
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};