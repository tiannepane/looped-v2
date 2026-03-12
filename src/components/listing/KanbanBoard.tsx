import { useState, useRef } from "react";
import { Check, X, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface ItemGroup {
  id: string;
  title: string;
  category: string;
  condition: string;
  size: string;
  description: string;
  photos: string[];
  confirmed: boolean;
  rejected: boolean;
  editedFields: Set<string>;
}

const CATEGORIES = [
  "Furniture",
  "Electronics",
  "Clothing & Shoes",
  "Home Decor",
  "Sports & Outdoors",
  "Books & Media",
  "Toys & Games",
  "Kitchen & Dining",
  "Tools & Hardware",
  "Other",
];

const CONDITIONS = [
  "New",
  "Like New",
  "Good",
  "Fair",
  "Poor",
];

interface KanbanBoardProps {
  groups: ItemGroup[];
  setGroups: React.Dispatch<React.SetStateAction<ItemGroup[]>>;
  ungroupedPhotos: string[];
  setUngroupedPhotos: React.Dispatch<React.SetStateAction<string[]>>;
  onContinue: () => void;
}

const KanbanBoard = ({ groups, setGroups, ungroupedPhotos, setUngroupedPhotos, onContinue }: KanbanBoardProps) => {
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [movePhotosOpen, setMovePhotosOpen] = useState(false);
  const startX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const reviewableGroups = groups.filter((g) => !g.confirmed && !g.rejected);
  const skippedGroups = groups.filter((g) => g.rejected);
  const confirmedCount = groups.filter((g) => g.confirmed).length;
  const rejectedCount = skippedGroups.length;
  const reviewedCount = confirmedCount + rejectedCount;
  const allReviewed = groups.length > 0 && reviewableGroups.length === 0;
  const currentGroup = reviewableGroups[0];

  const handleFieldChange = (groupId: string, field: string, value: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, [field]: value, editedFields: new Set(g.editedFields).add(field) }
          : g
      )
    );
  };

  const animateSwipe = (direction: "left" | "right", callback: () => void) => {
    setSwipeDirection(direction);
    setTimeout(() => {
      callback();
      setSwipeDirection(null);
      setDragX(0);
      setMovePhotosOpen(false);
    }, 300);
  };

  const approveItem = () => {
    if (!currentGroup) return;
    animateSwipe("right", () => {
      setGroups((prev) => prev.map((g) => (g.id === currentGroup.id ? { ...g, confirmed: true } : g)));
    });
  };

  const rejectItem = () => {
    if (!currentGroup) return;
    animateSwipe("left", () => {
      setGroups((prev) => prev.map((g) => (g.id === currentGroup.id ? { ...g, rejected: true } : g)));
    });
  };

  const restoreItem = (groupId: string) => {
    setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, rejected: false } : g)));
  };

  // Touch / mouse drag handlers
  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragX(e.clientX - startX.current);
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragX > 100) {
      approveItem();
    } else if (dragX < -100) {
      rejectItem();
    } else {
      setDragX(0);
    }
  };

  const getCardTransform = () => {
    if (swipeDirection === "right") return "translateX(120%) rotate(15deg)";
    if (swipeDirection === "left") return "translateX(-120%) rotate(-15deg)";
    if (isDragging || dragX !== 0) {
      const rotation = dragX * 0.05;
      return `translateX(${dragX}px) rotate(${rotation}deg)`;
    }
    return "translateX(0) rotate(0)";
  };

  const getOverlayOpacity = () => Math.min(Math.abs(dragX) / 150, 1);

  // Photo drag-and-drop between groups
  const onPhotoDragStart = (e: React.DragEvent, photo: string, sourceGroupId: string) => {
    e.dataTransfer.setData("photo", photo);
    e.dataTransfer.setData("sourceGroupId", sourceGroupId);
    e.dataTransfer.effectAllowed = "move";
  };

  const onPhotoDrop = (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();
    const photo = e.dataTransfer.getData("photo");
    const sourceGroupId = e.dataTransfer.getData("sourceGroupId");
    if (!photo || !sourceGroupId || sourceGroupId === targetGroupId) return;

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === sourceGroupId) {
          return { ...g, photos: g.photos.filter((p) => p !== photo) };
        }
        if (g.id === targetGroupId) {
          return { ...g, photos: [...g.photos, photo] };
        }
        return g;
      })
    );
  };

  const otherGroups = currentGroup ? groups.filter((g) => g.id !== currentGroup.id) : [];

  return (
    <div>
      <h2 className="text-3xl font-black tracking-tight text-foreground mb-2">Review Items</h2>
      <p className="text-muted-foreground mb-6">
        Swipe right to approve, left to skip. Edit details before approving.
      </p>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            {reviewedCount} of {groups.length} items reviewed
          </span>
          <span className="text-xs text-muted-foreground">
            {allReviewed ? "All done!" : `${confirmedCount} approved · ${rejectedCount} skipped`}
          </span>
        </div>
        <div className="h-2 bg-accent rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${groups.length > 0 ? (reviewedCount / groups.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Card stack */}
      {!allReviewed && currentGroup ? (
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-full max-w-md h-[560px]">
            {/* Background cards for stack effect */}
            {reviewableGroups.length > 2 && (
              <div className="absolute inset-0 mx-4 mt-4 bg-card border border-border rounded-xl opacity-40" />
            )}
            {reviewableGroups.length > 1 && (
              <div className="absolute inset-0 mx-2 mt-2 bg-card border border-border rounded-xl opacity-60" />
            )}

            {/* Active card */}
            <div
              ref={cardRef}
              className="absolute inset-0 bg-card border border-border rounded-xl shadow-lg overflow-hidden select-none touch-none"
              style={{
                transform: getCardTransform(),
                transition: swipeDirection || (!isDragging && dragX === 0) ? "transform 0.3s ease-out" : "none",
                cursor: isDragging ? "grabbing" : "grab",
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
              {/* Swipe overlays */}
              {dragX > 0 && (
                <div
                  className="absolute inset-0 bg-success/20 z-10 flex items-center justify-center pointer-events-none rounded-xl"
                  style={{ opacity: getOverlayOpacity() }}
                >
                  <div className="bg-success text-success-foreground px-6 py-3 rounded-lg text-xl font-black tracking-wide rotate-[-15deg] border-4 border-success">
                    APPROVE
                  </div>
                </div>
              )}
              {dragX < 0 && (
                <div
                  className="absolute inset-0 bg-destructive/20 z-10 flex items-center justify-center pointer-events-none rounded-xl"
                  style={{ opacity: getOverlayOpacity() }}
                >
                  <div className="bg-destructive text-destructive-foreground px-6 py-3 rounded-lg text-xl font-black tracking-wide rotate-[15deg] border-4 border-destructive">
                    SKIP
                  </div>
                </div>
              )}

              {/* Card content */}
              <div className="p-5 h-full overflow-y-auto">
                {/* Photos (draggable) */}
                <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                  {currentGroup.photos.map((photo, i) => (
                    <img
                      key={i}
                      src={photo}
                      alt={`${currentGroup.title} ${i + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border border-border flex-shrink-0 cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-primary/50 transition-all"
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation();
                        onPhotoDragStart(e, photo, currentGroup.id);
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                    />
                  ))}
                  {currentGroup.photos.length === 0 && (
                    <div className="w-full h-20 bg-accent rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                      No photos
                    </div>
                  )}
                </div>

                {/* Move photo to... collapsible */}
                {otherGroups.length > 0 && currentGroup.photos.length > 0 && (
                  <Collapsible open={movePhotosOpen} onOpenChange={setMovePhotosOpen}>
                    <CollapsibleTrigger
                      className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-3"
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      {movePhotosOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      Drag photo to another item
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div
                        className="flex gap-2 overflow-x-auto pb-3 mb-2"
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        {otherGroups.map((g) => (
                          <div
                            key={g.id}
                            className="flex-shrink-0 w-24 p-2 bg-accent/50 border-2 border-dashed border-border rounded-lg text-center hover:border-primary/50 transition-colors"
                            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary", "bg-primary/10"); }}
                            onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary", "bg-primary/10"); }}
                            onDrop={(e) => {
                              e.currentTarget.classList.remove("border-primary", "bg-primary/10");
                              onPhotoDrop(e, g.id);
                            }}
                          >
                            {g.photos.length > 0 ? (
                              <img src={g.photos[0]} alt={g.title} className="w-full h-12 object-cover rounded mb-1" draggable={false} />
                            ) : (
                              <div className="w-full h-12 bg-muted rounded mb-1" />
                            )}
                            <span className="text-[9px] font-medium text-muted-foreground leading-tight line-clamp-2">{g.title}</span>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Title */}
                <Input
                  value={currentGroup.title}
                  onChange={(e) => handleFieldChange(currentGroup.id, "title", e.target.value)}
                  className="text-lg font-bold border-none p-0 h-auto bg-transparent focus-visible:ring-0 mb-4"
                  onPointerDown={(e) => e.stopPropagation()}
                />

                {/* Fields */}
                <div className="flex flex-col gap-3">
                  {/* Category */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Category</label>
                      {!currentGroup.editedFields.has("category") && (
                        <span className="text-[9px] bg-primary/10 text-primary px-1 py-0.5 rounded font-bold">AI</span>
                      )}
                    </div>
                    <div onPointerDown={(e) => e.stopPropagation()}>
                      <Select
                        value={currentGroup.category}
                        onValueChange={(v) => handleFieldChange(currentGroup.id, "category", v)}
                      >
                        <SelectTrigger className="text-sm h-9 bg-background">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Condition */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Condition</label>
                      {!currentGroup.editedFields.has("condition") && (
                        <span className="text-[9px] bg-primary/10 text-primary px-1 py-0.5 rounded font-bold">AI</span>
                      )}
                    </div>
                    <div onPointerDown={(e) => e.stopPropagation()}>
                      <Select
                        value={currentGroup.condition}
                        onValueChange={(v) => handleFieldChange(currentGroup.id, "condition", v)}
                      >
                        <SelectTrigger className="text-sm h-9 bg-background">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {CONDITIONS.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Size */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Size</label>
                      {!currentGroup.editedFields.has("size") && (
                        <span className="text-[9px] bg-primary/10 text-primary px-1 py-0.5 rounded font-bold">AI</span>
                      )}
                    </div>
                    <Input
                      value={currentGroup.size}
                      onChange={(e) => handleFieldChange(currentGroup.id, "size", e.target.value)}
                      className="text-sm h-9 bg-background"
                      onPointerDown={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Description</label>
                      {!currentGroup.editedFields.has("description") && (
                        <span className="text-[9px] bg-primary/10 text-primary px-1 py-0.5 rounded font-bold">AI</span>
                      )}
                    </div>
                    <Textarea
                      value={currentGroup.description}
                      onChange={(e) => handleFieldChange(currentGroup.id, "description", e.target.value)}
                      rows={3}
                      className="text-sm bg-background"
                      onPointerDown={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-6 mt-6">
            <button
              onClick={rejectItem}
              className="w-14 h-14 rounded-full bg-card border-2 border-destructive text-destructive flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 shadow-md"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={approveItem}
              className="w-16 h-16 rounded-full bg-success text-success-foreground flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-lg"
            >
              <Check className="w-7 h-7" />
            </button>
          </div>
        </div>
      ) : (
        /* Summary when all reviewed */
        <div className="text-center py-12 mb-8">
          <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">All items reviewed!</h3>
          <p className="text-muted-foreground mb-1">
            {confirmedCount} approved · {rejectedCount} skipped
          </p>
        </div>
      )}

      {/* Skipped Items Tray */}
      {skippedGroups.length > 0 && (
        <div className="mb-8 max-w-md mx-auto">
          <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-medium">
            Skipped items · tap to restore
          </h4>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {skippedGroups.map((g) => (
              <button
                key={g.id}
                onClick={() => restoreItem(g.id)}
                className="flex-shrink-0 w-24 bg-card border border-border rounded-lg p-2 hover:border-primary/50 hover:shadow-md transition-all group"
              >
                {g.photos.length > 0 ? (
                  <img src={g.photos[0]} alt={g.title} className="w-full h-16 object-cover rounded mb-1.5" />
                ) : (
                  <div className="w-full h-16 bg-accent rounded mb-1.5 flex items-center justify-center">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <span className="text-[10px] font-medium text-muted-foreground leading-tight line-clamp-2 group-hover:text-foreground transition-colors">
                  {g.title}
                </span>
                <div className="flex items-center justify-center gap-0.5 mt-1 text-[9px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <RotateCcw className="w-2.5 h-2.5" /> restore
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <Button onClick={onContinue} size="lg" className="rounded-lg w-full max-w-md mx-auto block" disabled={!allReviewed || confirmedCount === 0}>
        Continue to Pricing
      </Button>
    </div>
  );
};

export default KanbanBoard;
