import analyzingBox from "@/assets/analyzing-box.png";

interface AnalysisModalProps {
  analysisStep: number;
}

const AnalysisModal = ({ analysisStep }: AnalysisModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        <img
          src={analyzingBox}
          alt="Analyzing"
          className="w-48 h-48 object-contain"
          style={{ animation: "calendar-float 3s ease-in-out infinite" }}
        />
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
