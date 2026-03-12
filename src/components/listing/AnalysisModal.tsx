import { Check, Loader2 } from "lucide-react";

interface AnalysisModalProps {
  analysisStep: number;
}

const analysisSteps = [
  { label: "Analyzing Images", step: 1 },
  { label: "Identifying Items", step: 2 },
  { label: "Grouping Photos", step: 3 },
  { label: "Generating Listings", step: 4 },
];

const AnalysisModal = ({ analysisStep }: AnalysisModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-lg p-10 max-w-md w-full shadow-lg">
        <h3 className="text-xl font-bold text-foreground mb-8">Analyzing your items...</h3>
        <div className="flex flex-col gap-5">
          {analysisSteps.map((s) => (
            <div key={s.step} className="flex items-center gap-3">
              {analysisStep > s.step ? (
                <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-success-foreground" />
                </div>
              ) : analysisStep === s.step ? (
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-accent" />
              )}
              <span
                className={`text-sm ${
                  analysisStep >= s.step ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;
