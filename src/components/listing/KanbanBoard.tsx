import { useState, useRef } from "react";
import { Check, X, ChevronDown, ChevronUp, RotateCcw, Trash2 } from "lucide-react";
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
  "Furniture", "Electronics", "Clothing & Shoes", "Home Decor",
  "Sports & Outdoors", "Books & Media", "Toys & Games",
  "Kitchen & Dining", "Tools & Hardware", "Other",
];

const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"];

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

  const deletePhoto = (groupId: string, photo: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, photos: g.photos.filter((p) => p !== photo) } : g
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
    if (dragX > 100) approveItem();
    else if (dragX < -100) rejectItem();
    else setDragX(0);
  };

  const getCardTransform = () => {
    if (swipeDirection === "right") return "translateX(120%) rotate(15deg)";
    if (swipeDirection === "left") return "translateX(-120%) rotate(-15deg)";
    if (isDragging || dragX !== 0) {
      return `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`;
    }
    return "translateX(0) rotate(0)";
  };

  const getOverlayOpacity = () => Math.min(Math.abs(dragX) / 150, 1);

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
        if (g.id === sourceGroupId) return { ...g, photos: g.photos.filter((p) => p !== photo) };
        if (g.id === targetGroupId) return { ...g, photos: [...g.photos, photo] };
        return g;
      })
    );
  };

  const otherGroups = currentGroup ? groups.filter((g) => g.id !== currentGroup.id) : [];

  const AiBadge = ({ field }: { field: string }) =>
    currentGroup && !currentGroup.editedFields.has(field) ? (
      <span className="text-[9px] bg-primary/10 text-primary px-1 py-0.5 rounded font-bold">AI</span>
    ) : null;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Header + progress — compact */}
      <div className="mb-4 flex-shrink-0">
        <div className="flex items-end justify-between mb-3">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-foreground leading-none">Review Items</h2>
            <p className="text-xs text-muted-foreground mt-1">Swipe right to approve, left to skip.</p>
          </div>
          <span className="text-xs text-muted-foreground">
            {allReviewed ? "All done!" : `${confirmedCount} approved · ${rejectedCount} skipped`}
          </span>
        </div>
        <div className="h-1.5 bg-accent rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${groups.length > 0 ? (reviewedCount / groups.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Main content area — fills remaining space */}
      <div className="flex-1 min-h-0 flex flex-col">
        {!allReviewed && currentGroup ? (
          <div className="flex gap-6 flex-1 min-h-0">
            {/* Left: Swipe card */}
            <div className="flex flex-col items-center w-80 flex-shrink-0">
              <div className="relative w-full flex-1 min-h-0">
                {reviewableGroups.length > 2 && (
                  <div className="absolute inset-0 mx-3 mt-3 bg-card border border-border rounded-xl opacity-40" />
                )}
                {reviewableGroups.length > 1 && (
                  <div className="absolute inset-0 mx-1.5 mt-1.5 bg-card border border-border rounded-xl opacity-60" />
                )}

                <div
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
                      <div className="bg-success text-success-foreground px-5 py-2 rounded-lg text-lg font-black tracking-wide rotate-[-15deg] border-4 border-success">
                        APPROVE
                      </div>
                    </div>
                  )}
                  {dragX < 0 && (
                    <div
                      className="absolute inset-0 bg-destructive/20 z-10 flex items-center justify-center pointer-events-none rounded-xl"
                      style={{ opacity: getOverlayOpacity() }}
                    >
                      <div className="bg-destructive text-destructive-foreground px-5 py-2 rounded-lg text-lg font-black tracking-wide rotate-[15deg] border-4 border-destructive">
                        SKIP
                      </div>
                    </div>
                  )}

                  {/* Card visual content — photos fill the card */}
                  <div className="p-4 h-full flex flex-col">
                    {/* Photo grid with delete on hover */}
                    <div className="flex gap-1.5 flex-wrap flex-1 min-h-0 overflow-y-auto pb-2">
                      {currentGroup.photos.map((photo, i) => (
                        <div key={i} className="relative group/photo">
                          <img
                            src={photo}
                            alt={`${currentGroup.title} ${i + 1}`}
                            className="w-16 h-16 object-cover rounded-lg border border-border cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-primary/50 transition-all"
                            draggable
                            onDragStart={(e) => { e.stopPropagation(); onPhotoDragStart(e, photo, currentGroup.id); }}
                            onPointerDown={(e) => e.stopPropagation()}
                          />
                          <button
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity shadow-sm"
                            onClick={(e) => { e.stopPropagation(); deletePhoto(currentGroup.id, photo); }}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                      {currentGroup.photos.length === 0 && (
                        <div className="w-full h-16 bg-accent rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                          No photos
                        </div>
                      )}
                    </div>

                    {/* Move photos collapsible */}
                    {otherGroups.length > 0 && currentGroup.photos.length > 0 && (
                      <Collapsible open={movePhotosOpen} onOpenChange={setMovePhotosOpen}>
                        <CollapsibleTrigger
                          className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors py-1"
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          {movePhotosOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          Move photo to…
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="flex gap-1.5 overflow-x-auto pb-1" onPointerDown={(e) => e.stopPropagation()}>
                            {otherGroups.map((g) => (
                              <div
                                key={g.id}
                                className="flex-shrink-0 w-20 p-1.5 bg-accent/50 border-2 border-dashed border-border rounded-lg text-center hover:border-primary/50 transition-colors"
                                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary", "bg-primary/10"); }}
                                onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary", "bg-primary/10"); }}
                                onDrop={(e) => { e.currentTarget.classList.remove("border-primary", "bg-primary/10"); onPhotoDrop(e, g.id); }}
                              >
                                {g.photos.length > 0 ? (
                                  <img src={g.photos[0]} alt={g.title} className="w-full h-10 object-cover rounded mb-0.5" draggable={false} />
                                ) : (
                                  <div className="w-full h-10 bg-muted rounded mb-0.5" />
                                )}
                                <span className="text-[8px] font-medium text-muted-foreground leading-tight line-clamp-1">{g.title}</span>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {/* Title inline */}
                    <Input
                      value={currentGroup.title}
                      onChange={(e) => handleFieldChange(currentGroup.id, "title", e.target.value)}
                      className="text-sm font-bold border-none p-0 h-auto bg-transparent focus-visible:ring-0 mt-2 flex-shrink-0"
                      onPointerDown={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-5 mt-4 flex-shrink-0">
                <button
                  onClick={rejectItem}
                  className="w-12 h-12 rounded-full bg-card border-2 border-destructive text-destructive flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 shadow-md"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={approveItem}
                  className="w-14 h-14 rounded-full bg-success text-success-foreground flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-lg"
                >
                  <Check className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Right: Editable fields */}
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 pr-1">
              {/* Category */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Category</label>
                  <AiBadge field="category" />
                </div>
                <Select value={currentGroup.category} onValueChange={(v) => handleFieldChange(currentGroup.id, "category", v)}>
                  <SelectTrigger className="text-sm h-8 bg-background"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* Condition */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Condition</label>
                  <AiBadge field="condition" />
                </div>
                <Select value={currentGroup.condition} onValueChange={(v) => handleFieldChange(currentGroup.id, "condition", v)}>
                  <SelectTrigger className="text-sm h-8 bg-background"><SelectValue placeholder="Select condition" /></SelectTrigger>
                  <SelectContent>{CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {/* Size */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Size</label>
                  <AiBadge field="size" />
                </div>
                <Input
                  value={currentGroup.size}
                  onChange={(e) => handleFieldChange(currentGroup.id, "size", e.target.value)}
                  className="text-sm h-8 bg-background"
                />
              </div>

              {/* Description */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Description</label>
                  <AiBadge field="description" />
                </div>
                <Textarea
                  value={currentGroup.description}
                  onChange={(e) => handleFieldChange(currentGroup.id, "description", e.target.value)}
                  className="text-sm bg-background flex-1 min-h-[60px] resize-none"
                />
              </div>

              {/* Skipped tray inline */}
              {skippedGroups.length > 0 && (
                <div className="flex-shrink-0 pt-2 border-t border-border">
                  <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-medium">
                    Skipped · tap to restore
                  </h4>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {skippedGroups.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => restoreItem(g.id)}
                        className="flex-shrink-0 w-20 bg-card border border-border rounded-lg p-1.5 hover:border-primary/50 hover:shadow-md transition-all group"
                      >
                        {g.photos.length > 0 ? (
                          <img src={g.photos[0]} alt={g.title} className="w-full h-12 object-cover rounded mb-1" />
                        ) : (
                          <div className="w-full h-12 bg-accent rounded mb-1 flex items-center justify-center">
                            <X className="w-3 h-3 text-muted-foreground" />
                          </div>
                        )}
                        <span className="text-[9px] font-medium text-muted-foreground leading-tight line-clamp-1 group-hover:text-foreground transition-colors">
                          {g.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={onContinue} size="sm" className="rounded-lg w-full flex-shrink-0" disabled={!allReviewed || confirmedCount === 0}>
                Continue to Pricing
              </Button>
            </div>
          </div>
        ) : (
          /* Summary when all reviewed */
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-success/10 text-success flex items-center justify-center mb-3">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">All items reviewed!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {confirmedCount} approved · {rejectedCount} skipped
            </p>

            {skippedGroups.length > 0 && (
              <div className="mb-4 w-full max-w-sm">
                <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-medium text-center">
                  Skipped · tap to restore
                </h4>
                <div className="flex gap-2 overflow-x-auto pb-1 justify-center">
                  {skippedGroups.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => restoreItem(g.id)}
                      className="flex-shrink-0 w-20 bg-card border border-border rounded-lg p-1.5 hover:border-primary/50 hover:shadow-md transition-all group"
                    >
                      {g.photos.length > 0 ? (
                        <img src={g.photos[0]} alt={g.title} className="w-full h-12 object-cover rounded mb-1" />
                      ) : (
                        <div className="w-full h-12 bg-accent rounded mb-1 flex items-center justify-center">
                          <X className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}
                      <span className="text-[9px] font-medium text-muted-foreground leading-tight line-clamp-1 group-hover:text-foreground transition-colors">
                        {g.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={onContinue} size="sm" className="rounded-lg w-full max-w-sm" disabled={confirmedCount === 0}>
              Continue to Pricing
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;
