

## Plan: Bigger Calendar Labels, Bolder Subtitle, Rethink Button

### Changes (all in `src/pages/Index.tsx` and `index.html`)

**1. Calendar typewriter label — much bigger**
- Change from `text-base` to `text-3xl` (or ~1.8rem)
- Increase the container height from `h-7` to `h-12` to accommodate
- Keep Caveat font, bump to `font-bold`

**2. Subtitle — bigger, bolder, more crayon-like**
- Bump from `1.6rem` to `2.4rem` (roughly text-4xl)
- Change to `font-bold` weight
- Keep Caveat font (it already looks handwritten/crayon-ish)
- Could also add a heavier handwriting font — **Gaegu** from Google Fonts is more crayon/childlike. I'll add it as an option alongside Caveat.

**3. Button — replace burnt orange with something that fits the vibe**
- Instead of the terracotta primary, use a soft dark charcoal/near-black button (`bg-foreground text-background`) — neutral, confident, doesn't clash with the warm palette
- Or use a hand-drawn style: rounded-full with a slight rotate, Caveat font on the label to feel homey
- I'll go with: **dark charcoal rounded-full button with Caveat font** — feels editorial and warm without the jarring orange

**4. Nav button** — also update to match (charcoal instead of terracotta)

**5. Font addition** — Add **Gaegu** (Google Font) for a true crayon/marker feel. Use it on the subtitle and calendar labels instead of Caveat.

### Files
- `index.html` — add Gaegu font import
- `src/pages/Index.tsx` — update calendar label size, subtitle size/font, button styling

