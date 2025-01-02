export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          hire_date: string | null
          department: string | null
          work_hours: number | null
          work_days: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          hire_date?: string | null
          department?: string | null
          work_hours?: number | null
          work_days?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          hire_date?: string | null
          department?: string | null
          work_hours?: number | null
          work_days?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          created_at?: string
          email: string
          name?: string
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          name?: string
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          name?: string
        }
      }
    }
    Views: Record<string, {
      Row: Record<string, unknown>
    }>
    Functions: Record<string, {
      Args: Record<string, unknown>
      Returns: unknown
    }>
    Enums: Record<string, never>
  }
}

