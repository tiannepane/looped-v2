

## Plan: Redesign Landing Page Below Hero

### Files to change
- `src/pages/Index.tsx` — full rewrite of sections below hero, calendar update, button text changes
- `src/index.css` — add checklist strikethrough and wave-draw animations

### Hero changes (minimal)
1. CTA button text: "Start Selling" → "List Your First Item"
2. Nav button stays "Start Selling"
3. Calendar: expand to 8 moments with new events and colors:
   - Moving Day (March, dusty rose), Graduation (May, sage), First Apartment (July, mustard), Spring Cleaning (April, lavender), The Breakup (October, soft blue), New Job New City (August, amber `hsl(35,80%,55%)`), Wedding (June, emerald `hsl(155,40%,45%)`), Back to School (September, slate `hsl(215,15%,55%)`)

### Section 1: How It Works — Animated Checklist
- Title: "Three steps. That's it." in `text-4xl font-bold tracking-tight` centered
- Below: a "paper taped to wall" card (`max-w-2xl mx-auto bg-white rounded-xl shadow-xl rotate-[-0.5deg]` relative)
  - Tape element: absolute `w-16 h-6 bg-amber-200/60 rounded-sm rotate-[-2deg]` at top center
  - Three checklist items with `space-y-8 p-10`
  - Each has a checkbox square, title, subtitle
  - IntersectionObserver triggers sequential check animations:
    - SVG checkmark draws via `stroke-dasharray`/`stroke-dashoffset` animation
    - CSS strikethrough line expands across text via `scaleX(0)→scaleX(1)` transition
    - Items trigger at 0.5s, 1.5s, 2.5s delays
  - After all checked: "That's it. You're done." fades in below

### Section 2: Pricing Intelligence — Interactive Slider
- Title & subtitle kept, restyled to `text-4xl font-bold`
- Three stat sticky notes scattered (not in a row) with tape decoration, rotations, colored backgrounds
- Center pricing card with:
  - Couch image, title, "AI Suggested" label
  - Dynamic price controlled by `useState` slider (range 180–450)
  - Proper `<input type="range">` styled with terracotta accent
  - Three zone labels: Quick Sale / Market Average / Patient
  - Zone-dependent italic comment that crossfades
  - "92% confidence · Based on 10 sold items in Toronto" below

### Section 3: Life Transitions — Wave with Cards
- Title & subtitle kept, restyled
- SVG sine wave path across full width, stroke-dasharray draw animation on scroll
- 8 life event cards positioned along the wave (alternating above/below)
- Cards: `w-56 bg-white rounded-2xl shadow-md` with emoji, title, quote, attribution, slight rotation
- Cards fade+slide in sequentially as wave draws
- Hover lift effect

### Section 4: Footer CTA
- "Your stuff is worth more than you think." `text-4xl font-bold`
- "Especially that couch." `text-lg italic`
- "Start Selling" button matching hero style
- "Looped · Made in Toronto 🇨🇦" + FAQ / Feedback links

### CSS additions (`index.css`)
- `@keyframes draw-check` for SVG checkmark
- `.checklist-strike` for strikethrough expansion
- `@keyframes draw-wave` for SVG wave path
- Slider thumb/track styling for the range input

