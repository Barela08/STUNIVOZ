import React, { useMemo, useState } from 'react';
import { CheckCircle, Clock, BookOpen, MessageCircle, ChevronRight, Route } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, EmptyState, Loading } from '../../components/common';
import { useCollection } from '../../hooks/useCollection';
import type { CareerPath, RoadmapStep } from '../../types';

export const CareerPage: React.FC = () => {
  const careerPaths = useCollection<CareerPath>('career_paths');
  const roadmapSteps = useCollection<RoadmapStep>('roadmap_steps');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [showAdvisor, setShowAdvisor] = useState(false);

  const activePath = selectedPath || careerPaths.data[0]?.id || null;
  const currentRoadmap = useMemo(
    () => roadmapSteps.data
      .filter((step) => step.career_path_id === activePath)
      .sort((a, b) => a.step_number - b.step_number),
    [roadmapSteps.data, activePath]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Career Guidance</h1>
          <p className="text-gray-500">Career paths and roadmap steps are loaded from real content records.</p>
        </div>
        <Button variant="primary" onClick={() => setShowAdvisor(true)}><MessageCircle className="w-4 h-4" /> Career Advisor</Button>
      </div>

      {careerPaths.loading || roadmapSteps.loading ? (
        <Loading text="Loading career paths..." />
      ) : careerPaths.data.length === 0 ? (
        <Card><EmptyState icon={<Route className="w-6 h-6" />} title="No career paths yet" description="Admins can create career_paths and roadmap_steps documents to power this page." /></Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-semibold text-lg text-gray-900">Choose Your Path</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {careerPaths.data.map((path) => (
                <Card key={path.id} hover className={`cursor-pointer ${activePath === path.id ? 'ring-2 ring-primary-500' : ''}`} onClick={() => setSelectedPath(path.id)}>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{path.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{path.description}</p>
                        <p className="text-sm text-gray-500 mt-3">{path.skills_required?.length || 0} required skills</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader title="Roadmap" />
              <CardContent>
                {currentRoadmap.length === 0 ? (
                  <EmptyState title="No roadmap steps" description="Add roadmap_steps records for the selected career path." />
                ) : (
                  <div className="space-y-3">
                    {currentRoadmap.map((step) => (
                      <div key={step.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
                          <span className="text-sm font-medium">{step.step_number}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{step.title}</h4>
                          <p className="text-sm text-gray-500">{step.estimated_time} - {step.difficulty}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader title="Progress" />
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                Progress is tracked when roadmap progress records are added.
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                Real content mode enabled.
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showAdvisor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-lg">Career Advisor</h3>
              <Button variant="ghost" onClick={() => setShowAdvisor(false)}>Close</Button>
            </div>
            <CardContent>
              <EmptyState title="Advisor not configured" description="Connect an AI provider before enabling live career advice." />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
