// Supabase browser client. Publishable/anon key is designed for browser use ONLY with strict RLS.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { tr } from './language.js';

export const SUPABASE_URL = 'https://krrxhixpqlshfbllwejk.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_cg2CPS4I2Ynez1_2ibOYWw_RGP-q_vh';

if (SUPABASE_URL.startsWith('PASTE_') || SUPABASE_PUBLISHABLE_KEY.startsWith('PASTE_')) {
  console.warn('Add your Supabase Project URL and Publishable Key in js/supabase.js');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export async function requireUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    location.href = 'login.html';
    return null;
  }
  return data.user;
}

export function showMessage(element, message, isError = false) {
  if (!element) return;
  element.textContent = tr(message);
  element.style.color = isError ? '#b42318' : '#16865b';
}
