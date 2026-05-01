export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      zakat_reminders: {
        Row: {
          id: string
          user_id: string
          reminder_date: string
          email: string
          created_at: string
          updated_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          reminder_date: string
          email: string
          created_at?: string
          updated_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          reminder_date?: string
          email?: string
          created_at?: string
          updated_at?: string | null
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "zakat_reminders_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}