import { useCallback } from "react";
import { Upload, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoUploadStepProps {
  photos: string[];
  setPhotos: React.Dispatch<React.SetStateAction<string[]>>;
  onAnalyze: () => void;
}

const DEMO_PHOTOS = [
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1550254478-ead40cc54513?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop&q=80",
  "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&h=400&fit=crop&q=80",
];

const PhotoUploadStep = ({ photos, setPhotos, onAnalyze }: PhotoUploadStepProps) => {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      // TODO: connect to actual file upload - handle real files from e.dataTransfer.files
      const demoImages = DEMO_PHOTOS.slice(0, 3);
      setPhotos((prev) => [...prev, ...demoImages].slice(0, 20));
    },
    [setPhotos]
  );

  const addDemoPhotos = () => {
    // Simulate bulk upload of 12 photos across multiple items
    setPhotos((prev) => [...prev, ...DEMO_PHOTOS].slice(0, 20));
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h2 className="text-3xl font-black tracking-tight text-foreground mb-2">Upload Photos</h2>
      <p className="text-muted-foreground mb-8">
        Drop all your photos at once — we'll sort them by item automatically. Max 20 photos.
      </p>

      {photos.length === 0 ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={addDemoPhotos}
          className="min-h-[400px] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center hover:border-primary/50 transition-colors duration-300 cursor-pointer"
        >
          <Upload className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-foreground font-semibold mb-1">Drop all your photos here</p>
          <p className="text-sm text-muted-foreground">
            Multiple items? No problem. We'll group them with AI.
          </p>
        </div>
      ) : (
        <>
          <div className="flex gap-3 mb-8 flex-wrap">
            {photos.map((photo, i) => (
              <div key={i} className="relative group">
                <img
                  src={photo}
                  alt={`Upload ${i + 1}`}
                  className="w-24 h-24 object-cover rounded-lg border border-border"
                />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-foreground text-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {photos.length < 20 && (
              <button
                onClick={addDemoPhotos}
                className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:border-primary/50 transition-colors duration-300"
              >
                <Upload className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={onAnalyze} size="lg" className="rounded-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze with AI
            </Button>
            <span className="text-sm text-muted-foreground">{photos.length} photo{photos.length !== 1 ? "s" : ""} uploaded</span>
          </div>
        </>
      )}
    </div>
  );
};

export default PhotoUploadStep;
