import { supabase } from './supabase'

export async function createChat(userId: string, title?: string) {
  return supabase
    .from('chats')
    .insert([{ user_id: userId, title }])
    .select()
    .single()
}

export async function getUserChats(userId: string) {
  return supabase
    .from('chats')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}

export async function getChatMessages(chatId: string) {
  return supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })
}

export async function renameChat(chatId: string, newTitle: string) {
  return supabase
    .from('chats')
    .update({ title: newTitle })
    .eq('id', chatId)
}

export async function deleteChat(chatId: string) {
  return supabase
    .from('chats')
    .delete()
    .eq('id', chatId)
} 