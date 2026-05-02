import React from 'react';
import { Card, CardHeader, CardContent, Button, ProgressBar } from '../../components/common';
import { CheckCircle, AlertTriangle, Upload } from 'lucide-react';

export const ATSPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">ATS Analyzer</h1>
          <p className="text-gray-500">Analyze your resume against industry standards</p>
        </div>
        <Button variant="primary">
          <Upload className="w-4 h-4 mr-2" />
          Upload New Resume
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader title="Overall Score" />
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="relative w-40 h-40 mb-6">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#0ea5e9"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray="439.8"
                    strokeDashoffset="109.95"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-4xl font-bold text-gray-900">75</span>
                  <span className="text-sm text-gray-500">/ 100</span>
                </div>
              </div>
              <p className="text-center text-gray-600">Your resume is looking good, but there's room for improvement.</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Analysis Breakdown" />
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Keyword Match</span>
                  <span className="text-primary-600">80%</span>
                </div>
                <ProgressBar value={80} color="primary" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Formatting & Readability</span>
                  <span className="text-green-600">90%</span>
                </div>
                <ProgressBar value={90} color="success" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Action Verbs Usage</span>
                  <span className="text-yellow-600">65%</span>
                </div>
                <ProgressBar value={65} color="warning" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Quantifiable Results</span>
                  <span className="text-red-600">40%</span>
                </div>
                <ProgressBar value={40} color="error" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Suggestions */}
      <Card>
        <CardHeader title="Improvement Suggestions" />
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900">Add more quantifiable results</h4>
                <p className="text-gray-600 mt-1">Instead of "Improved performance", use "Improved performance by 25% over 3 months".</p>
              </div>
            </div>
            
            <div className="flex gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
              <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900">Missing Key Skills</h4>
                <p className="text-gray-600 mt-1">Based on your target role (Frontend Developer), consider adding: TypeScript, Next.js, Redux.</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900">Great formatting</h4>
                <p className="text-gray-600 mt-1">Your resume uses standard fonts and clear headings, making it very ATS-friendly.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
