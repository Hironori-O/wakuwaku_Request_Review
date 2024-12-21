export interface Database {
  public: {
    Tables: {
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
