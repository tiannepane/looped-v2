import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import StepIndicator from "@/components/listing/StepIndicator";
import PhotoUploadStep from "@/components/listing/PhotoUploadStep";
import AnalysisModal from "@/components/listing/AnalysisModal";
import { type ItemGroup } from "@/components/listing/KanbanBoard";
import { type ItemPricing } from "@/components/listing/BulkPricingStep";
import PhotoWall from "@/components/listing/PhotoWall";
import DetailsReview from "@/components/listing/DetailsReview";
import CrossPostingHub from "@/components/listing/CrossPostingHub";
import CompletionStep from "@/components/listing/CompletionStep";

// TODO: Send all photos to Claude Vision API in a single call.
// Prompt should ask Claude to group photos by item and generate
// title, category, condition, size, and description for each group.
const MOCK_GROUPS: Omit<ItemGroup, "id" | "confirmed" | "rejected" | "editedFields">[] = [
  {
    title: "Mid-Century Modern Sofa — Orange",
    category: "Furniture",
    condition: "Good",
    size: "3-seater",
    description: "Beautiful mid-century modern sofa in warm orange with tufted back and solid wood legs. Clean, no stains or tears. Pet-free, smoke-free home. Pickup downtown Toronto.",
    photos: [],
  },
  {
    title: "Lightly Used Magic Keyboard",
    category: "Electronics",
    condition: "Like New",
    size: "Full-size",
    description: "Apple Magic Keyboard with numeric keypad. Silver/white. All keys work perfectly. Comes with Lightning cable. Barely used — switched to mechanical.",
    photos: [],
  },
  {
    title: "Vintage Brass Desk Lamp",
    category: "Home Decor",
    condition: "Good",
    size: "16 inches tall",
    description: "Beautiful vintage brass desk lamp with adjustable arm. Warm light, works perfectly. Minor patina adds character. Great for a reading nook or home office.",
    photos: [],
  },
  {
    title: "Nike Air Max 90 — Size 10",
    category: "Clothing & Shoes",
    condition: "Fair",
    size: "Men's 10",
    description: "Nike Air Max 90 in grey/white. Some wear on the soles but uppers are clean. Still very comfortable. Selling because I upgraded.",
    photos: [],
  },
];

const MOCK_PRICING: Omit<ItemPricing, "groupId">[] = [
  { recommended: 480, min: 350, max: 600, confidence: 87, daysToSell: 3, sampleCount: 24 },
  { recommended: 120, min: 80, max: 160, confidence: 92, daysToSell: 1, sampleCount: 41 },
  { recommended: 45, min: 25, max: 75, confidence: 74, daysToSell: 5, sampleCount: 12 },
  { recommended: 95, min: 60, max: 130, confidence: 83, daysToSell: 2, sampleCount: 18 },
];

const NewListing = () => {
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [groups, setGroups] = useState<ItemGroup[]>([]);
  const [ungroupedPhotos, setUngroupedPhotos] = useState<string[]>([]);
  const [pricingData, setPricingData] = useState<ItemPricing[]>([]);

  const startAnalysis = async () => {
    setAnalyzing(true);
    setAnalysisStep(1);
    // TODO: connect to AI analysis API
    await new Promise((r) => setTimeout(r, 1200));
    setAnalysisStep(2);
    await new Promise((r) => setTimeout(r, 1000));
    setAnalysisStep(3);
    await new Promise((r) => setTimeout(r, 1000));
    setAnalysisStep(4);
    await new Promise((r) => setTimeout(r, 1500));

    // Distribute uploaded photos among mock groups
    const photosCopy = [...photos];
    const groupCount = MOCK_GROUPS.length;
    const photosPerGroup = Math.ceil(photosCopy.length / groupCount);

    const generatedGroups: ItemGroup[] = MOCK_GROUPS.map((mock, i) => ({
      ...mock,
      id: `group-${i}`,
      confirmed: false,
      rejected: false,
      editedFields: new Set<string>(),
      photos: photosCopy.slice(i * photosPerGroup, (i + 1) * photosPerGroup),
    }));

    setGroups(generatedGroups);
    setPricingData(
      generatedGroups.map((g, i) => ({
        ...MOCK_PRICING[i % MOCK_PRICING.length],
        groupId: g.id,
      }))
    );

    setAnalyzing(false);
    setAnalysisStep(0);
    setStep(2);
  };

  const resetAll = () => {
    setStep(1);
    setPhotos([]);
    setAnalyzing(false);
    setAnalysisStep(0);
    setGroups([]);
    setUngroupedPhotos([]);
    setPricingData([]);
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <StepIndicator currentStep={step} totalSteps={4} />

        {/* Step 1: Photo Upload */}
        {step === 1 && !analyzing && (
          <PhotoUploadStep photos={photos} setPhotos={setPhotos} onAnalyze={startAnalysis} />
        )}

        {/* Analysis Modal */}
        {analyzing && <AnalysisModal analysisStep={analysisStep} />}

        {/* Step 2: Photo Wall */}
        {step === 2 && (
          <PhotoWall
            groups={groups}
            setGroups={setGroups}
            ungroupedPhotos={ungroupedPhotos}
            setUngroupedPhotos={setUngroupedPhotos}
            pricingData={pricingData}
            onContinue={() => setStep(3)}
          />
        )}

        {/* Step 3: Details Review (includes pricing) */}
        {step === 3 && (
          <DetailsReview
            groups={groups}
            setGroups={setGroups}
            pricingData={pricingData}
            setPricingData={setPricingData}
            onBack={() => setStep(2)}
            onComplete={() => setStep(4)}
          />
        )}

        {/* Step 4: Cross-posting hub */}
        {step === 4 && (
          <CrossPostingHub
            groups={groups}
            pricingData={pricingData}
            onComplete={() => {
              // TODO: save all listings to database
              setStep(5);
            }}
          />
        )}

        {/* Step 5: Done */}
        {step === 5 && (
          <CompletionStep itemCount={groups.length} onListAnother={resetAll} />
        )}
      </div>
    </AppLayout>
  );
};

export default NewListing;
