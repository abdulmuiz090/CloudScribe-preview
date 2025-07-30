
export interface ErrorLog {
  message: string;
  stack?: string;
  context?: Record<string, any>;
  timestamp: string;
  userId?: string;
  url?: string;
  userAgent?: string;
}

export class ErrorLogger {
  private static instance: ErrorLogger;
  
  private constructor() {}
  
  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }
  
  logError(error: Error, context?: Record<string, any>, userId?: string): void {
    const errorLog: ErrorLog = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userId,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorLog);
    }
    
    // Send to monitoring service (implement as needed)
    this.sendToMonitoring(errorLog);
  }
  
  private async sendToMonitoring(errorLog: ErrorLog): Promise<void> {
    try {
      // This could be sent to Supabase, Sentry, or another monitoring service
      console.log('Error would be sent to monitoring:', errorLog);
    } catch (monitoringError) {
      console.error('Failed to send error to monitoring:', monitoringError);
    }
  }
}

export const errorLogger = ErrorLogger.getInstance();
