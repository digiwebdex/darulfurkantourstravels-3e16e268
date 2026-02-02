
# Offer Popup Redesign Plan

## Overview
Redesign the current offer popup to match the target design (second image) with these key changes:

## Changes Required

### 1. Discount Badge Styling
**Current:** Dark green background (`bg-primary/60`) with white text
**Target:** Light cream/gray background with dark text

```tsx
// Change from:
bg-primary/60 text-white

// Change to:
bg-gray-200/90 text-gray-800
```

### 2. Subtitle Styling (Optional Refinement)
Keep the subtitle simple without additional decorative elements - current implementation is already correct.

### 3. Button Styling
Current amber buttons are already correct and match the target design.

## Technical Summary

| Element | Current | Target |
|---------|---------|--------|
| Header | Dark green with 🔥 | No change needed |
| Image | Makkah Sharif | No change needed |
| Title | Amber with sparkles | No change needed |
| Subtitle | White text | No change needed |
| Badge | Dark green bg | Light cream/gray bg |
| Buttons | Solid amber | No change needed |

## Implementation
Single file edit to `src/components/OfferPopup.tsx`:
- Update line 171: Change badge class from `bg-primary/60 text-white` to `bg-gray-200/90 text-gray-800`

This is a minimal change that will make the popup match the target design exactly.
