import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types" // We'll generate this next

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL")
}
if (!supabaseAnonKey) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

// Use the Database type generic for type safety
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
