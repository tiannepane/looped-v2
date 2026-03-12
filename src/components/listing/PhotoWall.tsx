import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, X } from "lucide-react";
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

/** Rustic polaroid frame */
const Polaroid = ({
  children,
  className = "",
  style,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => (
  <div
    className={`rounded-[3px] ${className}`}
    style={{
      background: "linear-gradient(145deg, #faf8f5 0%, #f0ece4 50%, #e8e2d8 100%)",
      padding: "5px 5px 28px 5px",
      boxShadow:
        "0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
      ...style,
    }}
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
  const modalRef = useRef<HTMLDivElement>(null);
  const dragData = useRef<{ photo: string; sourceId: string | null } | null>(null);

  const totalValue = pricingData.reduce((sum, p) => sum + p.recommended, 0);
  const ungroupedCount = ungroupedPhotos.length;

  // Close modal on click outside
  useEffect(() => {
    if (!expandedStack) return;
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setExpandedStack(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [expandedStack]);

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

    if (sourceId) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === sourceId ? { ...g, photos: g.photos.filter((p) => p !== photo) } : g
        )
      );
    } else {
      setUngroupedPhotos((prev) => prev.filter((p) => p !== photo));
    }

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

  const deletePhoto = (photo: string, groupId: string | null) => {
    if (groupId) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId ? { ...g, photos: g.photos.filter((p) => p !== photo) } : g
        )
      );
    } else {
      setUngroupedPhotos((prev) => prev.filter((p) => p !== photo));
    }
  };

  const onDropNewItem = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverTarget(null);
    const data = dragData.current;
    if (!data) return;

    const { photo, sourceId } = data;
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

    if (sourceId) {
      setGroups((prev) => [
        ...prev.map((g) =>
          g.id === sourceId ? { ...g, photos: g.photos.filter((p) => p !== photo) } : g
        ),
        newGroup,
      ]);
    } else {
      setUngroupedPhotos((prev) => prev.filter((p) => p !== photo));
      setGroups((prev) => [...prev, newGroup]);
    }
    dragData.current = null;
  };

  const visibleGroups = groups.filter((g) => g.photos.length > 0);
  const expandedGroup = groups.find((g) => g.id === expandedStack);

  return (
    <div className="px-4 md:px-8 lg:px-16 pt-2 pb-24">
      {/* Header */}
      <h2 className="text-2xl font-bold tracking-tight text-foreground mb-5">
        We found {visibleGroups.length} items worth{" "}
        <span className="text-primary">~${totalValue.toLocaleString()}</span>
      </h2>

      {/* Stacks grid — compact */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
        {visibleGroups.map((group) => {
          const pricing = pricingData.find((p) => p.groupId === group.id);
          const isDragOver = dragOverTarget === group.id;
          const cover = group.photos[0];
          const peek1 = group.photos[1] || (group.photos.length > 0 ? group.photos[0] : null);
          const showPeek = group.photos.length >= 1;

          return (
            <div
              key={group.id}
              className={`group cursor-pointer hover:-translate-y-1 transition-all duration-300 ${
                isDragOver ? "scale-[1.04]" : ""
              }`}
              onClick={() => setExpandedStack(group.id)}
              onDragOver={(e) => onDragOver(e, group.id)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, group.id)}
            >
              {/* Polaroid stack */}
              <div className="relative" style={{ aspectRatio: "3/4" }}>
                {/* Always show a "shadow" peek behind to hint at stacking */}
                {showPeek && (
                  <Polaroid
                    className="absolute inset-0 w-full h-full transition-all duration-300 group-hover:[transform:translate(12px,10px)_rotate(-8deg)_scale(0.92)]"
                    style={{
                      transform: "translate(8px, 6px) rotate(-7deg) scale(0.93)",
                      zIndex: 1,
                    }}
                  >
                    <img
                      src={peek1!}
                      alt=""
                      className="w-full h-full object-cover rounded-[2px]"
                    />
                  </Polaroid>
                )}
                {group.photos.length > 1 && (
                  <Polaroid
                    className="absolute inset-0 w-full h-full transition-all duration-300 group-hover:[transform:translate(7px,5px)_rotate(6deg)_scale(0.95)]"
                    style={{
                      transform: "translate(4px, 3px) rotate(5deg) scale(0.96)",
                      zIndex: 2,
                    }}
                  >
                    <img
                      src={group.photos[1]}
                      alt=""
                      className="w-full h-full object-cover rounded-[2px]"
                    />
                  </Polaroid>
                )}
                {/* Cover */}
                {cover ? (
                  <Polaroid
                    className={`relative w-full h-full group-hover:shadow-lg transition-all duration-300 ${
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

              {/* Title + price */}
              <div className="mt-3">
                <p className="text-base font-semibold tracking-tight text-foreground truncate">
                  {group.title}
                </p>
                <div className="flex items-center justify-between mt-0.5">
                  {pricing && (
                    <span className="text-lg font-bold text-primary">
                      ~${pricing.recommended}
                    </span>
                  )}
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {group.photos.length} photo{group.photos.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* New item placeholder */}
        <div
          className={`cursor-pointer hover:-translate-y-1 transition-all duration-300 group ${
            dragOverTarget === "new-item" ? "scale-[1.04]" : ""
          }`}
          onClick={() => {
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
            setExpandedStack(newId);
          }}
          onDragOver={(e) => onDragOver(e, "new-item")}
          onDragLeave={onDragLeave}
          onDrop={onDropNewItem}
        >
          <div
            className={`w-full rounded-[3px] border-2 border-dashed flex items-center justify-center transition-colors duration-300 ${
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
          className={`mt-10 pt-6 border-t border-border/50 transition-colors duration-200 ${
            dragOverTarget === "ungrouped" ? "bg-primary/5 rounded-xl" : ""
          }`}
          onDragOver={(e) => onDragOver(e, "ungrouped")}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, "ungrouped")}
        >
          <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
            Ungrouped
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {ungroupedPhotos.map((photo, i) => (
              <div key={i} className="relative flex-shrink-0 group/photo">
                <Polaroid
                  className="cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform duration-200"
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
                <button
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity shadow-md z-10"
                  onClick={() => deletePhoto(photo, null)}
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal overlay for expanded stack */}
      {expandedStack && expandedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <div
            ref={modalRef}
            className="w-full max-w-3xl mx-4 rounded-2xl border border-border p-8 shadow-xl max-h-[80vh] overflow-y-auto"
            style={{ background: "linear-gradient(135deg, #faf8f5, #f5f0ea)" }}
            onDragOver={(e) => onDragOver(e, expandedGroup.id)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, expandedGroup.id)}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  {expandedGroup.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Drag photos to other stacks · hover to delete
                </p>
              </div>
              <button
                onClick={() => setExpandedStack(null)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-5 flex-wrap">
              {expandedGroup.photos.map((photo, i) => (
                <div key={i} className="relative group/photo">
                  <Polaroid
                    className="cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform duration-200"
                    draggable
                    onDragStart={() => onDragStart(photo, expandedGroup.id)}
                  >
                    <img
                      src={photo}
                      alt={`${expandedGroup.title} ${i + 1}`}
                      className="w-36 h-36 object-cover rounded-[2px]"
                      draggable={false}
                    />
                  </Polaroid>
                  <button
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity shadow-md z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePhoto(photo, expandedGroup.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {expandedGroup.photos.length === 0 && (
                <p className="text-sm text-muted-foreground py-8">
                  No photos — drop some here or this item will be removed.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-sm border-t border-border/50 py-3 px-4 md:px-8 lg:px-16">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            {visibleGroups.length} items · ~${totalValue.toLocaleString()} total
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
