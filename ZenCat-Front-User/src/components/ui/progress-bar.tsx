import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  steps: string[];
}

export function ProgressBar({ currentStep, steps }: ProgressBarProps) {
  return (
    <div className="flex justify-center items-center">
      <div className="flex items-start">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={stepNumber} className="flex items-start">
              {/* Step Circle and Label */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                    isActive
                      ? 'bg-black text-white border-black'
                      : isCompleted
                        ? 'bg-black text-white border-black'
                        : 'bg-gray-100 text-gray-400 border-gray-300'
                  }`}
                >
                  {stepNumber}
                </div>
                <span
                  className={`mt-2 text-xs font-medium text-center max-w-20 ${
                    isActive || isCompleted ? 'text-black' : 'text-gray-500'
                  }`}
                >
                  {label}
                </span>
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div className="flex items-center h-10 px-6">
                  <div
                    className={`h-0.5 w-12 ${
                      isCompleted ? 'bg-black' : 'bg-gray-300'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
