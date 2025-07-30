
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, AlertCircle, Info, Megaphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  created_at: string;
}

export const AnnouncementBanner = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    fetchAnnouncements();
    
    // Get dismissed announcements from localStorage
    const dismissed = localStorage.getItem('dismissedAnnouncements');
    if (dismissed) {
      setDismissedAnnouncements(JSON.parse(dismissed));
    }

    // Subscribe to new announcements
    const channel = supabase
      .channel('announcements-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'announcements',
          filter: 'published=eq.true'
        },
        () => {
          fetchAnnouncements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('published', true)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;

      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const dismissAnnouncement = (announcementId: string) => {
    const newDismissed = [...dismissedAnnouncements, announcementId];
    setDismissedAnnouncements(newDismissed);
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'security':
        return <AlertCircle className="h-4 w-4" />;
      case 'maintenance':
        return <Info className="h-4 w-4" />;
      default:
        return <Megaphone className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'default';
      case 'normal':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const visibleAnnouncements = announcements.filter(
    announcement => !dismissedAnnouncements.includes(announcement.id)
  );

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {visibleAnnouncements.map((announcement) => (
        <Card key={announcement.id} className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                {getIcon(announcement.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{announcement.title}</h4>
                    <Badge variant={getPriorityColor(announcement.priority) as any}>
                      {announcement.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {announcement.content}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(announcement.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissAnnouncement(announcement.id)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
