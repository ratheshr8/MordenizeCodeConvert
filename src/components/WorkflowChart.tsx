import React from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { WorkflowStep } from '../types';

interface WorkflowChartProps {
  steps: WorkflowStep[];
}

export const WorkflowChart: React.FC<WorkflowChartProps> = ({ steps }) => {
  const getStepIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'active':
        return <Clock className="h-6 w-6 text-brand-blue-500" />;
      default:
        return <Circle className="h-6 w-6 text-gray-300" />;
    }
  };

  const getStepColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'active':
        return 'border-brand-blue-200 bg-brand-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Conversion Workflow</h3>
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            <div className={`flex items-start space-x-4 p-4 rounded-lg border-2 ${getStepColor(step.status)}`}>
              <div className="flex-shrink-0">
                {getStepIcon(step.status)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{step.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
              </div>
              <div className="text-sm font-medium text-gray-500">
                Step {index + 1}
              </div>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex justify-start ml-6">
                <div className="w-0.5 h-6 bg-gray-300"></div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{steps.filter(s => s.status === 'completed').length} of {steps.length} completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-brand-blue-500 h-2 rounded-full transition-all duration-500"
            style={{
              width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%`
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};