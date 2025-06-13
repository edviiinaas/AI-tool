import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types" // We'll generate this next
import { ENV } from "./env"

// Environment variable configuration
const getRequiredEnvVar = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

const supabaseUrl = getRequiredEnvVar("NEXT_PUBLIC_SUPABASE_URL")
const supabaseAnonKey = getRequiredEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY")

// Use the Database type generic for type safety
export const supabase = createClient<Database>(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_ANON_KEY
)
