import { useState, useRef, useCallback } from "react";
import { Plus, Pencil, Check } from "lucide-react";
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

const ZONE_COLORS = [
  { bg: "bg-amber-500/[0.08]", hover: "bg-amber-500/20", border: "border-amber-400", ring: "ring-amber-200" },
  { bg: "bg-emerald-500/[0.08]", hover: "bg-emerald-500/20", border: "border-emerald-400", ring: "ring-emerald-200" },
  { bg: "bg-slate-500/[0.08]", hover: "bg-slate-500/20", border: "border-slate-400", ring: "ring-slate-200" },
  { bg: "bg-rose-500/[0.08]", hover: "bg-rose-500/20", border: "border-rose-400", ring: "ring-rose-200" },
  { bg: "bg-violet-500/[0.08]", hover: "bg-violet-500/20", border: "border-violet-400", ring: "ring-violet-200" },
  { bg: "bg-sky-500/[0.08]", hover: "bg-sky-500/20", border: "border-sky-400", ring: "ring-sky-200" },
];

/** Pseudo-random rotation for a photo based on its index */
const ROTATIONS = [-2, 3, -1, 2, -3, 1, -2, 4, -1, 3];
const getRotation = (i: number) => ROTATIONS[i % ROTATIONS.length];

/** Printed photo on the table */
const TablePhoto = ({
  src,
  alt,
  rotation,
  groupId,
  onDragStart,
  className = "",
}: {
  src: string;
  alt: string;
  rotation: number;
  groupId: string | null;
  onDragStart: (photo: string, groupId: string | null) => void;
  className?: string;
}) => (
  <img
    src={src}
    alt={alt}
    draggable
    onDragStart={(e) => {
      e.dataTransfer.effectAllowed = "move";
      onDragStart(src, groupId);
    }}
    className={`w-28 h-36 object-cover rounded-lg shadow-md ring-2 ring-white cursor-grab active:cursor-grabbing
      hover:-translate-y-2 hover:shadow-xl hover:!rotate-0 hover:z-30 transition-all duration-200 ease-out ${className}`}
    style={{ transform: `rotate(${rotation}deg)` }}
  />
);

/** Editable zone title */
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
        className="group/edit flex items-center gap-1.5 text-lg font-semibold tracking-tight text-foreground truncate"
        onClick={() => {
          setEditing(true);
          setDraft(value);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        <span className="truncate">{value}</span>
        <Pencil className="w-3.5 h-3.5 opacity-0 group-hover/edit:opacity-40 transition-opacity" />
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); commit(); }}
      className="flex items-center gap-1.5"
    >
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        className="text-lg font-semibold tracking-tight text-foreground bg-transparent border-b border-foreground/20 outline-none w-full"
        autoFocus
      />
      <button type="submit" className="text-foreground/40 hover:text-foreground">
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
  const dragData = useRef<{ photo: string; sourceId: string | null } | null>(null);

  const visibleGroups = groups.filter((g) => g.photos.length > 0);
  const totalValue = pricingData.reduce((sum, p) => sum + p.recommended, 0);
  const totalPhotos = groups.reduce((s, g) => s + g.photos.length, 0) + ungroupedPhotos.length;
  const ungroupedCount = ungroupedPhotos.length;

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

  // Determine grid class based on item count (including +New Item zone)
  const itemCount = visibleGroups.length;
  const getGridClass = () => {
    if (itemCount >= 7) return "flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4";
    if (itemCount <= 1) return "grid grid-cols-2 gap-6";
    if (itemCount === 2) return "grid grid-cols-2 gap-6";
    if (itemCount === 3) return "grid grid-cols-3 gap-6";
    if (itemCount === 4) return "grid grid-cols-2 gap-6";
    if (itemCount === 5) return "grid grid-cols-3 gap-6";
    return "grid grid-cols-3 gap-6"; // 6
  };

  const isScrollLayout = itemCount >= 7;

  return (
    <div className="pb-24">
      {/* Header — on cream, above the tablecloth */}
      <div className="px-4 md:px-8 lg:px-16 pt-2 pb-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              We found {visibleGroups.length} item{visibleGroups.length !== 1 ? "s" : ""} worth{" "}
              <span className="text-primary">~${totalValue.toLocaleString()}</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Drag photos between zones to reorganize.
            </p>
          </div>
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {visibleGroups.length} items · {totalPhotos} photos
          </span>
        </div>
      </div>

      {/* Tablecloth area */}
      <div
        className="mx-4 md:mx-8 lg:mx-16 rounded-2xl p-8 relative"
        style={{
          background: "hsl(40, 30%, 96%)",
          backgroundImage: `
            repeating-linear-gradient(0deg, rgba(180,160,140,0.04) 0px, rgba(180,160,140,0.04) 1px, transparent 1px, transparent 40px),
            repeating-linear-gradient(90deg, rgba(180,160,140,0.04) 0px, rgba(180,160,140,0.04) 1px, transparent 1px, transparent 40px)
          `,
        }}
      >
        {/* Zone grid */}
        <div className={getGridClass()}>
          {visibleGroups.map((group, gi) => {
            const zoneColor = ZONE_COLORS[gi % ZONE_COLORS.length];
            const pricing = pricingData.find((p) => p.groupId === group.id);
            const isDragOver = dragOverTarget === group.id;
            const photosToShow = group.photos.slice(0, 4);
            const extraCount = group.photos.length - 4;

            return (
              <div
                key={group.id}
                className={`rounded-2xl p-6 transition-all duration-200 ease-out relative min-h-[220px]
                  ${isDragOver ? `${zoneColor.hover} border-2 border-dashed ${zoneColor.border}` : zoneColor.bg}
                  ${isScrollLayout ? "min-w-[300px] snap-center flex-shrink-0" : ""}
                `}
                onDragOver={(e) => onDragOver(e, group.id)}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, group.id)}
                onDragEnd={onDragEnd}
              >
                {/* Zone header */}
                <div className="flex items-center justify-between mb-3">
                  <EditableTitle
                    value={group.title}
                    onChange={(v) => updateGroupTitle(group.id, v)}
                  />
                  {pricing && (
                    <span className="text-lg font-bold text-primary ml-2 whitespace-nowrap">
                      ~${pricing.recommended}
                    </span>
                  )}
                </div>
                <div className="border-b border-foreground/[0.08] mb-4" />

                {/* Photos scattered in zone */}
                <div className="flex items-center justify-center min-h-[140px]">
                  <div className="flex items-center" style={{ marginLeft: photosToShow.length > 1 ? '16px' : '0' }}>
                    {photosToShow.map((photo, pi) => (
                      <div
                        key={pi}
                        className="relative"
                        style={{
                          marginLeft: pi > 0 ? "-20px" : "0",
                          zIndex: pi + 1,
                        }}
                      >
                        <TablePhoto
                          src={photo}
                          alt={`${group.title} ${pi + 1}`}
                          rotation={getRotation(pi)}
                          groupId={group.id}
                          onDragStart={onDragStartHandler}
                        />
                      </div>
                    ))}
                    {extraCount > 0 && (
                      <div
                        className={`w-28 h-36 rounded-lg ${zoneColor.bg} flex items-center justify-center text-sm font-medium text-foreground/60 shadow-md ring-2 ring-white`}
                        style={{ marginLeft: "-20px", zIndex: photosToShow.length + 1 }}
                      >
                        +{extraCount} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* + New Item zone */}
          <div
            className={`rounded-2xl border-2 border-dashed transition-all duration-200 ease-out flex items-center justify-center min-h-[220px]
              ${dragOverTarget === "new-item" ? "border-amber-400 bg-amber-500/10" : "border-gray-300"}
              ${isScrollLayout ? "min-w-[300px] snap-center flex-shrink-0" : ""}
            `}
            onDragOver={(e) => onDragOver(e, "new-item")}
            onDragLeave={onDragLeave}
            onDrop={onDropNewItem}
            onDragEnd={onDragEnd}
            onClick={() => {
              const newId = `group-${Date.now()}`;
              setGroups((prev) => [
                ...prev,
                {
                  id: newId,
                  title: "Untitled Item",
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
            }}
          >
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Plus className="w-8 h-8 text-gray-400" />
              <span className="text-sm">New Item</span>
            </div>
          </div>
        </div>

        {/* Ungrouped photos */}
        {ungroupedCount > 0 && (
          <div
            className={`mt-8 pt-6 transition-colors duration-200 ${
              dragOverTarget === "ungrouped" ? "bg-amber-500/5 rounded-xl" : ""
            }`}
            onDragOver={(e) => onDragOver(e, "ungrouped")}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, "ungrouped")}
            onDragEnd={onDragEnd}
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Needs sorting
            </p>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {ungroupedPhotos.map((photo, i) => (
                <div key={i} className="flex-shrink-0">
                  <TablePhoto
                    src={photo}
                    alt={`Ungrouped ${i + 1}`}
                    rotation={getRotation(i)}
                    groupId={null}
                    onDragStart={onDragStartHandler}
                    className="animate-pulse ring-amber-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-t border-gray-100 py-4 px-4 md:px-8 lg:px-16">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            {visibleGroups.length} items · ~${totalValue.toLocaleString()} total
          </span>

          {ungroupedCount > 0 && (
            <span className="text-sm text-amber-600 font-medium">
              {ungroupedCount} photo{ungroupedCount !== 1 ? "s" : ""} need sorting
            </span>
          )}

          <Button
            onClick={onContinue}
            disabled={ungroupedCount > 0}
            className={`rounded-lg px-8 py-3 h-11 font-semibold text-base transition-all ${
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
