

# Layout Fixes: Title Position + Centered Action Buttons

## Problems
1. Title is at the bottom of the card — unconventional and hard to read
2. Approve/skip buttons sit only under the left photo column, making it unclear that the right-side details are also part of the same item

## Changes (KanbanBoard.tsx)

### 1. Move title to the top
- Move the editable title `Input` from the bottom of the card (line 296-301) to the very top of the card content area, above the photo grid
- Style it as a prominent header with slightly larger text

### 2. Center action buttons below the full width
- Move the approve/skip button group out of the left column (`w-80`) and place it below the entire `flex gap-6` row (photos + details)
- Center them horizontally so they visually anchor the whole item, not just the photos
- This makes it obvious that swiping/clicking applies to everything on screen

### Layout structure after changes:
```text
┌─────────────────────────────────────────┐
│ Review Items          2 approved · 1 skip│
│ ████████████░░░░░░░░░░░░░░░░ progress   │
├──────────────┬──────────────────────────┤
│  [Card]      │  Category  [dropdown]    │
│  Title ←TOP  │  Condition [dropdown]    │
│  ┌──┐ ┌──┐  │  Size      [input]       │
│  │📷│ │📷│  │  Description [textarea]  │
│  └──┘ └──┘  │                          │
│  Move to...  │  Skipped tray...         │
├──────────────┴──────────────────────────┤
│           ⊘  ←center→  ✓               │
│         Continue to Pricing             │
└─────────────────────────────────────────┘
```

### File: `src/components/listing/KanbanBoard.tsx`

