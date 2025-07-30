
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, MessageCircle, Users, Hash } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  type: string;
  created_by: string;
  is_active: boolean;
  created_at: string;
  member_count?: number;
}

const ChatPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRooms(data || []);
      
      // Auto-select first room on desktop
      if (!isMobile && data && data.length > 0) {
        setSelectedRoom(data[0]);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: "Error",
        description: "Failed to load chat rooms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    if (!user) return;
    
    const roomName = prompt('Enter room name:');
    if (!roomName) return;

    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .insert({
          name: roomName,
          type: 'public',
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as member
      await supabase
        .from('chat_room_members')
        .insert({
          room_id: data.id,
          user_id: user.id,
          role: 'admin'
        });

      setRooms(prev => [data, ...prev]);
      setSelectedRoom(data);
      
      toast({
        title: "Success",
        description: "Chat room created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create chat room",
        variant: "destructive",
      });
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <ResponsiveContainer>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </ResponsiveContainer>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ResponsiveContainer maxWidth="full">
        <div className="h-[calc(100vh-12rem)] flex flex-col lg:flex-row gap-4">
          {/* Sidebar - Chat Rooms List */}
          <div className={`${isMobile && selectedRoom ? 'hidden' : 'flex'} flex-col w-full lg:w-80 bg-card rounded-lg border`}>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Chat Rooms</h2>
                <Button onClick={createRoom} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Room
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search rooms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-2">
              {filteredRooms.length === 0 ? (
                <div className="p-4 text-center">
                  <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'No rooms found' : 'No chat rooms available'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredRooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        selectedRoom?.id === room.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Hash className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium truncate">{room.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {room.type}
                            </Badge>
                          </div>
                          {room.description && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {room.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 min-w-0">
            {selectedRoom ? (
              <div className="h-full">
                {isMobile && (
                  <div className="mb-4">
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedRoom(null)}
                      className="mb-2"
                    >
                      ← Back to Rooms
                    </Button>
                  </div>
                )}
                <ChatInterface roomId={selectedRoom.id} room={selectedRoom} />
              </div>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Welcome to Chat</h3>
                  <p className="text-muted-foreground mb-4">
                    Select a room to start chatting, or create a new one
                  </p>
                  <Button onClick={createRoom}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Room
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </ResponsiveContainer>
    </DashboardLayout>
  );
};

export default ChatPage;
