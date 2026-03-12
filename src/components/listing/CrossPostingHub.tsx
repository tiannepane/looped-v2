import { useState } from "react";
import { Check, X, Chrome, ExternalLink, Home, Stamp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ItemGroup } from "./KanbanBoard";
import type { ItemPricing } from "./BulkPricingStep";

interface CrossPostingHubProps {
  groups: ItemGroup[];
  pricingData: ItemPricing[];
  onComplete: () => void;
}

interface PlatformStatus {
  [groupId: string]: boolean;
}

const POLAROID_ROTATIONS = [-4, 3, -2, 5, -3, 2];

const CrossPostingHub = ({ groups, pricingData, onComplete }: CrossPostingHubProps) => {
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [showBanner, setShowBanner] = useState(true);
  const [fbPosted, setFbPosted] = useState<PlatformStatus>({});
  const [kijijiPosted, setKijijiPosted] = useState<PlatformStatus>({});
  const [karrotPosted, setKarrotPosted] = useState<PlatformStatus>({});
  const [karrotUrls, setKarrotUrls] = useState<{ [groupId: string]: string }>({});

  const selectedGroup = groups[selectedItemIndex];
  const selectedPricing = pricingData.find((p) => p.groupId === selectedGroup?.id);

  const copyAndOpen = (url: string) => {
    if (!selectedGroup) return;
    const text = `${selectedGroup.title}\n$${selectedPricing?.recommended ?? 0}\n\n${selectedGroup.description}`;
    navigator.clipboard.writeText(text);
    window.open(url, "_blank");
  };

  // Build ticker items
  const getItemStatus = (group: ItemGroup) => {
    const statuses: string[] = [];
    const shortTitle = group.title.split(" ").slice(0, 2).join(" ");
    if (fbPosted[group.id]) statuses.push(`${shortTitle}: FB Listed`);
    else statuses.push(`${shortTitle}: FB Ready`);
    if (kijijiPosted[group.id]) statuses.push(`${shortTitle}: Kijiji Listed`);
    else statuses.push(`${shortTitle}: Kijiji Pending`);
    if (karrotPosted[group.id]) statuses.push(`${shortTitle}: Karrot Listed`);
    else statuses.push(`${shortTitle}: Karrot Ready`);
    return statuses;
  };

  const tickerItems = groups.flatMap(getItemStatus);
  const totalPosted = Object.values(fbPosted).filter(Boolean).length +
    Object.values(kijijiPosted).filter(Boolean).length +
    Object.values(karrotPosted).filter(Boolean).length;

  return (
    <div className="relative pb-32">
      {/* Chrome Extension Sticky Note — pinned top right */}
      {showBanner && (
        <div
          className="absolute -top-2 right-0 w-56 bg-mustard/30 rounded-lg shadow-md p-4 z-30"
          style={{ transform: "rotate(3deg)" }}
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-mustard/50 rounded-sm" style={{ transform: "rotate(-2deg)" }} />
          <button
            onClick={() => setShowBanner(false)}
            className="absolute top-2 right-2 text-foreground/30 hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Chrome className="w-5 h-5 text-foreground/60" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wide">Chrome</span>
          </div>
          <p className="text-sm font-bold text-foreground leading-snug" style={{ fontFamily: "'Gaegu', cursive" }}>
            The Auto-fill Extension. Coming soon for pro-sellers.
          </p>
        </div>
      )}

      {/* Title */}
      <div className="mb-8 pr-60">
        <h2
          className="text-5xl font-black tracking-tighter text-foreground uppercase leading-[0.95] mb-2"
        >
          THE FINAL<br />PUSH
        </h2>
        <p className="text-muted-foreground/60 text-lg" style={{ fontFamily: "'Gaegu', cursive" }}>
          Almost there! Get that cash. 💸
        </p>
      </div>

      {/* Feature Selection — Polaroid Row */}
      <div className="flex gap-4 overflow-x-auto pb-6 mb-10">
        {groups.map((group, i) => {
          const pricing = pricingData.find((p) => p.groupId === group.id);
          const isSelected = i === selectedItemIndex;

          return (
            <button
              key={group.id}
              onClick={() => setSelectedItemIndex(i)}
              className={`flex-shrink-0 bg-white p-1.5 pb-8 rounded-sm transition-all duration-300 cursor-pointer relative
                ${isSelected ? "scale-110 shadow-xl z-10" : "shadow-md hover:-translate-y-1 hover:shadow-lg"}
              `}
            >
              {group.photos[0] ? (
                <img src={group.photos[0]} alt={group.title} className="w-24 h-24 object-cover" />
              ) : (
                <div className="w-24 h-24 bg-accent flex items-center justify-center text-2xl">📦</div>
              )}
              <div className="absolute bottom-1 left-0 right-0 px-2 text-center">
                <p className={`text-[10px] font-bold truncate ${isSelected ? "text-foreground" : "text-foreground/70"}`}>
                  {isSelected && (
                    <span className="absolute inset-x-1 bottom-3 h-3 bg-primary/20 rounded-sm -z-10" />
                  )}
                  {group.title}
                </p>
                <p className="text-[10px] font-bold text-primary">${pricing?.recommended ?? 0}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Platform sticky note cards */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        {/* Facebook */}
        <div
          className="rounded-xl p-6 relative"
          style={{
            background: "hsl(38, 20%, 93%)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-4 bg-foreground/[0.06] rounded-sm" />
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
              style={{ backgroundColor: "#1877F2" }}
            >
              <span className="text-white text-lg font-black">f</span>
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">Facebook Marketplace</h3>
              <p className="text-[10px] text-muted-foreground">Largest audience in Toronto</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mb-4">
            {fbPosted[selectedGroup?.id] ? (
              <>
                <Check className="w-3.5 h-3.5 text-success" />
                <span className="text-xs font-medium" style={{ color: "hsl(var(--success))" }}>Posted</span>
              </>
            ) : (
              <span className="text-[10px] text-muted-foreground italic" style={{ fontFamily: "'Gaegu', cursive" }}>Ready to go</span>
            )}
          </div>
          <Button
            className="w-full rounded-full font-bold text-xs uppercase tracking-wide bg-foreground text-background hover:bg-foreground/90"
            onClick={() => {
              copyAndOpen("https://facebook.com/marketplace/create");
              setFbPosted((prev) => ({ ...prev, [selectedGroup.id]: true }));
            }}
          >
            PUSH TO FACEBOOK
          </Button>
          <p className="text-[10px] text-muted-foreground mt-3 italic">
            Tip: Select photos from recent downloads.
          </p>
        </div>

        {/* Kijiji */}
        <div
          className="rounded-xl p-6 relative"
          style={{
            background: "hsl(38, 20%, 93%)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-4 bg-foreground/[0.06] rounded-sm" />
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
              style={{ backgroundColor: "#7B68EE" }}
            >
              <span className="text-white text-lg font-black">K</span>
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">Kijiji</h3>
              <p className="text-[10px] text-muted-foreground">Canada's #1 marketplace</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mb-4">
            {kijijiPosted[selectedGroup?.id] ? (
              <>
                <Check className="w-3.5 h-3.5 text-success" />
                <span className="text-xs font-medium" style={{ color: "hsl(var(--success))" }}>Posted</span>
              </>
            ) : (
              <span className="text-[10px] text-muted-foreground italic" style={{ fontFamily: "'Gaegu', cursive" }}>Ready to go</span>
            )}
          </div>
          <Button
            className="w-full rounded-full font-bold text-xs uppercase tracking-wide bg-foreground text-background hover:bg-foreground/90"
            onClick={() => {
              copyAndOpen("https://www.kijiji.ca/p-post-ad.html");
              setKijijiPosted((prev) => ({ ...prev, [selectedGroup.id]: true }));
            }}
          >
            PUSH TO KIJIJI
          </Button>
          <p className="text-[10px] text-muted-foreground mt-3 italic">
            Tip: Paste title & description into matching fields.
          </p>
        </div>

        {/* Karrot */}
        <div
          className="bg-card rounded-2xl p-6 backdrop-blur-md relative"
          style={{
            transform: "rotate(-0.5deg)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06), 3px 5px 0 hsl(30, 30%, 85%)",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md"
              style={{ backgroundColor: "#FF6F0F", boxShadow: "2px 3px 0 rgba(0,0,0,0.15)" }}
            >
              <span className="text-lg">🥕</span>
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">Karrot</h3>
              <p className="text-[10px] text-muted-foreground">Best for neighborhoods</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mb-4">
            {karrotPosted[selectedGroup?.id] ? (
              <>
                <Check className="w-3.5 h-3.5 text-success" />
                <span className="text-xs font-medium" style={{ color: "hsl(var(--success))" }}>Posted</span>
              </>
            ) : (
              <span className="text-[10px] text-muted-foreground italic" style={{ fontFamily: "'Gaegu', cursive" }}>Ready to go</span>
            )}
          </div>
          <Button
            className="w-full rounded-full font-bold text-xs uppercase tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 mb-4"
            style={{ boxShadow: "0 3px 12px hsl(18, 60%, 50%, 0.3)" }}
            onClick={() => {
              copyAndOpen("https://www.karrotmarket.com");
              setKarrotPosted((prev) => ({ ...prev, [selectedGroup.id]: true }));
            }}
          >
            PUSH TO KARROT
          </Button>

          {/* Import — handwritten underline style */}
          <div className="border-t border-foreground/[0.06] pt-3">
            <div className="relative inline-block mb-2">
              <div className="absolute -top-1 -left-1 w-16 h-4 bg-primary/20 rounded-sm" style={{ transform: "rotate(-1deg)" }} />
              <p className="text-[10px] font-bold text-foreground relative z-10" style={{ fontFamily: "'Gaegu', cursive" }}>
                Paste FB Link Here
              </p>
            </div>
            <div className="flex gap-2 items-end">
              <input
                placeholder="facebook.com/marketplace/item/..."
                value={karrotUrls[selectedGroup?.id] || ""}
                onChange={(e) =>
                  setKarrotUrls((prev) => ({ ...prev, [selectedGroup.id]: e.target.value }))
                }
                className="flex-1 text-sm bg-transparent border-0 border-b border-foreground/20 rounded-none px-0 py-1 outline-none focus:border-foreground/50 transition-colors text-foreground"
                style={{ fontFamily: "'Gaegu', cursive" }}
              />
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-xs h-7 px-3 bg-foreground/5 hover:bg-foreground/10"
                disabled={!karrotUrls[selectedGroup?.id]}
              >
                Import
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon — subtle */}
      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 mb-3">Coming Soon</p>
        <div className="flex gap-6">
          {[
            { letter: "VS", bg: "#E0F2F1", color: "#00897B", name: "VarageSale" },
            { letter: "N", bg: "#E8F5E9", color: "#00B246", name: "Nextdoor" },
            { letter: "f+", bg: "#E3F2FD", color: "#1877F2", name: "FB Groups" },
          ].map((p) => (
            <div key={p.name} className="flex items-center gap-2 opacity-40">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: p.bg, color: p.color }}>
                {p.letter}
              </div>
              <span className="text-xs text-muted-foreground">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sales Ticker — dusty rose strip */}
      <div className="rounded-xl overflow-hidden mb-6" style={{ backgroundColor: "hsl(var(--dusty-rose) / 0.15)" }}>
        <div className="py-2.5 px-4 flex items-center overflow-hidden">
          <div className="flex gap-4 animate-[ticker_20s_linear_infinite] whitespace-nowrap">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="text-xs font-medium text-foreground/60">
                [{item}]
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Margin note */}
      <p className="text-muted-foreground/40 text-sm mb-4 italic" style={{ fontFamily: "'Gaegu', cursive" }}>
        {totalPosted > 0 ? `${totalPosted} listing${totalPosted !== 1 ? "s" : ""} pushed so far. Keep going!` : "Select an item above, then push to each platform."}
      </p>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-lg font-bold text-foreground">
            {groups.length} items · {totalPosted}/{groups.length * 3} platforms done
          </p>
          <Button
            onClick={onComplete}
            className="rounded-full px-12 h-14 text-xl font-black uppercase tracking-tight bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            style={{
              fontFamily: "'Gaegu', cursive",
              boxShadow: "0 6px 24px hsl(18, 60%, 50%, 0.4), inset 0 1px 0 hsl(18, 60%, 70%)",
            }}
          >
            STAMP IT DONE ✓
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CrossPostingHub;
