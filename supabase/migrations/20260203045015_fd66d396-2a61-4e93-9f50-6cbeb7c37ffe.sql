-- Add image adjustment columns to offer_popup_settings
ALTER TABLE offer_popup_settings
ADD COLUMN IF NOT EXISTS image_position TEXT DEFAULT 'center',
ADD COLUMN IF NOT EXISTS image_fit TEXT DEFAULT 'cover',
ADD COLUMN IF NOT EXISTS image_height INTEGER DEFAULT 224,
ADD COLUMN IF NOT EXISTS image_scale INTEGER DEFAULT 100;