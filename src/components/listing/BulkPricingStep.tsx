import { Button } from "@/components/ui/button";
import type { ItemGroup } from "./KanbanBoard";

export interface ItemPricing {
  groupId: string;
  recommended: number;
  min: number;
  max: number;
  confidence: number;
  daysToSell: number;
  sampleCount: number;
}

interface BulkPricingStepProps {
  groups: ItemGroup[];
  pricingData: ItemPricing[];
  onContinue: () => void;
}

const BulkPricingStep = ({ groups, pricingData, onContinue }: BulkPricingStepProps) => {
  const totalValue = pricingData.reduce((sum, p) => sum + p.recommended, 0);

  return (
    <div>
      <h2 className="text-3xl font-black tracking-tight text-foreground mb-2">Pricing Intelligence</h2>
      <p className="text-muted-foreground mb-8">Based on similar items in your area.</p>

      {/* Summary card */}
      <div className="bg-card border border-border rounded-lg p-8 mb-8 text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          Total Estimated Value
        </p>
        <p className="text-5xl font-black text-primary">${totalValue.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground mt-2">{groups.length} items</p>
      </div>

      {/* Individual items */}
      <div className="flex flex-col gap-4 mb-8">
        {groups.map((group) => {
          const pricing = pricingData.find((p) => p.groupId === group.id);
          if (!pricing) return null;

          return (
            <div key={group.id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                {group.photos[0] && (
                  <img
                    src={group.photos[0]}
                    alt={group.title}
                    className="w-14 h-14 rounded-lg object-cover border border-border"
                  />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{group.title}</p>
                  <p className="text-xs text-muted-foreground">{group.category} · {group.condition}</p>
                </div>
                <p className="text-3xl font-black text-primary">${pricing.recommended}</p>
              </div>

              {/* Price range */}
              <div className="mb-4">
                <div className="relative h-1.5 bg-accent rounded-full">
                  <div className="absolute h-1.5 bg-primary/20 rounded-full" style={{ left: "0%", width: "100%" }} />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full border-2 border-primary-foreground shadow-sm"
                    style={{
                      left: `${((pricing.recommended - pricing.min) / (pricing.max - pricing.min)) * 100}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground">${pricing.min}</span>
                  <span className="text-[10px] text-muted-foreground">${pricing.max}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6 text-center">
                <div>
                  <p className="text-sm font-bold text-foreground">{pricing.confidence}%</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Confidence</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">~{pricing.daysToSell}d</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Est. to sell</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{pricing.sampleCount}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Samples</p>
                </div>
              </div>

              {pricing.confidence < 80 && (
                <p className="text-xs text-muted-foreground italic mt-3">
                  We're still learning prices in your area.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <Button onClick={onContinue} className="w-full rounded-lg" size="lg">
        Continue to Post
      </Button>
    </div>
  );
};

export default BulkPricingStep;
