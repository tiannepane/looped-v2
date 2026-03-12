

# Plan: Skipped Items Tray + Photo Movement Between Cards

## What we're building

Two additions to the existing Tinder swipe review flow:

1. **Skipped Items Tray** -- When a user swipes left, the item appears as a small thumbnail card in a tray below the swipe area. Clicking a skipped item brings it back into the swipe deck for re-review.

2. **Photo Movement Between Items** -- Each card's photo thumbnails become draggable. A small sidebar/strip shows the other item groups as drop targets, so users can drag a mis-grouped photo out of the current card and into another item.

---

## Implementation Details

### Skipped Items Tray

In `KanbanBoard.tsx`:

- Instead of marking rejected items as permanently gone, show them in a horizontal scrollable row beneath the card stack labeled "Skipped items"
- Each skipped item renders as a small card (thumbnail + title, ~w-24)
- Clicking a skipped item sets `rejected: false`, putting it back in the reviewable queue
- The progress bar and "Continue" button logic stay the same (all items must be reviewed)

### Photo Movement Between Items

On the current swipe card, add drag capability to photo thumbnails:

- Use HTML5 `draggable` on each photo `<img>` with `onDragStart` storing the photo URL and source group ID
- Below the photo row on the card, show a collapsible "Move photo to..." strip with small labeled drop zones for each other group (just tiny cards with the group title)
- `onDrop` removes the photo from the source group and adds it to the target group via `setGroups`
- If moving a photo leaves a group with 0 photos, keep the group (it just shows "No photos")
- Pointer events on drag targets use `e.stopPropagation()` to avoid triggering the swipe gesture

### Files changed

- `src/components/listing/KanbanBoard.tsx` -- All changes are in this single file

