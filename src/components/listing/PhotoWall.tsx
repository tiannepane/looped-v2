import { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ItemGroup } from "./KanbanBoard";
import type { ItemPricing } from "./BulkPricingStep";

interface PhotoWallProps {
  groups: ItemGroup[];
  setGroups: React.Dispatch<React.SetStateAction<ItemGroup[]>>;
  ungroupedPhotos: string[];
  setUngroupedPhotos: React.Dispatch<React.SetStateAction<string[]>>;
  pricingData: ItemPricing[];
  onContinue: () => void;
}

const PhotoWall = ({
  groups,
  setGroups,
  ungroupedPhotos,
  setUngroupedPhotos,
  pricingData,
  onContinue,
}: PhotoWallProps) => {
  const [expandedStack, setExpandedStack] = useState<string | null>(null);
  const expandedRef = useRef<HTMLDivElement>(null);

  const totalValue = pricingData.reduce((sum, p) => sum + p.recommended, 0);
  const ungroupedCount = ungroupedPhotos.length;

  // Close expanded stack on click outside
  useEffect(() => {
    if (!expandedStack) return;
    const handler = (e: MouseEvent) => {
      if (expandedRef.current && !expandedRef.current.contains(e.target as Node)) {
        setExpandedStack(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [expandedStack]);

  const movePhoto = (photo: string, sourceGroupId: string | null, targetGroupId: string | "new" | "remove") => {
    if (targetGroupId === "remove") {
      // Move to ungrouped
      if (sourceGroupId) {
        setGroups((prev) =>
          prev.map((g) =>
            g.id === sourceGroupId ? { ...g, photos: g.photos.filter((p) => p !== photo) } : g
          )
        );
      }
      setUngroupedPhotos((prev) => [...prev, photo]);
      return;
    }

    if (targetGroupId === "new") {
      const newId = `group-${Date.now()}`;
      const newGroup: ItemGroup = {
        id: newId,
        title: "New Item",
        category: "Other",
        condition: "Good",
        size: "",
        description: "",
        photos: [photo],
        confirmed: false,
        rejected: false,
        editedFields: new Set(),
      };
      if (sourceGroupId) {
        setGroups((prev) => [
          ...prev.map((g) =>
            g.id === sourceGroupId ? { ...g, photos: g.photos.filter((p) => p !== photo) } : g
          ),
          newGroup,
        ]);
      } else {
        setUngroupedPhotos((prev) => prev.filter((p) => p !== photo));
        setGroups((prev) => [...prev, newGroup]);
      }
      return;
    }

    // Move between groups
    if (sourceGroupId) {
      setGroups((prev) =>
        prev.map((g) => {
          if (g.id === sourceGroupId) return { ...g, photos: g.photos.filter((p) => p !== photo) };
          if (g.id === targetGroupId) return { ...g, photos: [...g.photos, photo] };
          return g;
        })
      );
    } else {
      setUngroupedPhotos((prev) => prev.filter((p) => p !== photo));
      setGroups((prev) =>
        prev.map((g) => (g.id === targetGroupId ? { ...g, photos: [...g.photos, photo] } : g))
      );
    }
  };

  const createNewGroup = () => {
    const newId = `group-${Date.now()}`;
    const newGroup: ItemGroup = {
      id: newId,
      title: "New Item",
      category: "Other",
      condition: "Good",
      size: "",
      description: "",
      photos: [],
      confirmed: false,
      rejected: false,
      editedFields: new Set(),
    };
    setGroups((prev) => [...prev, newGroup]);
  };

  const MoveDropdown = ({
    photo,
    sourceGroupId,
  }: {
    photo: string;
    sourceGroupId: string | null;
  }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          Move to… <ChevronDown className="w-3 h-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {groups
          .filter((g) => g.id !== sourceGroupId)
          .map((g) => (
            <DropdownMenuItem key={g.id} onClick={() => movePhoto(photo, sourceGroupId, g.id)}>
              {g.title}
            </DropdownMenuItem>
          ))}
        <DropdownMenuItem onClick={() => movePhoto(photo, sourceGroupId, "new")}>
          + New item
        </DropdownMenuItem>
        {sourceGroupId && (
          <DropdownMenuItem onClick={() => movePhoto(photo, sourceGroupId, "remove")}>
            Remove from group
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="px-4 md:px-8 lg:px-16 py-12 pb-32">
      {/* Header */}
      <h2 className="text-3xl font-bold tracking-tight text-foreground">
        We found {groups.length} items worth{" "}
        <span className="text-primary">${totalValue.toLocaleString()}</span>
      </h2>

      {/* Spacer */}
      <div className="h-12" />

      {/* Stacks grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
        {groups.map((group, gi) => {
          const pricing = pricingData.find((p) => p.groupId === group.id);
          const isExpanded = expandedStack === group.id;
          const cover = group.photos[0];
          const peek1 = group.photos[1];
          const peek2 = group.photos[2];

          if (isExpanded) {
            return (
              <div
                key={group.id}
                ref={expandedRef}
                className="col-span-full bg-card border border-border rounded-2xl p-8 animate-fade-in"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">
                    {group.title}
                  </h3>
                  <button
                    onClick={() => setExpandedStack(null)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4">
                  {group.photos.map((photo, i) => (
                    <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
                      <img
                        src={photo}
                        alt={`${group.title} ${i + 1}`}
                        className="w-40 h-40 rounded-lg object-cover shadow-sm"
                      />
                      <MoveDropdown photo={photo} sourceGroupId={group.id} />
                    </div>
                  ))}
                  {group.photos.length === 0 && (
                    <p className="text-sm text-muted-foreground py-8">
                      No photos in this group yet.
                    </p>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div
              key={group.id}
              className="group cursor-pointer hover:-translate-y-1 transition-all duration-300"
              onClick={() => setExpandedStack(group.id)}
            >
              {/* Photo stack */}
              <div className="relative" style={{ aspectRatio: "3/4" }}>
                {/* Third peek photo */}
                {peek2 && (
                  <img
                    src={peek2}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover rounded-xl shadow-md transition-all duration-300"
                    style={{
                      transform: "translate(16px, 16px) rotate(-3deg) scale(0.9)",
                      zIndex: 1,
                    }}
                  />
                )}
                {/* Second peek photo */}
                {peek1 && (
                  <img
                    src={peek1}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover rounded-xl shadow-md transition-all duration-300"
                    style={{
                      transform: "translate(8px, 8px) rotate(2deg) scale(0.95)",
                      zIndex: 2,
                    }}
                  />
                )}
                {/* Cover photo */}
                {cover ? (
                  <img
                    src={cover}
                    alt={group.title}
                    className="relative w-full h-full object-cover rounded-xl shadow-sm group-hover:shadow-lg transition-all duration-300"
                    style={{ zIndex: 3 }}
                  />
                ) : (
                  <div
                    className="relative w-full h-full rounded-xl bg-accent/50 flex items-center justify-center"
                    style={{ zIndex: 3 }}
                  >
                    <span className="text-sm text-muted-foreground">No photos</span>
                  </div>
                )}
              </div>

              {/* Info below stack */}
              <div className="mt-3 flex items-start justify-between gap-2">
                <p className="text-lg font-semibold tracking-tight text-foreground truncate">
                  {group.title}
                </p>
                {pricing && (
                  <span className="text-xl font-bold text-primary flex-shrink-0">
                    ${pricing.recommended}
                  </span>
                )}
              </div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mt-0.5">
                {group.photos.length} photo{group.photos.length !== 1 ? "s" : ""}
              </p>
            </div>
          );
        })}

        {/* New item placeholder card */}
        <div
          className="cursor-pointer hover:-translate-y-1 transition-all duration-300 group"
          onClick={createNewGroup}
        >
          <div
            className="w-full rounded-xl border-2 border-dashed border-border flex items-center justify-center group-hover:border-primary/40 transition-colors duration-300"
            style={{ aspectRatio: "3/4" }}
          >
            <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors duration-300">
              <Plus className="w-6 h-6" />
              <span className="text-sm font-medium">New Item</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ungrouped section */}
      {ungroupedCount > 0 && (
        <div className="mt-16 pt-10 border-t border-border/50">
          <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-6">
            Ungrouped
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {ungroupedPhotos.map((photo, i) => (
              <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
                <img
                  src={photo}
                  alt={`Ungrouped ${i + 1}`}
                  className="w-24 h-24 rounded-lg object-cover shadow-sm"
                />
                <MoveDropdown photo={photo} sourceGroupId={null} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-sm border-t border-border/50 py-4 px-4 md:px-8 lg:px-16">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            {groups.length} items · ${totalValue.toLocaleString()} total
          </span>

          {ungroupedCount > 0 && (
            <span className="text-sm text-amber-600 font-medium">
              {ungroupedCount} photo{ungroupedCount !== 1 ? "s" : ""} need grouping
            </span>
          )}

          <Button
            onClick={onContinue}
            disabled={ungroupedCount > 0}
            className={`rounded-lg px-8 py-3 h-11 font-semibold transition-all ${
              ungroupedCount > 0 ? "opacity-50" : "hover:shadow-md"
            }`}
          >
            Review Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PhotoWall;
