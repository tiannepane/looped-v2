import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
              currentStep >= s
                ? "bg-foreground text-background"
                : "bg-accent text-muted-foreground"
            }`}
          >
            {currentStep > s ? <Check className="w-4 h-4" /> : s}
          </div>
          {s < totalSteps && (
            <div className={`w-12 h-px ${currentStep > s ? "bg-foreground" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
