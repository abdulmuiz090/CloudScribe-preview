
import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  event_type: 'login_attempt' | 'failed_login' | 'unauthorized_access' | 'suspicious_activity' | 'data_breach_attempt';
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class SecurityLogger {
  private static instance: SecurityLogger;
  
  private constructor() {}
  
  static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }
  
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('🔒 Security Event:', event);
      }
      
      // Store in database
      const { error } = await supabase
        .from('security_logs')
        .insert({
          event_type: event.event_type,
          user_id: event.user_id,
          ip_address: event.ip_address,
          user_agent: event.user_agent,
          details: event.details,
          severity: event.severity,
          timestamp: new Date().toISOString()
        });
      
      if (error) {
        console.error('Failed to log security event:', error);
      }
      
      // Send critical events to monitoring service
      if (event.severity === 'critical') {
        await this.sendToMonitoring(event);
      }
    } catch (error) {
      console.error('Security logging failed:', error);
    }
  }
  
  private async sendToMonitoring(event: SecurityEvent): Promise<void> {
    // In production, this would send to your monitoring service
    console.error('🚨 CRITICAL SECURITY EVENT:', event);
  }
}

export const securityLogger = SecurityLogger.getInstance();
