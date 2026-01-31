
-- Remove the restrictive category check constraint
ALTER TABLE public.packages DROP CONSTRAINT IF EXISTS packages_category_check;

-- Add a more flexible constraint that allows custom categories
ALTER TABLE public.packages ADD CONSTRAINT packages_category_check 
CHECK (category IS NULL OR length(category) > 0);
