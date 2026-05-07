import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = 'https://ikbzqdkplotrxhwodtnn.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('Missing Supabase key. Set SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('Checking current ref_slots structure...');
  
  // Check if columns exist by trying to select them
  const { data, error } = await supabase
    .from('ref_slots')
    .select('id, max_bookings, is_active, available_days')
    .limit(1);
  
  if (error) {
    console.log('Columns may not exist yet. Error:', error.message);
    console.log('\nPlease run this SQL in your Supabase SQL Editor:\n');
    console.log(`-- Migration 003: Add weekly schedule control to slots
ALTER TABLE ref_slots ADD COLUMN IF NOT EXISTS max_bookings integer NOT NULL DEFAULT 50;
ALTER TABLE ref_slots ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE ref_slots ADD COLUMN IF NOT EXISTS available_days integer[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}';

COMMENT ON COLUMN ref_slots.available_days IS 'Days of week when slot is available: 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat';
`);
  } else {
    console.log('Migration already applied or columns exist!');
    console.log('Sample data:', data);
  }
}

applyMigration();
