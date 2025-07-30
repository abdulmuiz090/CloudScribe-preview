
// CORS configuration for edge functions and API calls
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

export const SECURE_CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? 'https://jauuzzwtbbnyundldozd.supabase.co' 
    : '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
};

export function handleCorsPreflightRequest(): Response {
  return new Response(null, {
    status: 200,
    headers: CORS_HEADERS
  });
}
