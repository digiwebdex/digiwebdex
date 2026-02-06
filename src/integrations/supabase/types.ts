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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "staff" | "client"
      billing_type: "one_time" | "recurring" | "milestone"
      domain_status:
        | "pending"
        | "registered"
        | "active"
        | "expired"
        | "transferred"
      hosting_status: "pending" | "active" | "suspended" | "terminated"
      invoice_status: "unpaid" | "paid" | "overdue" | "cancelled"
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
      service_type:
        | "domain"
        | "hosting"
        | "web_development"
        | "software_development"
        | "digital_marketing"
        | "other"
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
      app_role: ["admin", "staff", "client"],
      billing_type: ["one_time", "recurring", "milestone"],
      domain_status: [
        "pending",
        "registered",
        "active",
        "expired",
        "transferred",
      ],
      hosting_status: ["pending", "active", "suspended", "terminated"],
      invoice_status: ["unpaid", "paid", "overdue", "cancelled"],
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
      service_type: [
        "domain",
        "hosting",
        "web_development",
        "software_development",
        "digital_marketing",
        "other",
      ],
    },
  },
} as const
