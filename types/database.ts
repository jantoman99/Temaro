export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TenantIndustry =
  | "hair"
  | "beauty"
  | "nails"
  | "massage_wellness"
  | "private_fitness"
  | "physio"
  | "pet_grooming"
  | "other";

export type Database = {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          plan: "free" | "pro" | "team";
          plan_expires_at: string | null;
          timezone: string;
          locale: string;
          default_currency: "CZK" | "EUR";
          industry: TenantIndustry;
          cancellation_notice_hours: number;
          cancellation_message: string | null;
          confirmation_message: string | null;
          public_description: string | null;
          logo_url: string | null;
          cover_image_url: string | null;
          custom_domain: string | null;
          custom_domain_status: "none" | "pending" | "active";
          custom_domain_verification_token: string | null;
          custom_domain_verified_at: string | null;
          brand_color: string | null;
          public_address: string | null;
          public_city: string | null;
          public_region: string | null;
          public_postal_code: string | null;
          public_country_code: string;
          public_map_url: string | null;
          public_latitude: number | null;
          public_longitude: number | null;
          review_url: string | null;
          review_rating: number | null;
          review_count: number;
          review_source_label: string | null;
          public_gallery_image_urls: string[];
          public_amenities: string[];
          social_instagram_url: string | null;
          social_facebook_url: string | null;
          social_tiktok_url: string | null;
          social_website_url: string | null;
          reminder_message: string | null;
          is_publicly_listed: boolean;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          plan?: "free" | "pro" | "team";
          plan_expires_at?: string | null;
          timezone?: string;
          locale?: string;
          default_currency?: "CZK" | "EUR";
          industry?: TenantIndustry;
          cancellation_notice_hours?: number;
          cancellation_message?: string | null;
          confirmation_message?: string | null;
          public_description?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          custom_domain?: string | null;
          custom_domain_status?: "none" | "pending" | "active";
          custom_domain_verification_token?: string | null;
          custom_domain_verified_at?: string | null;
          brand_color?: string | null;
          public_address?: string | null;
          public_city?: string | null;
          public_region?: string | null;
          public_postal_code?: string | null;
          public_country_code?: string;
          public_map_url?: string | null;
          public_latitude?: number | null;
          public_longitude?: number | null;
          review_url?: string | null;
          review_rating?: number | null;
          review_count?: number;
          review_source_label?: string | null;
          public_gallery_image_urls?: string[];
          public_amenities?: string[];
          social_instagram_url?: string | null;
          social_facebook_url?: string | null;
          social_tiktok_url?: string | null;
          social_website_url?: string | null;
          reminder_message?: string | null;
          is_publicly_listed?: boolean;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          plan?: "free" | "pro" | "team";
          plan_expires_at?: string | null;
          timezone?: string;
          locale?: string;
          default_currency?: "CZK" | "EUR";
          industry?: TenantIndustry;
          cancellation_notice_hours?: number;
          cancellation_message?: string | null;
          confirmation_message?: string | null;
          public_description?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          custom_domain?: string | null;
          custom_domain_status?: "none" | "pending" | "active";
          custom_domain_verification_token?: string | null;
          custom_domain_verified_at?: string | null;
          brand_color?: string | null;
          public_address?: string | null;
          public_city?: string | null;
          public_region?: string | null;
          public_postal_code?: string | null;
          public_country_code?: string;
          public_map_url?: string | null;
          public_latitude?: number | null;
          public_longitude?: number | null;
          review_url?: string | null;
          review_rating?: number | null;
          review_count?: number;
          review_source_label?: string | null;
          public_gallery_image_urls?: string[];
          public_amenities?: string[];
          social_instagram_url?: string | null;
          social_facebook_url?: string | null;
          social_tiktok_url?: string | null;
          social_website_url?: string | null;
          reminder_message?: string | null;
          is_publicly_listed?: boolean;
          created_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      tenant_users: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          role: "owner" | "staff";
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          role?: "owner" | "staff";
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string;
          role?: "owner" | "staff";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_users_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tenant_users_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      services: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          duration_minutes: number;
          price: number;
          currency: "CZK" | "EUR";
          buffer_minutes: number;
          deposit_type: "none" | "fixed" | "percent";
          deposit_value: number;
          is_active: boolean;
          position: number;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          description?: string | null;
          duration_minutes: number;
          price: number;
          currency?: "CZK" | "EUR";
          buffer_minutes?: number;
          deposit_type?: "none" | "fixed" | "percent";
          deposit_value?: number;
          is_active?: boolean;
          position?: number;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string | null;
          duration_minutes?: number;
          price?: number;
          currency?: "CZK" | "EUR";
          buffer_minutes?: number;
          deposit_type?: "none" | "fixed" | "percent";
          deposit_value?: number;
          is_active?: boolean;
          position?: number;
          created_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "services_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      staff: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string | null;
          name: string;
          bio: string | null;
          avatar_url: string | null;
          color: string | null;
          is_active: boolean;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id?: string | null;
          name: string;
          bio?: string | null;
          avatar_url?: string | null;
          color?: string | null;
          is_active?: boolean;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string | null;
          name?: string;
          bio?: string | null;
          avatar_url?: string | null;
          color?: string | null;
          is_active?: boolean;
          created_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "staff_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "staff_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      staff_hours: {
        Row: {
          id: string;
          staff_id: string;
          tenant_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_working: boolean;
        };
        Insert: {
          id?: string;
          staff_id: string;
          tenant_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_working?: boolean;
        };
        Update: {
          id?: string;
          staff_id?: string;
          tenant_id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          is_working?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "staff_hours_staff_tenant_fkey";
            columns: ["staff_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "staff_hours_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      staff_exceptions: {
        Row: {
          id: string;
          staff_id: string;
          tenant_id: string;
          date: string;
          is_working: boolean;
          start_time: string | null;
          end_time: string | null;
          note: string | null;
        };
        Insert: {
          id?: string;
          staff_id: string;
          tenant_id: string;
          date: string;
          is_working?: boolean;
          start_time?: string | null;
          end_time?: string | null;
          note?: string | null;
        };
        Update: {
          id?: string;
          staff_id?: string;
          tenant_id?: string;
          date?: string;
          is_working?: boolean;
          start_time?: string | null;
          end_time?: string | null;
          note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "staff_exceptions_staff_tenant_fkey";
            columns: ["staff_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "staff_exceptions_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      staff_services: {
        Row: {
          staff_id: string;
          service_id: string;
          tenant_id: string;
        };
        Insert: {
          staff_id: string;
          service_id: string;
          tenant_id: string;
        };
        Update: {
          staff_id?: string;
          service_id?: string;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_services_staff_tenant_fkey";
            columns: ["staff_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "staff_services_service_tenant_fkey";
            columns: ["service_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id", "tenant_id"];
          },
        ];
      };
      clients: {
        Row: {
          id: string;
          tenant_id: string;
          full_name: string;
          phone: string | null;
          email: string | null;
          notes: string | null;
          no_show_count: number;
          is_flagged: boolean;
          flag_reason: string | null;
          is_blacklisted: boolean;
          preferred_staff_id: string | null;
          preferred_contact_channel: "any" | "email" | "sms" | "phone";
          preferred_time_of_day: "any" | "morning" | "afternoon" | "evening";
          preference_notes: string | null;
          client_tier: "standard" | "trusted" | "risk";
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          full_name: string;
          phone?: string | null;
          email?: string | null;
          notes?: string | null;
          no_show_count?: number;
          is_flagged?: boolean;
          flag_reason?: string | null;
          is_blacklisted?: boolean;
          preferred_staff_id?: string | null;
          preferred_contact_channel?: "any" | "email" | "sms" | "phone";
          preferred_time_of_day?: "any" | "morning" | "afternoon" | "evening";
          preference_notes?: string | null;
          client_tier?: "standard" | "trusted" | "risk";
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          full_name?: string;
          phone?: string | null;
          email?: string | null;
          notes?: string | null;
          no_show_count?: number;
          is_flagged?: boolean;
          flag_reason?: string | null;
          is_blacklisted?: boolean;
          preferred_staff_id?: string | null;
          preferred_contact_channel?: "any" | "email" | "sms" | "phone";
          preferred_time_of_day?: "any" | "morning" | "afternoon" | "evening";
          preference_notes?: string | null;
          client_tier?: "standard" | "trusted" | "risk";
          created_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "clients_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clients_preferred_staff_tenant_fkey";
            columns: ["preferred_staff_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id", "tenant_id"];
          },
        ];
      };
      bookings: {
        Row: {
          id: string;
          tenant_id: string;
          client_id: string | null;
          staff_id: string;
          service_id: string;
          starts_at: string;
          ends_at: string;
          status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
          deposit_amount: number;
          deposit_paid: boolean;
          deposit_paid_at: string | null;
          notes: string | null;
          source: "manual" | "online" | "instagram" | "qr" | "widget" | "catalog" | "google" | "referral";
          source_detail: string | null;
          source_metadata: Json;
          cancellation_reason: string | null;
          cancelled_at: string | null;
          cancelled_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          client_id?: string | null;
          staff_id: string;
          service_id: string;
          starts_at: string;
          ends_at: string;
          status?: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
          deposit_amount?: number;
          deposit_paid?: boolean;
          deposit_paid_at?: string | null;
          notes?: string | null;
          source?: "manual" | "online" | "instagram" | "qr" | "widget" | "catalog" | "google" | "referral";
          source_detail?: string | null;
          source_metadata?: Json;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          client_id?: string | null;
          staff_id?: string;
          service_id?: string;
          starts_at?: string;
          ends_at?: string;
          status?: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
          deposit_amount?: number;
          deposit_paid?: boolean;
          deposit_paid_at?: string | null;
          notes?: string | null;
          source?: "manual" | "online" | "instagram" | "qr" | "widget" | "catalog" | "google" | "referral";
          source_detail?: string | null;
          source_metadata?: Json;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_staff_tenant_fkey";
            columns: ["staff_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "bookings_service_tenant_fkey";
            columns: ["service_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "bookings_client_tenant_fkey";
            columns: ["client_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id", "tenant_id"];
          },
        ];
      };
      booking_payments: {
        Row: {
          id: string;
          tenant_id: string;
          booking_id: string;
          amount: number;
          currency: "CZK" | "EUR";
          payment_scope: "deposit" | "remaining" | "full" | "other";
          method: "cash" | "card_terminal" | "online_card" | "bank_transfer" | "voucher" | "other";
          status: "pending" | "paid" | "refunded" | "failed";
          provider: string | null;
          provider_payment_id: string | null;
          note: string | null;
          paid_at: string | null;
          refunded_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          booking_id: string;
          amount: number;
          currency?: "CZK" | "EUR";
          payment_scope?: "deposit" | "remaining" | "full" | "other";
          method: "cash" | "card_terminal" | "online_card" | "bank_transfer" | "voucher" | "other";
          status?: "pending" | "paid" | "refunded" | "failed";
          provider?: string | null;
          provider_payment_id?: string | null;
          note?: string | null;
          paid_at?: string | null;
          refunded_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          booking_id?: string;
          amount?: number;
          currency?: "CZK" | "EUR";
          payment_scope?: "deposit" | "remaining" | "full" | "other";
          method?: "cash" | "card_terminal" | "online_card" | "bank_transfer" | "voucher" | "other";
          status?: "pending" | "paid" | "refunded" | "failed";
          provider?: string | null;
          provider_payment_id?: string | null;
          note?: string | null;
          paid_at?: string | null;
          refunded_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_payments_booking_tenant_fkey";
            columns: ["booking_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "booking_payments_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_payments_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      inventory_products: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          sku: string | null;
          unit: string;
          stock_quantity: number;
          low_stock_threshold: number;
          purchase_price: number | null;
          retail_price: number | null;
          currency: "CZK" | "EUR";
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          sku?: string | null;
          unit?: string;
          stock_quantity?: number;
          low_stock_threshold?: number;
          purchase_price?: number | null;
          retail_price?: number | null;
          currency?: "CZK" | "EUR";
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          sku?: string | null;
          unit?: string;
          stock_quantity?: number;
          low_stock_threshold?: number;
          purchase_price?: number | null;
          retail_price?: number | null;
          currency?: "CZK" | "EUR";
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inventory_products_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      inventory_movements: {
        Row: {
          id: string;
          tenant_id: string;
          product_id: string;
          quantity_delta: number;
          reason: "purchase" | "usage" | "sale" | "adjustment" | "waste" | "return";
          note: string | null;
          booking_id: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          product_id: string;
          quantity_delta: number;
          reason: "purchase" | "usage" | "sale" | "adjustment" | "waste" | "return";
          note?: string | null;
          booking_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          product_id?: string;
          quantity_delta?: number;
          reason?: "purchase" | "usage" | "sale" | "adjustment" | "waste" | "return";
          note?: string | null;
          booking_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inventory_movements_product_tenant_fkey";
            columns: ["product_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "inventory_products";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "inventory_movements_booking_tenant_fkey";
            columns: ["booking_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "inventory_movements_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inventory_movements_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      vouchers: {
        Row: {
          id: string;
          tenant_id: string;
          code_hash: string;
          code_last4: string;
          label: string;
          initial_amount: number;
          remaining_amount: number;
          currency: "CZK" | "EUR";
          status: "active" | "redeemed" | "expired" | "cancelled";
          expires_at: string | null;
          issued_to_name: string | null;
          issued_to_email: string | null;
          note: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          code_hash: string;
          code_last4: string;
          label: string;
          initial_amount: number;
          remaining_amount: number;
          currency?: "CZK" | "EUR";
          status?: "active" | "redeemed" | "expired" | "cancelled";
          expires_at?: string | null;
          issued_to_name?: string | null;
          issued_to_email?: string | null;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          code_hash?: string;
          code_last4?: string;
          label?: string;
          initial_amount?: number;
          remaining_amount?: number;
          currency?: "CZK" | "EUR";
          status?: "active" | "redeemed" | "expired" | "cancelled";
          expires_at?: string | null;
          issued_to_name?: string | null;
          issued_to_email?: string | null;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vouchers_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vouchers_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      voucher_redemptions: {
        Row: {
          id: string;
          tenant_id: string;
          voucher_id: string;
          booking_id: string | null;
          amount: number;
          note: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          voucher_id: string;
          booking_id?: string | null;
          amount: number;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          voucher_id?: string;
          booking_id?: string | null;
          amount?: number;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "voucher_redemptions_voucher_tenant_fkey";
            columns: ["voucher_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "vouchers";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "voucher_redemptions_booking_tenant_fkey";
            columns: ["booking_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "voucher_redemptions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "voucher_redemptions_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      service_packages: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          package_type: "sessions" | "credit";
          service_id: string | null;
          total_units: number | null;
          credit_amount: number | null;
          price: number;
          currency: "CZK" | "EUR";
          validity_days: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          package_type: "sessions" | "credit";
          service_id?: string | null;
          total_units?: number | null;
          credit_amount?: number | null;
          price: number;
          currency?: "CZK" | "EUR";
          validity_days?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          package_type?: "sessions" | "credit";
          service_id?: string | null;
          total_units?: number | null;
          credit_amount?: number | null;
          price?: number;
          currency?: "CZK" | "EUR";
          validity_days?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_packages_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_packages_service_tenant_fkey";
            columns: ["service_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id", "tenant_id"];
          },
        ];
      };
      client_passes: {
        Row: {
          id: string;
          tenant_id: string;
          package_id: string;
          client_id: string;
          package_type: "sessions" | "credit";
          remaining_units: number | null;
          remaining_credit: number | null;
          status: "active" | "used_up" | "expired" | "cancelled";
          purchased_at: string;
          expires_at: string | null;
          note: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          package_id: string;
          client_id: string;
          package_type: "sessions" | "credit";
          remaining_units?: number | null;
          remaining_credit?: number | null;
          status?: "active" | "used_up" | "expired" | "cancelled";
          purchased_at?: string;
          expires_at?: string | null;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          package_id?: string;
          client_id?: string;
          package_type?: "sessions" | "credit";
          remaining_units?: number | null;
          remaining_credit?: number | null;
          status?: "active" | "used_up" | "expired" | "cancelled";
          purchased_at?: string;
          expires_at?: string | null;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "client_passes_package_tenant_fkey";
            columns: ["package_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "service_packages";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "client_passes_client_tenant_fkey";
            columns: ["client_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "client_passes_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_passes_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      client_pass_redemptions: {
        Row: {
          id: string;
          tenant_id: string;
          client_pass_id: string;
          booking_id: string | null;
          units_used: number | null;
          credit_used: number | null;
          note: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          client_pass_id: string;
          booking_id?: string | null;
          units_used?: number | null;
          credit_used?: number | null;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          client_pass_id?: string;
          booking_id?: string | null;
          units_used?: number | null;
          credit_used?: number | null;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "client_pass_redemptions_pass_tenant_fkey";
            columns: ["client_pass_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "client_passes";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "client_pass_redemptions_booking_tenant_fkey";
            columns: ["booking_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "client_pass_redemptions_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_pass_redemptions_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      membership_plans: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          billing_period: "monthly" | "quarterly" | "yearly";
          price: number;
          currency: "CZK" | "EUR";
          included_units: number | null;
          included_credit: number | null;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          billing_period: "monthly" | "quarterly" | "yearly";
          price: number;
          currency?: "CZK" | "EUR";
          included_units?: number | null;
          included_credit?: number | null;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          billing_period?: "monthly" | "quarterly" | "yearly";
          price?: number;
          currency?: "CZK" | "EUR";
          included_units?: number | null;
          included_credit?: number | null;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "membership_plans_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      client_memberships: {
        Row: {
          id: string;
          tenant_id: string;
          membership_plan_id: string;
          client_id: string;
          status: "active" | "paused" | "cancelled" | "expired";
          starts_at: string;
          current_period_start: string;
          next_billing_date: string;
          cancelled_at: string | null;
          note: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          membership_plan_id: string;
          client_id: string;
          status?: "active" | "paused" | "cancelled" | "expired";
          starts_at?: string;
          current_period_start?: string;
          next_billing_date: string;
          cancelled_at?: string | null;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          membership_plan_id?: string;
          client_id?: string;
          status?: "active" | "paused" | "cancelled" | "expired";
          starts_at?: string;
          current_period_start?: string;
          next_billing_date?: string;
          cancelled_at?: string | null;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "client_memberships_plan_tenant_fkey";
            columns: ["membership_plan_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "membership_plans";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "client_memberships_client_tenant_fkey";
            columns: ["client_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "client_memberships_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_memberships_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      marketing_campaigns: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          channel: "email" | "sms";
          segment: "all" | "inactive_60d" | "flagged" | "no_show_risk" | "last_visit_30d";
          subject: string | null;
          message: string;
          status: "draft" | "scheduled" | "sent" | "cancelled";
          scheduled_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          channel: "email" | "sms";
          segment: "all" | "inactive_60d" | "flagged" | "no_show_risk" | "last_visit_30d";
          subject?: string | null;
          message: string;
          status?: "draft" | "scheduled" | "sent" | "cancelled";
          scheduled_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          channel?: "email" | "sms";
          segment?: "all" | "inactive_60d" | "flagged" | "no_show_risk" | "last_visit_30d";
          subject?: string | null;
          message?: string;
          status?: "draft" | "scheduled" | "sent" | "cancelled";
          scheduled_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "marketing_campaigns_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      last_minute_offers: {
        Row: {
          id: string;
          tenant_id: string;
          service_id: string | null;
          staff_id: string | null;
          starts_at: string;
          ends_at: string;
          discount_percent: number;
          note: string | null;
          status: "draft" | "published" | "cancelled" | "expired";
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          service_id?: string | null;
          staff_id?: string | null;
          starts_at: string;
          ends_at: string;
          discount_percent?: number;
          note?: string | null;
          status?: "draft" | "published" | "cancelled" | "expired";
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          service_id?: string | null;
          staff_id?: string | null;
          starts_at?: string;
          ends_at?: string;
          discount_percent?: number;
          note?: string | null;
          status?: "draft" | "published" | "cancelled" | "expired";
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "last_minute_offers_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "last_minute_offers_service_tenant_fkey";
            columns: ["service_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "last_minute_offers_staff_tenant_fkey";
            columns: ["staff_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "last_minute_offers_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      bookable_resources: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          resource_type: "room" | "chair" | "equipment" | "vehicle" | "other";
          capacity: number;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          resource_type?: "room" | "chair" | "equipment" | "vehicle" | "other";
          capacity?: number;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          resource_type?: "room" | "chair" | "equipment" | "vehicle" | "other";
          capacity?: number;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookable_resources_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      service_resources: {
        Row: {
          tenant_id: string;
          service_id: string;
          resource_id: string;
          created_at: string;
        };
        Insert: {
          tenant_id: string;
          service_id: string;
          resource_id: string;
          created_at?: string;
        };
        Update: {
          tenant_id?: string;
          service_id?: string;
          resource_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_resources_service_tenant_fkey";
            columns: ["service_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "service_resources_resource_tenant_fkey";
            columns: ["resource_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "bookable_resources";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "service_resources_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      tenant_locations: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          address: string | null;
          city: string | null;
          region: string | null;
          postal_code: string | null;
          country_code: string;
          latitude: number | null;
          longitude: number | null;
          phone: string | null;
          email: string | null;
          is_primary: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          address?: string | null;
          city?: string | null;
          region?: string | null;
          postal_code?: string | null;
          country_code?: string;
          latitude?: number | null;
          longitude?: number | null;
          phone?: string | null;
          email?: string | null;
          is_primary?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          address?: string | null;
          city?: string | null;
          region?: string | null;
          postal_code?: string | null;
          country_code?: string;
          latitude?: number | null;
          longitude?: number | null;
          phone?: string | null;
          email?: string | null;
          is_primary?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_locations_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      group_classes: {
        Row: {
          id: string;
          tenant_id: string;
          service_id: string;
          staff_id: string | null;
          resource_id: string | null;
          location_id: string | null;
          title: string;
          starts_at: string;
          ends_at: string;
          capacity: number;
          price: number | null;
          currency: "CZK" | "EUR";
          status: "scheduled" | "cancelled" | "completed";
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          service_id: string;
          staff_id?: string | null;
          resource_id?: string | null;
          location_id?: string | null;
          title: string;
          starts_at: string;
          ends_at: string;
          capacity: number;
          price?: number | null;
          currency?: "CZK" | "EUR";
          status?: "scheduled" | "cancelled" | "completed";
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          service_id?: string;
          staff_id?: string | null;
          resource_id?: string | null;
          location_id?: string | null;
          title?: string;
          starts_at?: string;
          ends_at?: string;
          capacity?: number;
          price?: number | null;
          currency?: "CZK" | "EUR";
          status?: "scheduled" | "cancelled" | "completed";
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_classes_service_tenant_fkey";
            columns: ["service_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "group_classes_staff_tenant_fkey";
            columns: ["staff_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "group_classes_resource_tenant_fkey";
            columns: ["resource_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "bookable_resources";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "group_classes_location_tenant_fkey";
            columns: ["location_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenant_locations";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "group_classes_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      group_class_attendees: {
        Row: {
          id: string;
          tenant_id: string;
          group_class_id: string;
          client_id: string;
          status: "booked" | "cancelled" | "attended" | "no_show";
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          group_class_id: string;
          client_id: string;
          status?: "booked" | "cancelled" | "attended" | "no_show";
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          group_class_id?: string;
          client_id?: string;
          status?: "booked" | "cancelled" | "attended" | "no_show";
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_class_attendees_class_tenant_fkey";
            columns: ["group_class_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "group_classes";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "group_class_attendees_client_tenant_fkey";
            columns: ["client_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "group_class_attendees_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      referral_programs: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          reward_type: "credit" | "discount" | "manual";
          referrer_reward_amount: number;
          referred_reward_amount: number;
          currency: "CZK" | "EUR";
          max_uses_per_code: number | null;
          is_active: boolean;
          note: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          reward_type?: "credit" | "discount" | "manual";
          referrer_reward_amount?: number;
          referred_reward_amount?: number;
          currency?: "CZK" | "EUR";
          max_uses_per_code?: number | null;
          is_active?: boolean;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          reward_type?: "credit" | "discount" | "manual";
          referrer_reward_amount?: number;
          referred_reward_amount?: number;
          currency?: "CZK" | "EUR";
          max_uses_per_code?: number | null;
          is_active?: boolean;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "referral_programs_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "referral_programs_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      referral_codes: {
        Row: {
          id: string;
          tenant_id: string;
          program_id: string;
          client_id: string | null;
          code_hash: string;
          code_last4: string;
          label: string | null;
          uses_count: number;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          program_id: string;
          client_id?: string | null;
          code_hash: string;
          code_last4: string;
          label?: string | null;
          uses_count?: number;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          program_id?: string;
          client_id?: string | null;
          code_hash?: string;
          code_last4?: string;
          label?: string | null;
          uses_count?: number;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "referral_codes_program_tenant_fkey";
            columns: ["program_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "referral_programs";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "referral_codes_client_tenant_fkey";
            columns: ["client_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "referral_codes_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "referral_codes_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      staff_commission_rules: {
        Row: {
          id: string;
          tenant_id: string;
          staff_id: string;
          rule_type: "percent_paid_revenue" | "fixed_completed_booking";
          percent_bps: number;
          fixed_amount: number;
          currency: "CZK" | "EUR";
          is_active: boolean;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          staff_id: string;
          rule_type?: "percent_paid_revenue" | "fixed_completed_booking";
          percent_bps?: number;
          fixed_amount?: number;
          currency?: "CZK" | "EUR";
          is_active?: boolean;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          staff_id?: string;
          rule_type?: "percent_paid_revenue" | "fixed_completed_booking";
          percent_bps?: number;
          fixed_amount?: number;
          currency?: "CZK" | "EUR";
          is_active?: boolean;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "staff_commission_rules_staff_tenant_fkey";
            columns: ["staff_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "staff_commission_rules_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      empty_slot_recovery_offers: {
        Row: {
          id: string;
          tenant_id: string;
          service_id: string;
          staff_id: string | null;
          starts_at: string;
          ends_at: string;
          discount_percent: number;
          status: "draft" | "ready" | "sent" | "expired" | "cancelled";
          note: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          service_id: string;
          staff_id?: string | null;
          starts_at: string;
          ends_at: string;
          discount_percent?: number;
          status?: "draft" | "ready" | "sent" | "expired" | "cancelled";
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          service_id?: string;
          staff_id?: string | null;
          starts_at?: string;
          ends_at?: string;
          discount_percent?: number;
          status?: "draft" | "ready" | "sent" | "expired" | "cancelled";
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "empty_slot_recovery_offers_service_tenant_fkey";
            columns: ["service_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "empty_slot_recovery_offers_staff_tenant_fkey";
            columns: ["staff_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "empty_slot_recovery_offers_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      empty_slot_recovery_recipients: {
        Row: {
          id: string;
          tenant_id: string;
          offer_id: string;
          client_id: string;
          status: "selected" | "sent" | "booked" | "skipped";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          offer_id: string;
          client_id: string;
          status?: "selected" | "sent" | "booked" | "skipped";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          offer_id?: string;
          client_id?: string;
          status?: "selected" | "sent" | "booked" | "skipped";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "empty_slot_recovery_recipients_offer_tenant_fkey";
            columns: ["offer_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "empty_slot_recovery_offers";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "empty_slot_recovery_recipients_client_tenant_fkey";
            columns: ["client_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "empty_slot_recovery_recipients_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      tenant_api_keys: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          token_hash: string;
          token_prefix: string;
          token_last4: string;
          scopes: string[];
          created_by: string | null;
          last_used_at: string | null;
          revoked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          token_hash: string;
          token_prefix: string;
          token_last4: string;
          scopes?: string[];
          created_by?: string | null;
          last_used_at?: string | null;
          revoked_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          token_hash?: string;
          token_prefix?: string;
          token_last4?: string;
          scopes?: string[];
          created_by?: string | null;
          last_used_at?: string | null;
          revoked_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_api_keys_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tenant_api_keys_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      booking_events: {
        Row: {
          id: string;
          tenant_id: string;
          booking_id: string;
          actor_user_id: string | null;
          actor_type: "owner" | "staff" | "client" | "system";
          event_type:
            | "created"
            | "confirmed"
            | "rejected"
            | "rescheduled"
            | "cancelled"
            | "completed"
            | "no_show"
            | "payment_recorded";
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          booking_id: string;
          actor_user_id?: string | null;
          actor_type: "owner" | "staff" | "client" | "system";
          event_type:
            | "created"
            | "confirmed"
            | "rejected"
            | "rescheduled"
            | "cancelled"
            | "completed"
            | "no_show"
            | "payment_recorded";
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          booking_id?: string;
          actor_user_id?: string | null;
          actor_type?: "owner" | "staff" | "client" | "system";
          event_type?:
            | "created"
            | "confirmed"
            | "rejected"
            | "rescheduled"
            | "cancelled"
            | "completed"
            | "no_show"
            | "payment_recorded";
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_events_booking_tenant_fkey";
            columns: ["booking_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "booking_events_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booking_events_actor_user_id_fkey";
            columns: ["actor_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      waitlist_entries: {
        Row: {
          id: string;
          tenant_id: string;
          client_id: string | null;
          service_id: string;
          staff_id: string | null;
          preferred_from: string | null;
          preferred_to: string | null;
          client_name: string;
          client_phone: string | null;
          client_email: string | null;
          notes: string | null;
          source: "online" | "instagram" | "qr" | "widget" | "catalog" | "google" | "referral";
          source_detail: string | null;
          source_metadata: Json;
          status: "active" | "offered" | "booked" | "cancelled" | "expired";
          offered_booking_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          client_id?: string | null;
          service_id: string;
          staff_id?: string | null;
          preferred_from?: string | null;
          preferred_to?: string | null;
          client_name: string;
          client_phone?: string | null;
          client_email?: string | null;
          notes?: string | null;
          source?: "online" | "instagram" | "qr" | "widget" | "catalog" | "google" | "referral";
          source_detail?: string | null;
          source_metadata?: Json;
          status?: "active" | "offered" | "booked" | "cancelled" | "expired";
          offered_booking_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          client_id?: string | null;
          service_id?: string;
          staff_id?: string | null;
          preferred_from?: string | null;
          preferred_to?: string | null;
          client_name?: string;
          client_phone?: string | null;
          client_email?: string | null;
          notes?: string | null;
          source?: "online" | "instagram" | "qr" | "widget" | "catalog" | "google" | "referral";
          source_detail?: string | null;
          source_metadata?: Json;
          status?: "active" | "offered" | "booked" | "cancelled" | "expired";
          offered_booking_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "waitlist_entries_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "waitlist_entries_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "waitlist_entries_service_tenant_fkey";
            columns: ["service_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "waitlist_entries_staff_tenant_fkey";
            columns: ["staff_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "waitlist_entries_offered_booking_tenant_fkey";
            columns: ["offered_booking_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id", "tenant_id"];
          },
        ];
      };
      booking_self_service_tokens: {
        Row: {
          id: string;
          tenant_id: string;
          booking_id: string;
          token_hash: string;
          purpose: "manage_booking";
          expires_at: string;
          revoked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          booking_id: string;
          token_hash: string;
          purpose?: "manage_booking";
          expires_at: string;
          revoked_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          booking_id?: string;
          token_hash?: string;
          purpose?: "manage_booking";
          expires_at?: string;
          revoked_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_self_service_tokens_booking_tenant_fkey";
            columns: ["booking_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "booking_self_service_tokens_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          tenant_id: string;
          booking_id: string | null;
          client_id: string | null;
          type:
            | "confirmation"
            | "reminder"
            | "cancellation"
            | "no_show_followup"
            | "owner_booking_created"
            | "reschedule"
            | "review_request";
          channel: "email" | "sms";
          recipient: string;
          status: "pending" | "processing" | "sent" | "failed" | "skipped";
          scheduled_at: string;
          processing_started_at: string | null;
          sent_at: string | null;
          error: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          booking_id?: string | null;
          client_id?: string | null;
          type:
            | "confirmation"
            | "reminder"
            | "cancellation"
            | "no_show_followup"
            | "owner_booking_created"
            | "reschedule"
            | "review_request";
          channel: "email" | "sms";
          recipient: string;
          status?: "pending" | "processing" | "sent" | "failed" | "skipped";
          scheduled_at: string;
          processing_started_at?: string | null;
          sent_at?: string | null;
          error?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          booking_id?: string | null;
          client_id?: string | null;
          type?:
            | "confirmation"
            | "reminder"
            | "cancellation"
            | "no_show_followup"
            | "owner_booking_created"
            | "reschedule"
            | "review_request";
          channel?: "email" | "sms";
          recipient?: string;
          status?: "pending" | "processing" | "sent" | "failed" | "skipped";
          scheduled_at?: string;
          processing_started_at?: string | null;
          sent_at?: string | null;
          error?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_booking_tenant_fkey";
            columns: ["booking_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "notifications_client_tenant_fkey";
            columns: ["client_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id", "tenant_id"];
          },
        ];
      };
      calendar_feed_tokens: {
        Row: {
          id: string;
          tenant_id: string;
          staff_id: string | null;
          token_hash: string;
          name: string;
          last_used_at: string | null;
          revoked_at: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          staff_id?: string | null;
          token_hash: string;
          name?: string;
          last_used_at?: string | null;
          revoked_at?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          staff_id?: string | null;
          token_hash?: string;
          name?: string;
          last_used_at?: string | null;
          revoked_at?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "calendar_feed_tokens_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "calendar_feed_tokens_staff_tenant_fkey";
            columns: ["staff_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "staff";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "calendar_feed_tokens_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      staff_directory_metrics: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          bio: string | null;
          user_id: string | null;
          working_days_count: number;
          service_count: number;
          exception_count: number;
        };
        Insert: never;
        Update: never;
        Relationships: [
          {
            foreignKeyName: "staff_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "staff_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      create_booking: {
        Args: {
          p_tenant_id: string;
          p_client_id: string | null;
          p_staff_id: string;
          p_service_id: string;
          p_starts_at: string;
          p_notes?: string | null;
          p_source?: "manual" | "online" | "instagram" | "qr" | "widget" | "catalog" | "google" | "referral";
        };
        Returns: Database["public"]["Tables"]["bookings"]["Row"];
      };
      create_public_booking: {
        Args: {
          p_tenant_slug: string;
          p_staff_id: string;
          p_service_id: string;
          p_starts_at: string;
          p_client_name: string;
          p_client_phone?: string | null;
          p_client_email?: string | null;
          p_notes?: string | null;
          p_source?: "online" | "instagram" | "qr" | "widget" | "catalog" | "google" | "referral";
          p_source_detail?: string | null;
          p_source_metadata?: Json;
        };
        Returns: Database["public"]["Tables"]["bookings"]["Row"];
      };
      create_waitlist_entry: {
        Args: {
          p_tenant_slug: string;
          p_service_id: string;
          p_staff_id?: string | null;
          p_client_name?: string;
          p_client_phone?: string | null;
          p_client_email?: string | null;
          p_notes?: string | null;
          p_source?: "online" | "instagram" | "qr" | "widget" | "catalog" | "google" | "referral";
          p_source_detail?: string | null;
          p_source_metadata?: Json;
        };
        Returns: Database["public"]["Tables"]["waitlist_entries"]["Row"];
      };
      record_inventory_movement: {
        Args: {
          p_product_id: string;
          p_quantity_delta: number;
          p_reason: "purchase" | "usage" | "sale" | "adjustment" | "waste" | "return";
          p_note?: string | null;
          p_booking_id?: string | null;
        };
        Returns: Database["public"]["Tables"]["inventory_movements"]["Row"];
      };
      redeem_voucher: {
        Args: {
          p_code_hash: string;
          p_amount: number;
          p_booking_id?: string | null;
          p_note?: string | null;
        };
        Returns: Database["public"]["Tables"]["voucher_redemptions"]["Row"];
      };
      redeem_client_pass: {
        Args: {
          p_client_pass_id: string;
          p_units_used?: number | null;
          p_credit_used?: number | null;
          p_booking_id?: string | null;
          p_note?: string | null;
        };
        Returns: Database["public"]["Tables"]["client_pass_redemptions"]["Row"];
      };
      enroll_group_class: {
        Args: {
          p_group_class_id: string;
          p_client_id: string;
          p_note?: string | null;
        };
        Returns: string;
      };
      update_booking: {
        Args: {
          p_tenant_id: string;
          p_booking_id: string;
          p_staff_id: string;
          p_service_id: string;
          p_starts_at: string;
          p_notes?: string | null;
        };
        Returns: Database["public"]["Tables"]["bookings"]["Row"];
      };
      reschedule_booking_self_service: {
        Args: {
          p_tenant_id: string;
          p_booking_id: string;
          p_staff_id: string;
          p_service_id: string;
          p_starts_at: string;
        };
        Returns: Database["public"]["Tables"]["bookings"]["Row"];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
