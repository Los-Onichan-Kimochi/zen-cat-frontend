import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export function StepIndicator({ currentStep, totalSteps, stepLabels }: StepIndicatorProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isConnected = index < stepLabels.length - 1;

          return (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center">
                {/* Círculo del paso */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-black text-white'
                      : isActive
                      ? 'bg-black text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? '✓' : stepNumber}
                </div>
                
                {/* Etiqueta del paso */}
                <span
                  className={`mt-2 text-xs font-medium text-center ${
                    isActive || isCompleted
                      ? 'text-black'
                      : 'text-gray-500'
                  }`}
                >
                  {label}
                </span>
              </div>

              {/* Línea conectora */}
              {isConnected && (
                <div className="flex-1 mx-4 mt-[-1rem]">
                  <div
                    className={`h-0.5 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-black'
                        : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
} 