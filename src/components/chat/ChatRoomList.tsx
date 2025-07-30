
/**
 * ChatRoomList Component
 * Purpose: Displays available chat rooms with real-time updates
 * Features: Room filtering, member counts, unread indicators
 */
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Search, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
  type: string;
  created_by: string;
  is_active: boolean;
  created_at: string;
  member_count?: number;
}

interface ChatRoomListProps {
  selectedRoomId: string | null;
  onRoomSelect: (roomId: string) => void;
}

export const ChatRoomList: React.FC<ChatRoomListProps> = ({
  selectedRoomId,
  onRoomSelect
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch available chat rooms
  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          chat_room_members(count)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include member count
      const roomsWithCount = data?.map(room => ({
        ...room,
        member_count: room.chat_room_members?.[0]?.count || 0
      })) || [];

      setRooms(roomsWithCount);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      toast({
        title: "Error",
        description: "Failed to load chat rooms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Join a chat room automatically
  const joinRoom = async (roomId: string) => {
    if (!user) return;

    try {
      // Check if already a member
      const { data: existingMember } = await supabase
        .from('chat_room_members')
        .select('id')
        .eq('room_id', roomId)
        .eq('user_id', user.id)
        .single();

      if (!existingMember) {
        // Join the room
        const { error } = await supabase
          .from('chat_room_members')
          .insert({
            room_id: roomId,
            user_id: user.id,
            role: 'member'
          });

        if (error) throw error;
      }

      onRoomSelect(roomId);
    } catch (error) {
      console.error('Error joining room:', error);
      toast({
        title: "Error",
        description: "Failed to join chat room",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchRooms();

    // Set up real-time subscription for room updates
    const roomsSubscription = supabase
      .channel('chat-rooms-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms'
        },
        () => {
          fetchRooms(); // Refresh rooms on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomsSubscription);
    };
  }, []);

  // Filter rooms based on search term
  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading chat rooms...</div>;
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Chat Rooms</CardTitle>
          <Button variant="ghost" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1 p-4 max-h-96 overflow-y-auto">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => joinRoom(room.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedRoomId === room.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {room.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{room.name}</p>
                    {room.description && (
                      <p className="text-sm opacity-70 truncate">
                        {room.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs opacity-70">
                    <Users className="h-3 w-3" />
                    <span>{room.member_count}</span>
                  </div>
                  {room.type === 'public' && (
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
