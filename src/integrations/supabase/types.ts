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
      aeo_metrics: {
        Row: {
          ai_clicks: number
          ai_conversions: number
          ai_referrals: number
          created_at: string
          date: string
          entity_id: string | null
          entity_type: string
          id: string
          semantic_score: number
          source: string | null
          structured_data_score: number
        }
        Insert: {
          ai_clicks?: number
          ai_conversions?: number
          ai_referrals?: number
          created_at?: string
          date: string
          entity_id?: string | null
          entity_type: string
          id?: string
          semantic_score?: number
          source?: string | null
          structured_data_score?: number
        }
        Update: {
          ai_clicks?: number
          ai_conversions?: number
          ai_referrals?: number
          created_at?: string
          date?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          semantic_score?: number
          source?: string | null
          structured_data_score?: number
        }
        Relationships: []
      }
      audience_segments: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          filter: Json
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          filter?: Json
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          filter?: Json
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          meta: Json
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          meta?: Json
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          meta?: Json
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
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
          attribution: Json
          created_at: string
          creator_earnings: number
          creator_id: string
          growth_pool_share: number
          id: string
          order_id: string
          order_total: number
          platform_fee: number
        }
        Insert: {
          attribution?: Json
          created_at?: string
          creator_earnings: number
          creator_id: string
          growth_pool_share?: number
          id?: string
          order_id: string
          order_total: number
          platform_fee: number
        }
        Update: {
          attribution?: Json
          created_at?: string
          creator_earnings?: number
          creator_id?: string
          growth_pool_share?: number
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
      creator_applications: {
        Row: {
          admin_note: string | null
          bio: string
          brand_name: string
          created_at: string
          decided_at: string | null
          id: string
          reviewer_id: string | null
          sample_urls: string[]
          socials: Json
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          bio?: string
          brand_name: string
          created_at?: string
          decided_at?: string | null
          id?: string
          reviewer_id?: string | null
          sample_urls?: string[]
          socials?: Json
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          bio?: string
          brand_name?: string
          created_at?: string
          decided_at?: string | null
          id?: string
          reviewer_id?: string | null
          sample_urls?: string[]
          socials?: Json
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      creator_ig_tokens: {
        Row: {
          access_token: string
          created_at: string
          creator_id: string
          expires_at: string | null
          ig_handle: string | null
          ig_user_id: string | null
          updated_at: string
        }
        Insert: {
          access_token: string
          created_at?: string
          creator_id: string
          expires_at?: string | null
          ig_handle?: string | null
          ig_user_id?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string
          created_at?: string
          creator_id?: string
          expires_at?: string | null
          ig_handle?: string | null
          ig_user_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      creators: {
        Row: {
          bio: string | null
          brand_name: string
          created_at: string
          creator_tier: string
          id: string
          logo_url: string | null
          user_id: string
          verified: boolean
        }
        Insert: {
          bio?: string | null
          brand_name: string
          created_at?: string
          creator_tier?: string
          id?: string
          logo_url?: string | null
          user_id: string
          verified?: boolean
        }
        Update: {
          bio?: string | null
          brand_name?: string
          created_at?: string
          creator_tier?: string
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
          attribution: Json | null
          created_at: string
          event_type: string
          id: string
          page_path: string | null
          properties: Json | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          attribution?: Json | null
          created_at?: string
          event_type: string
          id?: string
          page_path?: string | null
          properties?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          attribution?: Json | null
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
      fit_likes: {
        Row: {
          created_at: string
          fit_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fit_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          fit_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      fits: {
        Row: {
          body_type: string | null
          cover_image: string | null
          created_at: string
          environment: string | null
          featured: boolean
          id: string
          items: Json
          likes_count: number
          model: string
          name: string
          render_url: string | null
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          body_type?: string | null
          cover_image?: string | null
          created_at?: string
          environment?: string | null
          featured?: boolean
          id?: string
          items?: Json
          likes_count?: number
          model?: string
          name?: string
          render_url?: string | null
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          body_type?: string | null
          cover_image?: string | null
          created_at?: string
          environment?: string | null
          featured?: boolean
          id?: string
          items?: Json
          likes_count?: number
          model?: string
          name?: string
          render_url?: string | null
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: []
      }
      ig_embeds: {
        Row: {
          active: boolean
          caption: string | null
          created_at: string
          creator_id: string | null
          id: string
          order: number
          post_url: string
          scope: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          caption?: string | null
          created_at?: string
          creator_id?: string | null
          id?: string
          order?: number
          post_url: string
          scope: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          caption?: string | null
          created_at?: string
          creator_id?: string | null
          id?: string
          order?: number
          post_url?: string
          scope?: string
          updated_at?: string
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
          attribution: Json | null
          created_at: string
          creator_id: string | null
          id: string
          payment_reference: string | null
          phone: string | null
          search_query: string | null
          seo_landing_page: string | null
          shipping_address: string | null
          status: Database["public"]["Enums"]["order_status"]
          total: number
          traffic_source: string | null
          user_id: string | null
        }
        Insert: {
          attribution?: Json | null
          created_at?: string
          creator_id?: string | null
          id?: string
          payment_reference?: string | null
          phone?: string | null
          search_query?: string | null
          seo_landing_page?: string | null
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total: number
          traffic_source?: string | null
          user_id?: string | null
        }
        Update: {
          attribution?: Json | null
          created_at?: string
          creator_id?: string | null
          id?: string
          payment_reference?: string | null
          phone?: string | null
          search_query?: string | null
          seo_landing_page?: string | null
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total?: number
          traffic_source?: string | null
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
          dgr_code: string | null
          fit_image: string | null
          fit_metadata: Json
          fit_readiness: number | null
          fit_slot: string | null
          fit_status: Database["public"]["Enums"]["fit_status_t"]
          id: string
          image: string
          in_stock: boolean
          mask_url: string | null
          name: string
          original_price: number | null
          price: number
          sizes: string[]
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          stock_count: number | null
          updated_at: string
          views: Json
        }
        Insert: {
          approved?: boolean
          badge?: string | null
          category: string
          category_id?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          dgr_code?: string | null
          fit_image?: string | null
          fit_metadata?: Json
          fit_readiness?: number | null
          fit_slot?: string | null
          fit_status?: Database["public"]["Enums"]["fit_status_t"]
          id?: string
          image: string
          in_stock?: boolean
          mask_url?: string | null
          name: string
          original_price?: number | null
          price: number
          sizes?: string[]
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          stock_count?: number | null
          updated_at?: string
          views?: Json
        }
        Update: {
          approved?: boolean
          badge?: string | null
          category?: string
          category_id?: string | null
          created_at?: string
          creator_id?: string | null
          description?: string | null
          dgr_code?: string | null
          fit_image?: string | null
          fit_metadata?: Json
          fit_readiness?: number | null
          fit_slot?: string | null
          fit_status?: Database["public"]["Enums"]["fit_status_t"]
          id?: string
          image?: string
          in_stock?: boolean
          mask_url?: string | null
          name?: string
          original_price?: number | null
          price?: number
          sizes?: string[]
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          stock_count?: number | null
          updated_at?: string
          views?: Json
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
          bio: string | null
          birthday: string | null
          cover_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string
          interests: string[]
          location_city: string | null
          onboarding_completed_at: string | null
          onboarding_step: string | null
          phone: string | null
          pronouns: string | null
          referral_code: string | null
          social: Json
          style_tags: string[]
          suspended_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birthday?: string | null
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          interests?: string[]
          location_city?: string | null
          onboarding_completed_at?: string | null
          onboarding_step?: string | null
          phone?: string | null
          pronouns?: string | null
          referral_code?: string | null
          social?: Json
          style_tags?: string[]
          suspended_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birthday?: string | null
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          interests?: string[]
          location_city?: string | null
          onboarding_completed_at?: string | null
          onboarding_step?: string | null
          phone?: string | null
          pronouns?: string | null
          referral_code?: string | null
          social?: Json
          style_tags?: string[]
          suspended_at?: string | null
          username?: string | null
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
      referrals: {
        Row: {
          code: string
          converted_order_id: string | null
          created_at: string
          id: string
          invitee_id: string | null
          referrer_id: string
          reward_amount: number
          status: string
          updated_at: string
        }
        Insert: {
          code: string
          converted_order_id?: string | null
          created_at?: string
          id?: string
          invitee_id?: string | null
          referrer_id: string
          reward_amount?: number
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string
          converted_order_id?: string | null
          created_at?: string
          id?: string
          invitee_id?: string | null
          referrer_id?: string
          reward_amount?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
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
      seo_alerts: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string
          meta: Json | null
          resolved_at: string | null
          severity: string
          type: string
          url: string | null
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message: string
          meta?: Json | null
          resolved_at?: string | null
          severity?: string
          type: string
          url?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string
          meta?: Json | null
          resolved_at?: string | null
          severity?: string
          type?: string
          url?: string | null
        }
        Relationships: []
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
      seo_metrics: {
        Row: {
          avg_position: number
          clicks: number
          crawl_errors: number
          created_at: string
          ctr: number
          date: string
          entity_id: string | null
          entity_type: string
          id: string
          impressions: number
          indexed: boolean
          top_query: string | null
          url: string | null
        }
        Insert: {
          avg_position?: number
          clicks?: number
          crawl_errors?: number
          created_at?: string
          ctr?: number
          date: string
          entity_id?: string | null
          entity_type: string
          id?: string
          impressions?: number
          indexed?: boolean
          top_query?: string | null
          url?: string | null
        }
        Update: {
          avg_position?: number
          clicks?: number
          crawl_errors?: number
          created_at?: string
          ctr?: number
          date?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          impressions?: number
          indexed?: boolean
          top_query?: string | null
          url?: string | null
        }
        Relationships: []
      }
      seo_pages: {
        Row: {
          canonical_url: string | null
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string
          id: string
          index_status: string | null
          last_crawled_at: string | null
          og_image: string | null
          structured_data: Json | null
          title: string | null
          updated_at: string
          url: string
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          index_status?: string | null
          last_crawled_at?: string | null
          og_image?: string | null
          structured_data?: Json | null
          title?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          canonical_url?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          index_status?: string | null
          last_crawled_at?: string | null
          og_image?: string | null
          structured_data?: Json | null
          title?: string | null
          updated_at?: string
          url?: string
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
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          _action: string
          _meta?: Json
          _target_id?: string
          _target_type?: string
        }
        Returns: string
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
      fit_status_t: "draft" | "processing" | "ready" | "failed"
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
      fit_status_t: ["draft", "processing", "ready", "failed"],
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
