-- ============================================================
-- Migration 003: Add weekly schedule control to slots
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- Add missing columns to ref_slots (max_bookings, is_active, available_days)
ALTER TABLE ref_slots ADD COLUMN IF NOT EXISTS max_bookings integer NOT NULL DEFAULT 50;
ALTER TABLE ref_slots ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE ref_slots ADD COLUMN IF NOT EXISTS available_days integer[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}';

-- Add comment to explain available_days: 0=Sunday, 1=Monday, ..., 6=Saturday
COMMENT ON COLUMN ref_slots.available_days IS 'Days of week when slot is available: 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat';

-- Verify the changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'ref_slots' 
ORDER BY ordinal_position;
