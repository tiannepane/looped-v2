import { useState, useCallback } from "react";
import { Upload, X, Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/components/AppLayout";

interface ListingData {
  title: string;
  category: string;
  condition: string;
  size: string;
  description: string;
}

interface PricingData {
  recommended: number;
  min: number;
  max: number;
  confidence: number;
  daysToSell: number;
  sampleCount: number;
}

const NewListing = () => {
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [listing, setListing] = useState<ListingData>({
    title: "",
    category: "",
    condition: "",
    size: "",
    description: "",
  });
  const [editedFields, setEditedFields] = useState<Set<string>>(new Set());
  const [pricing, setPricing] = useState<PricingData>({
    recommended: 480,
    min: 350,
    max: 600,
    confidence: 87,
    daysToSell: 3,
    sampleCount: 24,
  });
  const [posted, setPosted] = useState(false);
  const [fbUrl, setFbUrl] = useState("");

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // TODO: connect to actual file upload
    const demoImages = [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
    ];
    setPhotos((prev) => [...prev, ...demoImages].slice(0, 5));
  }, []);

  const addDemoPhotos = () => {
    setPhotos([
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1550254478-ead40cc54513?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&h=400&fit=crop",
    ]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const startAnalysis = async () => {
    setAnalyzing(true);
    setAnalysisStep(1);
    // TODO: connect to AI analysis API
    await new Promise((r) => setTimeout(r, 1200));
    setAnalysisStep(2);
    await new Promise((r) => setTimeout(r, 1000));
    setAnalysisStep(3);
    await new Promise((r) => setTimeout(r, 1500));
    setListing({
      title: "Mid-Century Modern Sofa — Orange",
      category: "Furniture",
      condition: "Good",
      size: "3-seater",
      description:
        "Beautiful mid-century modern sofa in warm orange with tufted back and solid wood legs. Clean, no stains or tears. Pet-free, smoke-free home. Pickup downtown Toronto.",
    });
    setAnalysisStep(4);
  };

  const handleFieldChange = (field: keyof ListingData, value: string) => {
    setListing((prev) => ({ ...prev, [field]: value }));
    setEditedFields((prev) => new Set(prev).add(field));
  };

  const analysisSteps = [
    { label: "Analyzing Images", step: 1 },
    { label: "Determining Category", step: 2 },
    { label: "Generating Listing", step: 3 },
  ];

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-10">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-muted-foreground"
                }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 4 && <div className={`w-12 h-px ${step > s ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Photo Upload */}
        {step === 1 && (
          <div>
            <h2 className="text-3xl font-black tracking-tight text-foreground mb-2">Upload Photos</h2>
            <p className="text-muted-foreground mb-8">Snap a few pics of what you're selling. Max 5.</p>

            {photos.length === 0 ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={addDemoPhotos}
                className="min-h-[400px] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center hover:border-primary/50 transition-colors duration-300"
              >
                <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-foreground font-semibold mb-1">Drop your photos here</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
              </div>
            ) : (
              <>
                <div className="flex gap-4 mb-8 flex-wrap">
                  {photos.map((photo, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={photo}
                        alt={`Upload ${i + 1}`}
                        className="w-32 h-32 object-cover rounded-lg border border-border"
                      />
                      {i === 0 && (
                        <span className="absolute top-2 left-2 text-[10px] uppercase tracking-widest bg-foreground text-background px-2 py-0.5 rounded font-bold">
                          Cover
                        </span>
                      )}
                      <button
                        onClick={() => removePhoto(i)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {photos.length < 5 && (
                    <button
                      onClick={addDemoPhotos}
                      className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:border-primary/50 transition-colors duration-300"
                    >
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    </button>
                  )}
                </div>
                <Button onClick={startAnalysis} size="lg" className="rounded-lg">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze with AI
                </Button>
              </>
            )}
          </div>
        )}

        {/* Analysis Modal */}
        {analyzing && analysisStep < 4 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
            <div className="bg-background border border-border rounded-lg p-10 max-w-md w-full shadow-lg">
              <h3 className="text-xl font-bold text-foreground mb-8">Analyzing your item...</h3>
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
        )}

        {/* Step 2: Edit Listing */}
        {analyzing && analysisStep === 4 && step === 1 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
            <div className="bg-background border border-border rounded-lg p-10 max-w-lg w-full shadow-lg">
              <h3 className="text-xl font-bold text-foreground mb-6">Your listing is ready ✨</h3>
              <div className="flex flex-col gap-4">
                {(["title", "category", "condition", "size"] as const).map((field) => (
                  <div key={field}>
                    <div className="flex items-center gap-2 mb-1">
                      <label className="text-xs uppercase tracking-widest text-muted-foreground">
                        {field}
                      </label>
                      {!editedFields.has(field) && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
                          AI
                        </span>
                      )}
                    </div>
                    <Input
                      value={listing[field]}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      className="bg-card"
                    />
                  </div>
                ))}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="text-xs uppercase tracking-widest text-muted-foreground">
                      Description
                    </label>
                    {!editedFields.has("description") && (
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
                        AI
                      </span>
                    )}
                  </div>
                  <Textarea
                    value={listing.description}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    rows={4}
                    className="bg-card"
                  />
                </div>
              </div>
              <Button
                onClick={() => {
                  setAnalyzing(false);
                  setStep(2);
                }}
                className="mt-6 w-full rounded-lg"
                size="lg"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 (displayed): Pricing Intelligence */}
        {step === 2 && (
          <div>
            <h2 className="text-3xl font-black tracking-tight text-foreground mb-2">Pricing Intelligence</h2>
            <p className="text-muted-foreground mb-8">Based on similar items in your area.</p>

            <div className="bg-card border border-border rounded-lg p-10">
              <div className="text-center mb-10">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Recommended Price</p>
                <p className="text-6xl font-black text-primary">${pricing.recommended}</p>
              </div>

              {/* Price range bar */}
              <div className="mb-8">
                <div className="relative h-2 bg-accent rounded-full">
                  <div
                    className="absolute h-2 bg-primary/30 rounded-full"
                    style={{
                      left: "0%",
                      width: "100%",
                    }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-primary-foreground shadow-sm"
                    style={{
                      left: `${((pricing.recommended - pricing.min) / (pricing.max - pricing.min)) * 100}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-muted-foreground">${pricing.min}</span>
                  <span className="text-xs text-muted-foreground">${pricing.max}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{pricing.confidence}%</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Confidence</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">~{pricing.daysToSell} days</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Est. to sell</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{pricing.sampleCount}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Samples</p>
                </div>
              </div>

              {pricing.confidence < 80 && (
                <p className="text-sm text-muted-foreground text-center italic mb-6">
                  We're still learning prices in your area.
                </p>
              )}

              <Button onClick={() => setStep(3)} className="w-full rounded-lg" size="lg">
                Continue to Post
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Post to Platforms */}
        {step === 3 && (
          <div>
            <h2 className="text-3xl font-black tracking-tight text-foreground mb-2">Post Everywhere</h2>
            <p className="text-muted-foreground mb-8">Get your listing out there.</p>

            {/* Listing summary */}
            <div className="flex items-center gap-4 bg-card border border-border rounded-lg p-4 mb-8">
              <img
                src={photos[0] || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&h=100&fit=crop"}
                alt="Listing"
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <p className="font-semibold text-foreground">{listing.title}</p>
                <p className="text-primary font-bold">${pricing.recommended}</p>
              </div>
            </div>

            {/* Platform cards */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-2xl mb-3">📘</div>
                <h3 className="font-bold text-foreground mb-1">Facebook Marketplace</h3>
                <p className="text-sm text-muted-foreground mb-4">Post directly to FB Marketplace.</p>
                <Button
                  variant="outline"
                  className="w-full rounded-lg"
                  onClick={() => {
                    // TODO: copy description to clipboard and open FB
                    navigator.clipboard.writeText(listing.description);
                  }}
                >
                  Copy Description & Open Facebook
                </Button>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-2xl mb-3">🥕</div>
                <h3 className="font-bold text-foreground mb-1">Karrot</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Import your FB listing to Karrot automatically.
                </p>
                <Input
                  placeholder="Paste your FB listing URL"
                  value={fbUrl}
                  onChange={(e) => setFbUrl(e.target.value)}
                  className="mb-3 bg-background"
                />
                <Button variant="outline" className="w-full rounded-lg" disabled={!fbUrl}>
                  Import to Karrot
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <input
                type="checkbox"
                checked={posted}
                onChange={(e) => setPosted(e.target.checked)}
                className="w-4 h-4 accent-primary"
                id="posted-check"
              />
              <label htmlFor="posted-check" className="text-sm text-foreground">
                I've posted to the platforms
              </label>
            </div>

            <Button
              onClick={() => {
                // TODO: save listing to database
                setStep(4);
              }}
              className="w-full rounded-lg"
              size="lg"
              disabled={!posted}
            >
              Done
            </Button>

            {step === 4 && (
              <div className="mt-8 text-center">
                <p className="text-lg font-bold text-foreground">🎉 You're live!</p>
                <p className="text-muted-foreground text-sm">Your item has been added to your listings.</p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Done */}
        {step === 4 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-black tracking-tight text-foreground mb-2">You're live!</h2>
            <p className="text-muted-foreground mb-8">Your listing is out there making money while you sleep.</p>
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                className="rounded-lg"
                onClick={() => {
                  setStep(1);
                  setPhotos([]);
                  setAnalyzing(false);
                  setAnalysisStep(0);
                  setEditedFields(new Set());
                  setPosted(false);
                  setFbUrl("");
                }}
              >
                List Another Item
              </Button>
              <Button asChild className="rounded-lg">
                <a href="/items">View My Items</a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default NewListing;
