import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ItemGroup } from "./KanbanBoard";
import type { ItemPricing } from "./BulkPricingStep";

const GROUP_COLORS = [
  { bg: "bg-amber-100", text: "text-amber-800" },
  { bg: "bg-emerald-50", text: "text-emerald-800" },
  { bg: "bg-slate-100", text: "text-slate-700" },
  { bg: "bg-rose-50", text: "text-rose-700" },
  { bg: "bg-violet-50", text: "text-violet-700" },
];

const UNGROUPED_COLOR = { bg: "bg-gray-100", text: "text-gray-500" };

interface PhotoWallProps {
  groups: ItemGroup[];
  setGroups: React.Dispatch<React.SetStateAction<ItemGroup[]>>;
  ungroupedPhotos: string[];
  setUngroupedPhotos: React.Dispatch<React.SetStateAction<string[]>>;
  pricingData: ItemPricing[];
  onContinue: () => void;
}

interface PhotoItem {
  src: string;
  groupId: string | null;
  groupIndex: number;
}

const PhotoWall = ({
  groups,
  setGroups,
  ungroupedPhotos,
  setUngroupedPhotos,
  pricingData,
  onContinue,
}: PhotoWallProps) => {
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [highlightedGroup, setHighlightedGroup] = useState<string | null>(null);

  // Build flat photo list with group info
  const allPhotos: PhotoItem[] = [];
  groups.forEach((g, gi) => {
    g.photos.forEach((src) => {
      allPhotos.push({ src, groupId: g.id, groupIndex: gi });
    });
  });
  ungroupedPhotos.forEach((src) => {
    allPhotos.push({ src, groupId: null, groupIndex: -1 });
  });

  const totalValue = pricingData.reduce((sum, p) => sum + p.recommended, 0);
  const ungroupedCount = ungroupedPhotos.length;

  const getGroupColor = (groupIndex: number) =>
    groupIndex >= 0 ? GROUP_COLORS[groupIndex % GROUP_COLORS.length] : UNGROUPED_COLOR;

  const getGroupLabel = (photo: PhotoItem) => {
    if (photo.groupId === null) return "Ungrouped";
    const group = groups.find((g) => g.id === photo.groupId);
    const pricing = pricingData.find((p) => p.groupId === photo.groupId);
    if (!group) return "Unknown";
    return `${group.title}${pricing ? ` · $${pricing.recommended}` : ""}`;
  };

  const toggleSelect = (src: string) => {
    setSelectedPhotos((prev) => {
      const next = new Set(prev);
      if (next.has(src)) next.delete(src);
      else next.add(src);
      return next;
    });
  };

  const clearSelection = () => setSelectedPhotos(new Set());

  const moveSelectedTo = (targetGroupId: string | "new") => {
    const selected = Array.from(selectedPhotos);

    if (targetGroupId === "new") {
      // TODO: create new item group via AI or manual
      const newId = `group-${Date.now()}`;
      const newGroup: ItemGroup = {
        id: newId,
        title: "New Item",
        category: "Other",
        condition: "Good",
        size: "",
        description: "",
        photos: selected,
        confirmed: false,
        rejected: false,
        editedFields: new Set(),
      };
      setGroups((prev) => {
        const updated = prev.map((g) => ({
          ...g,
          photos: g.photos.filter((p) => !selectedPhotos.has(p)),
        }));
        return [...updated, newGroup];
      });
    } else {
      setGroups((prev) =>
        prev.map((g) => {
          const withoutSelected = g.photos.filter((p) => !selectedPhotos.has(p));
          if (g.id === targetGroupId) {
            return { ...g, photos: [...withoutSelected, ...selected.filter((s) => !g.photos.includes(s) || selectedPhotos.has(s))] };
          }
          return { ...g, photos: withoutSelected };
        })
      );
    }

    setUngroupedPhotos((prev) => prev.filter((p) => !selectedPhotos.has(p)));
    clearSelection();
  };

  const isPhotoHighlighted = (photo: PhotoItem) => {
    if (!highlightedGroup) return true;
    if (highlightedGroup === "ungrouped") return photo.groupId === null;
    return photo.groupId === highlightedGroup;
  };

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            We found {groups.length} items worth{" "}
            <span className="text-primary">${totalValue.toLocaleString()}</span>{" "}
            in your {allPhotos.length} photos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Drag photos between groups to fix anything.
          </p>
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap mt-1">
          {groups.length} items{ungroupedCount > 0 && ` · ${ungroupedCount} ungrouped`}
        </span>
      </div>

      {/* Group pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setHighlightedGroup(null)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
            !highlightedGroup
              ? "bg-foreground text-background"
              : "bg-accent text-muted-foreground hover:bg-accent/80"
          }`}
        >
          All
        </button>
        {groups.map((g, i) => {
          const color = GROUP_COLORS[i % GROUP_COLORS.length];
          const pricing = pricingData.find((p) => p.groupId === g.id);
          return (
            <button
              key={g.id}
              onClick={() => setHighlightedGroup(highlightedGroup === g.id ? null : g.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 ${
                highlightedGroup === g.id
                  ? `${color.bg} ${color.text} ring-2 ring-primary/30`
                  : `${color.bg} ${color.text} hover:ring-1 hover:ring-border`
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${color.bg} border border-current opacity-60`} />
              {g.title}
              {pricing && <span className="opacity-70">· ${pricing.recommended}</span>}
              <span className="opacity-50">({g.photos.length})</span>
            </button>
          );
        })}
        {ungroupedCount > 0 && (
          <button
            onClick={() => setHighlightedGroup(highlightedGroup === "ungrouped" ? null : "ungrouped")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 ${
              highlightedGroup === "ungrouped"
                ? "bg-gray-100 text-gray-500 ring-2 ring-primary/30"
                : "bg-gray-100 text-gray-500 hover:ring-1 hover:ring-border"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-gray-300" />
            Ungrouped ({ungroupedCount})
          </button>
        )}
      </div>

      {/* Masonry photo grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
        {allPhotos.map((photo, i) => {
          const color = getGroupColor(photo.groupIndex);
          const isSelected = selectedPhotos.has(photo.src);
          const dimmed = !isPhotoHighlighted(photo);

          return (
            <div
              key={`${photo.src}-${i}`}
              className={`relative break-inside-avoid mb-3 group cursor-pointer transition-all duration-200 ${
                dimmed ? "opacity-30 scale-[0.98]" : "hover:scale-[1.02] hover:shadow-md"
              }`}
              onClick={() => toggleSelect(photo.src)}
            >
              <img
                src={photo.src}
                alt=""
                className={`w-full rounded-lg shadow-sm object-cover transition-all duration-200 ${
                  isSelected ? "ring-3 ring-primary" : ""
                }`}
              />

              {/* Selection checkmark */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}

              {/* Group label overlay */}
              <div
                className={`absolute bottom-2 left-2 rounded-full px-3 py-1 text-xs font-medium ${color.bg} ${color.text} shadow-sm`}
              >
                {getGroupLabel(photo)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating action bar */}
      {selectedPhotos.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card shadow-lg rounded-xl px-6 py-3 flex items-center gap-4 border border-border">
          <span className="text-sm font-medium text-foreground">
            {selectedPhotos.size} photo{selectedPhotos.size !== 1 ? "s" : ""} selected
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                Move to… <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {groups.map((g) => (
                <DropdownMenuItem key={g.id} onClick={() => moveSelectedTo(g.id)}>
                  {g.title}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onClick={() => moveSelectedTo("new")}>
                + New item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={clearSelection}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom CTA */}
      {selectedPhotos.size === 0 && (
        <div className="fixed bottom-6 right-8 z-40">
          {ungroupedCount > 0 ? (
            <div className="text-right">
              <Button
                disabled
                className="rounded-xl px-8 py-3 h-12 text-base font-bold opacity-50"
              >
                Review Details
              </Button>
              <p className="text-xs text-muted-foreground mt-1.5">
                Assign all photos to continue
              </p>
            </div>
          ) : (
            <Button
              onClick={onContinue}
              className="rounded-xl px-8 py-3 h-12 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
            >
              Review Details
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoWall;
