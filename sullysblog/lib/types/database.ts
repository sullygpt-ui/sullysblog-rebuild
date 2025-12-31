// Database types based on Supabase schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          slug: string
          title: string
          content: string
          excerpt: string | null
          featured_image_url: string | null
          author_id: string
          category_id: string | null // Legacy field - use post_categories for new posts
          status: 'draft' | 'scheduled' | 'published'
          published_at: string | null
          created_at: string
          updated_at: string
          view_count: number
          seo_title: string | null
          seo_description: string | null
          seo_keywords: string | null
          wordpress_id: number | null
          wordpress_url: string | null
        }
        Insert: Omit<Database['public']['Tables']['posts']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['posts']['Insert']>
      }
      post_categories: {
        Row: {
          id: string
          post_id: string
          category_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['post_categories']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['post_categories']['Insert']>
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          created_at: string
          updated_at: string
        }
      }
      advertisers: {
        Row: {
          id: string
          business_name: string
          contact_name: string
          contact_email: string | null
          company_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
      }
      ad_campaigns: {
        Row: {
          id: string
          advertiser_id: string
          package_id: string | null
          stripe_subscription_id: string | null
          start_date: string
          end_date: string
          status: 'pending' | 'active' | 'cancelled' | 'expired'
          monthly_amount: number
          notes: string | null
          notified_at: string | null
          created_at: string
          updated_at: string
        }
      }
      ad_creatives: {
        Row: {
          id: string
          campaign_id: string
          placement: string
          creative_type: 'image' | 'html' | 'text_link'
          creative_url: string | null
          creative_html: string | null
          text_title: string | null
          text_description: string | null
          click_url: string
          alt_text: string | null
          created_at: string
        }
      }
      dictionary_terms: {
        Row: {
          id: string
          term: string
          slug: string
          short_definition: string
          full_definition: string
          created_at: string
          updated_at: string
          wordpress_page_id: number | null
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          parent_id: string | null
          author_name: string
          author_email: string
          author_url: string | null
          content: string
          status: 'pending' | 'approved' | 'spam'
          is_first_time: boolean
          created_at: string
          ip_address: string | null
          user_agent: string | null
          upvotes: number
          downvotes: number
          is_pinned: boolean
          is_best: boolean
          is_author_reply: boolean
          notify_replies: boolean
          reply_count: number
        }
        Insert: Omit<Database['public']['Tables']['comments']['Row'], 'id' | 'created_at' | 'upvotes' | 'downvotes' | 'reply_count'>
        Update: Partial<Database['public']['Tables']['comments']['Insert']>
      }
      comment_votes: {
        Row: {
          id: string
          comment_id: string
          voter_identifier: string
          vote_type: 'up' | 'down'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['comment_votes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['comment_votes']['Insert']>
      }
      comment_notifications: {
        Row: {
          id: string
          comment_id: string
          recipient_email: string
          notification_type: 'reply' | 'author_reply' | 'approved'
          sent_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['comment_notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['comment_notifications']['Insert']>
      }
      user_profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          role: 'customer' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          short_description: string | null
          description: string | null
          price: number
          compare_at_price: number | null
          product_type: 'ebook' | 'template' | 'bundle' | 'course'
          cover_image_url: string | null
          featured: boolean
          display_order: number
          stripe_price_id: string | null
          stripe_product_id: string | null
          status: 'draft' | 'active' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      product_files: {
        Row: {
          id: string
          product_id: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          display_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['product_files']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['product_files']['Insert']>
      }
      bundle_items: {
        Row: {
          id: string
          bundle_product_id: string
          included_product_id: string
          display_order: number
        }
        Insert: Omit<Database['public']['Tables']['bundle_items']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['bundle_items']['Insert']>
      }
      orders: {
        Row: {
          id: string
          user_id: string
          order_number: string
          status: 'pending' | 'completed' | 'refunded' | 'failed'
          subtotal: number
          total: number
          stripe_session_id: string | null
          stripe_payment_intent_id: string | null
          stripe_customer_id: string | null
          customer_email: string
          completed_at: string | null
          created_at: string
          updated_at: string
          coupon_id: string | null
          discount_amount: number
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          product_name: string
          price_at_purchase: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>
      }
      download_access: {
        Row: {
          id: string
          user_id: string
          product_id: string
          order_id: string
          download_count: number
          last_downloaded_at: string | null
          granted_at: string
        }
        Insert: Omit<Database['public']['Tables']['download_access']['Row'], 'id' | 'granted_at'>
        Update: Partial<Database['public']['Tables']['download_access']['Insert']>
      }
      coupons: {
        Row: {
          id: string
          code: string
          description: string | null
          discount_type: 'percentage' | 'fixed_amount'
          discount_value: number
          max_uses: number | null
          max_uses_per_user: number | null
          current_uses: number
          starts_at: string | null
          expires_at: string | null
          minimum_purchase: number | null
          applies_to: 'all' | 'specific_products'
          status: 'active' | 'inactive' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['coupons']['Row'], 'id' | 'created_at' | 'updated_at' | 'current_uses'>
        Update: Partial<Database['public']['Tables']['coupons']['Insert']>
      }
      coupon_products: {
        Row: {
          id: string
          coupon_id: string
          product_id: string
        }
        Insert: Omit<Database['public']['Tables']['coupon_products']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['coupon_products']['Insert']>
      }
      coupon_usages: {
        Row: {
          id: string
          coupon_id: string
          order_id: string
          user_id: string
          discount_amount: number
          used_at: string
        }
        Insert: Omit<Database['public']['Tables']['coupon_usages']['Row'], 'id' | 'used_at'>
        Update: Partial<Database['public']['Tables']['coupon_usages']['Insert']>
      }
    }
    Functions: {
      calculate_current_mrr: {
        Args: Record<string, never>
        Returns: number
      }
      get_active_campaigns_by_placement: {
        Args: { placement_filter: string }
        Returns: Array<{
          campaign_id: string
          creative_id: string
          creative_type: string
          creative_url: string | null
          creative_html: string | null
          text_title: string | null
          text_description: string | null
          click_url: string
          alt_text: string | null
          business_name: string
        }>
      }
    }
  }
}
