-- Add retry functionality to notification_logs
ALTER TABLE notification_logs 
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS message_content TEXT,
ADD COLUMN IF NOT EXISTS booking_type TEXT DEFAULT 'booking';

-- Add index for faster failed notification queries
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_booking_id ON notification_logs(booking_id);

-- Update staff_activity_log with more detailed tracking columns
ALTER TABLE staff_activity_log
ADD COLUMN IF NOT EXISTS old_value JSONB,
ADD COLUMN IF NOT EXISTS new_value JSONB,
ADD COLUMN IF NOT EXISTS booking_ref TEXT;

-- Create index for activity log queries
CREATE INDEX IF NOT EXISTS idx_staff_activity_log_created_at ON staff_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_staff_activity_log_action_type ON staff_activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_staff_activity_log_user_id ON staff_activity_log(user_id);

-- Grant select on notification_logs to authenticated users (for admin UI)
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins can manage notification logs" ON notification_logs;

-- Policy for admins to manage notification logs
CREATE POLICY "Admins can manage notification logs"
ON notification_logs
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Allow authenticated users to insert notification logs (for edge functions)
DROP POLICY IF EXISTS "Service can insert notification logs" ON notification_logs;
CREATE POLICY "Service can insert notification logs"
ON notification_logs
FOR INSERT
WITH CHECK (true);