import { useState, useRef, useCallback } from "react";
import { Plus, Pencil, Check, X, ChevronUp } from "lucide-react";
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

const MAX_TABLE_ITEMS = 6;

/** Editable zone title — ALL CAPS */
const EditableTitle = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = () => {
    setEditing(false);
    if (draft.trim()) onChange(draft.trim());
    else setDraft(value);
  };

  if (!editing) {
    return (
      <button
        className="group/edit flex items-center gap-1.5 text-sm font-bold tracking-tight text-foreground uppercase truncate w-full"
        onClick={() => {
          setEditing(true);
          setDraft(value);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        <span className="truncate">{value}</span>
        <Pencil className="w-3.5 h-3.5 opacity-0 group-hover/edit:opacity-40 transition-opacity flex-shrink-0" />
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); commit(); }}
      className="flex items-center gap-1.5 w-full"
    >
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        className="text-lg font-bold tracking-tight text-foreground uppercase bg-transparent border-b border-foreground/20 outline-none w-full"
        autoFocus
      />
      <button type="submit" className="text-foreground/40 hover:text-foreground flex-shrink-0">
        <Check className="w-4 h-4" />
      </button>
    </form>
  );
};

const PhotoWall = ({
  groups,
  setGroups,
  ungroupedPhotos,
  setUngroupedPhotos,
  pricingData,
  onContinue,
}: PhotoWallProps) => {
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
  const [hoveredCoaster, setHoveredCoaster] = useState<string | null>(null);
  const [expandedCoaster, setExpandedCoaster] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bonusRoundTransition, setBonusRoundTransition] = useState(false);
  const [bonusMessage, setBonusMessage] = useState("");
  const [newItemNaming, setNewItemNaming] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const newItemInputRef = useRef<HTMLInputElement>(null);
  const dragData = useRef<{ photo: string; sourceId: string | null } | null>(null);

  // Split groups into table (first 6) and overflow
  const tableGroups = groups.slice(0, MAX_TABLE_ITEMS);
  const overflowGroups = groups.slice(MAX_TABLE_ITEMS);
  const hasOverflow = overflowGroups.length > 0;

  const totalValue = pricingData.reduce((sum, p) => sum + p.recommended, 0);
  const totalPhotos = groups.reduce((s, g) => s + g.photos.length, 0) + ungroupedPhotos.length;

  const onDragStartHandler = useCallback((photo: string, sourceId: string | null) => {
    dragData.current = { photo, sourceId };
  }, []);

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

    setGroups((prev) =>
      prev.map((g) =>
        g.id === targetGroupId ? { ...g, photos: [...g.photos, photo] } : g
      )
    );

    dragData.current = null;
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
      title: "Untitled Item",
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

  const onDragEnd = () => setDragOverTarget(null);

  const updateGroupTitle = (groupId: string, title: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, title } : g))
    );
  };

  // Hard delete: permanently remove photo
  const deletePhoto = (groupId: string, photo: string) => {
    setGroups((prev) => {
      const updated = prev.map((g) =>
        g.id === groupId ? { ...g, photos: g.photos.filter((p) => p !== photo) } : g
      );
      return updated.filter((g) => g.photos.length > 0 || g.title !== "Untitled Item");
    });
  };

  const deleteUngroupedPhoto = (photo: string) => {
    setUngroupedPhotos((prev) => prev.filter((p) => p !== photo));
  };

  const deleteGroup = (groupId: string) => {
    // Hard delete — photos are gone
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const createNewItem = () => {
    const name = newItemName.trim() || "Untitled Item";
    const newId = `group-${Date.now()}`;
    setGroups((prev) => [
      ...prev,
      {
        id: newId,
        title: name,
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
    setNewItemNaming(false);
    setNewItemName("");
  };

  // Bonus round: after posting first 6, load next batch
  const handleContinue = () => {
    if (hasOverflow) {
      // Show bonus round transition
      setBonusRoundTransition(true);
      setBonusMessage(`6 down! Ready for the Bonus Round? We found ${overflowGroups.length} more item${overflowGroups.length !== 1 ? "s" : ""} for you.`);
      setTimeout(() => {
        // Move overflow to front, remove completed table items
        setGroups((prev) => prev.slice(MAX_TABLE_ITEMS));
        setBonusRoundTransition(false);
        setBonusMessage("");
      }, 3000);
    } else {
      onContinue();
    }
  };

  const ungroupedCount = ungroupedPhotos.length;

  return (
    <div className="pb-24">
      {/* Bonus Round Transition Overlay */}
      {bonusRoundTransition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 backdrop-blur-sm">
          <div className="text-center animate-scale-in">
            <div className="text-7xl mb-6">🎉</div>
            <p
              className="text-3xl font-bold text-background mb-2"
              style={{ fontFamily: "'Gaegu', cursive" }}
            >
              {bonusMessage}
            </p>
          </div>
        </div>
      )}

      {/* Expanded fan-out overlay */}
      {expandedCoaster && (() => {
        const group = groups.find(g => g.id === expandedCoaster);
        if (!group || group.photos.length === 0) return null;
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm"
            onClick={() => setExpandedCoaster(null)}
          >
            <div className="flex items-end gap-3 p-8" onClick={(e) => e.stopPropagation()}>
              {group.photos.map((photo, pi) => {
                const total = group.photos.length;
                const rotation = (pi - (total - 1) / 2) * 6;
                return (
                  <div
                    key={pi}
                    className="relative group/photo animate-scale-in"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      animationDelay: `${pi * 0.05}s`,
                    }}
                  >
                    <img
                      src={photo}
                      alt={`${group.title} ${pi + 1}`}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        onDragStartHandler(photo, group.id);
                        setExpandedCoaster(null);
                      }}
                      className="w-32 h-44 object-cover rounded-xl shadow-xl cursor-grab active:cursor-grabbing ring-4 ring-white
                        hover:-translate-y-3 hover:shadow-2xl transition-all duration-200"
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); deletePhoto(group.id, photo); }}
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center
                        opacity-0 group-hover/photo:opacity-100 transition-all duration-200 z-50 shadow-md
                        hover:scale-110"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="absolute bottom-8 text-sm text-background/70" style={{ fontFamily: "'Gaegu', cursive" }}>
              Click outside to close · Drag photos to reorganize
            </p>
          </div>
        );
      })()}

      {/* Header */}
      <div className="px-4 md:px-8 lg:px-16 pt-2 pb-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              {hasOverflow
                ? <>6 items on the table. <span className="text-primary">{overflowGroups.length} more in the drawer.</span></>
                : <>We found {tableGroups.filter(g => g.photos.length > 0).length} item{tableGroups.filter(g => g.photos.length > 0).length !== 1 ? "s" : ""} worth{" "}
                    <span className="text-primary">~${totalValue.toLocaleString()}</span>
                  </>
              }
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Drag photos between coasters to reorganize. Hover to fan out.
            </p>
          </div>
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {groups.length} items · {totalPhotos} photos
          </span>
        </div>
      </div>

      {/* Gingham tablecloth area */}
      <div className="mx-4 md:mx-8 lg:mx-16 rounded-2xl p-8 relative tablecloth-gingham">
        {/* 2-column, max 3 rows (6 items) grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Render actual coasters */}
          {tableGroups.map((group, gi) => {
            const pricing = pricingData.find((p) => p.groupId === group.id);
            const isDragOver = dragOverTarget === group.id;
            const isHovered = hoveredCoaster === group.id;

            return (
              <div
                key={group.id}
                className="group/zone relative"
                onMouseEnter={() => setHoveredCoaster(group.id)}
                onMouseLeave={() => setHoveredCoaster(null)}
              >
                {/* Clean coaster — no tape */}
                <div
                  className={`rounded-2xl p-5 relative min-h-[240px] transition-all duration-200 ease-out backdrop-blur-md
                    ${isDragOver ? "ring-2 ring-foreground/30 bg-card/80" : "bg-card/60"}
                  `}
                  style={{
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
                  }}
                  onDragOver={(e) => onDragOver(e, group.id)}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop(e, group.id)}
                  onDragEnd={onDragEnd}
                >
                  {/* Delete coaster button */}
                  <button
                    onClick={() => deleteGroup(group.id)}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-card text-muted-foreground flex items-center justify-center
                      opacity-0 group-hover/zone:opacity-100 transition-opacity duration-200 z-40 shadow-sm
                      hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Title */}
                  <div className="mb-1 pr-8">
                    <EditableTitle
                      value={group.title}
                      onChange={(v) => updateGroupTitle(group.id, v)}
                    />
                  </div>

                  {/* Price on its own line */}
                  {pricing && (
                    <span className="text-base font-bold text-primary block mb-2">
                      ${pricing.recommended}
                    </span>
                  )}

                  <div className="border-b border-foreground/[0.06] mb-3" />

                  {/* Photos — fan-out on hover */}
                  {group.photos.length > 0 ? (
                    <div
                      className="flex items-center justify-center min-h-[120px] overflow-hidden cursor-pointer"
                      onClick={() => setExpandedCoaster(expandedCoaster === group.id ? null : group.id)}
                    >
                      {/* Stacked preview — show max 3 overlapping */}
                      <div className="flex items-center justify-center">
                        {group.photos.slice(0, 3).map((photo, pi) => (
                          <div
                            key={pi}
                            className="relative flex-shrink-0"
                            style={{
                              marginLeft: pi > 0 ? '-16px' : '0',
                              transform: `rotate(${pi % 2 === 0 ? -3 : 3}deg)`,
                              zIndex: 3 - pi,
                            }}
                          >
                            <img
                              src={photo}
                              alt={`${group.title} ${pi + 1}`}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.effectAllowed = "move";
                                onDragStartHandler(photo, group.id);
                              }}
                              className="w-20 h-24 object-cover rounded-lg shadow-md cursor-grab active:cursor-grabbing ring-2 ring-white"
                            />
                          </div>
                        ))}
                        {group.photos.length > 3 && (
                          <div className="w-20 h-24 rounded-lg bg-foreground/5 flex items-center justify-center text-xs font-medium text-muted-foreground shadow-sm ring-2 ring-white"
                            style={{ marginLeft: '-16px', zIndex: 0 }}
                          >
                            +{group.photos.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground/50 absolute bottom-2 right-3">
                        {group.photos.length} photo{group.photos.length !== 1 ? "s" : ""} · tap to expand
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center min-h-[150px] text-sm text-muted-foreground italic">
                      Drag photos here
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Empty "Add Item" slots to fill 3x2 grid */}
          {Array.from({ length: Math.max(0, MAX_TABLE_ITEMS - tableGroups.length) }).map((_, i) => {
            const slotKey = `empty-${i}`;
            const isActiveSlot = i === 0; // First empty slot is the "new item" slot
            const isDragOverSlot = dragOverTarget === "new-item" && isActiveSlot;

            return (
              <div
                key={slotKey}
                className={`rounded-2xl border-2 border-dashed transition-all duration-200 ease-out flex flex-col items-center justify-center min-h-[240px] cursor-pointer
                  ${isDragOverSlot ? "border-foreground/40 bg-card/30" : "border-muted-foreground/[0.12] hover:border-muted-foreground/30"}
                `}
                onDragOver={isActiveSlot ? (e) => onDragOver(e, "new-item") : undefined}
                onDragLeave={isActiveSlot ? onDragLeave : undefined}
                onDrop={isActiveSlot ? onDropNewItem : undefined}
                onDragEnd={isActiveSlot ? onDragEnd : undefined}
                onClick={() => {
                  if (!newItemNaming) {
                    setNewItemNaming(true);
                    setNewItemName("");
                    setTimeout(() => newItemInputRef.current?.focus(), 0);
                  }
                }}
              >
                {newItemNaming && isActiveSlot ? (
                  <form
                    onSubmit={(e) => { e.preventDefault(); createNewItem(); }}
                    className="flex flex-col items-center gap-3 p-4 w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-sm font-medium text-foreground">Name this item</span>
                    <input
                      ref={newItemInputRef}
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      onBlur={() => { if (!newItemName.trim()) setNewItemNaming(false); }}
                      placeholder="e.g. Vintage Lamp"
                      className="text-base text-center font-semibold text-foreground bg-transparent border-b-2 border-foreground/30 outline-none w-full max-w-[200px] focus:border-foreground transition-colors"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        className="rounded-full px-4 h-8 text-sm bg-foreground text-background hover:bg-foreground/90"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" /> Create
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="rounded-lg px-3 h-8 text-sm"
                        onClick={() => { setNewItemNaming(false); setNewItemName(""); }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                    <Plus className="w-6 h-6" />
                    <span className="text-sm" style={{ fontFamily: "'Gaegu', cursive" }}>Add Item</span>
                    <span className="text-[11px] text-muted-foreground/30 max-w-[140px] text-center leading-snug" style={{ fontFamily: "'Gaegu', cursive" }}>
                      Found something else while packing?
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Ungrouped photos (needs sorting) */}
        {ungroupedCount > 0 && (
          <div className="mt-8 pt-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Needs sorting
            </p>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {ungroupedPhotos.map((photo, i) => (
                <div key={i} className="flex-shrink-0 group/photo relative">
                  <img
                    src={photo}
                    alt={`Ungrouped ${i + 1}`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      onDragStartHandler(photo, null);
                    }}
                    className="w-24 h-32 object-cover rounded-lg shadow-md cursor-grab active:cursor-grabbing
                      hover:-translate-y-1 hover:shadow-xl transition-all duration-200 ring-2 ring-foreground/10"
                  />
                  <button
                    onClick={() => deleteUngroupedPhoto(photo)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center
                      opacity-0 group-hover/photo:opacity-100 transition-all duration-200 z-40 shadow-md hover:scale-110"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Overflow "Bonus Round" Drawer */}
      {hasOverflow && (
        <div className="mx-4 md:mx-8 lg:mx-16 mt-4">
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="w-full flex items-center justify-between px-6 py-3 rounded-t-2xl bg-foreground/5 backdrop-blur-sm border border-border/50 hover:bg-foreground/10 transition-colors"
          >
            <span className="text-sm font-bold text-foreground uppercase tracking-wide" style={{ fontFamily: "'Gaegu', cursive" }}>
              🎁 Bonus Round — {overflowGroups.length} more item{overflowGroups.length !== 1 ? "s" : ""} waiting
            </span>
            <ChevronUp className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${drawerOpen ? "" : "rotate-180"}`} />
          </button>
          {drawerOpen && (
            <div className="px-6 py-4 bg-foreground/[0.03] border-x border-b border-border/50 rounded-b-2xl">
              <div className="flex gap-4 overflow-x-auto pb-2">
                {overflowGroups.map((group) => (
                  <div key={group.id} className="flex-shrink-0 w-40 bg-card/60 backdrop-blur-md rounded-xl p-3 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-tight text-foreground truncate">{group.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{group.photos.length} photo{group.photos.length !== 1 ? "s" : ""}</p>
                    {group.photos[0] && (
                      <img src={group.photos[0]} alt={group.title} className="w-full h-20 object-cover rounded-lg mt-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-sm border-t border-border py-4 px-4 md:px-8 lg:px-16">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            {tableGroups.filter(g => g.photos.length > 0).length} items · ~${totalValue.toLocaleString()} total
          </span>

          {ungroupedCount > 0 && (
            <span className="text-sm text-foreground/60 font-medium">
              {ungroupedCount} photo{ungroupedCount !== 1 ? "s" : ""} need sorting
            </span>
          )}

          <Button
            onClick={handleContinue}
            disabled={ungroupedCount > 0}
            className={`rounded-full px-10 py-3 h-12 font-bold text-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all ${
              ungroupedCount > 0 ? "opacity-50" : "hover:shadow-[0_4px_16px_hsl(18,60%,50%,0.4)]"
            }`}
            style={{ fontFamily: "'Gaegu', cursive" }}
          >
            {hasOverflow ? "Post & Load More" : "Review Details"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PhotoWall;
