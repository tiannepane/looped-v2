import { useState, useRef } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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

/** Polaroid-style card wrapper */
const Polaroid = ({
  children,
  className = "",
  style,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
  <div
    className={`bg-card rounded-sm shadow-md p-1.5 pb-10 ${className}`}
    style={style}
    {...rest}
  >
    {children}
  </div>
);

const PhotoWall = ({
  groups,
  setGroups,
  ungroupedPhotos,
  setUngroupedPhotos,
  pricingData,
  onContinue,
}: PhotoWallProps) => {
  const [expandedStack, setExpandedStack] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  const dragData = useRef<{ photo: string; sourceId: string | null } | null>(null);

  const totalValue = pricingData.reduce((sum, p) => sum + p.recommended, 0);
  const ungroupedCount = ungroupedPhotos.length;

  // --- Drag and drop ---
  const onDragStart = (photo: string, sourceGroupId: string | null) => {
    dragData.current = { photo, sourceId: sourceGroupId };
  };

  const onDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverTarget(targetId);
  };

  const onDragLeave = () => setDragOverTarget(null);

  const onDrop = (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();
    setDragOverTarget(null);
    const data = dragData.current;
    if (!data || data.sourceId === targetGroupId) return;

    const { photo, sourceId } = data;

    // Remove from source
    if (sourceId) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === sourceId ? { ...g, photos: g.photos.filter((p) => p !== photo) } : g
        )
      );
    } else {
      setUngroupedPhotos((prev) => prev.filter((p) => p !== photo));
    }

    // Add to target
    if (targetGroupId === "ungrouped") {
      setUngroupedPhotos((prev) => [...prev, photo]);
    } else {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === targetGroupId ? { ...g, photos: [...g.photos, photo] } : g
        )
      );
    }

    dragData.current = null;
  };

  const createNewGroup = () => {
    const newId = `group-${Date.now()}`;
    setGroups((prev) => [
      ...prev,
      {
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
      },
    ]);
  };

  const onDropNewItem = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverTarget(null);
    const data = dragData.current;
    if (!data) return;

    const { photo, sourceId } = data;
    const newId = `group-${Date.now()}`;

    if (sourceId) {
      setGroups((prev) => [
        ...prev.map((g) =>
          g.id === sourceId ? { ...g, photos: g.photos.filter((p) => p !== photo) } : g
        ),
        {
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
        },
      ]);
    } else {
      setUngroupedPhotos((prev) => prev.filter((p) => p !== photo));
      setGroups((prev) => [
        ...prev,
        {
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
        },
      ]);
    }
    dragData.current = null;
  };

  return (
    <div className="px-4 md:px-8 lg:px-16 py-12 pb-32">
      {/* Header */}
      <h2 className="text-3xl font-bold tracking-tight text-foreground">
        We found {groups.length} items worth{" "}
        <span className="text-primary">${totalValue.toLocaleString()}</span>
      </h2>

      <div className="h-12" />

      {/* Stacks grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
        {groups.map((group) => {
          const pricing = pricingData.find((p) => p.groupId === group.id);
          const isExpanded = expandedStack === group.id;
          const isDragOver = dragOverTarget === group.id;
          const cover = group.photos[0];
          const peek1 = group.photos[1];
          const peek2 = group.photos[2];

          // Expanded view — shows all photos as draggable polaroids
          if (isExpanded) {
            return (
              <div
                key={group.id}
                ref={expandedRef}
                className="col-span-full bg-card border border-border rounded-2xl p-8 animate-fade-in"
                onDragOver={(e) => onDragOver(e, group.id)}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, group.id)}
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

                <p className="text-xs text-muted-foreground mb-4">
                  Drag photos to other stacks to rearrange.
                </p>

                <div className="flex gap-5 overflow-x-auto pb-4">
                  {group.photos.map((photo, i) => (
                    <Polaroid
                      key={i}
                      className="flex-shrink-0 cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform duration-200"
                      draggable
                      onDragStart={() => onDragStart(photo, group.id)}
                    >
                      <img
                        src={photo}
                        alt={`${group.title} ${i + 1}`}
                        className="w-36 h-36 object-cover rounded-[2px]"
                        draggable={false}
                      />
                    </Polaroid>
                  ))}
                  {group.photos.length === 0 && (
                    <p className="text-sm text-muted-foreground py-8">
                      Drop photos here to add them.
                    </p>
                  )}
                </div>
              </div>
            );
          }

          // Collapsed stack — polaroid style
          return (
            <div
              key={group.id}
              className={`group cursor-pointer hover:-translate-y-1 transition-all duration-300 ${
                isDragOver ? "scale-105" : ""
              }`}
              onClick={() => setExpandedStack(group.id)}
              onDragOver={(e) => onDragOver(e, group.id)}
              onDragLeave={onDragLeave}
              onDrop={(e) => {
                onDrop(e, group.id);
                setExpandedStack(null);
              }}
            >
              {/* Polaroid stack */}
              <div className="relative" style={{ aspectRatio: "3/4" }}>
                {/* Third peek polaroid */}
                {peek2 && (
                  <Polaroid
                    className="absolute inset-0 w-full h-full transition-all duration-300 group-hover:[transform:translate(20px,20px)_rotate(-3deg)_scale(0.9)]"
                    style={{
                      transform: "translate(16px, 16px) rotate(-3deg) scale(0.9)",
                      zIndex: 1,
                    }}
                  >
                    <img src={peek2} alt="" className="w-full h-full object-cover rounded-[2px]" />
                  </Polaroid>
                )}
                {/* Second peek polaroid */}
                {peek1 && (
                  <Polaroid
                    className="absolute inset-0 w-full h-full transition-all duration-300 group-hover:[transform:translate(12px,12px)_rotate(2deg)_scale(0.95)]"
                    style={{
                      transform: "translate(8px, 8px) rotate(2deg) scale(0.95)",
                      zIndex: 2,
                    }}
                  >
                    <img src={peek1} alt="" className="w-full h-full object-cover rounded-[2px]" />
                  </Polaroid>
                )}
                {/* Cover polaroid */}
                {cover ? (
                  <Polaroid
                    className={`relative w-full h-full shadow-sm group-hover:shadow-lg transition-all duration-300 ${
                      isDragOver ? "ring-2 ring-primary shadow-lg" : ""
                    }`}
                    style={{ zIndex: 3 }}
                  >
                    <img
                      src={cover}
                      alt={group.title}
                      className="w-full h-full object-cover rounded-[2px]"
                    />
                  </Polaroid>
                ) : (
                  <Polaroid
                    className={`relative w-full h-full flex items-center justify-center transition-all duration-300 ${
                      isDragOver ? "ring-2 ring-primary shadow-lg" : ""
                    }`}
                    style={{ zIndex: 3 }}
                  >
                    <span className="text-sm text-muted-foreground">Drop photos here</span>
                  </Polaroid>
                )}
              </div>

              {/* Info below */}
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

        {/* New item placeholder */}
        <div
          className={`cursor-pointer hover:-translate-y-1 transition-all duration-300 group ${
            dragOverTarget === "new-item" ? "scale-105" : ""
          }`}
          onClick={createNewGroup}
          onDragOver={(e) => onDragOver(e, "new-item")}
          onDragLeave={onDragLeave}
          onDrop={onDropNewItem}
        >
          <div
            className={`w-full rounded-sm border-2 border-dashed flex items-center justify-center transition-colors duration-300 ${
              dragOverTarget === "new-item"
                ? "border-primary bg-primary/5"
                : "border-border group-hover:border-primary/40"
            }`}
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
        <div
          className={`mt-16 pt-10 border-t border-border/50 transition-colors duration-200 ${
            dragOverTarget === "ungrouped" ? "bg-primary/5 rounded-xl" : ""
          }`}
          onDragOver={(e) => onDragOver(e, "ungrouped")}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, "ungrouped")}
        >
          <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-6">
            Ungrouped
          </h3>
          <div className="flex gap-5 overflow-x-auto pb-2">
            {ungroupedPhotos.map((photo, i) => (
              <Polaroid
                key={i}
                className="flex-shrink-0 cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform duration-200"
                draggable
                onDragStart={() => onDragStart(photo, null)}
              >
                <img
                  src={photo}
                  alt={`Ungrouped ${i + 1}`}
                  className="w-20 h-20 object-cover rounded-[2px]"
                  draggable={false}
                />
              </Polaroid>
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
