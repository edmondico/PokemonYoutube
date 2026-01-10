import React, { useState } from 'react';
import { TodoItem } from '../types';
import { Plus, CheckSquare, Square, Trash2, Calendar, Sun, Moon } from 'lucide-react';

interface DailyTodoListProps {
  todos: TodoItem[];
  setTodos: React.Dispatch<React.SetStateAction<TodoItem[]>>;
  tomorrowTodos: TodoItem[];
  setTomorrowTodos: React.Dispatch<React.SetStateAction<TodoItem[]>>;
}

export const DailyTodoList: React.FC<DailyTodoListProps> = ({ 
  todos, 
  setTodos, 
  tomorrowTodos, 
  setTomorrowTodos 
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow'>('today');
  const [newTodo, setNewTodo] = useState('');

  const currentList = activeTab === 'today' ? todos : tomorrowTodos;
  const setCurrentList = activeTab === 'today' ? setTodos : setTomorrowTodos;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setCurrentList(prev => [...prev, { id: Math.random().toString(36), text: newTodo, completed: false }]);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    setCurrentList(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setCurrentList(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm h-full flex flex-col">
      
      {/* Header with Tabs */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CheckSquare className="text-pokemon-blue" />
          Tasks
        </h3>
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('today')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === 'today' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
          >
            Today
          </button>
          <button 
            onClick={() => setActiveTab('tomorrow')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === 'tomorrow' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
          >
            Tomorrow
          </button>
        </div>
      </div>
      
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder={`Add task for ${activeTab}...`}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none focus:border-pokemon-blue"
        />
        <button type="submit" className="bg-pokemon-dark dark:bg-pokemon-blue text-white p-2 rounded-lg hover:opacity-90">
          <Plus size={20} />
        </button>
      </form>

      <div className="space-y-2 max-h-[400px] overflow-y-auto flex-1">
        {currentList.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="mx-auto text-gray-300 dark:text-gray-600 mb-2" size={24} />
            <p className="text-xs text-gray-400 dark:text-gray-500">No tasks for {activeTab}.</p>
          </div>
        )}
        {currentList.map(todo => (
          <div key={todo.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg group transition-colors">
            <button onClick={() => toggleTodo(todo.id)} className="text-gray-400 dark:text-gray-500 hover:text-pokemon-blue dark:hover:text-pokemon-blue">
              {todo.completed ? <CheckSquare className="text-green-500 dark:text-green-400" size={18} /> : <Square size={18} />}
            </button>
            <span className={`text-sm flex-1 break-words ${todo.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'}`}>
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)} className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};