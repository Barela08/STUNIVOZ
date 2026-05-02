import React, { useMemo, useState } from 'react';
import { Plus, CheckCircle, Circle, Clock, Target, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Input, EmptyState, Loading } from '../../components/common';
import { addDocument, deleteDocument, updateDocument } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import type { Task } from '../../types';

export const PlannerPage: React.FC = () => {
  const { user } = useAuth();
  const tasks = useCollection<Task>('tasks');
  const [newTask, setNewTask] = useState('');

  const myTasks = useMemo(
    () => tasks.data.filter((task) => task.user_id === user?.uid),
    [tasks.data, user?.uid]
  );
  const completedCount = myTasks.filter((task) => task.completed).length;
  const upcoming = myTasks
    .filter((task) => !task.completed && task.due_date)
    .sort((a, b) => String(a.due_date).localeCompare(String(b.due_date)))
    .slice(0, 5);

  const addTask = async () => {
    if (!user || !newTask.trim()) return;
    await addDocument('tasks', {
      user_id: user.uid,
      title: newTask.trim(),
      priority: 'medium',
      completed: false,
      created_at: new Date().toISOString()
    });
    setNewTask('');
    tasks.refresh();
  };

  const toggleTask = async (task: Task) => {
    await updateDocument('tasks', task.id, { completed: !task.completed });
    tasks.refresh();
  };

  const removeTask = async (id: string) => {
    await deleteDocument('tasks', id);
    tasks.refresh();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Planner</h1>
        <p className="text-gray-500">Plan your goals and track real task progress.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Add a new task..."
                  value={newTask}
                  onChange={(event) => setNewTask(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') addTask();
                  }}
                />
                <Button variant="primary" onClick={addTask}>
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Tasks" subtitle={`${completedCount} of ${myTasks.length} completed`} />
            <CardContent>
              {tasks.loading ? (
                <Loading text="Loading tasks..." />
              ) : myTasks.length === 0 ? (
                <EmptyState title="No tasks yet" description="Create tasks here to track your study and career work." />
              ) : (
                <div className="space-y-3">
                  {myTasks.map((task) => (
                    <div key={task.id} className={`flex items-center gap-3 p-3 rounded-lg ${task.completed ? 'bg-green-50' : 'bg-gray-50'}`}>
                      <button onClick={() => toggleTask(task)} className="flex-shrink-0">
                        {task.completed ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-gray-300" />}
                      </button>
                      <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.title}</span>
                      <button onClick={() => removeTask(task.id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Progress" />
            <CardContent>
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-primary-500" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Completion</span>
                    <span>{myTasks.length ? Math.round((completedCount / myTasks.length) * 100) : 0}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-primary-500 rounded-full" style={{ width: `${myTasks.length ? (completedCount / myTasks.length) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Upcoming Deadlines" />
            <CardContent>
              {upcoming.length === 0 ? (
                <EmptyState title="No deadlines" description="Add due dates to tasks to see them here." />
              ) : (
                <div className="space-y-3">
                  {upcoming.map((deadline) => (
                    <div key={deadline.id} className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">{deadline.title}</p>
                        <p className="text-xs text-gray-500">{deadline.due_date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
