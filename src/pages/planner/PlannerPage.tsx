import React, { useState } from 'react';
import { Plus, CheckCircle, Circle, Clock, Flame, Target, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Input } from '../../components/common';

const mockTasks = [
  { id: 1, title: 'Complete React project', dueDate: '2024-12-15', category: 'project', completed: false },
  { id: 2, title: 'Prepare for interview', dueDate: '2024-12-20', category: 'interview', completed: false },
  { id: 3, title: 'Update resume', dueDate: '2024-12-10', category: 'career', completed: true },
  { id: 4, title: 'Learn TypeScript', dueDate: '2024-12-25', category: 'learning', completed: false },
];

const mockGoals = {
  weekly: [
    { id: 1, title: 'Solve 10 coding problems', completed: 6, total: 10 },
    { id: 2, title: 'Complete 2 lessons', completed: 2, total: 2 },
  ],
  monthly: [
    { id: 1, title: 'Apply to 5 internships', completed: 3, total: 5 },
    { id: 2, title: 'Build 1 project', completed: 0, total: 1 },
  ],
};

export const PlannerPage: React.FC = () => {
  const [tasks, setTasks] = useState(mockTasks);
  const [newTask, setNewTask] = useState('');
  const [streak] = useState(7);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), title: newTask, dueDate: '', category: 'general', completed: false }]);
      setNewTask('');
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Planner</h1>
          <p className="text-gray-500">Plan your goals and track progress</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="font-semibold text-orange-600">{streak} day streak!</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tasks */}
        <div className="lg:col-span-2 space-y-4">
          {/* Add Task */}
          <Card>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Add a new task..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="flex-1"
                />
                <Button variant="primary" onClick={addTask}>
                  <Plus className="w-4 h-4" />
                  Add Task
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tasks List */}
          <Card>
            <CardHeader title="Today's Tasks" subtitle={`${completedCount} of ${tasks.length} completed`} />
            <CardContent>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      task.completed ? 'bg-green-50' : 'bg-gray-50'
                    }`}
                  >
                    <button onClick={() => toggleTask(task.id)} className="flex-shrink-0">
                      {task.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </button>
                    <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {task.title}
                    </span>
                    <button onClick={() => deleteTask(task.id)} className="text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Goals */}
          <Card>
            <CardHeader title="Goals" />
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Weekly Goals</h4>
                  <div className="space-y-3">
                    {mockGoals.weekly.map((goal) => (
                      <div key={goal.id} className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-primary-500" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-700">{goal.title}</span>
                            <span className="text-sm text-gray-500">{goal.completed}/{goal.total}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-500 h-2 rounded-full"
                              style={{ width: `${(goal.completed / goal.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Monthly Goals</h4>
                  <div className="space-y-3">
                    {mockGoals.monthly.map((goal) => (
                      <div key={goal.id} className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-accent-500" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-700">{goal.title}</span>
                            <span className="text-sm text-gray-500">{goal.completed}/{goal.total}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-accent-500 h-2 rounded-full"
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
          {/* Calendar Preview */}
          <Card>
            <CardHeader title="Calendar" />
            <CardContent>
              <div className="text-center py-4">
                <h3 className="font-semibold text-gray-900">December 2024</h3>
                <div className="grid grid-cols-7 gap-1 mt-4">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <span key={i} className="text-xs text-gray-500">{day}</span>
                  ))}
                  {[...Array(31)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-xs p-2 rounded ${
                        i + 1 === 15 ? 'bg-primary-500 text-white' :
                        i + 1 < 15 ? 'text-gray-400' : 'text-gray-700'
                      }`}
                    >
                      {i + 1}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deadlines */}
          <Card>
            <CardHeader title="Upcoming Deadlines" />
            <CardContent>
              <div className="space-y-3">
                {[
                  { title: 'Resume submission', date: 'Dec 10', urgent: true },
                  { title: 'Interview prep', date: 'Dec 20', urgent: false },
                  { title: 'Project completion', date: 'Dec 15', urgent: false },
                ].map((deadline, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Clock className={`w-4 h-4 ${deadline.urgent ? 'text-red-500' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{deadline.title}</p>
                      <p className="text-xs text-gray-500">{deadline.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
