import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let cachedClient: SupabaseClient | null = null

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const getSupabaseClient = () => {
  if (!isSupabaseConfigured) {
    return null
  }

  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl!, supabaseAnonKey!)
  }

  return cachedClient
}

export const wait = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms))

export const safeUuid = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}
