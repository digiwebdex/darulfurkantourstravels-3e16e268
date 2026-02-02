-- Create storage bucket for hotel images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hotels', 'hotels', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for hotel images
CREATE POLICY "Hotel images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'hotels');

CREATE POLICY "Authenticated users can upload hotel images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'hotels' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update hotel images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'hotels' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete hotel images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'hotels' AND auth.role() = 'authenticated');