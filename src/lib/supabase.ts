import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. ' +
    'Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// ── Database types ────────────────────────────────────────────────────────────
export interface DbDevotee {
  id?: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  gotra: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbSevaBooking {
  id: string;
  devotee_phone: string;
  seva_date: string;
  seva_date_iso: string | null;
  seva_type: string;
  slot_id: string | null;
  slot_time: string | null;
  slot_name: string | null;
  slot_price: number;
  family_members: string[];
  total: number;
  payment_method: string;
  payment_status: string;
  created_at?: string;
}

export interface DbBookingDeitySeva {
  id?: string;
  booking_id: string;
  deity_id: string;
  deity_name: string;
  seva_name: string;
  price: number;
}

export interface DbDonation {
  id?: string;
  donor_name: string;
  donor_phone: string;
  donor_email: string;
  donation_type: string;
  amount: number;
  message: string;
  want_receipt: boolean;
  payment_status: string;
  transaction_id: string | null;
  created_at?: string;
}
