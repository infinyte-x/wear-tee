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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_invites: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
        }
        Relationships: []
      }
      bd_districts: {
        Row: {
          division_id: string | null
          id: string
          name: string
          name_bn: string | null
        }
        Insert: {
          division_id?: string | null
          id?: string
          name: string
          name_bn?: string | null
        }
        Update: {
          division_id?: string | null
          id?: string
          name?: string
          name_bn?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bd_districts_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "bd_divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      bd_divisions: {
        Row: {
          id: string
          name: string
          name_bn: string | null
        }
        Insert: {
          id?: string
          name: string
          name_bn?: string | null
        }
        Update: {
          id?: string
          name?: string
          name_bn?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image: string | null
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          min_order_amount: number | null
          type: string
          updated_at: string
          usage_limit: number | null
          used_count: number | null
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          min_order_amount?: number | null
          type: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number | null
          value: number
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          min_order_amount?: number | null
          type?: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number | null
          value?: number
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean | null
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          color: string | null
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_price: number
          quantity: number
          size: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_price: number
          quantity?: number
          size?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_price?: number
          quantity?: number
          size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          alt_phone: string | null
          area: string | null
          created_at: string
          district: string | null
          division: string | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          phone: string | null
          shipping_address: string | null
          shipping_city: string | null
          shipping_country: string | null
          shipping_fee: number | null
          status: string
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          alt_phone?: string | null
          area?: string | null
          created_at?: string
          district?: string | null
          division?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          phone?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_fee?: number | null
          status?: string
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          alt_phone?: string | null
          area?: string | null
          created_at?: string
          district?: string | null
          division?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          phone?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_fee?: number | null
          status?: string
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          account_number: string | null
          created_at: string | null
          display_order: number | null
          id: string
          instructions: string | null
          is_active: boolean | null
          name: string
          type: string
        }
        Insert: {
          account_number?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          name: string
          type: string
        }
        Update: {
          account_number?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          name?: string
          type?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          colors: string[] | null
          created_at: string
          description: string | null
          featured: boolean | null
          id: string
          images: string[]
          low_stock_threshold: number | null
          name: string
          price: number
          sizes: string[] | null
          stock: number
          updated_at: string
        }
        Insert: {
          category: string
          colors?: string[] | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          images?: string[]
          low_stock_threshold?: number | null
          name: string
          price: number
          sizes?: string[] | null
          stock?: number
          updated_at?: string
        }
        Update: {
          category?: string
          colors?: string[] | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          images?: string[]
          low_stock_threshold?: number | null
          name?: string
          price?: number
          sizes?: string[] | null
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shipping_zones: {
        Row: {
          base_rate: number
          created_at: string | null
          display_order: number | null
          free_shipping_threshold: number | null
          id: string
          is_active: boolean | null
          name: string
          name_bn: string | null
          updated_at: string | null
        }
        Insert: {
          base_rate?: number
          created_at?: string | null
          display_order?: number | null
          free_shipping_threshold?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          name_bn?: string | null
          updated_at?: string | null
        }
        Update: {
          base_rate?: number
          created_at?: string | null
          display_order?: number | null
          free_shipping_threshold?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_bn?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content: Json
          created_at: string
          id: string
          key: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          key: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          movement_type: string
          new_stock: number
          notes: string | null
          previous_stock: number
          product_id: string
          quantity_change: number
          reason: string | null
          reference_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type: string
          new_stock: number
          notes?: string | null
          previous_stock: number
          product_id: string
          quantity_change: number
          reason?: string | null
          reference_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type?: string
          new_stock?: number
          notes?: string | null
          previous_stock?: number
          product_id?: string
          quantity_change?: number
          reason?: string | null
          reference_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_stock: {
        Args: {
          p_movement_type: string
          p_notes?: string
          p_product_id: string
          p_quantity_change: number
          p_reason?: string
          p_reference_id?: string
        }
        Returns: {
          created_at: string
          created_by: string | null
          id: string
          movement_type: string
          new_stock: number
          notes: string | null
          previous_stock: number
          product_id: string
          quantity_change: number
          reason: string | null
          reference_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "stock_movements"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_invited: { Args: { _email: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
