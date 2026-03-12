import { useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const POLAROID_ROTATIONS = [-5, 3, -2, 6, -4, 2];

interface DetailsReviewProps {
  groups: ItemGroup[];
  setGroups: React.Dispatch<React.SetStateAction<ItemGroup[]>>;
  pricingData: ItemPricing[];
  setPricingData: React.Dispatch<React.SetStateAction<ItemPricing[]>>;
  onBack: () => void;
  onComplete: () => void;
}

/** Slider comment based on position */
const getSliderComment = (price: number, min: number, max: number) => {
  const pct = (price - min) / (max - min);
  if (pct < 0.33) return { text: "Priced to fly! ⚡️", align: "left" };
  if (pct < 0.66) return { text: "The Toronto Sweet Spot 🎯", align: "center" };
  return { text: "Worth the wait 💰", align: "right" };
};

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

  const AiHighlight = ({ groupId, field }: { groupId: string; field: string }) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group || group.editedFields.has(field)) return null;
    return (
      <Sparkles className="w-3 h-3 text-primary inline-block ml-1" />
    );
  };

  return (
    <div className="pb-28">
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Review Your Listings
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Edit anything. Adjust prices. Then post everywhere.
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

        const sliderPct = ((pricing.recommended - pricing.min) / (pricing.max - pricing.min)) * 100;
        const comment = getSliderComment(pricing.recommended, pricing.min, pricing.max);

        return (
          <section
            key={group.id}
            className={`py-16 ${idx > 0 ? "border-t border-border/30" : ""}`}
          >
            {/* Asymmetric layout: 60/40 */}
            <div className="flex gap-10">
              {/* Left column: photos — 60% */}
              <div className="w-[60%] flex-shrink-0 relative">
                {/* Overlapping title */}
                <div className="relative z-10 mb-[-1.2rem]">
                  {editingTitleId === group.id ? (
                    <Input
                      value={group.title}
                      onChange={(e) => handleFieldChange(group.id, "title", e.target.value)}
                      onBlur={() => setEditingTitleId(null)}
                      onKeyDown={(e) => e.key === "Enter" && setEditingTitleId(null)}
                      autoFocus
                      className="text-5xl font-black tracking-tighter border-none p-0 h-auto bg-transparent focus-visible:ring-0 text-foreground uppercase"
                    />
                  ) : (
                    <h3
                      className="text-5xl font-black tracking-tighter text-foreground cursor-text hover:text-foreground/80 transition-colors duration-200 uppercase leading-[0.95]"
                      onClick={() => setEditingTitleId(group.id)}
                    >
                      {group.title}
                    </h3>
                  )}
                </div>

                {/* Main photo — physical print style */}
                {group.photos[0] && (
                  <div className="relative">
                    <img
                      src={group.photos[0]}
                      alt={group.title}
                      className="w-full aspect-[4/3] object-cover rounded-lg ring-8 ring-white"
                      style={{
                        boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 2px 10px rgba(0,0,0,0.06)",
                      }}
                    />
                  </div>
                )}

                {/* Polaroid thumbnails — fanned out */}
                {group.photos.length > 1 && (
                  <div className="flex gap-3 mt-6 ml-2">
                    {group.photos.slice(1).map((photo, i) => (
                      <div
                        key={i}
                        className="bg-white p-1.5 pb-6 rounded-sm shadow-md hover:-translate-y-2 hover:shadow-lg transition-all duration-200 cursor-pointer"
                        style={{
                          transform: `rotate(${POLAROID_ROTATIONS[i % POLAROID_ROTATIONS.length]}deg)`,
                        }}
                      >
                        <img
                          src={photo}
                          alt={`${group.title} ${i + 2}`}
                          className="w-20 h-20 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right column: details + pricing — 40% */}
              <div className="flex-1 space-y-5 pt-16">
                {/* Category — margin note style */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1">
                    Category <AiHighlight groupId={group.id} field="category" />
                  </label>
                  <Select
                    value={group.category}
                    onValueChange={(v) => handleFieldChange(group.id, "category", v)}
                  >
                    <SelectTrigger className="text-sm h-9 bg-transparent border-0 border-b border-foreground/15 rounded-none px-0 focus:ring-0 focus:border-foreground/40 hover:border-foreground/30 transition-colors shadow-none">
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
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1">
                    Condition <AiHighlight groupId={group.id} field="condition" />
                  </label>
                  <Select
                    value={group.condition}
                    onValueChange={(v) => handleFieldChange(group.id, "condition", v)}
                  >
                    <SelectTrigger className="text-sm h-9 bg-transparent border-0 border-b border-foreground/15 rounded-none px-0 focus:ring-0 focus:border-foreground/40 hover:border-foreground/30 transition-colors shadow-none">
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
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1">
                    Size <AiHighlight groupId={group.id} field="size" />
                  </label>
                  <Input
                    value={group.size}
                    onChange={(e) => handleFieldChange(group.id, "size", e.target.value)}
                    className="text-sm h-9 bg-transparent border-0 border-b border-foreground/15 rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground/40 hover:border-foreground/30 transition-colors shadow-none"
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1">
                    Postal Code (FSA) <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={group.postalCode || ""}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().slice(0, 3);
                      handleFieldChange(group.id, "postalCode", val);
                    }}
                    placeholder="e.g. M5V"
                    maxLength={3}
                    className="text-sm h-9 bg-transparent border-0 border-b border-foreground/15 rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground/40 hover:border-foreground/30 transition-colors shadow-none w-24"
                  />
                </div>

                {/* Description — sticky note style */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1">
                    Description <AiHighlight groupId={group.id} field="description" />
                  </label>
                  <div className="relative mt-1.5">
                    <div className="absolute -top-1.5 left-4 w-10 h-3 bg-mustard/40 rounded-sm z-10" style={{ transform: "rotate(-2deg)" }} />
                    <Textarea
                      value={group.description}
                      onChange={(e) => handleFieldChange(group.id, "description", e.target.value)}
                      className="text-sm bg-sage/10 border-0 rounded-lg px-4 pt-4 pb-3 focus-visible:ring-0 min-h-[100px] resize-none shadow-none"
                    />
                  </div>
                </div>

                {/* ===== PRICING STUDIO ===== */}
                <div className="relative mt-8 pt-6">
                  {/* Confidence tape */}
                  <div
                    className="absolute -top-1 -right-2 bg-mustard/50 px-3 py-1 rounded-sm z-20 shadow-sm"
                    style={{ transform: "rotate(2deg)" }}
                  >
                    <span className="text-[10px] font-bold text-foreground">
                      {pricing.confidence}% confidence
                    </span>
                  </div>

                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-2">
                    Suggested Price
                  </label>

                  {/* Massive terracotta price */}
                  <p className="text-7xl font-black text-primary leading-none mb-6 tracking-tight">
                    ${pricing.recommended}
                  </p>

                  {/* Handwritten slider comment */}
                  <div className="relative h-8 mb-1">
                    <p
                      key={comment.text}
                      className="absolute text-lg text-foreground/70 animate-fade-in whitespace-nowrap"
                      style={{
                        fontFamily: "'Gaegu', cursive",
                        left: comment.align === "left" ? "0" : comment.align === "center" ? "50%" : undefined,
                        right: comment.align === "right" ? "0" : undefined,
                        transform: comment.align === "center" ? "translateX(-50%)" : undefined,
                      }}
                    >
                      {comment.text}
                    </p>
                  </div>

                  {/* Terracotta slider */}
                  <div className="mb-2">
                    <input
                      type="range"
                      min={pricing.min}
                      max={pricing.max}
                      value={pricing.recommended}
                      onChange={(e) => handlePriceChange(group.id, Number(e.target.value))}
                      className="pricing-slider w-full"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                      Quick Sale · ${pricing.min}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                      Max Value · ${pricing.max}
                    </span>
                  </div>

                  {/* Stats */}
                  <p className="text-xs text-muted-foreground mt-4">
                    {pricing.sampleCount} local sales · avg {pricing.daysToSell} days to sell
                  </p>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Sticky bottom bar — premium CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-lg font-bold text-foreground">
            Total:{" "}
            <span className="text-primary">
              ${totalValue.toLocaleString()}
            </span>
          </p>
          <Button
            onClick={onComplete}
            className="rounded-full px-10 h-12 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 gap-2 transition-all"
            style={{
              fontFamily: "'Gaegu', cursive",
              boxShadow: "0 4px 20px hsl(18, 60%, 50%, 0.35)",
            }}
          >
            Post to Platforms <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DetailsReview;
