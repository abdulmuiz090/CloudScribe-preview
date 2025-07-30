
import { supabase } from '@/lib/supabase';
import type { Post, UserProfile } from '@/types/database.types';

export interface FeedItem {
  id: string;
  type: 'post' | 'blog' | 'video' | 'template' | 'product';
  content: any;
  author: UserProfile;
  created_at: string;
}

export async function getFeedItems(limit = 20): Promise<FeedItem[]> {
  const feedItems: FeedItem[] = [];

  try {
    // Get posts from admins and super-admins
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        *,
        author:user_profiles!posts_admin_id_fkey(
          id,
          full_name,
          profile_image_url,
          role
        )
      `)
      .eq('published', true)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(Math.floor(limit / 4));

    if (postsError) {
      console.error('Error fetching posts:', postsError);
    } else if (posts) {
      const postItems = posts.map(post => ({
        id: `post-${post.id}`,
        type: 'post' as const,
        content: post,
        author: (post as any).author,
        created_at: post.created_at,
      }));
      feedItems.push(...postItems);
    }

    // Get blogs from admins and super-admins
    const { data: blogs, error: blogsError } = await supabase
      .from('blogs')
      .select(`
        *,
        author:user_profiles!blogs_author_id_fkey(
          id,
          full_name,
          profile_image_url,
          role
        )
      `)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(Math.floor(limit / 4));

    if (blogsError) {
      console.error('Error fetching blogs:', blogsError);
    } else if (blogs) {
      const blogItems = blogs.map(blog => ({
        id: `blog-${blog.id}`,
        type: 'blog' as const,
        content: blog,
        author: (blog as any).author,
        created_at: blog.created_at,
      }));
      feedItems.push(...blogItems);
    }

    // Get videos from admins and super-admins
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select(`
        *,
        author:user_profiles!videos_author_id_fkey(
          id,
          full_name,
          profile_image_url,
          role
        )
      `)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(Math.floor(limit / 4));

    if (videosError) {
      console.error('Error fetching videos:', videosError);
    } else if (videos) {
      const videoItems = videos.map(video => ({
        id: `video-${video.id}`,
        type: 'video' as const,
        content: video,
        author: (video as any).author,
        created_at: video.created_at,
      }));
      feedItems.push(...videoItems);
    }

    // Get templates from admins and super-admins
    const { data: templates, error: templatesError } = await supabase
      .from('templates')
      .select(`
        *,
        author:user_profiles!templates_author_id_fkey(
          id,
          full_name,
          profile_image_url,
          role
        )
      `)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(Math.floor(limit / 4));

    if (templatesError) {
      console.error('Error fetching templates:', templatesError);
    } else if (templates) {
      const templateItems = templates.map(template => ({
        id: `template-${template.id}`,
        type: 'template' as const,
        content: template,
        author: (template as any).author,
        created_at: template.created_at,
      }));
      feedItems.push(...templateItems);
    }

  } catch (error) {
    console.error('Error in getFeedItems:', error);
  }

  // Sort all items by creation date
  return feedItems.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, limit);
}

export async function getPersonalizedFeed(limit = 20): Promise<FeedItem[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // If not authenticated, return the general feed
    return getFeedItems(limit);
  }

  try {
    // Get followed users
    const { data: following } = await supabase
      .from('followers')
      .select('following_id')
      .eq('follower_id', user.id);

    const followingIds = following?.map(f => f.following_id) || [];
    
    if (followingIds.length === 0) {
      // If not following anyone, show general feed
      return getFeedItems(limit);
    }

    const feedItems: FeedItem[] = [];

    // Get posts from followed users
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        *,
        author:user_profiles!posts_admin_id_fkey(
          id,
          full_name,
          profile_image_url,
          role
        )
      `)
      .in('admin_id', followingIds)
      .eq('published', true)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!postsError && posts) {
      const postItems = posts.map(post => ({
        id: `post-${post.id}`,
        type: 'post' as const,
        content: post,
        author: (post as any).author,
        created_at: post.created_at,
      }));
      feedItems.push(...postItems);
    }

    // Get blogs from followed users
    const { data: blogs, error: blogsError } = await supabase
      .from('blogs')
      .select(`
        *,
        author:user_profiles!blogs_author_id_fkey(
          id,
          full_name,
          profile_image_url,
          role
        )
      `)
      .in('author_id', followingIds)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!blogsError && blogs) {
      const blogItems = blogs.map(blog => ({
        id: `blog-${blog.id}`,
        type: 'blog' as const,
        content: blog,
        author: (blog as any).author,
        created_at: blog.created_at,
      }));
      feedItems.push(...blogItems);
    }

    return feedItems.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, limit);

  } catch (error) {
    console.error('Error in getPersonalizedFeed:', error);
    return getFeedItems(limit); // Fallback to general feed
  }
}

// Alias for backward compatibility
export const fetchUserFeed = getPersonalizedFeed;
