export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_requests: {
        Row: {
          created_at: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          priority: string
          published: boolean
          scheduled_for: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: string
          priority?: string
          published?: boolean
          scheduled_for?: string | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          priority?: string
          published?: boolean
          scheduled_for?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      blogs: {
        Row: {
          author_id: string
          content: string
          created_at: string
          featured: boolean | null
          id: string
          published: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          featured?: boolean | null
          id?: string
          published?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          featured?: boolean | null
          id?: string
          published?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blogs_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          message_type: string
          metadata: Json | null
          room_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          room_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          room_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_room_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          content_id: string
          content_type: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      communities: {
        Row: {
          admin_id: string
          banner_url: string | null
          created_at: string
          description: string | null
          id: string
          members_count: number | null
          name: string
          published: boolean | null
          tags: string[] | null
          topic: string | null
          updated_at: string
        }
        Insert: {
          admin_id: string
          banner_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          members_count?: number | null
          name: string
          published?: boolean | null
          tags?: string[] | null
          topic?: string | null
          updated_at?: string
        }
        Update: {
          admin_id?: string
          banner_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          members_count?: number | null
          name?: string
          published?: boolean | null
          tags?: string[] | null
          topic?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communities_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          content: string
          created_at: string
          created_by: string
          delivered_count: number | null
          id: string
          name: string
          recipient_count: number | null
          scheduled_for: string | null
          sent_at: string | null
          status: string
          subject: string
          template_type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          delivered_count?: number | null
          id?: string
          name: string
          recipient_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          template_type?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          delivered_count?: number | null
          id?: string
          name?: string
          recipient_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          content: string
          created_at: string
          id: string
          status: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          status?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          status?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      followers: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          admin_id: string
          comments_count: number | null
          content_data: Json
          content_type: string
          created_at: string
          id: string
          is_paid: boolean | null
          likes_count: number | null
          price: number | null
          published: boolean | null
          title: string | null
          updated_at: string
          visibility: string | null
        }
        Insert: {
          admin_id: string
          comments_count?: number | null
          content_data: Json
          content_type: string
          created_at?: string
          id?: string
          is_paid?: boolean | null
          likes_count?: number | null
          price?: number | null
          published?: boolean | null
          title?: string | null
          updated_at?: string
          visibility?: string | null
        }
        Update: {
          admin_id?: string
          comments_count?: number | null
          content_data?: Json
          content_type?: string
          created_at?: string
          id?: string
          is_paid?: boolean | null
          likes_count?: number | null
          price?: number | null
          published?: boolean | null
          title?: string | null
          updated_at?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string
          featured: boolean | null
          id: string
          image_url: string | null
          name: string
          price: number
          published: boolean | null
          seller_id: string
          stock: number | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description: string
          featured?: boolean | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          published?: boolean | null
          seller_id: string
          stock?: number | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string
          featured?: boolean | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          published?: boolean | null
          seller_id?: string
          stock?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ratings: {
        Row: {
          comment: string | null
          content_id: string
          content_type: string
          created_at: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      spaces: {
        Row: {
          admin_id: string
          banner_url: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          admin_id: string
          banner_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          admin_id?: string
          banner_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spaces_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      template_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      template_download_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          purchase_id: string
          token: string
          used: boolean | null
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          purchase_id: string
          token: string
          used?: boolean | null
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          purchase_id?: string
          token?: string
          used?: boolean | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_download_tokens_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "template_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      template_feedback: {
        Row: {
          buyer_id: string
          created_at: string | null
          id: string
          purchase_id: string
          questions_and_answers: Json
          seller_id: string
          seller_responded_at: string | null
          seller_response: string | null
          template_id: string
          updated_at: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          id?: string
          purchase_id: string
          questions_and_answers?: Json
          seller_id: string
          seller_responded_at?: string | null
          seller_response?: string | null
          template_id: string
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          id?: string
          purchase_id?: string
          questions_and_answers?: Json
          seller_id?: string
          seller_responded_at?: string | null
          seller_response?: string | null
          template_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_feedback_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "template_purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_feedback_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      template_purchases: {
        Row: {
          buyer_id: string
          created_at: string | null
          currency: string
          download_count: number | null
          id: string
          last_download_date: string | null
          max_downloads: number | null
          payment_reference: string | null
          payment_status: string
          purchase_date: string | null
          purchase_price: number
          seller_id: string
          template_id: string
          updated_at: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          currency?: string
          download_count?: number | null
          id?: string
          last_download_date?: string | null
          max_downloads?: number | null
          payment_reference?: string | null
          payment_status?: string
          purchase_date?: string | null
          purchase_price: number
          seller_id: string
          template_id: string
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          currency?: string
          download_count?: number | null
          id?: string
          last_download_date?: string | null
          max_downloads?: number | null
          payment_reference?: string | null
          payment_status?: string
          purchase_date?: string | null
          purchase_price?: number
          seller_id?: string
          template_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_purchases_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      template_reviews: {
        Row: {
          created_at: string | null
          id: string
          is_verified_purchase: boolean | null
          purchase_id: string
          rating: number
          review_text: string | null
          reviewer_id: string
          template_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_verified_purchase?: boolean | null
          purchase_id: string
          rating: number
          review_text?: string | null
          reviewer_id: string
          template_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_verified_purchase?: boolean | null
          purchase_id?: string
          rating?: number
          review_text?: string | null
          reviewer_id?: string
          template_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_reviews_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: true
            referencedRelation: "template_purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_reviews_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          author_id: string
          category_id: string | null
          created_at: string
          cta_buttons: Json | null
          currency: string | null
          demo_url: string | null
          description: string
          discount_end_date: string | null
          discount_percentage: number | null
          discount_price: number | null
          downloads_count: number | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          instructions_url: string | null
          is_free: boolean | null
          license_type: string | null
          max_file_size_mb: number | null
          name: string
          post_purchase_questions: Json | null
          preview_image_url: string | null
          price: number | null
          published: boolean | null
          supports_international: boolean | null
          tags: string[] | null
          updated_at: string
          watermarked_preview_url: string | null
        }
        Insert: {
          author_id: string
          category_id?: string | null
          created_at?: string
          cta_buttons?: Json | null
          currency?: string | null
          demo_url?: string | null
          description: string
          discount_end_date?: string | null
          discount_percentage?: number | null
          discount_price?: number | null
          downloads_count?: number | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          instructions_url?: string | null
          is_free?: boolean | null
          license_type?: string | null
          max_file_size_mb?: number | null
          name: string
          post_purchase_questions?: Json | null
          preview_image_url?: string | null
          price?: number | null
          published?: boolean | null
          supports_international?: boolean | null
          tags?: string[] | null
          updated_at?: string
          watermarked_preview_url?: string | null
        }
        Update: {
          author_id?: string
          category_id?: string | null
          created_at?: string
          cta_buttons?: Json | null
          currency?: string | null
          demo_url?: string | null
          description?: string
          discount_end_date?: string | null
          discount_percentage?: number | null
          discount_price?: number | null
          downloads_count?: number | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          instructions_url?: string | null
          is_free?: boolean | null
          license_type?: string | null
          max_file_size_mb?: number | null
          name?: string
          post_purchase_questions?: Json | null
          preview_image_url?: string | null
          price?: number | null
          published?: boolean | null
          supports_international?: boolean | null
          tags?: string[] | null
          updated_at?: string
          watermarked_preview_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "template_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          author_image_url: string | null
          author_name: string
          content: string
          created_at: string
          id: string
          profile_id: string
          rating: number | null
          updated_at: string
        }
        Insert: {
          author_image_url?: string | null
          author_name: string
          content: string
          created_at?: string
          id?: string
          profile_id: string
          rating?: number | null
          updated_at?: string
        }
        Update: {
          author_image_url?: string | null
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          profile_id?: string
          rating?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          accent_color: string | null
          banner_url: string | null
          bio: string | null
          created_at: string
          email: string
          followers_count: number | null
          following_count: number | null
          full_name: string
          id: string
          profile_image_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          social_links: Json | null
          status_tag: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          accent_color?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          followers_count?: number | null
          following_count?: number | null
          full_name: string
          id: string
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          social_links?: Json | null
          status_tag?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          accent_color?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          followers_count?: number | null
          following_count?: number | null
          full_name?: string
          id?: string
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          social_links?: Json | null
          status_tag?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      user_wallets: {
        Row: {
          available_balance: number
          bank_details: Json | null
          created_at: string
          id: string
          paystack_recipient_code: string | null
          pending_balance: number
          total_earnings: number
          updated_at: string
          user_id: string
        }
        Insert: {
          available_balance?: number
          bank_details?: Json | null
          created_at?: string
          id?: string
          paystack_recipient_code?: string | null
          pending_balance?: number
          total_earnings?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          available_balance?: number
          bank_details?: Json | null
          created_at?: string
          id?: string
          paystack_recipient_code?: string | null
          pending_balance?: number
          total_earnings?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          author_id: string
          created_at: string
          description: string
          duration: number | null
          featured: boolean | null
          id: string
          published: boolean | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string
        }
        Insert: {
          author_id: string
          created_at?: string
          description: string
          duration?: number | null
          featured?: boolean | null
          id?: string
          published?: boolean | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url: string
        }
        Update: {
          author_id?: string
          created_at?: string
          description?: string
          duration?: number | null
          featured?: boolean | null
          id?: string
          published?: boolean | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          metadata: Json | null
          reference: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          reference?: string | null
          status?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          reference?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_download_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_download_token: {
        Args: { purchase_uuid: string }
        Returns: string
      }
      get_admin_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_platform_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_products_with_categories: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          description: string
          seller_id: string
          category_id: string
          category_name: string
          price: number
          stock: number
          published: boolean
          featured: boolean
          image_url: string
          created_at: string
          updated_at: string
          seller_name: string
        }[]
      }
      get_templates_with_categories: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          description: string
          author_id: string
          category_id: string
          category_name: string
          price: number
          is_free: boolean
          published: boolean
          file_url: string
          preview_image_url: string
          created_at: string
          updated_at: string
          author_name: string
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      process_admin_request: {
        Args: { request_id: string; new_status: string; admin_id: string }
        Returns: Json
      }
      validate_template_file_type: {
        Args: { file_type: string; file_size_bytes: number }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "super-admin" | "admin" | "user"
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
      user_role: ["super-admin", "admin", "user"],
    },
  },
} as const
