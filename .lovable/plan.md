
# Fix Offer Popup - Match Exact Reference Design

## Problem
The current popup has a cream/light background (`#f5f0e8`) for the content section, but the reference design shows a **dark green/teal background** that matches the header. The text colors also need to be adjusted for visibility on dark background.

## Exact Design Specifications from Reference

### Structure
- Centered modal with rounded corners
- Dark green header bar
- Large Kaaba image banner
- Dark green content section (NOT cream)

### Colors
| Element | Current | Should Be |
|---------|---------|-----------|
| Content Background | `#f5f0e8` (cream) | Dark green/teal (`#0d4a3e` or similar) |
| Title | `text-amber-500` | Gold/amber (keep) |
| Subtitle | `text-gray-800` | White (`text-white`) |
| Description | `text-gray-600` | Light gray (`text-gray-300`) |
| Badge | `bg-amber-500 text-white` | Gold background, dark text |
| Buttons | `bg-amber-400 text-gray-900` | Gold/amber, dark text (keep) |

### Layout
- Width: Slightly wider (`max-w-lg` instead of `max-w-md`)
- Buttons: Side by side on mobile too
- Proper spacing and padding

## Changes to Make

### File: `src/components/OfferPopup.tsx`

1. **Change content section background** from cream to dark teal/green:
   ```tsx
   // FROM:
   <div className="px-6 py-6 text-center bg-[#f5f0e8]">
   
   // TO:
   <div className="px-6 py-6 text-center bg-[#0d5a4c]">
   ```

2. **Update subtitle color** to white for dark background:
   ```tsx
   // FROM:
   <p className="text-sm font-semibold text-gray-800 mb-3">
   
   // TO:
   <p className="text-sm font-semibold text-white mb-3">
   ```

3. **Update description color** to light gray:
   ```tsx
   // FROM:
   <p className="text-sm text-gray-600 mb-5 leading-relaxed">
   
   // TO:
   <p className="text-sm text-gray-300 mb-5 leading-relaxed">
   ```

4. **Update discount badge** styling:
   ```tsx
   // FROM:
   <span className="inline-block bg-amber-500 text-white ...">
   
   // TO:
   <span className="inline-block bg-[#d4a84b] text-gray-900 ...">
   ```

5. **Increase popup width** to match reference:
   ```tsx
   // FROM:
   className="... w-[90%] max-w-md"
   
   // TO:
   className="... w-[90%] max-w-lg"
   ```

6. **Make buttons always side by side**:
   ```tsx
   // FROM:
   <div className="flex flex-col xs:flex-row justify-center gap-3">
   
   // TO:
   <div className="flex flex-row justify-center gap-3">
   ```

7. **Remove white border** on container:
   ```tsx
   // FROM:
   <div className="relative rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-white">
   
   // TO:
   <div className="relative rounded-2xl shadow-2xl overflow-hidden border-0 bg-primary">
   ```

## Visual Comparison

### Current (Wrong)
- Cream/light content background
- Dark text on light background
- Smaller width

### After Fix (Correct)
- Dark green/teal content background matching header
- Light/gold text on dark background
- Wider popup
- Seamless design flow from header to content

## Files to Modify
| File | Changes |
|------|---------|
| `src/components/OfferPopup.tsx` | Update background colors, text colors, width, and layout |
