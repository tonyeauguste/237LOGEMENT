// Généré automatiquement depuis le schéma Supabase (projet 237LOGEMENT).
// Ne pas éditer à la main — régénérer via le MCP Supabase après une migration.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      contact_messages: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: number
          last_name: string | null
          message: string
          phone: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: never
          last_name?: string | null
          message: string
          phone?: string | null
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: never
          last_name?: string | null
          message?: string
          phone?: string | null
          subject?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string
          id: string
          name: string
          phone: string | null
          role: string
          status: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          id: string
          name?: string
          phone?: string | null
          role?: string
          status?: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string
          status?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          amenities: string[]
          available: boolean
          baths: number
          charges: string | null
          city: string
          created_at: string
          deposit: number | null
          description: string
          favs: number
          id: number
          images: string[]
          kind: string
          min_duration: string | null
          owner_avatar: string | null
          owner_id: string | null
          owner_listings: number
          owner_name: string
          owner_phone: string | null
          owner_rating: number
          precision_desc: string | null
          price: number
          quartier: string
          rooms: number
          status: string
          surface: number | null
          title: string
          type: string
          verified: boolean
          videos: string[]
          views: number
        }
        Insert: {
          address?: string | null
          amenities?: string[]
          available?: boolean
          baths?: number
          charges?: string | null
          city: string
          created_at?: string
          deposit?: number | null
          description?: string
          favs?: number
          id?: never
          images?: string[]
          kind?: string
          min_duration?: string | null
          owner_avatar?: string | null
          owner_id?: string | null
          owner_listings?: number
          owner_name?: string
          owner_phone?: string | null
          owner_rating?: number
          precision_desc?: string | null
          price?: number
          quartier: string
          rooms?: number
          status?: string
          surface?: number | null
          title: string
          type?: string
          verified?: boolean
          videos?: string[]
          views?: number
        }
        Update: {
          address?: string | null
          amenities?: string[]
          available?: boolean
          baths?: number
          charges?: string | null
          city?: string
          created_at?: string
          deposit?: number | null
          description?: string
          favs?: number
          id?: never
          images?: string[]
          kind?: string
          min_duration?: string | null
          owner_avatar?: string | null
          owner_id?: string | null
          owner_listings?: number
          owner_name?: string
          owner_phone?: string | null
          owner_rating?: number
          precision_desc?: string | null
          price?: number
          quartier?: string
          rooms?: number
          status?: string
          surface?: number | null
          title?: string
          type?: string
          verified?: boolean
          videos?: string[]
          views?: number
        }
        Relationships: []
      }
      property_messages: {
        Row: {
          created_at: string
          id: number
          message: string
          property_id: number | null
        }
        Insert: {
          created_at?: string
          id?: never
          message: string
          property_id?: number | null
        }
        Update: {
          created_at?: string
          id?: never
          message?: string
          property_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "property_messages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_property_favs: {
        Args: { delta: number; prop_id: number }
        Returns: undefined
      }
      admin_delete_user: { Args: { p_id: string }; Returns: undefined }
      admin_list_users: {
        Args: { p_limit?: number; p_offset?: number; p_search?: string }
        Returns: {
          avatar: string
          created_at: string
          email: string
          id: string
          last_sign_in_at: string
          listings_count: number
          name: string
          phone: string
          role: string
          status: string
          total_count: number
        }[]
      }
      increment_property_views: {
        Args: { prop_id: number }
        Returns: undefined
      }
      is_active_user: { Args: never; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
