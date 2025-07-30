
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get user profile to check followers
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('followers_count')
      .eq('id', user.id)
      .single();

    // Get products count
    const { count: productsCount } = await supabaseClient
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', user.id);

    // Get content created (blogs, videos, templates)
    const { count: blogsCount } = await supabaseClient
      .from('blogs')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', user.id);

    const { count: videosCount } = await supabaseClient
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', user.id);

    const { count: templatesCount } = await supabaseClient
      .from('templates')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', user.id);

    // Get posts engagement
    const { data: posts } = await supabaseClient
      .from('posts')
      .select('likes_count, comments_count')
      .eq('admin_id', user.id);

    const totalLikes = posts?.reduce((sum, post) => sum + (post.likes_count || 0), 0) || 0;
    const totalComments = posts?.reduce((sum, post) => sum + (post.comments_count || 0), 0) || 0;
    const totalViews = Math.floor(totalLikes * 2.5); // Estimate views based on engagement

    // Mock data for now - in production, these would come from actual transaction/order tables
    const mockMetrics = {
      totalFollowers: profile?.followers_count || 0,
      contentCreated: (blogsCount || 0) + (videosCount || 0) + (templatesCount || 0),
      productsCount: productsCount || 0,
      walletBalance: 45000,
      customersCount: Math.floor((productsCount || 0) * 1.2), // Estimate
      topRatedProduct: productsCount > 0 ? {
        name: "Premium Design Template",
        rating: 4.8,
        sales: 23
      } : null,
      contentEngagement: {
        totalViews,
        totalLikes,
        totalComments,
        engagementRate: totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0
      },
      recentFeedback: [
        {
          id: "1",
          content: "Amazing quality and fast delivery!",
          rating: 5,
          created_at: new Date().toISOString(),
          product_name: "Design Template"
        },
        {
          id: "2", 
          content: "Good value for money, would recommend.",
          rating: 4,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          product_name: "UI Kit"
        }
      ]
    };

    return new Response(JSON.stringify(mockMetrics), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Admin metrics error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
