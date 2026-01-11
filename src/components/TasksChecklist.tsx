import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import * as db from '../services/supabaseService';
import { Plus, CheckSquare, Square, Trash2, ChevronLeft, ChevronRight, Calendar, Loader2 } from 'lucide-react';

// Helper functions for dates
const formatDateShort = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${day}/${month}`;
};

const formatDateFull = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'short' };
  return date.toLocaleDateString('es-ES', options);
};

const getDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return getDateString(date);
};

const isToday = (dateStr: string): boolean => {
  return dateStr === getDateString(new Date());
};

const isTomorrow = (dateStr: string): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return dateStr === getDateString(tomorrow);
};

const isYesterday = (dateStr: string): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === getDateString(yesterday);
};

const getRelativeDay = (dateStr: string): string => {
  if (isToday(dateStr)) return 'Hoy';
  if (isTomorrow(dateStr)) return 'Mañana';
  if (isYesterday(dateStr)) return 'Ayer';
  return formatDateFull(dateStr);
};

export const TasksChecklist: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(getDateString(new Date()));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Load tasks when date changes
  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true);
      // Ensure perpetual tasks exist for this date
      await db.ensureDailyTasksForDate(selectedDate);
      // Fetch all tasks
      const fetchedTasks = await db.getTasksByDate(selectedDate);
      setTasks(fetchedTasks);
      setIsLoading(false);
    };
    loadTasks();
  }, [selectedDate]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim() || isAdding) return;

    setIsAdding(true);
    const newTask = await db.addTask(newTaskText.trim(), selectedDate);
    if (newTask) {
      setTasks(prev => [...prev, newTask]);
    }
    setNewTaskText('');
    setIsAdding(false);
  };

  const handleToggleTask = async (task: Task) => {
    const newCompleted = !task.completed;
    setTasks(prev => prev.map(t =>
      t.id === task.id ? { ...t, completed: newCompleted } : t
    ));
    await db.toggleTaskComplete(task.id, newCompleted);
  };

  const handleDeleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await db.deleteTask(id);
  };

  const goToPreviousDay = () => {
    setSelectedDate(prev => addDays(prev, -1));
  };

  const goToNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  const goToToday = () => {
    setSelectedDate(getDateString(new Date()));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-full flex flex-col overflow-hidden">

      {/* Header with Date Navigation */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-pokemon-blue/10 to-pokemon-red/10 dark:from-pokemon-blue/20 dark:to-pokemon-red/20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="text-pokemon-blue" size={20} />
            Checklist
          </h3>
          {!isToday(selectedDate) && (
            <button
              onClick={goToToday}
              className="text-xs px-2 py-1 bg-pokemon-blue text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Ir a Hoy
            </button>
          )}
        </div>

        {/* Date Selector */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-lg p-2">
          <button
            onClick={goToPreviousDay}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>

          <div className="text-center flex-1">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatDateShort(selectedDate)}
            </div>
            <div className={`text-xs font-medium ${
              isToday(selectedDate)
                ? 'text-pokemon-blue'
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {getRelativeDay(selectedDate)}
            </div>
          </div>

          <button
            onClick={goToNextDay}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>{completedCount} de {totalCount} completadas</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pokemon-blue to-green-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder={`Nueva tarea para ${formatDateShort(selectedDate)}...`}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:outline-none focus:border-pokemon-blue focus:ring-1 focus:ring-pokemon-blue"
            disabled={isAdding}
          />
          <button
            type="submit"
            disabled={isAdding || !newTaskText.trim()}
            className="bg-pokemon-blue text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
          </button>
        </div>
      </form>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-pokemon-blue" size={24} />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-block p-3 bg-gray-100 dark:bg-gray-700 rounded-full mb-3">
              <CheckSquare className="text-gray-400 dark:text-gray-500" size={24} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No hay tareas para {getRelativeDay(selectedDate).toLowerCase()}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Añade una tarea arriba
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-lg group transition-all ${
                  task.completed
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <button
                  onClick={() => handleToggleTask(task)}
                  className={`flex-shrink-0 transition-colors ${
                    task.completed
                      ? 'text-green-500'
                      : 'text-gray-400 dark:text-gray-500 hover:text-pokemon-blue'
                  }`}
                >
                  {task.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                </button>

                <span className={`text-sm flex-1 break-words ${
                  task.completed
                    ? 'line-through text-gray-400 dark:text-gray-500'
                    : 'text-gray-700 dark:text-gray-200'
                }`}>
                  {task.text}
                </span>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Date Buttons */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex gap-2 justify-center">
          {[-2, -1, 0, 1, 2].map(offset => {
            const date = new Date();
            date.setDate(date.getDate() + offset);
            const dateStr = getDateString(date);
            const isSelected = dateStr === selectedDate;

            return (
              <button
                key={offset}
                onClick={() => setSelectedDate(dateStr)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-pokemon-blue text-white shadow-md'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                }`}
              >
                {offset === 0 ? 'Hoy' : offset === 1 ? 'Mañ' : offset === -1 ? 'Ayer' : formatDateShort(dateStr)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
