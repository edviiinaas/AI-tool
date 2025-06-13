import { supabase } from './supabase'

export interface Agent {
  id: string
  name: string
  emoji: string
  description: string
  system_prompt: string
  created_at?: string
  is_active?: boolean
}

export async function getAgents() {
  return supabase
    .from('agents')
    .select('*')
    .order('created_at', { ascending: true })
}

export async function createAgent(agent: Omit<Agent, 'id'>) {
  return supabase
    .from('agents')
    .insert([agent])
    .select()
    .single()
}

export async function updateAgent(agentId: string, updates: Partial<Agent>) {
  return supabase
    .from('agents')
    .update(updates)
    .eq('id', agentId)
    .select()
    .single()
}

export async function deleteAgent(agentId: string) {
  return supabase
    .from('agents')
    .delete()
    .eq('id', agentId)
} 