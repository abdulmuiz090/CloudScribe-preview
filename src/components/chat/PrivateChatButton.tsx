
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface PrivateChatButtonProps {
  targetUserId: string;
  targetUserName: string;
  className?: string;
}

export const PrivateChatButton = ({ 
  targetUserId, 
  targetUserName, 
  className = '' 
}: PrivateChatButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  const [loading, setLoading] = useState(false);

  const createOrFindPrivateChat = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.id === targetUserId) {
      return; // Can't chat with yourself
    }

    setLoading(true);
    try {
      // Check if a private chat already exists between these two users
      const { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('type', 'private')
        .or(`name.eq.${user.id}_${targetUserId},name.eq.${targetUserId}_${user.id}`)
        .single();

      if (existingRoom) {
        // Navigate to existing chat room
        navigate(`/dashboard/chat?room=${existingRoom.id}`);
        return;
      }

      // Create new private chat room
      const roomName = `${user.id}_${targetUserId}`;
      const { data: newRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          name: roomName,
          description: `Private chat with ${targetUserName}`,
          type: 'private',
          created_by: user.id,
          is_active: true
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add both users as members
      const { error: memberError } = await supabase
        .from('chat_room_members')
        .insert([
          {
            room_id: newRoom.id,
            user_id: user.id,
            role: 'member'
          },
          {
            room_id: newRoom.id,
            user_id: targetUserId,
            role: 'member'
          }
        ]);

      if (memberError) throw memberError;

      // Navigate to the new chat room
      navigate(`/dashboard/chat?room=${newRoom.id}`);
      
    } catch (error) {
      handleError(error, { title: 'Failed to start chat' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={createOrFindPrivateChat}
      disabled={loading || !user || user.id === targetUserId}
      className={className}
      variant="outline"
    >
      {loading ? (
        <LoadingSpinner size="sm" className="mr-2" />
      ) : (
        <MessageCircle className="h-4 w-4 mr-2" />
      )}
      Get in Touch
    </Button>
  );
};
