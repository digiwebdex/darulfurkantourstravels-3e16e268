

# Offer Popup - Image Position, Resize & Crop Adjustment Plan

## Overview
Add image positioning, sizing, and crop adjustment options to the Offer Popup settings in the admin panel so admins can control how the banner image displays.

## New Features to Add

### 1. Image Position Control
Dropdown to select how the image is positioned within the container:
- Center (default)
- Top
- Bottom
- Left
- Right

### 2. Image Fit/Size Control
Dropdown to control how the image fills the space:
- Cover (fills the area, may crop)
- Contain (fits entirely, may show gaps)
- Fill (stretches to fill)
- None (original size)

### 3. Image Height Control
Slider or input to adjust the banner image height:
- Range: 100px - 400px
- Default: 224px (current h-56)

### 4. Zoom/Scale Control
Slider to zoom in/out on the image:
- Range: 100% - 200%
- Default: 100%

## Database Changes

Add 4 new columns to `offer_popup_settings` table:

```sql
ALTER TABLE offer_popup_settings
ADD COLUMN image_position TEXT DEFAULT 'center',
ADD COLUMN image_fit TEXT DEFAULT 'cover',
ADD COLUMN image_height INTEGER DEFAULT 224,
ADD COLUMN image_scale INTEGER DEFAULT 100;
```

## Admin Panel Changes (AdminOfferPopup.tsx)

### New UI Elements in Appearance Card:
1. **Image Position** - Select dropdown with options: Center, Top, Bottom, Left, Right
2. **Image Fit** - Select dropdown with options: Cover, Contain, Fill, None
3. **Image Height** - Slider/input (100-400px)
4. **Image Zoom** - Slider (100-200%)
5. **Live preview** updates in real-time as settings change

### Updated Interface:
```typescript
interface PopupSettings {
  // ... existing fields
  image_position: string | null;
  image_fit: string | null;
  image_height: number | null;
  image_scale: number | null;
}
```

## Frontend Changes (OfferPopup.tsx)

Update the image styling to apply the settings dynamically:

```tsx
<img
  src={settings.image_url || makkahImage}
  alt="Offer Banner"
  style={{
    height: `${settings.image_height || 224}px`,
    objectFit: settings.image_fit || 'cover',
    objectPosition: settings.image_position || 'center',
    transform: `scale(${(settings.image_scale || 100) / 100})`,
  }}
  className="w-full"
/>
```

## Files to Modify

| File | Changes |
|------|---------|
| Database Migration | Add 4 new columns |
| `src/components/admin/AdminOfferPopup.tsx` | Add new controls for image settings |
| `src/components/OfferPopup.tsx` | Apply dynamic image styles |

## UI Preview (Admin Panel)

```text
┌─────────────────────────────────────────┐
│ Image Settings                           │
├─────────────────────────────────────────┤
│ Position: [Center ▼]  Fit: [Cover ▼]    │
│                                          │
│ Height: [==●=========] 224px            │
│                                          │
│ Zoom:   [●===========] 100%             │
└─────────────────────────────────────────┘
```

## Implementation Steps

1. Create database migration to add new columns
2. Update `AdminOfferPopup.tsx`:
   - Add new fields to interface
   - Add Select dropdowns for position and fit
   - Add Slider components for height and zoom
   - Update save function to include new fields
   - Update live preview to reflect changes
3. Update `OfferPopup.tsx`:
   - Update interface to include new fields
   - Apply inline styles based on settings

