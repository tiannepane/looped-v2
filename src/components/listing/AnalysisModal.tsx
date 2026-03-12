interface AnalysisModalProps {
  analysisStep: number;
}

const AnalysisModal = ({ analysisStep }: AnalysisModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        <div
          className="text-8xl"
          style={{ animation: "box-bounce 1.5s ease-in-out infinite" }}
        >
          📦
        </div>
        <p
          className="text-3xl font-bold text-foreground"
          style={{ fontFamily: "'Gaegu', cursive" }}
        >
          Analyzing...
        </p>
      </div>
    </div>
  );
};

export default AnalysisModal;
