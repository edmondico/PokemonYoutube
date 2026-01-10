import React, { useState, useRef } from 'react';
import { Upload, X, Zap, Target, ThumbsUp, ThumbsDown, AlertCircle, Loader2 } from 'lucide-react';
import { analyzeContent } from '../services/geminiService';
import { ContentAnalysis } from '../types';

export const ContentAnalyzer: React.FC = () => {
  const [title, setTitle] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContentAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!title.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await analyzeContent(title, image || undefined);
      setResult(data);
    } catch (error) {
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full animate-fade-in">
      {/* Input Section */}
      <div className="w-full lg:w-1/3 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-fit">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Target className="text-pokemon-red" />
          Content Input
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Video Title
            </label>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. I Found a $10,000 Pokemon Card at a Yard Sale!"
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:border-pokemon-blue resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Thumbnail Preview (Optional)
            </label>
            
            {!image ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <Upload className="text-gray-400 mb-2" size={24} />
                <span className="text-sm text-gray-500">Click to upload thumbnail</span>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden group">
                <img src={image} alt="Thumbnail preview" className="w-full object-cover" />
                <button 
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full hover:bg-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !title.trim()}
            className="w-full py-3 bg-pokemon-blue text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Zap size={20} />}
            Analyze Potential
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="flex-1">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 animate-pulse">
            <Target size={48} className="mb-4 text-gray-300 dark:text-gray-600" />
            <p>Analyzing title psychology & visual hook...</p>
          </div>
        ) : !result ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <p>Enter a title and thumbnail to see AI predictions</p>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Score Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-6 items-center">
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    className="stroke-current text-gray-200 dark:text-gray-700"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    className={`stroke-current ${result.score > 80 ? 'text-green-500' : result.score > 50 ? 'text-yellow-500' : 'text-red-500'}`}
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={351.86}
                    strokeDashoffset={351.86 - (351.86 * result.score) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{result.score}</span>
                  <span className="text-xs text-gray-500">VIRAL SCORE</span>
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{result.prediction}</h2>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {result.strengths.map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full flex items-center gap-1">
                      <ThumbsUp size={12} /> {s}
                    </span>
                  ))}
                  {result.weaknesses.map((w, i) => (
                    <span key={i} className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold rounded-full flex items-center gap-1">
                      <ThumbsDown size={12} /> {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Alternatives & Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Zap className="text-yellow-500" size={18} />
                  Better Alternatives
                </h4>
                <ul className="space-y-3">
                  {result.alternativeTitles.map((title, idx) => (
                    <li key={idx} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-800 dark:text-gray-200 border-l-4 border-pokemon-blue">
                      {title}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="text-blue-500" size={18} />
                  Pro Tips
                </h4>
                <ul className="space-y-3">
                  {result.improvementTips.map((tip, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-pokemon-blue font-bold">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
