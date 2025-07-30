
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

interface PasswordResetRequest {
  email: string;
  resetLink: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        },
      }
    );
  }

  try {
    const requestBody = await req.text();
    
    if (!requestBody) {
      return new Response(
        JSON.stringify({ error: "Request body is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    const { email, resetLink }: PasswordResetRequest = JSON.parse(requestBody);

    if (!email || !resetLink) {
      return new Response(
        JSON.stringify({ error: "Email and resetLink are required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    console.log(`Sending password reset email to: ${email}`);

    const emailResponse = await resend.emails.send({
      from: "CloudScribe <noreply@cloudscribe.com>",
      to: [email],
      subject: "Reset Your CloudScribe Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0;">CloudScribe</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Creator Platform</p>
          </div>
          
          <h2 style="color: #333; text-align: center; margin-bottom: 30px;">Reset Your Password</h2>
          
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
              You requested to reset your password for your CloudScribe account. 
              Click the button below to set a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #4f46e5; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 6px; display: inline-block;
                        font-weight: 600; text-align: center;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin: 20px 0 0 0;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="word-break: break-all; color: #4f46e5; font-size: 14px; margin: 5px 0 0 0;">
              ${resetLink}
            </p>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">
              <strong>Security Notice:</strong> This link will expire in 24 hours for security reasons.
            </p>
            <p style="color: #999; font-size: 12px; margin: 0;">
              If you didn't request this password reset, you can safely ignore this email.
              Your password will remain unchanged.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2024 CloudScribe. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id || 'unknown'
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    
    let errorMessage = "An unexpected error occurred";
    let statusCode = 500;
    
    if (error.message?.includes("API key")) {
      errorMessage = "Email service configuration error";
      statusCode = 503;
    } else if (error.message?.includes("rate limit")) {
      errorMessage = "Too many requests, please try again later";
      statusCode = 429;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      {
        status: statusCode,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
