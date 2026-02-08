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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      affiliate_clicks: {
        Row: {
          affiliate_id: string
          conversion_order_id: string | null
          converted: boolean
          country: string | null
          created_at: string
          device_type: string | null
          id: string
          ip_address: string | null
          landing_page: string | null
          referrer_url: string | null
          user_agent: string | null
        }
        Insert: {
          affiliate_id: string
          conversion_order_id?: string | null
          converted?: boolean
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          landing_page?: string | null
          referrer_url?: string | null
          user_agent?: string | null
        }
        Update: {
          affiliate_id?: string
          conversion_order_id?: string | null
          converted?: boolean
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          landing_page?: string | null
          referrer_url?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_commissions: {
        Row: {
          affiliate_id: string
          approved_at: string | null
          click_id: string | null
          commission_amount: number
          commission_rate: number
          created_at: string
          grace_period_ends_at: string | null
          id: string
          notes: string | null
          order_amount: number
          order_id: string
          paid_at: string | null
          status: Database["public"]["Enums"]["commission_status"]
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          approved_at?: string | null
          click_id?: string | null
          commission_amount: number
          commission_rate: number
          created_at?: string
          grace_period_ends_at?: string | null
          id?: string
          notes?: string | null
          order_amount: number
          order_id: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["commission_status"]
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          approved_at?: string | null
          click_id?: string | null
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          grace_period_ends_at?: string | null
          id?: string
          notes?: string | null
          order_amount?: number
          order_id?: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["commission_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_click_id_fkey"
            columns: ["click_id"]
            isOneToOne: false
            referencedRelation: "affiliate_clicks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_withdrawals: {
        Row: {
          affiliate_id: string
          amount: number
          created_at: string
          id: string
          notes: string | null
          payment_details: Json | null
          payment_method: string
          processed_at: string | null
          processed_by: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["withdrawal_status"]
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_details?: Json | null
          payment_method: string
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_details?: Json | null
          payment_method?: string
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_withdrawals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          commission_rate: number
          created_at: string
          grace_period_days: number
          id: string
          min_withdrawal_amount: number
          notes: string | null
          payment_details: Json | null
          payment_method: string | null
          pending_earnings: number
          referral_code: string
          status: Database["public"]["Enums"]["affiliate_status"]
          total_clicks: number
          total_conversions: number
          total_earnings: number
          updated_at: string
          user_id: string
          withdrawable_earnings: number
          withdrawn_earnings: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          commission_rate?: number
          created_at?: string
          grace_period_days?: number
          id?: string
          min_withdrawal_amount?: number
          notes?: string | null
          payment_details?: Json | null
          payment_method?: string | null
          pending_earnings?: number
          referral_code: string
          status?: Database["public"]["Enums"]["affiliate_status"]
          total_clicks?: number
          total_conversions?: number
          total_earnings?: number
          updated_at?: string
          user_id: string
          withdrawable_earnings?: number
          withdrawn_earnings?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          commission_rate?: number
          created_at?: string
          grace_period_days?: number
          id?: string
          min_withdrawal_amount?: number
          notes?: string | null
          payment_details?: Json | null
          payment_method?: string | null
          pending_earnings?: number
          referral_code?: string
          status?: Database["public"]["Enums"]["affiliate_status"]
          total_clicks?: number
          total_conversions?: number
          total_earnings?: number
          updated_at?: string
          user_id?: string
          withdrawable_earnings?: number
          withdrawn_earnings?: number
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      automation_logs: {
        Row: {
          automation_type: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          error_message: string | null
          id: string
          status: string
        }
        Insert: {
          automation_type: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          status?: string
        }
        Update: {
          automation_type?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          status?: string
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          description_bn: string | null
          description_en: string | null
          id: string
          is_active: boolean | null
          meta_description_bn: string | null
          meta_description_en: string | null
          meta_title_bn: string | null
          meta_title_en: string | null
          name_bn: string
          name_en: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean | null
          meta_description_bn?: string | null
          meta_description_en?: string | null
          meta_title_bn?: string | null
          meta_title_en?: string | null
          name_bn: string
          name_en: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean | null
          meta_description_bn?: string | null
          meta_description_en?: string | null
          meta_title_bn?: string | null
          meta_title_en?: string | null
          name_bn?: string
          name_en?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_tags: {
        Row: {
          id: string
          post_id: string
          tag_id: string
        }
        Insert: {
          id?: string
          post_id: string
          tag_id: string
        }
        Update: {
          id?: string
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          canonical_url: string | null
          category_id: string | null
          change_frequency: string | null
          content_bn: string | null
          content_en: string | null
          created_at: string
          excerpt_bn: string | null
          excerpt_en: string | null
          faq_items: Json | null
          featured_image: string | null
          id: string
          is_featured: boolean | null
          is_indexed: boolean | null
          is_published: boolean | null
          keywords: string[] | null
          meta_description_bn: string | null
          meta_description_en: string | null
          meta_title_bn: string | null
          meta_title_en: string | null
          og_image: string | null
          priority: number | null
          published_at: string | null
          reading_time_minutes: number | null
          schema_markup: Json | null
          slug: string
          title_bn: string
          title_en: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          author_id?: string | null
          canonical_url?: string | null
          category_id?: string | null
          change_frequency?: string | null
          content_bn?: string | null
          content_en?: string | null
          created_at?: string
          excerpt_bn?: string | null
          excerpt_en?: string | null
          faq_items?: Json | null
          featured_image?: string | null
          id?: string
          is_featured?: boolean | null
          is_indexed?: boolean | null
          is_published?: boolean | null
          keywords?: string[] | null
          meta_description_bn?: string | null
          meta_description_en?: string | null
          meta_title_bn?: string | null
          meta_title_en?: string | null
          og_image?: string | null
          priority?: number | null
          published_at?: string | null
          reading_time_minutes?: number | null
          schema_markup?: Json | null
          slug: string
          title_bn: string
          title_en: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          author_id?: string | null
          canonical_url?: string | null
          category_id?: string | null
          change_frequency?: string | null
          content_bn?: string | null
          content_en?: string | null
          created_at?: string
          excerpt_bn?: string | null
          excerpt_en?: string | null
          faq_items?: Json | null
          featured_image?: string | null
          id?: string
          is_featured?: boolean | null
          is_indexed?: boolean | null
          is_published?: boolean | null
          keywords?: string[] | null
          meta_description_bn?: string | null
          meta_description_en?: string | null
          meta_title_bn?: string | null
          meta_title_en?: string | null
          og_image?: string | null
          priority?: number | null
          published_at?: string | null
          reading_time_minutes?: number | null
          schema_markup?: Json | null
          slug?: string
          title_bn?: string
          title_en?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_related_posts: {
        Row: {
          id: string
          post_id: string
          related_post_id: string
          relevance_score: number | null
        }
        Insert: {
          id?: string
          post_id: string
          related_post_id: string
          relevance_score?: number | null
        }
        Update: {
          id?: string
          post_id?: string
          related_post_id?: string
          relevance_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_related_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_related_posts_related_post_id_fkey"
            columns: ["related_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name_bn: string
          name_en: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name_bn: string
          name_en: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name_bn?: string
          name_en?: string
          slug?: string
        }
        Relationships: []
      }
      case_studies: {
        Row: {
          after_pagespeed_score: number | null
          after_screenshot_url: string | null
          before_pagespeed_score: number | null
          before_screenshot_url: string | null
          business_goal_bn: string | null
          business_goal_en: string | null
          canonical_url: string | null
          client_logo_url: string | null
          client_website_url: string | null
          company_background_bn: string | null
          company_background_en: string | null
          created_at: string
          faq_items: Json | null
          hero_headline_bn: string | null
          hero_headline_en: string | null
          hero_image_url: string | null
          hero_subheadline_bn: string | null
          hero_subheadline_en: string | null
          id: string
          industry_tag_bn: string | null
          industry_tag_en: string | null
          industry_type_bn: string | null
          industry_type_en: string | null
          is_featured: boolean | null
          is_published: boolean | null
          keywords: string[] | null
          meta_description_bn: string | null
          meta_description_en: string | null
          meta_title_bn: string | null
          meta_title_en: string | null
          og_image_url: string | null
          performance_improvements: Json | null
          problems: Json | null
          project_name_bn: string
          project_name_en: string
          published_at: string | null
          result_highlight_bn: string | null
          result_highlight_en: string | null
          results: Json | null
          schema_markup: Json | null
          slug: string
          solutions: Json | null
          sort_order: number | null
          tech_stack: Json | null
          testimonial_author_avatar_url: string | null
          testimonial_author_company: string | null
          testimonial_author_name: string | null
          testimonial_author_title_bn: string | null
          testimonial_author_title_en: string | null
          testimonial_rating: number | null
          testimonial_text_bn: string | null
          testimonial_text_en: string | null
          updated_at: string
          views_count: number | null
        }
        Insert: {
          after_pagespeed_score?: number | null
          after_screenshot_url?: string | null
          before_pagespeed_score?: number | null
          before_screenshot_url?: string | null
          business_goal_bn?: string | null
          business_goal_en?: string | null
          canonical_url?: string | null
          client_logo_url?: string | null
          client_website_url?: string | null
          company_background_bn?: string | null
          company_background_en?: string | null
          created_at?: string
          faq_items?: Json | null
          hero_headline_bn?: string | null
          hero_headline_en?: string | null
          hero_image_url?: string | null
          hero_subheadline_bn?: string | null
          hero_subheadline_en?: string | null
          id?: string
          industry_tag_bn?: string | null
          industry_tag_en?: string | null
          industry_type_bn?: string | null
          industry_type_en?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          keywords?: string[] | null
          meta_description_bn?: string | null
          meta_description_en?: string | null
          meta_title_bn?: string | null
          meta_title_en?: string | null
          og_image_url?: string | null
          performance_improvements?: Json | null
          problems?: Json | null
          project_name_bn: string
          project_name_en: string
          published_at?: string | null
          result_highlight_bn?: string | null
          result_highlight_en?: string | null
          results?: Json | null
          schema_markup?: Json | null
          slug: string
          solutions?: Json | null
          sort_order?: number | null
          tech_stack?: Json | null
          testimonial_author_avatar_url?: string | null
          testimonial_author_company?: string | null
          testimonial_author_name?: string | null
          testimonial_author_title_bn?: string | null
          testimonial_author_title_en?: string | null
          testimonial_rating?: number | null
          testimonial_text_bn?: string | null
          testimonial_text_en?: string | null
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          after_pagespeed_score?: number | null
          after_screenshot_url?: string | null
          before_pagespeed_score?: number | null
          before_screenshot_url?: string | null
          business_goal_bn?: string | null
          business_goal_en?: string | null
          canonical_url?: string | null
          client_logo_url?: string | null
          client_website_url?: string | null
          company_background_bn?: string | null
          company_background_en?: string | null
          created_at?: string
          faq_items?: Json | null
          hero_headline_bn?: string | null
          hero_headline_en?: string | null
          hero_image_url?: string | null
          hero_subheadline_bn?: string | null
          hero_subheadline_en?: string | null
          id?: string
          industry_tag_bn?: string | null
          industry_tag_en?: string | null
          industry_type_bn?: string | null
          industry_type_en?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          keywords?: string[] | null
          meta_description_bn?: string | null
          meta_description_en?: string | null
          meta_title_bn?: string | null
          meta_title_en?: string | null
          og_image_url?: string | null
          performance_improvements?: Json | null
          problems?: Json | null
          project_name_bn?: string
          project_name_en?: string
          published_at?: string | null
          result_highlight_bn?: string | null
          result_highlight_en?: string | null
          results?: Json | null
          schema_markup?: Json | null
          slug?: string
          solutions?: Json | null
          sort_order?: number | null
          tech_stack?: Json | null
          testimonial_author_avatar_url?: string | null
          testimonial_author_company?: string | null
          testimonial_author_name?: string | null
          testimonial_author_title_bn?: string | null
          testimonial_author_title_en?: string | null
          testimonial_rating?: number | null
          testimonial_text_bn?: string | null
          testimonial_text_en?: string | null
          updated_at?: string
          views_count?: number | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_address: string | null
          message: string
          name: string
          phone: string | null
          replied_at: string | null
          replied_by: string | null
          status: string | null
          subject: string | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          message: string
          name: string
          phone?: string | null
          replied_at?: string | null
          replied_by?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          message?: string
          name?: string
          phone?: string | null
          replied_at?: string | null
          replied_by?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          applicable_services: Json | null
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_discount: number | null
          min_order_amount: number | null
          updated_at: string
          usage_limit: number | null
          used_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_services?: Json | null
          code: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order_amount?: number | null
          updated_at?: string
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_services?: Json | null
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order_amount?: number | null
          updated_at?: string
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      custom_field_values: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          field_id: string
          id: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          field_id: string
          id?: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          field_id?: string
          id?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_values_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "custom_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_fields: {
        Row: {
          created_at: string
          default_value: string | null
          entity_type: string
          field_key: string
          field_label_bn: string | null
          field_label_en: string
          field_type: Database["public"]["Enums"]["custom_field_type"]
          id: string
          is_active: boolean | null
          is_required: boolean | null
          options: Json | null
          sort_order: number | null
          updated_at: string
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string
          default_value?: string | null
          entity_type: string
          field_key: string
          field_label_bn?: string | null
          field_label_en: string
          field_type?: Database["public"]["Enums"]["custom_field_type"]
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          options?: Json | null
          sort_order?: number | null
          updated_at?: string
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string
          default_value?: string | null
          entity_type?: string
          field_key?: string
          field_label_bn?: string | null
          field_label_en?: string
          field_type?: Database["public"]["Enums"]["custom_field_type"]
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          options?: Json | null
          sort_order?: number | null
          updated_at?: string
          validation_rules?: Json | null
        }
        Relationships: []
      }
      domain_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          domain_id: string
          id: string
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          domain_id: string
          id?: string
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          domain_id?: string
          id?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "domain_logs_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_pricing: {
        Row: {
          base_price: number
          created_at: string
          currency: string | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          margin_percent: number | null
          renewal_price: number
          sort_order: number | null
          tld: string
          transfer_price: number
          updated_at: string
        }
        Insert: {
          base_price?: number
          created_at?: string
          currency?: string | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          margin_percent?: number | null
          renewal_price?: number
          sort_order?: number | null
          tld: string
          transfer_price?: number
          updated_at?: string
        }
        Update: {
          base_price?: number
          created_at?: string
          currency?: string | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          margin_percent?: number | null
          renewal_price?: number
          sort_order?: number | null
          tld?: string
          transfer_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      domain_search_logs: {
        Row: {
          created_at: string
          domain_name: string
          id: string
          ip_address: string | null
          is_available: boolean | null
          price_shown: number | null
          search_source: string | null
          tld: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          domain_name: string
          id?: string
          ip_address?: string | null
          is_available?: boolean | null
          price_shown?: number | null
          search_source?: string | null
          tld: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          domain_name?: string
          id?: string
          ip_address?: string | null
          is_available?: boolean | null
          price_shown?: number | null
          search_source?: string | null
          tld?: string
          user_id?: string | null
        }
        Relationships: []
      }
      domains: {
        Row: {
          auto_renew: boolean | null
          created_at: string
          dns_records: Json | null
          domain_name: string
          expiry_date: string | null
          id: string
          nameservers: Json | null
          order_id: string | null
          registrar: string | null
          registrar_order_id: string | null
          registration_date: string | null
          status: Database["public"]["Enums"]["domain_status"]
          tld: string
          updated_at: string
          user_id: string | null
          whois_privacy: boolean | null
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string
          dns_records?: Json | null
          domain_name: string
          expiry_date?: string | null
          id?: string
          nameservers?: Json | null
          order_id?: string | null
          registrar?: string | null
          registrar_order_id?: string | null
          registration_date?: string | null
          status?: Database["public"]["Enums"]["domain_status"]
          tld: string
          updated_at?: string
          user_id?: string | null
          whois_privacy?: boolean | null
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string
          dns_records?: Json | null
          domain_name?: string
          expiry_date?: string | null
          id?: string
          nameservers?: Json | null
          order_id?: string | null
          registrar?: string | null
          registrar_order_id?: string | null
          registration_date?: string | null
          status?: Database["public"]["Enums"]["domain_status"]
          tld?: string
          updated_at?: string
          user_id?: string | null
          whois_privacy?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "domains_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_sections: {
        Row: {
          content_bn: string | null
          content_en: string | null
          created_at: string
          cta_link: string | null
          cta_text_bn: string | null
          cta_text_en: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          metadata: Json | null
          section_key: string
          sort_order: number | null
          subtitle_bn: string | null
          subtitle_en: string | null
          title_bn: string | null
          title_en: string | null
          updated_at: string
        }
        Insert: {
          content_bn?: string | null
          content_en?: string | null
          created_at?: string
          cta_link?: string | null
          cta_text_bn?: string | null
          cta_text_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          section_key: string
          sort_order?: number | null
          subtitle_bn?: string | null
          subtitle_en?: string | null
          title_bn?: string | null
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          content_bn?: string | null
          content_en?: string | null
          created_at?: string
          cta_link?: string | null
          cta_text_bn?: string | null
          cta_text_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          section_key?: string
          sort_order?: number | null
          subtitle_bn?: string | null
          subtitle_en?: string | null
          title_bn?: string | null
          title_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hosting_accounts: {
        Row: {
          auto_renew: boolean | null
          bandwidth_limit_mb: number | null
          cpanel_url: string | null
          created_at: string
          credentials_encrypted: string | null
          database_limit: number | null
          disk_limit_mb: number | null
          domain_id: string | null
          email_limit: number | null
          expiry_date: string | null
          id: string
          order_id: string | null
          package_name: string | null
          server_id: string | null
          status: Database["public"]["Enums"]["hosting_status"]
          suspended_reason: string | null
          updated_at: string
          user_id: string | null
          username: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          bandwidth_limit_mb?: number | null
          cpanel_url?: string | null
          created_at?: string
          credentials_encrypted?: string | null
          database_limit?: number | null
          disk_limit_mb?: number | null
          domain_id?: string | null
          email_limit?: number | null
          expiry_date?: string | null
          id?: string
          order_id?: string | null
          package_name?: string | null
          server_id?: string | null
          status?: Database["public"]["Enums"]["hosting_status"]
          suspended_reason?: string | null
          updated_at?: string
          user_id?: string | null
          username?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          bandwidth_limit_mb?: number | null
          cpanel_url?: string | null
          created_at?: string
          credentials_encrypted?: string | null
          database_limit?: number | null
          disk_limit_mb?: number | null
          domain_id?: string | null
          email_limit?: number | null
          expiry_date?: string | null
          id?: string
          order_id?: string | null
          package_name?: string | null
          server_id?: string | null
          status?: Database["public"]["Enums"]["hosting_status"]
          suspended_reason?: string | null
          updated_at?: string
          user_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hosting_accounts_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hosting_accounts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hosting_accounts_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          currency: string | null
          discount: number | null
          due_date: string | null
          id: string
          invoice_number: string
          notes: string | null
          order_id: string | null
          paid_at: string | null
          pdf_url: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax: number | null
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          discount?: number | null
          due_date?: string | null
          id?: string
          invoice_number: string
          notes?: string | null
          order_id?: string | null
          paid_at?: string | null
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax?: number | null
          total: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          discount?: number | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          notes?: string | null
          order_id?: string | null
          paid_at?: string | null
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax?: number | null
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_pages: {
        Row: {
          canonical_url: string | null
          change_frequency: string | null
          content_bn: string | null
          content_en: string | null
          created_at: string
          faq_items: Json | null
          h1_bn: string | null
          h1_en: string | null
          hero_image_url: string | null
          id: string
          internal_links: Json | null
          is_indexed: boolean | null
          is_published: boolean | null
          keywords: string[] | null
          location: string | null
          meta_description_bn: string | null
          meta_description_en: string | null
          meta_title_bn: string | null
          meta_title_en: string | null
          og_image: string | null
          page_type: string
          priority: number | null
          schema_markup: Json | null
          service_type: string | null
          slug: string
          title_bn: string
          title_en: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          canonical_url?: string | null
          change_frequency?: string | null
          content_bn?: string | null
          content_en?: string | null
          created_at?: string
          faq_items?: Json | null
          h1_bn?: string | null
          h1_en?: string | null
          hero_image_url?: string | null
          id?: string
          internal_links?: Json | null
          is_indexed?: boolean | null
          is_published?: boolean | null
          keywords?: string[] | null
          location?: string | null
          meta_description_bn?: string | null
          meta_description_en?: string | null
          meta_title_bn?: string | null
          meta_title_en?: string | null
          og_image?: string | null
          page_type?: string
          priority?: number | null
          schema_markup?: Json | null
          service_type?: string | null
          slug: string
          title_bn: string
          title_en: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          canonical_url?: string | null
          change_frequency?: string | null
          content_bn?: string | null
          content_en?: string | null
          created_at?: string
          faq_items?: Json | null
          h1_bn?: string | null
          h1_en?: string | null
          hero_image_url?: string | null
          id?: string
          internal_links?: Json | null
          is_indexed?: boolean | null
          is_published?: boolean | null
          keywords?: string[] | null
          location?: string | null
          meta_description_bn?: string | null
          meta_description_en?: string | null
          meta_title_bn?: string | null
          meta_title_en?: string | null
          og_image?: string | null
          page_type?: string
          priority?: number | null
          schema_markup?: Json | null
          service_type?: string | null
          slug?: string
          title_bn?: string
          title_en?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: []
      }
      lead_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          lead_id: string
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          lead_id: string
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          lead_id?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          converted_order_id: string | null
          created_at: string
          email: string | null
          first_contact_at: string | null
          follow_up_count: number | null
          id: string
          last_follow_up_at: string | null
          name: string
          notes: string | null
          phone: string
          service_interest: string | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          converted_order_id?: string | null
          created_at?: string
          email?: string | null
          first_contact_at?: string | null
          follow_up_count?: number | null
          id?: string
          last_follow_up_at?: string | null
          name: string
          notes?: string | null
          phone: string
          service_interest?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          converted_order_id?: string | null
          created_at?: string
          email?: string | null
          first_contact_at?: string | null
          follow_up_count?: number | null
          id?: string
          last_follow_up_at?: string | null
          name?: string
          notes?: string | null
          phone?: string
          service_interest?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_converted_order_id_fkey"
            columns: ["converted_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      location_pages: {
        Row: {
          address_bn: string | null
          address_en: string | null
          area: string | null
          content_bn: string | null
          content_en: string | null
          created_at: string
          district: string | null
          division: string | null
          geo_coordinates: Json | null
          id: string
          is_indexed: boolean | null
          is_published: boolean | null
          local_business_schema: Json | null
          location_name_bn: string
          location_name_en: string
          meta_description_bn: string | null
          meta_description_en: string | null
          meta_title_bn: string | null
          meta_title_en: string | null
          phone: string | null
          priority: number | null
          services_offered: string[] | null
          slug: string
          title_bn: string
          title_en: string
          updated_at: string
        }
        Insert: {
          address_bn?: string | null
          address_en?: string | null
          area?: string | null
          content_bn?: string | null
          content_en?: string | null
          created_at?: string
          district?: string | null
          division?: string | null
          geo_coordinates?: Json | null
          id?: string
          is_indexed?: boolean | null
          is_published?: boolean | null
          local_business_schema?: Json | null
          location_name_bn: string
          location_name_en: string
          meta_description_bn?: string | null
          meta_description_en?: string | null
          meta_title_bn?: string | null
          meta_title_en?: string | null
          phone?: string | null
          priority?: number | null
          services_offered?: string[] | null
          slug: string
          title_bn: string
          title_en: string
          updated_at?: string
        }
        Update: {
          address_bn?: string | null
          address_en?: string | null
          area?: string | null
          content_bn?: string | null
          content_en?: string | null
          created_at?: string
          district?: string | null
          division?: string | null
          geo_coordinates?: Json | null
          id?: string
          is_indexed?: boolean | null
          is_published?: boolean | null
          local_business_schema?: Json | null
          location_name_bn?: string
          location_name_en?: string
          meta_description_bn?: string | null
          meta_description_en?: string | null
          meta_title_bn?: string | null
          meta_title_en?: string | null
          phone?: string | null
          priority?: number | null
          services_offered?: string[] | null
          slug?: string
          title_bn?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      manual_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string | null
          method: string
          notes: string | null
          order_id: string | null
          rejection_reason: string | null
          screenshot_url: string | null
          sender_number: string | null
          status: string
          transaction_id: string
          updated_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id?: string | null
          method: string
          notes?: string | null
          order_id?: string | null
          rejection_reason?: string | null
          screenshot_url?: string | null
          sender_number?: string | null
          status?: string
          transaction_id: string
          updated_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string | null
          method?: string
          notes?: string | null
          order_id?: string | null
          rejection_reason?: string | null
          screenshot_url?: string | null
          sender_number?: string | null
          status?: string
          transaction_id?: string
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manual_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          amount: number | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          invoice_id: string | null
          is_paid: boolean | null
          project_id: string
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_id?: string | null
          is_paid?: boolean | null
          project_id: string
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_id?: string | null
          is_paid?: boolean | null
          project_id?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          body_bn: string | null
          body_en: string | null
          created_at: string
          event_name: string | null
          id: string
          is_active: boolean | null
          name: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          slug: string
          subject_bn: string | null
          subject_en: string | null
          updated_at: string
          variables: Json | null
        }
        Insert: {
          body_bn?: string | null
          body_en?: string | null
          created_at?: string
          event_name?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          slug: string
          subject_bn?: string | null
          subject_en?: string | null
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          body_bn?: string | null
          body_en?: string | null
          created_at?: string
          event_name?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notification_type?: Database["public"]["Enums"]["notification_type"]
          slug?: string
          subject_bn?: string | null
          subject_en?: string | null
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          recipient: string
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          subject: string | null
          template_id: string | null
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          recipient: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          subject?: string | null
          template_id?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_type?: Database["public"]["Enums"]["notification_type"]
          recipient?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          subject?: string | null
          template_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "notification_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      order_meta: {
        Row: {
          created_at: string
          id: string
          meta_key: string
          meta_value: Json | null
          order_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meta_key: string
          meta_value?: Json | null
          order_id: string
        }
        Update: {
          created_at?: string
          id?: string
          meta_key?: string
          meta_value?: Json | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_meta_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_notes: string | null
          billing_type: Database["public"]["Enums"]["billing_type"]
          completed_at: string | null
          coupon_code: string | null
          created_at: string
          currency: string | null
          discount: number | null
          id: string
          notes: string | null
          order_number: string
          package_id: string | null
          paid_at: string | null
          service_id: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax: number | null
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          billing_type?: Database["public"]["Enums"]["billing_type"]
          completed_at?: string | null
          coupon_code?: string | null
          created_at?: string
          currency?: string | null
          discount?: number | null
          id?: string
          notes?: string | null
          order_number: string
          package_id?: string | null
          paid_at?: string | null
          service_id?: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax?: number | null
          total: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          billing_type?: Database["public"]["Enums"]["billing_type"]
          completed_at?: string | null
          coupon_code?: string | null
          created_at?: string
          currency?: string | null
          discount?: number | null
          id?: string
          notes?: string | null
          order_number?: string
          package_id?: string | null
          paid_at?: string | null
          service_id?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax?: number | null
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          bank_transfer_proof_url: string | null
          created_at: string
          currency: string | null
          gateway: Database["public"]["Enums"]["payment_gateway"]
          gateway_response: Json | null
          gateway_transaction_id: string | null
          id: string
          invoice_id: string | null
          order_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          transaction_id: string
          updated_at: string
          user_id: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          bank_transfer_proof_url?: string | null
          created_at?: string
          currency?: string | null
          gateway: Database["public"]["Enums"]["payment_gateway"]
          gateway_response?: Json | null
          gateway_transaction_id?: string | null
          id?: string
          invoice_id?: string | null
          order_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id: string
          updated_at?: string
          user_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          bank_transfer_proof_url?: string | null
          created_at?: string
          currency?: string | null
          gateway?: Database["public"]["Enums"]["payment_gateway"]
          gateway_response?: Json | null
          gateway_transaction_id?: string | null
          id?: string
          invoice_id?: string | null
          order_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string
          updated_at?: string
          user_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_files: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          milestone_id: string | null
          project_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          milestone_id?: string | null
          project_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          milestone_id?: string | null
          project_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_files_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          completed_milestones: number | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          order_id: string | null
          requirements: Json | null
          service_type: Database["public"]["Enums"]["service_type"]
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          title: string
          total_milestones: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_milestones?: number | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          requirements?: Json | null
          service_type: Database["public"]["Enums"]["service_type"]
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          title: string
          total_milestones?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_milestones?: number | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          requirements?: Json | null
          service_type?: Database["public"]["Enums"]["service_type"]
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          title?: string
          total_milestones?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          performed_by: string | null
          proposal_id: string
          user_agent: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          performed_by?: string | null
          proposal_id: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          performed_by?: string | null
          proposal_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_logs_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_templates: {
        Row: {
          accent_color: string | null
          created_at: string
          custom_css: string | null
          footer_text_bn: string | null
          footer_text_en: string | null
          header_text_bn: string | null
          header_text_en: string | null
          id: string
          is_default: boolean | null
          logo_url: string | null
          name: string
          payment_instructions_bn: string | null
          payment_instructions_en: string | null
          primary_color: string | null
          secondary_color: string | null
          show_bank_details: boolean | null
          show_company_details: boolean | null
          show_mobile_payment: boolean | null
          terms_conditions_bn: string | null
          terms_conditions_en: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          created_at?: string
          custom_css?: string | null
          footer_text_bn?: string | null
          footer_text_en?: string | null
          header_text_bn?: string | null
          header_text_en?: string | null
          id?: string
          is_default?: boolean | null
          logo_url?: string | null
          name: string
          payment_instructions_bn?: string | null
          payment_instructions_en?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          show_bank_details?: boolean | null
          show_company_details?: boolean | null
          show_mobile_payment?: boolean | null
          terms_conditions_bn?: string | null
          terms_conditions_en?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          created_at?: string
          custom_css?: string | null
          footer_text_bn?: string | null
          footer_text_en?: string | null
          header_text_bn?: string | null
          header_text_en?: string | null
          id?: string
          is_default?: boolean | null
          logo_url?: string | null
          name?: string
          payment_instructions_bn?: string | null
          payment_instructions_en?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          show_bank_details?: boolean | null
          show_company_details?: boolean | null
          show_mobile_payment?: boolean | null
          terms_conditions_bn?: string | null
          terms_conditions_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      proposals: {
        Row: {
          accepted_at: string | null
          access_token: string
          client_email: string | null
          client_name: string
          client_phone: string
          converted_order_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          deliverables: Json | null
          description: string | null
          discount_amount: number | null
          discount_type: string | null
          discount_value: number | null
          expiry_date: string | null
          id: string
          lead_id: string | null
          line_items: Json
          package_name: string | null
          payment_instructions: string | null
          payment_link: string | null
          proposal_number: string
          rejected_at: string | null
          rejection_reason: string | null
          sent_at: string | null
          service_type: string
          status: Database["public"]["Enums"]["proposal_status"]
          subtotal: number
          timeline: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          access_token?: string
          client_email?: string | null
          client_name: string
          client_phone: string
          converted_order_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deliverables?: Json | null
          description?: string | null
          discount_amount?: number | null
          discount_type?: string | null
          discount_value?: number | null
          expiry_date?: string | null
          id?: string
          lead_id?: string | null
          line_items?: Json
          package_name?: string | null
          payment_instructions?: string | null
          payment_link?: string | null
          proposal_number: string
          rejected_at?: string | null
          rejection_reason?: string | null
          sent_at?: string | null
          service_type: string
          status?: Database["public"]["Enums"]["proposal_status"]
          subtotal?: number
          timeline?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          access_token?: string
          client_email?: string | null
          client_name?: string
          client_phone?: string
          converted_order_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          deliverables?: Json | null
          description?: string | null
          discount_amount?: number | null
          discount_type?: string | null
          discount_value?: number | null
          expiry_date?: string | null
          id?: string
          lead_id?: string | null
          line_items?: Json
          package_name?: string | null
          payment_instructions?: string | null
          payment_link?: string | null
          proposal_number?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          sent_at?: string | null
          service_type?: string
          status?: Database["public"]["Enums"]["proposal_status"]
          subtotal?: number
          timeline?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_converted_order_id_fkey"
            columns: ["converted_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      renewal_logs: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          invoice_id: string | null
          new_expiry_date: string | null
          old_expiry_date: string | null
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          invoice_id?: string | null
          new_expiry_date?: string | null
          old_expiry_date?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          invoice_id?: string | null
          new_expiry_date?: string | null
          old_expiry_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "renewal_logs_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      reseller_clients: {
        Row: {
          client_user_id: string
          created_at: string
          id: string
          reseller_id: string
        }
        Insert: {
          client_user_id: string
          created_at?: string
          id?: string
          reseller_id: string
        }
        Update: {
          client_user_id?: string
          created_at?: string
          id?: string
          reseller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reseller_clients_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
        ]
      }
      reseller_earnings: {
        Row: {
          approved_at: string | null
          client_user_id: string | null
          commission_rate: number
          commission_type: Database["public"]["Enums"]["commission_type"]
          created_at: string
          earning_amount: number
          id: string
          notes: string | null
          order_amount: number
          order_id: string
          paid_at: string | null
          reseller_id: string
          status: Database["public"]["Enums"]["earning_status"]
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          client_user_id?: string | null
          commission_rate: number
          commission_type: Database["public"]["Enums"]["commission_type"]
          created_at?: string
          earning_amount: number
          id?: string
          notes?: string | null
          order_amount: number
          order_id: string
          paid_at?: string | null
          reseller_id: string
          status?: Database["public"]["Enums"]["earning_status"]
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          client_user_id?: string | null
          commission_rate?: number
          commission_type?: Database["public"]["Enums"]["commission_type"]
          created_at?: string
          earning_amount?: number
          id?: string
          notes?: string | null
          order_amount?: number
          order_id?: string
          paid_at?: string | null
          reseller_id?: string
          status?: Database["public"]["Enums"]["earning_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reseller_earnings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reseller_earnings_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
        ]
      }
      reseller_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          performed_by: string | null
          reseller_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          performed_by?: string | null
          reseller_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          performed_by?: string | null
          reseller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reseller_logs_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
        ]
      }
      reseller_withdrawals: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          payment_details: Json | null
          payment_method: string
          processed_at: string | null
          processed_by: string | null
          rejection_reason: string | null
          reseller_id: string
          status: Database["public"]["Enums"]["withdrawal_status"]
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_details?: Json | null
          payment_method: string
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          reseller_id: string
          status?: Database["public"]["Enums"]["withdrawal_status"]
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_details?: Json | null
          payment_method?: string
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          reseller_id?: string
          status?: Database["public"]["Enums"]["withdrawal_status"]
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reseller_withdrawals_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
        ]
      }
      resellers: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          balance: number
          brand_color: string | null
          commission_rate: number
          commission_type: Database["public"]["Enums"]["commission_type"]
          company_logo_url: string | null
          company_name: string
          created_at: string
          id: string
          min_withdrawal_amount: number
          notes: string | null
          payment_details: Json | null
          payment_method: string | null
          pending_earnings: number
          status: Database["public"]["Enums"]["reseller_status"]
          total_earnings: number
          updated_at: string
          user_id: string
          withdrawn_earnings: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          balance?: number
          brand_color?: string | null
          commission_rate?: number
          commission_type?: Database["public"]["Enums"]["commission_type"]
          company_logo_url?: string | null
          company_name: string
          created_at?: string
          id?: string
          min_withdrawal_amount?: number
          notes?: string | null
          payment_details?: Json | null
          payment_method?: string | null
          pending_earnings?: number
          status?: Database["public"]["Enums"]["reseller_status"]
          total_earnings?: number
          updated_at?: string
          user_id: string
          withdrawn_earnings?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          balance?: number
          brand_color?: string | null
          commission_rate?: number
          commission_type?: Database["public"]["Enums"]["commission_type"]
          company_logo_url?: string | null
          company_name?: string
          created_at?: string
          id?: string
          min_withdrawal_amount?: number
          notes?: string | null
          payment_details?: Json | null
          payment_method?: string | null
          pending_earnings?: number
          status?: Database["public"]["Enums"]["reseller_status"]
          total_earnings?: number
          updated_at?: string
          user_id?: string
          withdrawn_earnings?: number
        }
        Relationships: []
      }
      revenue_summary: {
        Row: {
          active_domains_count: number
          active_hosting_count: number
          arr: number
          created_at: string
          digital_marketing_revenue: number
          domain_revenue: number
          hosting_revenue: number
          id: string
          month: string
          mrr: number
          new_orders_count: number
          other_revenue: number
          overdue_invoices_amount: number
          overdue_invoices_count: number
          paid_invoices_count: number
          pending_invoices_amount: number
          pending_invoices_count: number
          renewal_rate: number | null
          software_development_revenue: number
          suspended_hosting_count: number
          total_revenue: number
          updated_at: string
          web_development_revenue: number
        }
        Insert: {
          active_domains_count?: number
          active_hosting_count?: number
          arr?: number
          created_at?: string
          digital_marketing_revenue?: number
          domain_revenue?: number
          hosting_revenue?: number
          id?: string
          month: string
          mrr?: number
          new_orders_count?: number
          other_revenue?: number
          overdue_invoices_amount?: number
          overdue_invoices_count?: number
          paid_invoices_count?: number
          pending_invoices_amount?: number
          pending_invoices_count?: number
          renewal_rate?: number | null
          software_development_revenue?: number
          suspended_hosting_count?: number
          total_revenue?: number
          updated_at?: string
          web_development_revenue?: number
        }
        Update: {
          active_domains_count?: number
          active_hosting_count?: number
          arr?: number
          created_at?: string
          digital_marketing_revenue?: number
          domain_revenue?: number
          hosting_revenue?: number
          id?: string
          month?: string
          mrr?: number
          new_orders_count?: number
          other_revenue?: number
          overdue_invoices_amount?: number
          overdue_invoices_count?: number
          paid_invoices_count?: number
          pending_invoices_amount?: number
          pending_invoices_count?: number
          renewal_rate?: number | null
          software_development_revenue?: number
          suspended_hosting_count?: number
          total_revenue?: number
          updated_at?: string
          web_development_revenue?: number
        }
        Relationships: []
      }
      seo_settings: {
        Row: {
          created_at: string
          id: string
          meta_description_bn: string | null
          meta_description_en: string | null
          meta_title_bn: string | null
          meta_title_en: string | null
          og_image: string | null
          page_slug: string
          schema_markup: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          meta_description_bn?: string | null
          meta_description_en?: string | null
          meta_title_bn?: string | null
          meta_title_en?: string | null
          og_image?: string | null
          page_slug: string
          schema_markup?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          meta_description_bn?: string | null
          meta_description_en?: string | null
          meta_title_bn?: string | null
          meta_title_en?: string | null
          og_image?: string | null
          page_slug?: string
          schema_markup?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      servers: {
        Row: {
          api_token_encrypted: string | null
          created_at: string
          current_accounts: number | null
          hostname: string
          id: string
          ip_address: string | null
          is_active: boolean | null
          max_accounts: number | null
          name: string
          server_type: string | null
          updated_at: string
        }
        Insert: {
          api_token_encrypted?: string | null
          created_at?: string
          current_accounts?: number | null
          hostname: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          max_accounts?: number | null
          name: string
          server_type?: string | null
          updated_at?: string
        }
        Update: {
          api_token_encrypted?: string | null
          created_at?: string
          current_accounts?: number | null
          hostname?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          max_accounts?: number | null
          name?: string
          server_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          created_at: string
          description_bn: string | null
          description_en: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name_bn: string
          name_en: string
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_bn: string
          name_en: string
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_bn?: string
          name_en?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      service_packages: {
        Row: {
          billing_cycle_months: number | null
          billing_type: Database["public"]["Enums"]["billing_type"]
          created_at: string
          currency: string | null
          features_bn: Json | null
          features_en: Json | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          name_bn: string
          name_en: string
          price: number
          service_id: string
          setup_fee: number | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          billing_cycle_months?: number | null
          billing_type?: Database["public"]["Enums"]["billing_type"]
          created_at?: string
          currency?: string | null
          features_bn?: Json | null
          features_en?: Json | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name_bn: string
          name_en: string
          price: number
          service_id: string
          setup_fee?: number | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          billing_cycle_months?: number | null
          billing_type?: Database["public"]["Enums"]["billing_type"]
          created_at?: string
          currency?: string | null
          features_bn?: Json | null
          features_en?: Json | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name_bn?: string
          name_en?: string
          price?: number
          service_id?: string
          setup_fee?: number | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_packages_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category_id: string | null
          created_at: string
          description_bn: string | null
          description_en: string | null
          features_bn: Json | null
          features_en: Json | null
          id: string
          image_url: string | null
          is_active: boolean | null
          meta_description: string | null
          meta_title: string | null
          name_bn: string
          name_en: string
          service_type: Database["public"]["Enums"]["service_type"]
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          features_bn?: Json | null
          features_en?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name_bn: string
          name_en: string
          service_type: Database["public"]["Enums"]["service_type"]
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          features_bn?: Json | null
          features_en?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name_bn?: string
          name_en?: string
          service_type?: Database["public"]["Enums"]["service_type"]
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      sitemap_entries: {
        Row: {
          change_frequency: string | null
          created_at: string
          entity_id: string | null
          id: string
          is_active: boolean | null
          last_modified: string | null
          page_type: string
          priority: number | null
          updated_at: string
          url: string
        }
        Insert: {
          change_frequency?: string | null
          created_at?: string
          entity_id?: string | null
          id?: string
          is_active?: boolean | null
          last_modified?: string | null
          page_type: string
          priority?: number | null
          updated_at?: string
          url: string
        }
        Update: {
          change_frequency?: string | null
          created_at?: string
          entity_id?: string | null
          id?: string
          is_active?: boolean | null
          last_modified?: string | null
          page_type?: string
          priority?: number | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      subscription_billing_history: {
        Row: {
          amount: number
          billing_date: string
          created_at: string
          id: string
          invoice_id: string | null
          notes: string | null
          payment_date: string | null
          status: string
          subscription_id: string
        }
        Insert: {
          amount: number
          billing_date: string
          created_at?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string | null
          status?: string
          subscription_id: string
        }
        Update: {
          amount?: number
          billing_date?: string
          created_at?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string | null
          status?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_billing_history_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_billing_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          new_status: Database["public"]["Enums"]["subscription_status"] | null
          old_status: Database["public"]["Enums"]["subscription_status"] | null
          performed_by: string | null
          subscription_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          new_status?: Database["public"]["Enums"]["subscription_status"] | null
          old_status?: Database["public"]["Enums"]["subscription_status"] | null
          performed_by?: string | null
          subscription_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          new_status?: Database["public"]["Enums"]["subscription_status"] | null
          old_status?: Database["public"]["Enums"]["subscription_status"] | null
          performed_by?: string | null
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_logs_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          auto_renew: boolean | null
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          currency: string | null
          domain_id: string | null
          failed_billing_attempts: number | null
          grace_period_days: number | null
          hosting_account_id: string | null
          id: string
          last_billing_date: string | null
          metadata: Json | null
          next_billing_date: string
          plan_name: string
          service_type: string
          status: Database["public"]["Enums"]["subscription_status"]
          suspended_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          auto_renew?: boolean | null
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          currency?: string | null
          domain_id?: string | null
          failed_billing_attempts?: number | null
          grace_period_days?: number | null
          hosting_account_id?: string | null
          id?: string
          last_billing_date?: string | null
          metadata?: Json | null
          next_billing_date: string
          plan_name: string
          service_type: string
          status?: Database["public"]["Enums"]["subscription_status"]
          suspended_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          auto_renew?: boolean | null
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          currency?: string | null
          domain_id?: string | null
          failed_billing_attempts?: number | null
          grace_period_days?: number | null
          hosting_account_id?: string | null
          id?: string
          last_billing_date?: string | null
          metadata?: Json | null
          next_billing_date?: string
          plan_name?: string
          service_type?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          suspended_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_hosting_account_id_fkey"
            columns: ["hosting_account_id"]
            isOneToOne: false
            referencedRelation: "hosting_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: Database["public"]["Enums"]["ticket_category"]
          closed_at: string | null
          created_at: string
          description: string | null
          first_response_at: string | null
          id: string
          priority: Database["public"]["Enums"]["ticket_priority"]
          related_invoice_id: string | null
          related_order_id: string | null
          resolved_at: string | null
          satisfaction_feedback: string | null
          satisfaction_rating: number | null
          sla_due_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          tags: string[] | null
          ticket_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["ticket_category"]
          closed_at?: string | null
          created_at?: string
          description?: string | null
          first_response_at?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          related_invoice_id?: string | null
          related_order_id?: string | null
          resolved_at?: string | null
          satisfaction_feedback?: string | null
          satisfaction_rating?: number | null
          sla_due_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          tags?: string[] | null
          ticket_number?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["ticket_category"]
          closed_at?: string | null
          created_at?: string
          description?: string | null
          first_response_at?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          related_invoice_id?: string | null
          related_order_id?: string | null
          resolved_at?: string | null
          satisfaction_feedback?: string | null
          satisfaction_rating?: number | null
          sla_due_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          tags?: string[] | null
          ticket_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_related_invoice_id_fkey"
            columns: ["related_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          category: string
          description: string | null
          id: string
          is_sensitive: boolean | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          category?: string
          description?: string | null
          id?: string
          is_sensitive?: boolean | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          is_sensitive?: boolean | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      ticket_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          new_value: string | null
          old_value: string | null
          performed_by: string | null
          ticket_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          performed_by?: string | null
          ticket_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          performed_by?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_logs_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          attachment_urls: string[] | null
          created_at: string
          id: string
          is_internal_note: boolean
          message: string
          sender_id: string
          ticket_id: string
        }
        Insert: {
          attachment_urls?: string[] | null
          created_at?: string
          id?: string
          is_internal_note?: boolean
          message: string
          sender_id: string
          ticket_id: string
        }
        Update: {
          attachment_urls?: string[] | null
          created_at?: string
          id?: string
          is_internal_note?: boolean
          message?: string
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      generate_invoice_number: { Args: never; Returns: string }
      generate_order_number: { Args: never; Returns: string }
      generate_proposal_number: { Args: never; Returns: string }
      generate_referral_code: { Args: never; Returns: string }
      generate_ticket_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_page_views: {
        Args: { page_id: string; page_table: string }
        Returns: undefined
      }
      is_admin_or_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      affiliate_status: "pending" | "active" | "suspended" | "rejected"
      app_role: "admin" | "staff" | "client" | "reseller"
      billing_cycle: "monthly" | "quarterly" | "yearly"
      billing_type: "one_time" | "recurring" | "milestone"
      commission_status: "pending" | "approved" | "paid" | "cancelled"
      commission_type: "fixed" | "percentage"
      custom_field_type:
        | "text"
        | "number"
        | "date"
        | "select"
        | "multiselect"
        | "checkbox"
        | "textarea"
        | "email"
        | "phone"
        | "url"
      domain_status:
        | "pending"
        | "registered"
        | "active"
        | "expired"
        | "transferred"
      earning_status: "pending" | "approved" | "paid"
      hosting_status: "pending" | "active" | "suspended" | "terminated"
      invoice_status: "unpaid" | "paid" | "overdue" | "cancelled"
      lead_status: "new" | "contacted" | "converted" | "lost"
      notification_status: "pending" | "sent" | "failed"
      notification_type: "email" | "sms" | "whatsapp" | "in_app"
      order_status:
        | "pending"
        | "paid"
        | "processing"
        | "active"
        | "completed"
        | "cancelled"
      payment_gateway:
        | "sslcommerz"
        | "bkash"
        | "nagad"
        | "bank_transfer"
        | "manual"
      payment_status: "pending" | "success" | "failed" | "refunded"
      project_status:
        | "pending"
        | "in_progress"
        | "review"
        | "completed"
        | "on_hold"
        | "cancelled"
      proposal_status: "draft" | "sent" | "accepted" | "rejected" | "expired"
      reseller_status: "pending" | "active" | "suspended"
      service_type:
        | "domain"
        | "hosting"
        | "web_development"
        | "software_development"
        | "digital_marketing"
        | "other"
      subscription_status:
        | "active"
        | "suspended"
        | "cancelled"
        | "pending"
        | "expired"
      ticket_category:
        | "hosting"
        | "domain"
        | "software"
        | "billing"
        | "technical"
        | "other"
      ticket_priority: "low" | "medium" | "high" | "urgent"
      ticket_status:
        | "open"
        | "in_progress"
        | "waiting_customer"
        | "resolved"
        | "closed"
      withdrawal_status: "pending" | "processing" | "completed" | "rejected"
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
      affiliate_status: ["pending", "active", "suspended", "rejected"],
      app_role: ["admin", "staff", "client", "reseller"],
      billing_cycle: ["monthly", "quarterly", "yearly"],
      billing_type: ["one_time", "recurring", "milestone"],
      commission_status: ["pending", "approved", "paid", "cancelled"],
      commission_type: ["fixed", "percentage"],
      custom_field_type: [
        "text",
        "number",
        "date",
        "select",
        "multiselect",
        "checkbox",
        "textarea",
        "email",
        "phone",
        "url",
      ],
      domain_status: [
        "pending",
        "registered",
        "active",
        "expired",
        "transferred",
      ],
      earning_status: ["pending", "approved", "paid"],
      hosting_status: ["pending", "active", "suspended", "terminated"],
      invoice_status: ["unpaid", "paid", "overdue", "cancelled"],
      lead_status: ["new", "contacted", "converted", "lost"],
      notification_status: ["pending", "sent", "failed"],
      notification_type: ["email", "sms", "whatsapp", "in_app"],
      order_status: [
        "pending",
        "paid",
        "processing",
        "active",
        "completed",
        "cancelled",
      ],
      payment_gateway: [
        "sslcommerz",
        "bkash",
        "nagad",
        "bank_transfer",
        "manual",
      ],
      payment_status: ["pending", "success", "failed", "refunded"],
      project_status: [
        "pending",
        "in_progress",
        "review",
        "completed",
        "on_hold",
        "cancelled",
      ],
      proposal_status: ["draft", "sent", "accepted", "rejected", "expired"],
      reseller_status: ["pending", "active", "suspended"],
      service_type: [
        "domain",
        "hosting",
        "web_development",
        "software_development",
        "digital_marketing",
        "other",
      ],
      subscription_status: [
        "active",
        "suspended",
        "cancelled",
        "pending",
        "expired",
      ],
      ticket_category: [
        "hosting",
        "domain",
        "software",
        "billing",
        "technical",
        "other",
      ],
      ticket_priority: ["low", "medium", "high", "urgent"],
      ticket_status: [
        "open",
        "in_progress",
        "waiting_customer",
        "resolved",
        "closed",
      ],
      withdrawal_status: ["pending", "processing", "completed", "rejected"],
    },
  },
} as const
