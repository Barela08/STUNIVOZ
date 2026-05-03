import React, { useState } from 'react';
import { Plus, CheckCircle, Circle, Clock, Flame, Target, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Input } from '../../components/common';

type Task = {
  id: number;
  title: string;
  dueDate: string;
  category: string;
  completed: boolean;
};

type Goal = {
  id: number;
  title: string;
  completed: number;
  total: number;
};

const categoryColors: Record<string, string> = {
  project: 'bg-blue-100 text-blue-700',
  interview: 'bg-purple-100 text-purple-700',
  career: 'bg-green-100 text-green-700',
  learning: 'bg-orange-100 text-orange-700',
  general: 'bg-gray-100 text-gray-600',
};

const now = new Date();
const pad = (n: number) => String(n).padStart(2, '0');
const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

const getDateLabel = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  if (diff < 0) return `Overdue by ${Math.abs(diff)} day${Math.abs(diff) > 1 ? 's' : ''}`;
  return `Due in ${diff} days`;
};

const getDateColor = (dateStr: string) => {
  if (!dateStr) return 'text-gray-400';
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'text-red-500';
  if (diff <= 2) return 'text-orange-500';
  return 'text-gray-400';
};

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export const PlannerPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newDue, setNewDue] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [streak] = useState(7);

  const [weeklyGoals, setWeeklyGoals] = useState<Goal[]>([
    { id: 1, title: 'Solve 10 coding problems', completed: 3, total: 10 },
    { id: 2, title: 'Complete 2 course lessons', completed: 1, total: 2 },
  ]);
  const [monthlyGoals, setMonthlyGoals] = useState<Goal[]>([
    { id: 1, title: 'Apply to 5 internships', completed: 2, total: 5 },
    { id: 2, title: 'Build 1 project', completed: 0, total: 1 },
  ]);

  const addTask = () => {
    if (!newTask.trim()) return;
    const task: Task = {
      id: Date.now(),
      title: newTask.trim(),
      dueDate: newDue,
      category: newCategory,
      completed: false,
    };
    setTasks(prev => [task, ...prev]);
    setNewTask('');
    setNewDue('');
    setNewCategory('general');
    setShowForm(false);
  };

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const incrementGoal = (goals: Goal[], setGoals: React.Dispatch<React.SetStateAction<Goal[]>>, id: number) => {
    setGoals(goals.map(g => g.id === id && g.completed < g.total ? { ...g, completed: g.completed + 1 } : g));
  };

  const decrementGoal = (goals: Goal[], setGoals: React.Dispatch<React.SetStateAction<Goal[]>>, id: number) => {
    setGoals(goals.map(g => g.id === id && g.completed > 0 ? { ...g, completed: g.completed - 1 } : g));
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  // Calendar
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  const taskDays = new Set(
    tasks
      .filter(t => !t.completed && t.dueDate)
      .map(t => new Date(t.dueDate).getDate())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Planner</h1>
          <p className="text-gray-500">Plan your goals and track daily progress</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg border border-orange-100">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-semibold text-orange-600">{streak} day streak!</span>
          </div>
          <Button variant="primary" onClick={() => setShowForm(prev => !prev)}>
            <Plus className="w-4 h-4" /> Add Task
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Add Task Form */}
          {showForm && (
            <Card className="border-2 border-primary-200 bg-primary-50/30">
              <CardContent>
                <h3 className="font-semibold text-gray-900 mb-3">New Task</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="What do you need to do?"
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTask()}
                    autoFocus
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Due Date</label>
                      <input
                        type="date"
                        value={newDue}
                        min={todayStr}
                        onChange={e => setNewDue(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Category</label>
                      <select
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
                      >
                        <option value="general">General</option>
                        <option value="project">Project</option>
                        <option value="interview">Interview</option>
                        <option value="career">Career</option>
                        <option value="learning">Learning</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
                    <Button variant="primary" className="flex-1" onClick={addTask} disabled={!newTask.trim()}>
                      Add Task
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Task List */}
          <Card>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">My Tasks</h3>
                <p className="text-sm text-gray-500">{completedCount} of {totalCount} completed</p>
              </div>
              <div className="flex gap-1">
                {(['all', 'pending', 'completed'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${filter === f ? 'bg-primary-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <CardContent>
              {filteredTasks.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">
                    {filter === 'completed' ? 'No completed tasks yet.' :
                     filter === 'pending' ? 'No pending tasks. Great job!' :
                     'No tasks yet. Add your first task!'}
                  </p>
                  {tasks.length === 0 && (
                    <Button variant="primary" size="sm" className="mt-3" onClick={() => setShowForm(true)}>
                      <Plus className="w-4 h-4" /> Add Task
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${task.completed ? 'bg-green-50/70 opacity-75' : 'bg-gray-50 hover:bg-gray-100'}`}
                    >
                      <button onClick={() => toggleTask(task.id)} className="shrink-0 transition-transform active:scale-95">
                        {task.completed
                          ? <CheckCircle className="w-5 h-5 text-green-500" />
                          : <Circle className="w-5 h-5 text-gray-300 hover:text-primary-400 transition-colors" />
                        }
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className={`block font-medium text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${categoryColors[task.category] || categoryColors.general}`}>
                            {task.category}
                          </span>
                          {task.dueDate && (
                            <span className={`flex items-center gap-1 text-xs ${task.completed ? 'text-gray-400' : getDateColor(task.dueDate)}`}>
                              <Clock className="w-3 h-3" /> {getDateLabel(task.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Goals */}
          <Card>
            <CardHeader title="Goals" />
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary-500" /> Weekly Goals
                  </h4>
                  <div className="space-y-3">
                    {weeklyGoals.map((goal) => (
                      <div key={goal.id} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-700">{goal.title}</span>
                            <div className="flex items-center gap-2">
                              <button onClick={() => decrementGoal(weeklyGoals, setWeeklyGoals, goal.id)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold">
                                <ChevronDown className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-semibold text-gray-700 w-12 text-center">{goal.completed}/{goal.total}</span>
                              <button onClick={() => incrementGoal(weeklyGoals, setWeeklyGoals, goal.id)} className="w-6 h-6 rounded-full bg-primary-100 hover:bg-primary-200 flex items-center justify-center text-primary-600 text-sm font-bold">
                                <ChevronUp className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-500 h-2 rounded-full transition-all"
                              style={{ width: `${(goal.completed / goal.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-accent-500" /> Monthly Goals
                  </h4>
                  <div className="space-y-3">
                    {monthlyGoals.map((goal) => (
                      <div key={goal.id} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-700">{goal.title}</span>
                            <div className="flex items-center gap-2">
                              <button onClick={() => decrementGoal(monthlyGoals, setMonthlyGoals, goal.id)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500">
                                <ChevronDown className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-semibold text-gray-700 w-12 text-center">{goal.completed}/{goal.total}</span>
                              <button onClick={() => incrementGoal(monthlyGoals, setMonthlyGoals, goal.id)} className="w-6 h-6 rounded-full bg-accent-100 hover:bg-accent-200 flex items-center justify-center text-accent-600">
                                <ChevronUp className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-accent-500 h-2 rounded-full transition-all"
                              style={{ width: `${(goal.completed / goal.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Live Calendar */}
          <Card>
            <CardHeader title="Calendar" />
            <CardContent>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900">{monthNames[month]} {year}</h3>
                <div className="grid grid-cols-7 gap-1 mt-4">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <span key={day} className="text-xs text-gray-400 font-medium">{day}</span>
                  ))}
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <span key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const isToday = day === today;
                    const hasTask = taskDays.has(day);
                    return (
                      <div key={day} className="relative flex items-center justify-center">
                        <span
                          className={`text-xs p-1.5 rounded-full w-7 h-7 flex items-center justify-center font-medium transition-colors ${
                            isToday ? 'bg-primary-500 text-white' :
                            day < today ? 'text-gray-300' :
                            'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {day}
                        </span>
                        {hasTask && !isToday && (
                          <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-400 rounded-full" />
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-3">Orange dots = tasks due</p>
              </div>
            </CardContent>
          </Card>

          {/* Progress Summary */}
          <Card>
            <CardHeader title="Today's Progress" />
            <CardContent>
              <div className="text-center py-2">
                <div className="text-4xl font-bold text-primary-600">
                  {totalCount === 0 ? '—' : `${Math.round((completedCount / totalCount) * 100)}%`}
                </div>
                <div className="text-sm text-gray-500 mt-1">Tasks completed</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all"
                    style={{ width: totalCount === 0 ? '0%' : `${(completedCount / totalCount) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">{completedCount} of {totalCount} tasks done</p>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming (from tasks with due dates) */}
          <Card>
            <CardHeader title="Upcoming Deadlines" />
            <CardContent>
              {tasks.filter(t => !t.completed && t.dueDate).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No deadlines set. Add due dates to your tasks!</p>
              ) : (
                <div className="space-y-3">
                  {tasks
                    .filter(t => !t.completed && t.dueDate)
                    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                    .slice(0, 5)
                    .map((task) => (
                      <div key={task.id} className="flex items-center gap-3">
                        <Clock className={`w-4 h-4 shrink-0 ${getDateColor(task.dueDate)}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 font-medium truncate">{task.title}</p>
                          <p className={`text-xs ${getDateColor(task.dueDate)}`}>{getDateLabel(task.dueDate)}</p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
