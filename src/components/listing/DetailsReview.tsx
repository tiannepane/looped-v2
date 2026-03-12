import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ItemGroup } from "./KanbanBoard";
import type { ItemPricing } from "./BulkPricingStep";

const CATEGORIES = [
  "Furniture", "Electronics", "Clothing & Shoes", "Home Decor",
  "Sports & Outdoors", "Books & Media", "Toys & Games",
  "Kitchen & Dining", "Tools & Hardware", "Other",
];

const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"];

interface DetailsReviewProps {
  groups: ItemGroup[];
  setGroups: React.Dispatch<React.SetStateAction<ItemGroup[]>>;
  pricingData: ItemPricing[];
  setPricingData: React.Dispatch<React.SetStateAction<ItemPricing[]>>;
  onBack: () => void;
  onComplete: () => void;
}

const DetailsReview = ({
  groups,
  setGroups,
  pricingData,
  setPricingData,
  onBack,
  onComplete,
}: DetailsReviewProps) => {
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);

  const totalValue = pricingData.reduce((sum, p) => sum + p.recommended, 0);

  const handleFieldChange = (groupId: string, field: string, value: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, [field]: value, editedFields: new Set(g.editedFields).add(field) }
          : g
      )
    );
  };

  const handlePriceChange = (groupId: string, newPrice: number) => {
    setPricingData((prev) =>
      prev.map((p) => (p.groupId === groupId ? { ...p, recommended: newPrice } : p))
    );
  };

  const AiBadge = ({ groupId, field }: { groupId: string; field: string }) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group || group.editedFields.has(field)) return null;
    return (
      <span className="text-[9px] italic text-muted-foreground/50 font-normal transition-opacity duration-300">
        ai
      </span>
    );
  };

  return (
    <div className="pb-28">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Review Your Listings
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Edit anything. Adjust prices. Then post everywhere.
          </p>
        </div>
        <p className="text-xl font-bold text-primary whitespace-nowrap mt-1">
          Total: ${totalValue.toLocaleString()}
        </p>
      </div>

      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Photo Wall
      </button>

      {/* Item sections */}
      {groups.map((group, idx) => {
        const pricing = pricingData.find((p) => p.groupId === group.id);
        if (!pricing) return null;

        return (
          <section
            key={group.id}
            className={`py-12 ${idx > 0 ? "border-t border-border/50" : ""}`}
          >
            <div className="flex gap-10">
              {/* Left column: photos */}
              <div className="w-1/2 flex-shrink-0">
                {/* Editable title */}
                <div className="mb-5">
                  {editingTitleId === group.id ? (
                    <Input
                      value={group.title}
                      onChange={(e) => handleFieldChange(group.id, "title", e.target.value)}
                      onBlur={() => setEditingTitleId(null)}
                      onKeyDown={(e) => e.key === "Enter" && setEditingTitleId(null)}
                      autoFocus
                      className="text-2xl font-bold tracking-tight border-none p-0 h-auto bg-transparent focus-visible:ring-0 text-foreground"
                    />
                  ) : (
                    <h3
                      className="text-2xl font-bold tracking-tight text-foreground cursor-text hover:text-primary transition-colors duration-200"
                      onClick={() => setEditingTitleId(group.id)}
                    >
                      {group.title}
                    </h3>
                  )}
                </div>

                {/* Cover photo */}
                {group.photos[0] && (
                  <div className="relative mb-3">
                    <img
                      src={group.photos[0]}
                      alt={group.title}
                      className="w-full aspect-[4/3] object-cover rounded-lg"
                    />
                    <span className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm text-foreground text-[10px] font-medium uppercase tracking-widest px-2.5 py-1 rounded-full">
                      Cover
                    </span>
                  </div>
                )}

                {/* Thumbnail row */}
                {group.photos.length > 1 && (
                  <div className="flex gap-2 flex-wrap">
                    {group.photos.slice(1).map((photo, i) => (
                      <img
                        key={i}
                        src={photo}
                        alt={`${group.title} ${i + 2}`}
                        className="w-20 h-20 rounded-lg object-cover border border-border/40 hover:ring-2 hover:ring-primary/30 transition-all"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right column: details + pricing */}
              <div className="flex-1 space-y-6">
                {/* Category */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <label className="text-xs uppercase tracking-widest text-muted-foreground">
                      Category
                    </label>
                    <AiBadge groupId={group.id} field="category" />
                  </div>
                  <Select
                    value={group.category}
                    onValueChange={(v) => handleFieldChange(group.id, "category", v)}
                  >
                    <SelectTrigger className="text-sm h-9 bg-transparent border-border/30 focus:border-primary hover:border-border transition-colors">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Condition */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <label className="text-xs uppercase tracking-widest text-muted-foreground">
                      Condition
                    </label>
                    <AiBadge groupId={group.id} field="condition" />
                  </div>
                  <Select
                    value={group.condition}
                    onValueChange={(v) => handleFieldChange(group.id, "condition", v)}
                  >
                    <SelectTrigger className="text-sm h-9 bg-transparent border-border/30 focus:border-primary hover:border-border transition-colors">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITIONS.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Size */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <label className="text-xs uppercase tracking-widest text-muted-foreground">
                      Size
                    </label>
                    <AiBadge groupId={group.id} field="size" />
                  </div>
                  <Input
                    value={group.size}
                    onChange={(e) => handleFieldChange(group.id, "size", e.target.value)}
                    className="text-sm h-9 bg-transparent border-border/30 focus-visible:border-primary hover:border-border transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <label className="text-xs uppercase tracking-widest text-muted-foreground">
                      Description
                    </label>
                    <AiBadge groupId={group.id} field="description" />
                  </div>
                  <Textarea
                    value={group.description}
                    onChange={(e) => handleFieldChange(group.id, "description", e.target.value)}
                    className="text-sm bg-transparent border-border/30 focus-visible:border-primary hover:border-border transition-colors min-h-[100px] resize-none"
                  />
                </div>

                {/* Separator */}
                <div className="border-t border-border/30" />

                {/* Pricing section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <label className="text-xs uppercase tracking-widest text-muted-foreground">
                      Suggested Price
                    </label>
                    <AiBadge groupId={group.id} field="price" />
                  </div>

                  <p className="text-4xl font-bold text-primary mb-4">
                    ${pricing.recommended}
                  </p>

                  {/* Price slider */}
                  <div className="mb-2">
                    <Slider
                      value={[pricing.recommended]}
                      min={pricing.min}
                      max={pricing.max}
                      step={1}
                      onValueChange={(val) => handlePriceChange(group.id, val[0])}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-xs text-muted-foreground">
                      Quick Sale · ${pricing.min}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Max Value · ${pricing.max}
                    </span>
                  </div>

                  {/* Stats */}
                  <p className="text-sm text-muted-foreground">
                    {pricing.confidence}% confidence · {pricing.sampleCount} local sales · avg {pricing.daysToSell} days to sell
                  </p>

                  {pricing.confidence < 80 && (
                    <p className="text-xs italic text-muted-foreground/70 mt-1">
                      Still learning prices in your area
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">
            {groups.length} items · Total:{" "}
            <span className="text-primary font-bold">
              ${totalValue.toLocaleString()}
            </span>
          </p>
          <Button
            onClick={onComplete}
            className="rounded-xl px-8 h-11 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg gap-2"
          >
            Post to Platforms <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DetailsReview;
