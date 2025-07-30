/**
 * ChatMessages Component
 * Purpose: Displays chat messages with real-time updates
 * Features: Message pagination, typing indicators, message reactions
 */
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Image, Paperclip, Trash2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MessageReactions } from './MessageReactions';
import { FileUpload } from './FileUpload';

interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  message_type: string;
  created_at: string;
  // User profile data will be fetched separately
  user_name?: string;
  user_image?: string;
  reactions?: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
}

interface ChatMessagesProps {
  roomId: string | null;
  roomName: string;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  roomId,
  roomName
}) => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages for the current room
  const fetchMessages = async () => {
    if (!roomId) return;

    try {
      setLoading(true);
      
      // First get messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (messagesError) throw messagesError;

      // Then get user profiles for each unique user_id
      const userIds = [...new Set(messagesData?.map(m => m.user_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, full_name, profile_image_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching user profiles:', profilesError);
      }

      // Fetch reactions for all messages
      const messageIds = messagesData?.map(m => m.id) || [];
      const { data: reactions, error: reactionsError } = await supabase
        .from('chat_message_reactions')
        .select('message_id, emoji, user_id')
        .in('message_id', messageIds);

      if (reactionsError) {
        console.error('Error fetching reactions:', reactionsError);
      }

      // Group reactions by message and emoji
      const reactionsByMessage = reactions?.reduce((acc, reaction) => {
        if (!acc[reaction.message_id]) {
          acc[reaction.message_id] = {};
        }
        if (!acc[reaction.message_id][reaction.emoji]) {
          acc[reaction.message_id][reaction.emoji] = [];
        }
        acc[reaction.message_id][reaction.emoji].push(reaction.user_id);
        return acc;
      }, {} as Record<string, Record<string, string[]>>) || {};

      // Combine messages with user profile data and reactions
      const messagesWithProfiles = messagesData?.map(message => ({
        ...message,
        user_name: profilesData?.find(p => p.id === message.user_id)?.full_name || 'Unknown User',
        user_image: profilesData?.find(p => p.id === message.user_id)?.profile_image_url || undefined,
        reactions: Object.entries(reactionsByMessage[message.id] || {}).map(([emoji, users]) => ({
          emoji,
          count: users.length,
          users,
        })),
      })) || [];

      setMessages(messagesWithProfiles);
      setTimeout(scrollToBottom, 100);
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

  // Send a new message
  const sendMessage = async (content: string = newMessage, messageType: string = 'text') => {
    if (!content.trim() || !roomId || !user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          user_id: user.id,
          content: content.trim(),
          message_type: messageType
        });

      if (error) throw error;

      if (messageType === 'text') {
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  // Delete a message
  const deleteMessage = async (messageId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Message deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    }
  };

  // Handle file upload
  const handleFileUpload = async (fileUrl: string, fileName: string, fileType: string) => {
    await sendMessage(fileUrl, 'file');
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchMessages();

      // Set up real-time subscription for new messages
      const messagesSubscription = supabase
        .channel(`chat-messages-${roomId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `room_id=eq.${roomId}`
          },
          async (payload) => {
            // When new message arrives, fetch user profile and add to messages
            const newMessage = payload.new as ChatMessage;
            
            // Get user profile for the new message
            const { data: userProfile } = await supabase
              .from('user_profiles')
              .select('full_name, profile_image_url')
              .eq('id', newMessage.user_id)
              .single();

            const messageWithProfile = {
              ...newMessage,
              user_name: userProfile?.full_name || 'Unknown User',
              user_image: userProfile?.profile_image_url || undefined
            };

            setMessages(prev => [...prev, messageWithProfile]);
            setTimeout(scrollToBottom, 100);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messagesSubscription);
      };
    }
  }, [roomId]);

  if (!roomId) {
    return (
      <Card className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <h3 className="text-lg font-medium mb-2">Select a Chat Room</h3>
          <p>Choose a room from the sidebar to start chatting</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle>{roomName}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="text-center">Loading messages...</div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.user_id === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={message.user_image} />
                      <AvatarFallback>
                        {message.user_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : ''} max-w-xs lg:max-w-md group`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {isOwnMessage ? 'You' : message.user_name || 'Unknown'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                        {isOwnMessage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                            onClick={() => deleteMessage(message.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <div
                        className={`px-3 py-2 rounded-lg break-words ${
                          isOwnMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.message_type === 'file' ? (
                          <a 
                            href={message.content} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 hover:underline"
                          >
                            <Upload className="h-4 w-4" />
                            View File
                          </a>
                        ) : (
                          message.content
                        )}
                      </div>
                      
                      <MessageReactions 
                        messageId={message.id} 
                        reactions={message.reactions} 
                      />
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
        
        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="mb-2">
            <FileUpload 
              onFileUploaded={handleFileUpload}
              disabled={uploadingFile}
            />
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={() => sendMessage()} size="icon" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
