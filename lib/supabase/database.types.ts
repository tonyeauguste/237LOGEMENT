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
    PostgrestVersion: "14.5"
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
      owner_ratings: {
        Row: {
          created_at: string
          id: number
          owner_id: string
          property_id: number | null
          rater_id: string
          rating: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: never
          owner_id: string
          property_id?: number | null
          rater_id: string
          rating: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: never
          owner_id?: string
          property_id?: number | null
          rater_id?: string
          rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_ratings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          city: string | null
          created_at: string
          id: string
          name: string
          phone: string | null
          role: string
          status: string
        }
        Insert: {
          avatar?: string | null
          city?: string | null
          created_at?: string
          id: string
          name?: string
          phone?: string | null
          role?: string
          status?: string
        }
        Update: {
          avatar?: string | null
          city?: string | null
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
          advance_payment: number | null
          amenities: string[]
          available: boolean
          baths: number
          charges: string | null
          city: string
          created_at: string
          deposit: number | null
          description: string
          favs: number
          favs_legacy_baseline: number
          id: number
          images: string[]
          kind: string
          land_title_status: string | null
          min_duration: string | null
          occupancy_status: string | null
          owner_avatar: string | null
          owner_id: string | null
          owner_listings: number
          owner_name: string
          owner_phone: string | null
          owner_rating: number
          owner_rating_count: number
          precision_desc: string | null
          price: number
          price_negotiable: boolean | null
          quartier: string
          rooms: number
          status: string
          surface: number | null
          title: string
          transaction_type: string
          type: string | null
          verified: boolean
          videos: string[]
          views: number
          views_legacy_baseline: number
        }
        Insert: {
          address?: string | null
          advance_payment?: number | null
          amenities?: string[]
          available?: boolean
          baths?: number
          charges?: string | null
          city: string
          created_at?: string
          deposit?: number | null
          description?: string
          favs?: number
          favs_legacy_baseline?: number
          id?: never
          images?: string[]
          kind?: string
          land_title_status?: string | null
          min_duration?: string | null
          occupancy_status?: string | null
          owner_avatar?: string | null
          owner_id?: string | null
          owner_listings?: number
          owner_name?: string
          owner_phone?: string | null
          owner_rating?: number
          owner_rating_count?: number
          precision_desc?: string | null
          price?: number
          price_negotiable?: boolean | null
          quartier: string
          rooms?: number
          status?: string
          surface?: number | null
          title: string
          transaction_type?: string
          type?: string | null
          verified?: boolean
          videos?: string[]
          views?: number
          views_legacy_baseline?: number
        }
        Update: {
          address?: string | null
          advance_payment?: number | null
          amenities?: string[]
          available?: boolean
          baths?: number
          charges?: string | null
          city?: string
          created_at?: string
          deposit?: number | null
          description?: string
          favs?: number
          favs_legacy_baseline?: number
          id?: never
          images?: string[]
          kind?: string
          land_title_status?: string | null
          min_duration?: string | null
          occupancy_status?: string | null
          owner_avatar?: string | null
          owner_id?: string | null
          owner_listings?: number
          owner_name?: string
          owner_phone?: string | null
          owner_rating?: number
          owner_rating_count?: number
          precision_desc?: string | null
          price?: number
          price_negotiable?: boolean | null
          quartier?: string
          rooms?: number
          status?: string
          surface?: number | null
          title?: string
          transaction_type?: string
          type?: string | null
          verified?: boolean
          videos?: string[]
          views?: number
          views_legacy_baseline?: number
        }
        Relationships: []
      }
      property_favorites: {
        Row: {
          created_at: string
          id: number
          property_id: number
          visitor_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          property_id: number
          visitor_id: string
        }
        Update: {
          created_at?: string
          id?: never
          property_id?: number
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
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
      property_views: {
        Row: {
          first_viewed_at: string
          id: number
          last_viewed_at: string
          property_id: number
          visitor_id: string
        }
        Insert: {
          first_viewed_at?: string
          id?: never
          last_viewed_at?: string
          property_id: number
          visitor_id: string
        }
        Update: {
          first_viewed_at?: string
          id?: never
          last_viewed_at?: string
          property_id?: number
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_views_property_id_fkey"
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
      is_active_user: { Args: never; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      register_property_view: {
        Args: { prop_id: number; visitor: string }
        Returns: undefined
      }
      set_property_favorite: {
        Args: { is_fav: boolean; prop_id: number; visitor: string }
        Returns: undefined
      }
      submit_owner_rating: {
        Args: {
          prop_id: number
          rater: string
          stars: number
          target_owner: string
        }
        Returns: undefined
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
