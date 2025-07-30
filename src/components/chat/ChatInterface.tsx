
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Send, Smile, Paperclip, MoreVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessage {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  message_type: string;
  metadata?: any;
  user_name?: string;
  user_avatar?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  type: string;
}

interface ChatInterfaceProps {
  roomId: string;
  room: ChatRoom;
}

export const ChatInterface = ({ roomId, room }: ChatInterfaceProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userProfiles, setUserProfiles] = useState<Record<string, { name: string; avatar?: string }>>({});
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUserProfile = async (userId: string) => {
    if (userProfiles[userId]) return userProfiles[userId];

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('full_name, profile_image_url')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const profile = {
        name: data.full_name || 'Unknown User',
        avatar: data.profile_image_url
      };

      setUserProfiles(prev => ({ ...prev, [userId]: profile }));
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { name: 'Unknown User' };
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      const messagesWithProfiles = await Promise.all(
        (data || []).map(async (msg) => {
          const profile = await fetchUserProfile(msg.user_id);
          return {
            ...msg,
            user_name: profile.name,
            user_avatar: profile.avatar
          };
        })
      );

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const newMsg = payload.new as ChatMessage;
          const profile = await fetchUserProfile(newMsg.user_id);
          
          setMessages(prev => [...prev, {
            ...newMsg,
            user_name: profile.name,
            user_avatar: profile.avatar
          }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          user_id: user.id,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <Card className="w-full h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="py-3 px-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{room.name}</CardTitle>
            {room.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {room.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {room.type}
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.user_id === user?.id ? 'flex-row-reverse' : ''
                  }`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={message.user_avatar} />
                    <AvatarFallback className="text-xs">
                      {message.user_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 max-w-xs sm:max-w-md ${
                    message.user_id === user?.id ? 'text-right' : ''
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {message.user_name || 'Unknown User'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className={`inline-block p-3 rounded-lg text-sm ${
                      message.user_id === user?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      {message.content}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0">
              <Paperclip className="h-4 w-4" />
            </Button>
            <div className="flex-1 relative">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sending}
                className="pr-10"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              size="icon"
              className="h-10 w-10 flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
