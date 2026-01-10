import React from 'react';
import { X, Copy, Check } from 'lucide-react';

interface ScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export const ScriptModal: React.FC<ScriptModalProps> = ({ isOpen, onClose, title, content }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl transition-all">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 rounded-t-2xl">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Script Gen AI</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">{title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800">
          {content}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
          <button 
            onClick={handleCopy}
            className="px-4 py-2 bg-pokemon-blue text-white font-medium rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy Script'}
          </button>
        </div>
      </div>
    </div>
  );
};