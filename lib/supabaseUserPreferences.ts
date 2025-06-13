import { supabase } from './supabase'

export async function saveUserPreferences(userId: string, preferences: any) {
  return supabase
    .from('users')
    .update({ preferences })
    .eq('id', userId)
}

export async function loadUserPreferences(userId: string) {
  const { data } = await supabase
    .from('users')
    .select('preferences')
    .eq('id', userId)
    .single()
  return data?.preferences || {}
} 