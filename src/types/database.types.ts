
export type UserRole = 'super-admin' | 'admin' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  profile_image_url?: string;
  username?: string;
  bio?: string;
  banner_url?: string;
  status_tag?: string;
  accent_color?: string;
  followers_count?: number;
  following_count?: number;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
    instagram?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface PublicProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  profile_image_url?: string;
  username?: string;
  bio?: string;
  banner_url?: string;
  status_tag?: string;
  accent_color?: string;
  followers_count?: number;
  following_count?: number;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
    instagram?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  profile_id: string;
  author_name: string;
  author_image_url?: string;
  content: string;
  rating?: number;
  created_at: string;
  updated_at: string;
}

export interface Community {
  id: string;
  admin_id: string;
  name: string;
  description?: string;
  topic?: string;
  tags?: string[];
  banner_url?: string;
  members_count?: number;
  published?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  joined_at: string;
}

export interface Post {
  id: string;
  admin_id: string;
  content_type: 'text' | 'image' | 'video' | 'file' | 'link';
  title?: string;
  content_data: {
    text?: string;
    image_url?: string;
    video_url?: string;
    file_url?: string;
    link_url?: string;
    link_title?: string;
    link_description?: string;
  };
  is_paid?: boolean;
  price?: number;
  visibility?: 'public' | 'followers' | 'paid';
  likes_count?: number;
  comments_count?: number;
  published?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Space {
  id: string;
  admin_id: string;
  name: string;
  description?: string;
  banner_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  category_id?: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  stock?: number;
  published?: boolean;
  featured?: boolean;
  is_free?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Blog {
  id: string;
  author_id: string;
  title: string;
  content: string;
  published?: boolean;
  featured?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  author_id: string;
  category_id?: string;
  name: string;
  description: string;
  file_url?: string;
  preview_image_url?: string;
  price?: number;
  is_free?: boolean;
  published?: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  author_id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: number;
  published?: boolean;
  featured?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  type: string;
  content: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminRequest {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface UserWallet {
  id: string;
  user_id: string;
  available_balance: number;
  pending_balance: number;
  total_earnings: number;
  bank_details?: {
    account_name: string;
    account_number: string;
    bank_code: string;
    bank_name: string;
  };
  paystack_recipient_code?: string;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'credit' | 'debit' | 'payout' | 'sale' | 'fee';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  reference?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}
