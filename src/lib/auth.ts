import { supabase } from "@/integrations/supabase/client";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export function usernameToEmail(username: string) {
  return `${normalizeUsername(username)}@syncearn.local`;
}

export function validateUsername(username: string) {
  if (!USERNAME_RE.test(username.trim())) {
    return "Username must be 3-20 characters (letters, numbers, underscore).";
  }
  return null;
}

export async function registerWithUsername(username: string, password: string, ref?: string | null) {
  const { data, error } = await supabase.auth.signUp({
    email: usernameToEmail(username),
    password,
    options: {
      emailRedirectTo: window.location.origin,
      data: { username: username.trim(), ref: ref ?? null },
    },
  });
  if (error) throw error;
  return data;
}

export async function loginWithUsername(username: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  });
  if (error) throw error;
  return data;
}
