

## Plan: Enhance Sorting Table — Layout, Frames, Delete, New Item Flow

### Changes (all in `src/components/listing/PhotoWall.tsx`)

**1. Title on one line, price below**
- Move price out of the header row. Title spans full width on its own line (editable, truncated).
- Price sits below the separator as `~$X` in terracotta, text-base font-bold.

**2. Functional "Add New Item" with naming**
- Clicking "+ New Item" opens an inline state (`newItemNaming`) that replaces the placeholder with an input field + confirm button.
- User types a name, hits enter/confirm, and a new empty group is created with that title.
- If they cancel (blur with empty), nothing happens.

**3. Delete entire stack**
- Add a small `Trash2` icon button (absolute top-right of each zone, opacity-0 on default, visible on group hover).
- Clicking it removes the group entirely: photos go to ungrouped.

**4. Delete individual photos**
- Each `TablePhoto` gets a small `X` button on hover (absolute top-right corner).
- Clicking it removes that photo from the group. If it was the last photo, the group is removed.

**5. 3D cartoon picture frame around each zone**
- Wrap each zone in a decorative "frame" using layered CSS box-shadows and borders to simulate a chunky 3D cartoon frame:
  - Outer: thick rounded border (~4px) in a warm wood-like color (`hsl(30, 40%, 65%)`)
  - Inner shadow: `inset 0 0 0 2px hsl(35, 35%, 80%)` for a beveled inner edge
  - Outer shadow: `4px 6px 0 hsl(30, 30%, 50%)` for the 3D depth/offset effect
  - Slight `rotate` on alternating zones (±0.5deg) for scrappy feel
- The zone's colored background sits inside the frame.

**6. Minor polish**
- Empty groups (0 photos) still show in grid so user can drag into them or delete them.
- Keep all existing drag-and-drop logic unchanged.

