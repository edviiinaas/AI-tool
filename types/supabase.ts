export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      messages: {
        Row: {
          id: string
          content: string
          created_at: string
          user_id: string
          is_edited: boolean
          file_url: string | null
          file_type: string | null
        }
        Insert: {
          id?: string
          content: string
          created_at?: string
          user_id: string
          is_edited?: boolean
          file_url?: string | null
          file_type?: string | null
        }
        Update: {
          id?: string
          content?: string
          created_at?: string
          user_id?: string
          is_edited?: boolean
          file_url?: string | null
          file_type?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string
          avatar_url: string | null
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          avatar_url?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          avatar_url?: string | null
          updated_at?: string
        }
      }
      message_reactions: {
        Row: {
          id: string
          message_id: string
          user_id: string
          emoji: string
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          emoji: string
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          emoji?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 