
export interface FeedItem {
  id: string;
  type: 'post' | 'space_created' | 'community_created' | 'product_launch';
  content: any;
  author: {
    id: string;
    full_name: string;
    profile_image_url?: string;
    role: string;
  };
  created_at: string;
}

export interface FeedFilters {
  type?: string;
  timeframe?: 'today' | 'week' | 'month' | 'all';
  following_only?: boolean;
}
