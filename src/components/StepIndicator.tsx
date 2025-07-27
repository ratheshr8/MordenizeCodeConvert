import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  completed: boolean;
  active: boolean;
}

interface StepIndicatorProps {
  steps: Step[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                  step.completed
                    ? 'bg-green-500 text-white'
                    : step.active
                    ? 'bg-brand-blue-500 text-white'
                     : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.completed ? <Check className="h-5 w-5" /> : index + 1}
              </div>
              <div className="ml-3">
                <div
                  className={`text-sm font-medium ${
                    step.active ? 'text-blue-600' : step.completed ? 'text-green-600' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </div>
              </div>
            </div>
            
            {index < steps.length - 1 && (
              <div className="flex-1 mx-6">
                <div
                  className={`h-0.5 transition-all duration-200 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};