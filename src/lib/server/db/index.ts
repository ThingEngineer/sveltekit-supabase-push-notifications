import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '$env/static/private';

// Create a Supabase client for server-side API calls
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Simple session management for demo purposes
export type SessionInfo = {
  username: string;
};

// No-op functions for compatibility with existing code
export function deleteExpiredDbSessions() { /* Not needed with Supabase auth */ }
export function insertDbSession() { /* Not needed with Supabase auth */ }
export function deleteDbSession() { /* Not needed with Supabase auth */ }
export function getDbSession() { return undefined; }
