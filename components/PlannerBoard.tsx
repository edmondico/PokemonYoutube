import React, { useState } from 'react';
import { VideoIdea, IdeaStatus } from '../types';
import { IdeaCard } from './IdeaCard';
import { Inbox, FileText, Video, CheckCircle2, Plus } from 'lucide-react';

interface PlannerBoardProps {
  ideas: VideoIdea[];
  onUpdateStatus: (idea: VideoIdea, status: IdeaStatus) => void;
  onDelete: (id: string) => void;
  onGenerateScript: (idea: VideoIdea) => void;
  onManualAdd: (title: string, description: string) => void;
}

export const PlannerBoard: React.FC<PlannerBoardProps> = ({ 
  ideas, 
  onUpdateStatus, 
  onDelete, 
  onGenerateScript,
  onManualAdd 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(newTitle.trim()) {
        onManualAdd(newTitle, newDesc);
        setNewTitle('');
        setNewDesc('');
        setShowForm(false);
    }
  };

  const columns: { id: IdeaStatus; title: string; icon: React.ReactNode; color: string; darkColor: string }[] = [
    { id: 'saved', title: 'Inbox / Research', icon: <Inbox size={18} />, color: 'bg-gray-100 text-gray-600', darkColor: 'dark:bg-gray-800 dark:text-gray-300' },
    { id: 'scripting', title: 'To Script', icon: <FileText size={18} />, color: 'bg-yellow-100 text-yellow-700', darkColor: 'dark:bg-yellow-900/30 dark:text-yellow-400' },
    { id: 'filming', title: 'Filming', icon: <Video size={18} />, color: 'bg-purple-100 text-purple-700', darkColor: 'dark:bg-purple-900/30 dark:text-purple-400' },
    { id: 'done', title: 'Ready / Done', icon: <CheckCircle2 size={18} />, color: 'bg-green-100 text-green-700', darkColor: 'dark:bg-green-900/30 dark:text-green-400' },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-6">
      {columns.map(col => {
        const colIdeas = ideas.filter(i => (i.status || 'saved') === col.id);
        
        return (
          <div key={col.id} className="flex-1 min-w-[300px] flex flex-col h-full">
            <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${col.color} ${col.darkColor} font-bold text-sm transition-colors`}>
              {col.icon}
              {col.title}
              <span className="ml-auto bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded text-xs">
                {colIdeas.length}
              </span>
            </div>

            {/* Manual Add Form only in Saved column */}
            {col.id === 'saved' && (
                <div className="mb-4">
                    {!showForm ? (
                        <button 
                            onClick={() => setShowForm(true)}
                            className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 text-sm font-medium hover:border-pokemon-blue dark:hover:border-pokemon-blue hover:text-pokemon-blue dark:hover:text-pokemon-blue transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={16} /> Add Manual Idea
                        </button>
                    ) : (
                        <form onSubmit={handleAddSubmit} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-pokemon-blue shadow-sm">
                            <input 
                                className="w-full text-sm font-bold mb-2 p-1 border-b dark:border-gray-700 bg-transparent dark:text-white focus:outline-none focus:border-pokemon-blue"
                                placeholder="Video Title"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                autoFocus
                            />
                            <textarea 
                                className="w-full text-xs p-1 mb-2 border dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded focus:outline-none focus:border-pokemon-blue"
                                placeholder="Quick notes..."
                                rows={2}
                                value={newDesc}
                                onChange={e => setNewDesc(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowForm(false)} className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">Cancel</button>
                                <button type="submit" className="text-xs bg-pokemon-blue text-white px-3 py-1 rounded">Add</button>
                            </div>
                        </form>
                    )}
                </div>
            )}
            
            <div className="flex flex-col gap-4">
              {colIdeas.length === 0 && !showForm ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 dark:text-gray-600 text-sm">
                  Empty
                </div>
              ) : (
                colIdeas.map(idea => (
                  <IdeaCard 
                    key={idea.id} 
                    idea={idea} 
                    isSaved={true}
                    onUpdateStatus={onUpdateStatus}
                    onDelete={onDelete}
                    onGenerateScript={onGenerateScript}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};