-- Add full_view_image_url column to offer_popup_settings table
ALTER TABLE offer_popup_settings 
ADD COLUMN IF NOT EXISTS full_view_image_url TEXT;