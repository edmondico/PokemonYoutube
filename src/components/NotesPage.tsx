import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Save, 
  Pin, 
  FileText
} from 'lucide-react';
import { Note } from '../types';
import { getNotes, saveNote, deleteNote } from '../services/supabaseService';

export const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Editor state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Note['category']>('general');
  const [isPinned, setIsPinned] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    if (selectedNoteId) {
      const note = notes.find(n => n.id === selectedNoteId);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setCategory(note.category);
        setIsPinned(note.isPinned);
      }
    } else {
      resetEditor();
    }
  }, [selectedNoteId, notes]);

  const loadNotes = async () => {
    setIsLoading(true);
    const data = await getNotes();
    setNotes(data);
    setIsLoading(false);
  };

  const resetEditor = () => {
    setTitle('');
    setContent('');
    setCategory('general');
    setIsPinned(false);
  };

  const handleCreateNew = () => {
    setSelectedNoteId(null);
    resetEditor();
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    setIsSaving(true);
    const now = Date.now();
    
    const newNote: Note = {
      id: selectedNoteId || Math.random().toString(36).substr(2, 9),
      title,
      content,
      category,
      isPinned,
      createdAt: selectedNoteId ? (notes.find(n => n.id === selectedNoteId)?.createdAt || now) : now,
      updatedAt: now
    };

    await saveNote(newNote);
    
    // Update local state
    if (selectedNoteId) {
      setNotes(prev => prev.map(n => n.id === selectedNoteId ? newNote : n));
    } else {
      setNotes(prev => [newNote, ...prev]);
      setSelectedNoteId(newNote.id);
    }
    
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      if (selectedNoteId === id) {
        setSelectedNoteId(null);
      }
    }
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6 animate-fade-in">
      {/* Sidebar List */}
      <div className="w-1/3 min-w-[300px] flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="text-pokemon-blue" />
              Notes
            </h2>
            <button 
              onClick={handleCreateNew}
              className="p-2 bg-pokemon-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="New Note"
            >
              <Plus size={20} />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pokemon-blue focus:border-transparent outline-none dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading notes...</div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'No notes found' : 'Create your first note!'}
            </div>
          ) : (
            filteredNotes.map(note => (
              <div 
                key={note.id}
                onClick={() => setSelectedNoteId(note.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 border ${
                  selectedNoteId === note.id 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 ring-1 ring-blue-300 dark:ring-blue-700' 
                    : 'border-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-semibold line-clamp-1 ${selectedNoteId === note.id ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                    {note.title || 'Untitled Note'}
                  </h3>
                  {note.isPinned && <Pin size={14} className="text-yellow-500 fill-yellow-500" />}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2 h-10">
                  {note.content || 'No content...'}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{formatDate(note.updatedAt)}</span>
                  <span className={`px-2 py-0.5 rounded-full ${
                    note.category === 'video-idea' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                    note.category === 'script-draft' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    note.category === 'market-research' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {note.category}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden relative">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/20">
          <div className="flex items-center gap-2 flex-1">
             <input 
              type="text" 
              placeholder="Note Title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent text-xl font-bold text-gray-900 dark:text-white outline-none w-full placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsPinned(!isPinned)}
              className={`p-2 rounded-lg transition-colors ${isPinned ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              title="Pin Note"
            >
              <Pin size={20} className={isPinned ? 'fill-current' : ''} />
            </button>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value as Note['category'])}
              className="bg-transparent text-sm font-medium text-gray-600 dark:text-gray-300 outline-none cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <option value="general">General</option>
              <option value="video-idea">Video Idea</option>
              <option value="script-draft">Script Draft</option>
              <option value="market-research">Market Research</option>
            </select>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
            {selectedNoteId && (
              <button 
                onClick={() => handleDelete(selectedNoteId)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete Note"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button 
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-pokemon-blue text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
        
        <textarea 
          placeholder="Start writing..." 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 p-6 resize-none outline-none bg-transparent text-gray-800 dark:text-gray-200 leading-relaxed text-lg"
        />

        <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded backdrop-blur-sm">
          {content.length} characters • {content.split(/\s+/).filter(Boolean).length} words
        </div>
      </div>
    </div>
  );
};
