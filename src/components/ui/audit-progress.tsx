import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { BlinkingEye } from './blinking-eye';

interface AuditProgressProps {
  isLoading: boolean;
}

const steps = [
  { id: 1, label: 'Analyzing Tender Data', duration: 800 },
  { id: 2, label: 'Processing Text Features', duration: 1200 },
  { id: 3, label: 'Computing SHAP Values', duration: 1000 },
  { id: 4, label: 'Generating Risk Assessment', duration: 500 },
];

export function AuditProgress({ isLoading }: AuditProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    let stepIndex = 0;
    let progressValue = 0;

    const moveToNextStep = () => {
      if (stepIndex < steps.length) {
        setCurrentStep(stepIndex + 1);
        
        // Simulate progress within this step
        const step = steps[stepIndex];
        const increment = 100 / steps.length / 20; // 20 updates per step
        const interval = step.duration / 20;

        const progressInterval = setInterval(() => {
          progressValue += increment;
          setProgress(Math.min(progressValue, (stepIndex + 1) * (100 / steps.length)));
        }, interval);

        setTimeout(() => {
          clearInterval(progressInterval);
          stepIndex++;
          if (stepIndex < steps.length) {
            moveToNextStep();
          }
        }, step.duration);
      }
    };

    moveToNextStep();

    return () => {
      stepIndex = steps.length; // Stop progression
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="w-full space-y-6">
      {/* Blinking Eye Animation */}
      <div className="flex flex-col items-center justify-center py-6">
        <BlinkingEye size={100} className="mb-4" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Glassbox AI is analyzing your tender...
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => {
          const isComplete = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div
              key={step.id}
              className={`flex items-center space-x-3 transition-all duration-300 ${
                isCurrent ? 'scale-105' : 'scale-100'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isComplete
                    ? 'border-green-500 bg-green-500 text-white'
                    : isCurrent
                    ? 'border-primary bg-primary text-primary-foreground animate-pulse'
                    : 'border-muted bg-background text-muted-foreground'
                }`}
              >
                {isComplete ? (
                  <Check className="h-4 w-4" />
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="text-xs font-medium">{step.id}</span>
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-medium transition-colors duration-300 ${
                    isComplete
                      ? 'text-green-600 dark:text-green-400'
                      : isCurrent
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </p>
              </div>
              {isCurrent && (
                <div className="text-xs text-muted-foreground animate-pulse">
                  Processing...
                </div>
              )}
              {isComplete && (
                <div className="text-xs text-green-600 dark:text-green-400">
                  Complete
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Estimated time */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Estimated time remaining: ~{Math.max(0, 4 - currentStep)} seconds
        </p>
      </div>
    </div>
  );
}
