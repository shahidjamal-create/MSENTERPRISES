import { createClient } from '@supabase/supabase-js';
import supabase from '../db-client.js';
import { HttpError } from './http.js';

export const STAFF_ROLES = ['super_admin', 'admin', 'manager', 'technician', 'inventory_staff'];
export const ALL_ROLES = [...STAFF_ROLES, 'customer'];

// Server-side permission map. The frontend mirrors this only to hide menus;
// every protected route checks it here.
export const PERMISSIONS = {
  dashboard: STAFF_ROLES,
  products: ['super_admin', 'admin', 'manager', 'inventory_staff'],
  catalog: ['super_admin', 'admin', 'manager'],
  bookings: ['super_admin', 'admin', 'manager', 'technician'],
  orders: ['super_admin', 'admin', 'manager'],
  customers: ['super_admin', 'admin', 'manager'],
  inventory: ['super_admin', 'admin', 'manager', 'inventory_staff'],
  suppliers: ['super_admin', 'admin', 'manager', 'inventory_staff'],
  staff: ['super_admin', 'admin'],
  emails: ['super_admin', 'admin'],
  enquiries: ['super_admin', 'admin', 'manager'],
  reports: ['super_admin', 'admin', 'manager'],
  settings: ['super_admin', 'admin'],
};

// A throwaway client for sign-in / refresh so the shared service client never
// picks up a user session.
export function authClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
  );
}

export async function ensureProfile(authUser) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle();
  if (error) throw error;
  if (data) return data;

  const meta = authUser.user_metadata || {};
  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .insert({
      id: authUser.id,
      email: (authUser.email || '').toLowerCase(),
      full_name: meta.full_name || meta.name || '',
      phone: meta.phone || '',
      role: 'customer',
      is_active: true,
    })
    .select()
    .single();
  if (insertError) throw insertError;
  return created;
}

export async function currentUser(req, { required = true } = {}) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    if (required) throw new HttpError(401, 'Please log in to continue.');
    return null;
  }
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    if (required) throw new HttpError(401, 'Your session has expired. Please log in again.');
    return null;
  }
  const profile = await ensureProfile(data.user);
  if (profile.is_active === false) throw new HttpError(403, 'This account has been disabled. Please contact the store.');
  return profile;
}

export async function requirePermission(req, permission) {
  const user = await currentUser(req);
  if (!(PERMISSIONS[permission] || []).includes(user.role)) {
    throw new HttpError(403, 'You do not have permission to perform this action.');
  }
  return user;
}

export const isStaff = (user) => !!user && STAFF_ROLES.includes(user.role);
export const can = (user, permission) => !!user && (PERMISSIONS[permission] || []).includes(user.role);
