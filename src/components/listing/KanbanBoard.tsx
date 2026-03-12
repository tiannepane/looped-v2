import { useState, useRef } from "react";
import { ChevronRight, Trash2, X } from "lucide-react";
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
  const [editingTitle, setEditingTitle] = useState(false);
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
      setEditingTitle(false);
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
      <span className="text-[9px] italic text-muted-foreground/50 font-normal transition-opacity duration-300">ai</span>
    ) : null;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Header + progress */}
      <div className="mb-6 flex-shrink-0">
        <div className="flex items-end justify-between mb-3">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-foreground leading-none">Review Items</h2>
            <p className="text-xs text-muted-foreground mt-1.5 tracking-wide">Swipe right to keep, left to pass.</p>
          </div>
          <span className="text-xs text-muted-foreground tracking-wide">
            {allReviewed ? "All done!" : `${confirmedCount} yay${confirmedCount !== 1 ? "s" : ""} · ${rejectedCount} nay${rejectedCount !== 1 ? "s" : ""}`}
          </span>
        </div>
        <div className="h-1 bg-accent rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${groups.length > 0 ? (reviewedCount / groups.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 min-h-0 flex flex-col">
        {!allReviewed && currentGroup ? (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Editorial title — headline style */}
            <div className="mb-4 flex-shrink-0">
              {editingTitle ? (
                <Input
                  value={currentGroup.title}
                  onChange={(e) => handleFieldChange(currentGroup.id, "title", e.target.value)}
                  onBlur={() => setEditingTitle(false)}
                  onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
                  autoFocus
                  className="text-2xl font-black tracking-tight border-none p-0 h-auto bg-transparent focus-visible:ring-0 text-foreground"
                />
              ) : (
                <h3
                  className="text-2xl font-black tracking-tight text-foreground cursor-text hover:text-primary transition-colors duration-200"
                  onClick={() => setEditingTitle(true)}
                >
                  {currentGroup.title}
                </h3>
              )}
            </div>

            <div className="flex gap-8 flex-1 min-h-0">
              {/* Left: Swipe card — photos dominant */}
              <div className="flex flex-col w-[55%] flex-shrink-0 min-h-0">
                <div className="relative w-full flex-1 min-h-0">
                  {reviewableGroups.length > 2 && (
                    <div className="absolute inset-0 mx-3 mt-3 bg-card border border-border rounded-2xl opacity-40" />
                  )}
                  {reviewableGroups.length > 1 && (
                    <div className="absolute inset-0 mx-1.5 mt-1.5 bg-card border border-border rounded-2xl opacity-60" />
                  )}

                  <div
                    className="absolute inset-0 bg-card border border-border rounded-2xl shadow-lg overflow-hidden select-none touch-none"
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
                        className="absolute inset-0 bg-success/15 z-10 flex items-center justify-center pointer-events-none rounded-2xl"
                        style={{ opacity: getOverlayOpacity() }}
                      >
                        <div className="text-success text-4xl font-black uppercase tracking-widest rotate-[-15deg]">
                          YAY
                        </div>
                      </div>
                    )}
                    {dragX < 0 && (
                      <div
                        className="absolute inset-0 bg-destructive/15 z-10 flex items-center justify-center pointer-events-none rounded-2xl"
                        style={{ opacity: getOverlayOpacity() }}
                      >
                        <div className="text-destructive text-4xl font-black uppercase tracking-widest rotate-[15deg] line-through">
                          NAY
                        </div>
                      </div>
                    )}

                    {/* Photos fill the card */}
                    <div className="p-5 h-full flex flex-col">
                      <div className="flex gap-2 flex-wrap flex-1 min-h-0 overflow-y-auto pb-2 content-start">
                        {currentGroup.photos.map((photo, i) => (
                          <div key={i} className="relative group/photo">
                            <img
                              src={photo}
                              alt={`${currentGroup.title} ${i + 1}`}
                              className="w-24 h-24 object-cover rounded-xl border border-border/50 cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-primary/30 transition-all"
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
                          <div className="w-full h-24 bg-accent/50 rounded-xl flex items-center justify-center text-xs text-muted-foreground">
                            No photos
                          </div>
                        )}
                      </div>

                      {/* Move photos — subtle text link */}
                      {otherGroups.length > 0 && currentGroup.photos.length > 0 && (
                        <Collapsible open={movePhotosOpen} onOpenChange={setMovePhotosOpen}>
                          <CollapsibleTrigger
                            className="flex items-center gap-1 text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors py-1"
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${movePhotosOpen ? "rotate-90" : ""}`} />
                            Move to another item
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="flex gap-2 overflow-x-auto pb-1 pt-1" onPointerDown={(e) => e.stopPropagation()}>
                              {otherGroups.map((g) => (
                                <div
                                  key={g.id}
                                  className="flex-shrink-0 w-20 p-1.5 bg-accent/30 border border-dashed border-border/50 rounded-lg text-center hover:border-primary/40 transition-colors"
                                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary", "bg-primary/10"); }}
                                  onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary", "bg-primary/10"); }}
                                  onDrop={(e) => { e.currentTarget.classList.remove("border-primary", "bg-primary/10"); onPhotoDrop(e, g.id); }}
                                >
                                  {g.photos.length > 0 ? (
                                    <img src={g.photos[0]} alt={g.title} className="w-full h-10 object-cover rounded mb-0.5" draggable={false} />
                                  ) : (
                                    <div className="w-full h-10 bg-muted/50 rounded mb-0.5" />
                                  )}
                                  <span className="text-[8px] font-medium text-muted-foreground/70 leading-tight line-clamp-1">{g.title}</span>
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Editable fields — editorial spacing */}
              <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-6 pr-1">
                {/* Category + Condition */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <label className="text-xs uppercase tracking-widest text-muted-foreground">Category</label>
                      <AiBadge field="category" />
                    </div>
                    <Select value={currentGroup.category} onValueChange={(v) => handleFieldChange(currentGroup.id, "category", v)}>
                      <SelectTrigger className="text-sm h-9 bg-transparent border-border/40 focus:border-primary hover:border-border transition-colors">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <label className="text-xs uppercase tracking-widest text-muted-foreground">Condition</label>
                      <AiBadge field="condition" />
                    </div>
                    <Select value={currentGroup.condition} onValueChange={(v) => handleFieldChange(currentGroup.id, "condition", v)}>
                      <SelectTrigger className="text-sm h-9 bg-transparent border-border/40 focus:border-primary hover:border-border transition-colors">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>{CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Size */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <label className="text-xs uppercase tracking-widest text-muted-foreground">Size</label>
                    <AiBadge field="size" />
                  </div>
                  <Input
                    value={currentGroup.size}
                    onChange={(e) => handleFieldChange(currentGroup.id, "size", e.target.value)}
                    className="text-sm h-9 bg-transparent border-border/40 focus-visible:border-primary hover:border-border transition-colors"
                  />
                </div>

                {/* Description */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <label className="text-xs uppercase tracking-widest text-muted-foreground">Description</label>
                    <AiBadge field="description" />
                  </div>
                  <Textarea
                    value={currentGroup.description}
                    onChange={(e) => handleFieldChange(currentGroup.id, "description", e.target.value)}
                    className="text-sm bg-transparent border-border/40 focus-visible:border-primary hover:border-border transition-colors flex-1 min-h-[60px] resize-none"
                  />
                </div>

                {/* Skipped tray */}
                {skippedGroups.length > 0 && (
                  <div className="flex-shrink-0 pt-3 border-t border-border/30">
                    <h4 className="text-xs uppercase tracking-widest text-muted-foreground/60 mb-2 font-medium">
                      Nay'd · tap to restore
                    </h4>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {skippedGroups.map((g) => (
                        <button
                          key={g.id}
                          onClick={() => restoreItem(g.id)}
                          className="flex-shrink-0 w-20 bg-card border border-border/40 rounded-lg p-1.5 hover:border-primary/40 hover:shadow-md transition-all group"
                        >
                          {g.photos.length > 0 ? (
                            <img src={g.photos[0]} alt={g.title} className="w-full h-12 object-cover rounded mb-1" />
                          ) : (
                            <div className="w-full h-12 bg-accent/50 rounded mb-1 flex items-center justify-center">
                              <X className="w-3 h-3 text-muted-foreground/40" />
                            </div>
                          )}
                          <span className="text-[9px] font-medium text-muted-foreground/60 leading-tight line-clamp-1 group-hover:text-foreground transition-colors">
                            {g.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Editorial action buttons — NAY / YAY */}
            <div className="flex items-center justify-center gap-8 py-4 flex-shrink-0">
              <button
                onClick={rejectItem}
                className="group px-12 py-3 rounded-xl text-xl font-black uppercase tracking-widest text-muted-foreground/50 hover:text-muted-foreground transition-all duration-200 hover:line-through"
              >
                NAY
              </button>
              <button
                onClick={approveItem}
                className="px-12 py-3 rounded-xl text-xl font-black uppercase tracking-widest text-primary hover:scale-105 hover:shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.4)] transition-all duration-200"
              >
                YAY
              </button>
            </div>

            {/* Continue — only visible when all reviewed */}
            {allReviewed && confirmedCount > 0 && (
              <div className="flex-shrink-0 animate-[fadeInUp_0.4s_ease-out]">
                <Button
                  onClick={onContinue}
                  className="w-full rounded-xl h-12 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                >
                  Continue to Pricing
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Summary when all reviewed */
          <div className="flex-1 flex flex-col items-center justify-center">
            <h3 className="text-3xl font-black tracking-tight text-foreground mb-2">All reviewed!</h3>
            <p className="text-sm text-muted-foreground mb-6 tracking-wide">
              {confirmedCount} yay{confirmedCount !== 1 ? "s" : ""} · {rejectedCount} nay{rejectedCount !== 1 ? "s" : ""}
            </p>

            {skippedGroups.length > 0 && (
              <div className="mb-6 w-full max-w-sm">
                <h4 className="text-xs uppercase tracking-widest text-muted-foreground/60 mb-3 font-medium text-center">
                  Nay'd · tap to restore
                </h4>
                <div className="flex gap-2 overflow-x-auto pb-1 justify-center">
                  {skippedGroups.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => restoreItem(g.id)}
                      className="flex-shrink-0 w-20 bg-card border border-border/40 rounded-lg p-1.5 hover:border-primary/40 hover:shadow-md transition-all group"
                    >
                      {g.photos.length > 0 ? (
                        <img src={g.photos[0]} alt={g.title} className="w-full h-12 object-cover rounded mb-1" />
                      ) : (
                        <div className="w-full h-12 bg-accent/50 rounded mb-1 flex items-center justify-center">
                          <X className="w-3 h-3 text-muted-foreground/40" />
                        </div>
                      )}
                      <span className="text-[9px] font-medium text-muted-foreground/60 leading-tight line-clamp-1 group-hover:text-foreground transition-colors">
                        {g.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={onContinue}
              className="w-full max-w-sm rounded-xl h-12 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
              disabled={confirmedCount === 0}
            >
              Continue to Pricing
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;
