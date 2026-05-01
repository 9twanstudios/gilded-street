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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author: string
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          related_product_ids: string[]
          slug: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          related_product_ids?: string[]
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          related_product_ids?: string[]
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          size: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          size?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          size?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      commissions: {
        Row: {
          created_at: string
          creator_earnings: number
          creator_id: string
          id: string
          order_id: string
          order_total: number
          platform_fee: number
        }
        Insert: {
          created_at?: string
          creator_earnings: number
          creator_id: string
          id?: string
          order_id: string
          order_total: number
          platform_fee: number
        }
        Update: {
          created_at?: string
          creator_earnings?: number
          creator_id?: string
          id?: string
          order_id?: string
          order_total?: number
          platform_fee?: number
        }
        Relationships: [
          {
            foreignKeyName: "commissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      creators: {
        Row: {
          bio: string | null
          brand_name: string
          created_at: string
          id: string
          logo_url: string | null
          user_id: string
          verified: boolean
        }
        Insert: {
          bio?: string | null
          brand_name: string
          created_at?: string
          id?: string
          logo_url?: string | null
          user_id: string
          verified?: boolean
        }
        Update: {
          bio?: string | null
          brand_name?: string
          created_at?: string
          id?: string
          logo_url?: string | null
          user_id?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "creators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      drops: {
        Row: {
          active: boolean
          cover_image: string | null
          created_at: string
          description: string | null
          drop_date: string
          id: string
          product_ids: string[]
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          cover_image?: string | null
          created_at?: string
          description?: string | null
          drop_date: string
          id?: string
          product_ids?: string[]
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          cover_image?: string | null
          created_at?: string
          description?: string | null
          drop_date?: string
          id?: string
          product_ids?: string[]
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          page_path: string | null
          properties: Json | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          page_path?: string | null
          properties?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          page_path?: string | null
          properties?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ledger_entries: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          idempotency_key: string
          order_id: string | null
          reference: string | null
          status: Database["public"]["Enums"]["ledger_status"]
          type: Database["public"]["Enums"]["ledger_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          idempotency_key: string
          order_id?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["ledger_status"]
          type: Database["public"]["Enums"]["ledger_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          idempotency_key?: string
          order_id?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["ledger_status"]
          type?: Database["public"]["Enums"]["ledger_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      notify_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          notified: boolean
          product_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          notified?: boolean
          product_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          notified?: boolean
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notify_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          price_at_time: number
          product_id: string | null
          quantity: number
          size: string | null
        }
        Insert: {
          id?: string
          order_id: string
          price_at_time: number
          product_id?: string | null
          quantity?: number
          size?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          price_at_time?: number
          product_id?: string | null
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
          created_at: string
          creator_id: string | null
          id: string
          payment_reference: string | null
          phone: string | null
          shipping_address: string | null
          status: Database["public"]["Enums"]["order_status"]
          total: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          creator_id?: string | null
          id?: string
          payment_reference?: string | null
          phone?: string | null
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          creator_id?: string | null
          id?: string
          payment_reference?: string | null
          phone?: string | null
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total?: number
          user_id?: string | null
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          approved: boolean
          badge: string | null
          category: string
          category_id: string | null
          created_at: string
          creator_id: string | null
          description: string | null
          id: string
          image: string
          in_stock: boolean
          name: string
          original_price: number | null
          price: number
          sizes: string[]
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          stock_count: number | null
          updated_at: string
        }
        Insert: {
          approved?: boolean
          badge?: string | null
          category: string
          category_id?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          id?: string
          image: string
          in_stock?: boolean
          name: string
          original_price?: number | null
          price: number
          sizes?: string[]
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          stock_count?: number | null
          updated_at?: string
        }
        Update: {
          approved?: boolean
          badge?: string | null
          category?: string
          category_id?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          id?: string
          image?: string
          in_stock?: boolean
          name?: string
          original_price?: number | null
          price?: number
          sizes?: string[]
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          stock_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      qr_campaigns: {
        Row: {
          active: boolean
          campaign_type: string
          created_at: string
          created_by: string | null
          cta_label: string | null
          cta_url: string | null
          description: string | null
          headline: string
          hero_image: string | null
          id: string
          name: string
          slug: string
          subheadline: string | null
          target_id: string | null
          target_slug: string | null
          updated_at: string
          variant: string | null
          variant_of: string | null
        }
        Insert: {
          active?: boolean
          campaign_type?: string
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          cta_url?: string | null
          description?: string | null
          headline?: string
          hero_image?: string | null
          id?: string
          name: string
          slug: string
          subheadline?: string | null
          target_id?: string | null
          target_slug?: string | null
          updated_at?: string
          variant?: string | null
          variant_of?: string | null
        }
        Update: {
          active?: boolean
          campaign_type?: string
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          cta_url?: string | null
          description?: string | null
          headline?: string
          hero_image?: string | null
          id?: string
          name?: string
          slug?: string
          subheadline?: string | null
          target_id?: string | null
          target_slug?: string | null
          updated_at?: string
          variant?: string | null
          variant_of?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_campaigns_variant_of_fkey"
            columns: ["variant_of"]
            isOneToOne: false
            referencedRelation: "qr_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_scans: {
        Row: {
          campaign_id: string
          id: string
          ip_city: string | null
          ip_country: string | null
          referrer: string | null
          scanned_at: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          campaign_id: string
          id?: string
          ip_city?: string | null
          ip_country?: string | null
          referrer?: string | null
          scanned_at?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          campaign_id?: string
          id?: string
          ip_city?: string | null
          ip_country?: string | null
          referrer?: string | null
          scanned_at?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_scans_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "qr_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          product_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_clusters: {
        Row: {
          body_md: string
          created_at: string
          h1: string
          hero_image: string | null
          id: string
          keywords: string[]
          meta_description: string
          published: boolean
          related_drop_ids: string[]
          related_product_ids: string[]
          related_story_ids: string[]
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body_md?: string
          created_at?: string
          h1: string
          hero_image?: string | null
          id?: string
          keywords?: string[]
          meta_description?: string
          published?: boolean
          related_drop_ids?: string[]
          related_product_ids?: string[]
          related_story_ids?: string[]
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body_md?: string
          created_at?: string
          h1?: string
          hero_image?: string | null
          id?: string
          keywords?: string[]
          meta_description?: string
          published?: boolean
          related_drop_ids?: string[]
          related_product_ids?: string[]
          related_story_ids?: string[]
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      seo_locations: {
        Row: {
          body_md: string
          city: string
          country: string
          created_at: string
          hero_image: string | null
          id: string
          local_cta_label: string | null
          local_cta_url: string | null
          meta_description: string
          published: boolean
          shipping_note: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body_md?: string
          city: string
          country: string
          created_at?: string
          hero_image?: string | null
          id?: string
          local_cta_label?: string | null
          local_cta_url?: string | null
          meta_description?: string
          published?: boolean
          shipping_note?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body_md?: string
          city?: string
          country?: string
          created_at?: string
          hero_image?: string | null
          id?: string
          local_cta_label?: string | null
          local_cta_url?: string | null
          meta_description?: string
          published?: boolean
          shipping_note?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          content: string
          cover_image: string | null
          created_at: string
          era: string | null
          figure_image: string | null
          figure_name: string | null
          id: string
          published: boolean
          related_drop_id: string | null
          related_product_ids: string[]
          relevance: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          cover_image?: string | null
          created_at?: string
          era?: string | null
          figure_image?: string | null
          figure_name?: string | null
          id?: string
          published?: boolean
          related_drop_id?: string | null
          related_product_ids?: string[]
          relevance?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          cover_image?: string | null
          created_at?: string
          era?: string | null
          figure_image?: string | null
          figure_name?: string | null
          id?: string
          published?: boolean
          related_drop_id?: string | null
          related_product_ids?: string[]
          relevance?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          currency: string
          id: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          list_name: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          list_name?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          list_name?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawals: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string
          id: string
          processed_at: string | null
          status: Database["public"]["Enums"]["withdrawal_status"]
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount: number
          created_at?: string
          id?: string
          processed_at?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          id?: string
          processed_at?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "user"
        | "creator"
        | "content"
        | "commerce"
        | "marketing"
        | "support"
      ledger_status: "pending" | "completed" | "failed"
      ledger_type: "deposit" | "purchase" | "payout" | "fee" | "refund"
      order_status:
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      product_status: "pending" | "approved" | "rejected"
      withdrawal_status: "pending" | "approved" | "rejected" | "completed"
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
      app_role: [
        "admin",
        "user",
        "creator",
        "content",
        "commerce",
        "marketing",
        "support",
      ],
      ledger_status: ["pending", "completed", "failed"],
      ledger_type: ["deposit", "purchase", "payout", "fee", "refund"],
      order_status: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      product_status: ["pending", "approved", "rejected"],
      withdrawal_status: ["pending", "approved", "rejected", "completed"],
    },
  },
} as const
