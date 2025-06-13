import { supabase } from './supabase'

export async function getAgentPresets(userId: string) {
  return supabase.from('agent_presets').select('*').eq('user_id', userId)
}

export async function createAgentPreset(userId: string, name: string, agentIds: string[]) {
  return supabase.from('agent_presets').insert([{ user_id: userId, name, agent_ids: agentIds }])
}

export async function deleteAgentPreset(presetId: string) {
  return supabase.from('agent_presets').delete().eq('id', presetId)
} 