import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const Stepper = ({ steps, currentStep, className }: StepperProps) => {
  return (
    <div className={cn("w-full", className)}>
      <nav aria-label="Progress">
        <ol className="space-y-4 md:space-y-6">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isUpcoming = index > currentStep;

            return (
              <li key={index} className="relative">
                <div className="flex items-center">
                  <div className="flex items-center">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium",
                        {
                          "border-primary bg-primary text-primary-foreground": isCompleted,
                          "border-primary bg-background text-primary": isCurrent,
                          "border-muted-foreground bg-background text-muted-foreground": isUpcoming,
                        }
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          {
                            "text-foreground": isCompleted || isCurrent,
                            "text-muted-foreground": isUpcoming,
                          }
                        )}
                      >
                        {step.title}
                      </p>
                      {step.description && (
                        <p
                          className={cn(
                            "text-xs",
                            {
                              "text-muted-foreground": isCompleted || isCurrent,
                              "text-muted-foreground/60": isUpcoming,
                            }
                          )}
                        >
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "absolute left-4 top-8 -ml-px h-6 w-0.5",
                      {
                        "bg-primary": isCompleted,
                        "bg-muted-foreground/30": !isCompleted,
                      }
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};