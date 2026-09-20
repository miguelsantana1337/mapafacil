import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

export function createClient() {
  const env = getSupabaseEnv();
  if (!env) throw new Error("Supabase não está configurado neste ambiente.");
  return createBrowserClient(env.url, env.publishableKey);
}
