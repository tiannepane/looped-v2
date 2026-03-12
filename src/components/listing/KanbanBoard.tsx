import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface ItemGroup {
  id: string;
  title: string;
  category: string;
  condition: string;
  size: string;
  description: string;
  photos: string[];
  confirmed: boolean;
  editedFields: Set<string>;
}

interface KanbanBoardProps {
  groups: ItemGroup[];
  setGroups: React.Dispatch<React.SetStateAction<ItemGroup[]>>;
  ungroupedPhotos: string[];
  setUngroupedPhotos: React.Dispatch<React.SetStateAction<string[]>>;
  onContinue: () => void;
}

const KanbanBoard = ({ groups, setGroups, ungroupedPhotos, setUngroupedPhotos, onContinue }: KanbanBoardProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [draggedPhoto, setDraggedPhoto] = useState<{ photo: string; fromGroup: string | null; index: number } | null>(null);

  const confirmedCount = groups.filter((g) => g.confirmed).length;
  const allConfirmed = groups.length > 0 && confirmedCount === groups.length;

  const toggleExpanded = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleFieldChange = (groupId: string, field: string, value: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, [field]: value, editedFields: new Set(g.editedFields).add(field) }
          : g
      )
    );
  };

  const confirmGroup = (id: string) => {
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, confirmed: !g.confirmed } : g)));
  };

  const deleteGroup = (id: string) => {
    const group = groups.find((g) => g.id === id);
    if (group) {
      setUngroupedPhotos((prev) => [...prev, ...group.photos]);
      setGroups((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const addNewGroup = () => {
    const newGroup: ItemGroup = {
      id: `group-${Date.now()}`,
      title: "New Item",
      category: "",
      condition: "",
      size: "",
      description: "",
      photos: [],
      confirmed: false,
      editedFields: new Set(),
    };
    setGroups((prev) => [...prev, newGroup]);
  };

  // Drag & drop handlers
  const onPhotoDragStart = (photo: string, fromGroup: string | null, index: number) => {
    setDraggedPhoto({ photo, fromGroup, index });
  };

  const onGroupDrop = (targetGroupId: string) => {
    if (!draggedPhoto) return;
    const { photo, fromGroup, index } = draggedPhoto;

    if (fromGroup === targetGroupId) return;

    // Remove from source
    if (fromGroup === null) {
      setUngroupedPhotos((prev) => prev.filter((_, i) => i !== index));
    } else {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === fromGroup ? { ...g, photos: g.photos.filter((_, i) => i !== index) } : g
        )
      );
    }

    // Add to target
    setGroups((prev) =>
      prev.map((g) => (g.id === targetGroupId ? { ...g, photos: [...g.photos, photo] } : g))
    );

    setDraggedPhoto(null);
  };

  const onUngroupedDrop = () => {
    if (!draggedPhoto) return;
    const { photo, fromGroup, index } = draggedPhoto;

    if (fromGroup === null) return;

    setGroups((prev) =>
      prev.map((g) =>
        g.id === fromGroup ? { ...g, photos: g.photos.filter((_, i) => i !== index) } : g
      )
    );
    setUngroupedPhotos((prev) => [...prev, photo]);
    setDraggedPhoto(null);
  };

  return (
    <div>
      <h2 className="text-3xl font-black tracking-tight text-foreground mb-2">Review & Group Items</h2>
      <p className="text-muted-foreground mb-6">
        AI grouped your photos by item. Drag photos between groups to fix mistakes.
      </p>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            {confirmedCount} of {groups.length} items reviewed
          </span>
          <span className="text-xs text-muted-foreground">
            {allConfirmed ? "All set!" : "Confirm each item to continue"}
          </span>
        </div>
        <div className="h-2 bg-accent rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${groups.length > 0 ? (confirmedCount / groups.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Ungrouped photos */}
      {ungroupedPhotos.length > 0 && (
        <div
          className="mb-6 p-4 border-2 border-dashed border-border rounded-lg"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onUngroupedDrop}
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Ungrouped Photos ({ungroupedPhotos.length})
          </p>
          <div className="flex gap-2 flex-wrap">
            {ungroupedPhotos.map((photo, i) => (
              <img
                key={i}
                src={photo}
                alt={`Ungrouped ${i + 1}`}
                className="w-16 h-16 object-cover rounded-lg border border-border cursor-grab active:cursor-grabbing"
                draggable
                onDragStart={() => onPhotoDragStart(photo, null, i)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Kanban columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-8">
        {groups.map((group) => (
          <div
            key={group.id}
            className={`min-w-[280px] max-w-[320px] flex-shrink-0 border rounded-lg bg-card transition-all duration-300 ${
              group.confirmed ? "border-success/50" : "border-border"
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onGroupDrop(group.id)}
          >
            {/* Column header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 mb-2">
                <Input
                  value={group.title}
                  onChange={(e) => handleFieldChange(group.id, "title", e.target.value)}
                  className="text-sm font-semibold border-none p-0 h-auto bg-transparent focus-visible:ring-0"
                />
                <button
                  onClick={() => confirmGroup(group.id)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                    group.confirmed
                      ? "bg-success text-success-foreground"
                      : "bg-accent text-muted-foreground hover:bg-primary hover:text-primary-foreground"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteGroup(group.id)}
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors duration-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs text-muted-foreground">
                {group.photos.length} photo{group.photos.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Photos */}
            <div className="p-3 flex gap-2 flex-wrap min-h-[80px]">
              {group.photos.map((photo, i) => (
                <img
                  key={i}
                  src={photo}
                  alt={`${group.title} ${i + 1}`}
                  className="w-14 h-14 object-cover rounded-lg border border-border cursor-grab active:cursor-grabbing"
                  draggable
                  onDragStart={() => onPhotoDragStart(photo, group.id, i)}
                />
              ))}
              {group.photos.length === 0 && (
                <p className="text-xs text-muted-foreground w-full text-center py-4">
                  Drop photos here
                </p>
              )}
            </div>

            {/* Expandable details */}
            <div className="px-4 pb-4">
              <button
                onClick={() => toggleExpanded(group.id)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 mb-2"
              >
                {expandedGroups.has(group.id) ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
                Details
              </button>

              {expandedGroups.has(group.id) && (
                <div className="flex flex-col gap-3">
                  {(["category", "condition", "size"] as const).map((field) => (
                    <div key={field}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          {field}
                        </label>
                        {!group.editedFields.has(field) && (
                          <span className="text-[9px] bg-primary/10 text-primary px-1 py-0.5 rounded font-bold">
                            AI
                          </span>
                        )}
                      </div>
                      <Input
                        value={group[field]}
                        onChange={(e) => handleFieldChange(group.id, field, e.target.value)}
                        className="text-xs h-8 bg-background"
                      />
                    </div>
                  ))}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Description
                      </label>
                      {!group.editedFields.has("description") && (
                        <span className="text-[9px] bg-primary/10 text-primary px-1 py-0.5 rounded font-bold">
                          AI
                        </span>
                      )}
                    </div>
                    <Textarea
                      value={group.description}
                      onChange={(e) => handleFieldChange(group.id, "description", e.target.value)}
                      rows={3}
                      className="text-xs bg-background"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add new group button */}
        <button
          onClick={addNewGroup}
          className="min-w-[120px] flex-shrink-0 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors duration-300 py-10"
        >
          <Plus className="w-6 h-6" />
          <span className="text-xs">New Group</span>
        </button>
      </div>

      <Button onClick={onContinue} size="lg" className="rounded-lg" disabled={!allConfirmed}>
        Continue to Pricing
      </Button>
    </div>
  );
};

export default KanbanBoard;
