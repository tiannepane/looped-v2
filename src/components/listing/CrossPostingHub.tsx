import { useState } from "react";
import { Check, X, Chrome, ExternalLink, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const CrossPostingHub = ({ groups, pricingData, onComplete }: CrossPostingHubProps) => {
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [showBanner, setShowBanner] = useState(true);
  const [fbPosted, setFbPosted] = useState<PlatformStatus>({});
  const [kijijiPosted, setKijijiPosted] = useState<PlatformStatus>({});
  const [karrotPosted, setKarrotPosted] = useState<PlatformStatus>({});
  const [karrotUrls, setKarrotUrls] = useState<{ [groupId: string]: string }>({});
  const [allDone, setAllDone] = useState(false);

  const selectedGroup = groups[selectedItemIndex];
  const selectedPricing = pricingData.find((p) => p.groupId === selectedGroup?.id);

  const fbCount = Object.values(fbPosted).filter(Boolean).length;
  const kijijiCount = Object.values(kijijiPosted).filter(Boolean).length;
  const karrotCount = Object.values(karrotPosted).filter(Boolean).length;

  const copyAndOpen = (url: string) => {
    if (!selectedGroup) return;
    const text = `${selectedGroup.title}\n$${selectedPricing?.recommended ?? 0}\n\n${selectedGroup.description}`;
    navigator.clipboard.writeText(text);
    window.open(url, "_blank");
  };

  // Platform icon components
  const FacebookIcon = () => (
    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: "#1877F2" }}>
      <span className="text-white text-lg font-black">f</span>
    </div>
  );

  const KijijiIcon = () => (
    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#7B68EE" }}>
      <span className="text-white text-lg font-black">K</span>
    </div>
  );

  const KarrotIcon = () => (
    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FF6F0F" }}>
      <span className="text-lg">🥕</span>
    </div>
  );

  const VarageSaleIcon = () => (
    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-teal-100">
      <span className="text-teal-600 text-xs font-black">VS</span>
    </div>
  );

  const NextdoorIcon = () => (
    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#00B246" }}>
      <Home className="w-5 h-5 text-white" />
    </div>
  );

  const FBGroupsIcon = () => (
    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#1877F2" }}>
      <span className="text-white text-[10px] font-bold leading-tight text-center">f<br />grp</span>
    </div>
  );

  return (
    <div>
      {/* Chrome Extension Banner */}
      {showBanner && (
        <div className="mb-8 rounded-lg border border-border bg-gradient-to-r from-background to-card p-4 flex items-center gap-4">
          <Chrome className="w-8 h-8 text-foreground flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-foreground text-sm">Looped Chrome Extension</p>
            <p className="text-xs text-muted-foreground">
              Auto-fill your listings on Facebook and Kijiji. No more copy-pasting.
            </p>
          </div>
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-foreground/10 text-foreground flex-shrink-0">
            Coming Soon
          </span>
          <button
            onClick={() => setShowBanner(false)}
            className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <h2 className="text-3xl font-black tracking-tight text-foreground mb-2">Post Everywhere</h2>
      <p className="text-muted-foreground mb-8">Get your listings out there, one by one.</p>

      {/* Item selector row */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-8">
        {groups.map((group, i) => {
          const pricing = pricingData.find((p) => p.groupId === group.id);
          return (
            <button
              key={group.id}
              onClick={() => setSelectedItemIndex(i)}
              className={`flex items-center gap-3 p-3 rounded-lg border min-w-[200px] flex-shrink-0 transition-all duration-300 hover:scale-[1.02] ${
                i === selectedItemIndex
                  ? "border-primary bg-card shadow-md"
                  : "border-border bg-card/50"
              }`}
            >
              {group.photos[0] && (
                <img
                  src={group.photos[0]}
                  alt={group.title}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              )}
              <div className="text-left">
                <p className="text-xs font-semibold text-foreground truncate max-w-[120px]">{group.title}</p>
                <p className="text-xs text-primary font-bold">${pricing?.recommended ?? 0}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Platform cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Facebook */}
        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <FacebookIcon />
            <div>
              <h3 className="font-bold text-foreground text-sm">Facebook Marketplace</h3>
              <p className="text-xs text-muted-foreground">Largest audience in Toronto</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mb-4">
            {fbPosted[selectedGroup?.id] ? (
              <>
                <Check className="w-3.5 h-3.5 text-success" />
                <span className="text-xs text-success font-medium">Posted</span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">Ready to post</span>
            )}
          </div>
          <Button
            variant="outline"
            className="w-full rounded-lg text-xs mb-3"
            onClick={() => {
              copyAndOpen("https://facebook.com/marketplace/create");
              setFbPosted((prev) => ({ ...prev, [selectedGroup.id]: true }));
            }}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Copy & Open Facebook
          </Button>
          <p className="text-[10px] text-muted-foreground">
            Tip: Your photos are saved. Select them from recent downloads on Facebook.
          </p>
        </div>

        {/* Kijiji */}
        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <KijijiIcon />
            <div>
              <h3 className="font-bold text-foreground text-sm">Kijiji</h3>
              <p className="text-xs text-muted-foreground">Canada's #1 marketplace</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mb-4">
            {kijijiPosted[selectedGroup?.id] ? (
              <>
                <Check className="w-3.5 h-3.5 text-success" />
                <span className="text-xs text-success font-medium">Posted</span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">Ready to post</span>
            )}
          </div>
          <Button
            variant="outline"
            className="w-full rounded-lg text-xs mb-3"
            onClick={() => {
              copyAndOpen("https://www.kijiji.ca/p-post-ad.html");
              setKijijiPosted((prev) => ({ ...prev, [selectedGroup.id]: true }));
            }}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Copy & Open Kijiji
          </Button>
          <p className="text-[10px] text-muted-foreground">
            Tip: Paste your title and description into the matching fields.
          </p>
        </div>

        {/* Karrot */}
        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <KarrotIcon />
            <div>
              <h3 className="font-bold text-foreground text-sm">Karrot</h3>
              <p className="text-xs text-muted-foreground">Best for neighborhoods</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mb-4">
            {karrotPosted[selectedGroup?.id] ? (
              <>
                <Check className="w-3.5 h-3.5 text-success" />
                <span className="text-xs text-success font-medium">Posted</span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">Ready to post</span>
            )}
          </div>
          <Button
            variant="outline"
            className="w-full rounded-lg text-xs mb-3"
            onClick={() => {
              copyAndOpen("https://www.karrotmarket.com");
              setKarrotPosted((prev) => ({ ...prev, [selectedGroup.id]: true }));
            }}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Copy & Open Karrot
          </Button>
          <div className="border-t border-border pt-3 mt-3">
            <p className="text-[10px] text-muted-foreground mb-2">Or import from Facebook:</p>
            <div className="flex gap-2">
              <Input
                placeholder="Paste FB listing URL"
                value={karrotUrls[selectedGroup?.id] || ""}
                onChange={(e) =>
                  setKarrotUrls((prev) => ({ ...prev, [selectedGroup.id]: e.target.value }))
                }
                className="text-xs h-8 bg-background"
              />
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg text-xs h-8 flex-shrink-0"
                disabled={!karrotUrls[selectedGroup?.id]}
              >
                Import
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Karrot can import your Facebook listing automatically, including photos, title, and price.
            </p>
          </div>
        </div>
      </div>

      {/* Posting progress */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <h3 className="font-bold text-foreground text-sm mb-4">Posting Progress</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Facebook", count: fbCount, icon: <FacebookIcon /> },
            { label: "Kijiji", count: kijijiCount, icon: <KijijiIcon /> },
            { label: "Karrot", count: karrotCount, icon: <KarrotIcon /> },
          ].map((platform) => (
            <div key={platform.label} className="flex items-center gap-3">
              <div className="scale-75 origin-left">{platform.icon}</div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{platform.label}</span>
                  <span className="text-xs font-medium text-foreground">
                    {platform.count}/{groups.length}
                  </span>
                </div>
                <div className="h-1.5 bg-accent rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${groups.length > 0 ? (platform.count / groups.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon platforms */}
      <div className="bg-accent/50 rounded-lg p-6 mb-8">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Coming Soon</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: <VarageSaleIcon />, name: "VarageSale", subtitle: "Toronto neighborhoods" },
            { icon: <NextdoorIcon />, name: "Nextdoor", subtitle: "Your local community" },
            { icon: <FBGroupsIcon />, name: "FB Buy & Sell Groups", subtitle: "Toronto-specific groups" },
          ].map((p) => (
            <div key={p.name} className="flex items-center gap-3 opacity-50">
              {p.icon}
              <div>
                <p className="text-xs font-semibold text-foreground">{p.name}</p>
                <p className="text-[10px] text-muted-foreground">{p.subtitle}</p>
              </div>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-accent text-muted-foreground font-medium">
                Soon
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Want us to add another platform?{" "}
          <a href="/account" className="text-primary hover:underline">
            Let us know
          </a>
        </p>
      </div>

      {/* Finish */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="checkbox"
          checked={allDone}
          onChange={(e) => setAllDone(e.target.checked)}
          className="w-4 h-4 accent-primary"
          id="all-done-check"
        />
        <label htmlFor="all-done-check" className="text-sm text-foreground">
          I've finished posting all items
        </label>
      </div>

      <Button onClick={onComplete} className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90 font-bold" style={{ fontFamily: "'Gaegu', cursive" }} size="lg" disabled={!allDone}>
        Complete
      </Button>
    </div>
  );
};

export default CrossPostingHub;
