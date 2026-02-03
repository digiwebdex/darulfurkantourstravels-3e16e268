
# Add Full-View Image Mode to Offer Popup

## Overview
Add a new field in the Admin Offer Popup settings to upload a "full-view" promotional image (like the complete flyer design). When this image is set, the popup will show ONLY that image with no text overlays or buttons - just the full promotional image and a close button.

## Current vs New Behavior

| Mode | What Shows |
|------|------------|
| Current (Banner Image) | Image + Title + Subtitle + Description + Buttons |
| NEW (Full-View Image) | Only the full promotional image + Close button |

## Changes Required

### 1. Database Schema Update
Add new field to store the full-view image URL:

```sql
-- Add full_view_image_url column to offer_popup_settings table
ALTER TABLE offer_popup_settings 
ADD COLUMN full_view_image_url TEXT;
```

### 2. Admin Panel Changes (`src/components/admin/AdminOfferPopup.tsx`)

Add a new upload field in the Appearance section:

```tsx
{/* Full-View Image (New Section) */}
<div className="border-t pt-4">
  <Label>Full-View Promotional Image</Label>
  <p className="text-sm text-muted-foreground mb-2">
    Upload a complete promotional flyer. When set, this image will be shown 
    as the entire popup content (no title, buttons, etc.)
  </p>
  <div className="mt-2 space-y-2">
    <div className="flex gap-2">
      <Input
        value={settings.full_view_image_url || ""}
        onChange={(e) => updateField("full_view_image_url", e.target.value)}
        placeholder="Enter image URL or upload"
      />
      <Button variant="outline" onClick={...}>
        Upload
      </Button>
    </div>
    {settings.full_view_image_url && (
      <div className="relative">
        <img src={settings.full_view_image_url} className="w-full rounded-lg" />
        <Button variant="destructive" size="sm" onClick={...}>
          Remove
        </Button>
      </div>
    )}
  </div>
</div>
```

Update the `PopupSettings` interface and `handleSave` function to include `full_view_image_url`.

### 3. Frontend Popup Changes (`src/components/OfferPopup.tsx`)

Add conditional rendering based on whether `full_view_image_url` is set:

```tsx
{/* If full-view image is set, show ONLY that image */}
{settings.full_view_image_url ? (
  <motion.div className="relative max-w-lg rounded-2xl overflow-hidden">
    <button onClick={handleClose} className="absolute top-3 right-3 z-10 ...">
      <X className="w-5 h-5 text-white" />
    </button>
    <img 
      src={settings.full_view_image_url} 
      alt="Promotional Offer"
      className="w-full h-auto max-h-[90vh] object-contain"
    />
  </motion.div>
) : (
  /* Existing popup with title, buttons, etc. */
)}
```

### 4. Update site_settings Data Structure

Update the OfferPopupSettings interface to include the new field:

```tsx
interface OfferPopupSettings {
  // ... existing fields
  full_view_image_url?: string;
}
```

## Visual Result

**When Full-View Image is NOT set:**
- Shows current design with banner image, title, description, buttons

**When Full-View Image IS set:**
- Shows only the uploaded promotional flyer (like the Umrah package image)
- Close button in top-right corner
- No text overlays, no buttons - just the complete promotional image

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/AdminOfferPopup.tsx` | Add full-view image upload field, update interface, save logic |
| `src/components/OfferPopup.tsx` | Add conditional rendering for full-view mode |
| Database Migration | Add `full_view_image_url` column to `offer_popup_settings` |
