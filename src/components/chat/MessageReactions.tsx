
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Heart, ThumbsUp, Laugh, Angry } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MessageReactionsProps {
  messageId: string;
  reactions?: { emoji: string; count: number; users: string[] }[];
}

const REACTION_EMOJIS = [
  { emoji: '👍', icon: ThumbsUp, label: 'thumbs up' },
  { emoji: '❤️', icon: Heart, label: 'heart' },
  { emoji: '😂', icon: Laugh, label: 'laugh' },
  { emoji: '😠', icon: Angry, label: 'angry' },
];

export const MessageReactions = ({ messageId, reactions = [] }: MessageReactionsProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const addReaction = async (emoji: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_message_reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          emoji
        });

      if (error) throw error;
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const removeReaction = async (emoji: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  const handleReactionClick = (emoji: string) => {
    const reaction = reactions.find(r => r.emoji === emoji);
    const hasUserReacted = reaction?.users.includes(user?.id || '');

    if (hasUserReacted) {
      removeReaction(emoji);
    } else {
      addReaction(emoji);
    }
  };

  return (
    <div className="flex items-center gap-1 mt-1">
      {reactions.map((reaction) => (
        <Button
          key={reaction.emoji}
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => handleReactionClick(reaction.emoji)}
        >
          {reaction.emoji} {reaction.count}
        </Button>
      ))}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            +
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="flex gap-1">
            {REACTION_EMOJIS.map(({ emoji, label }) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => addReaction(emoji)}
                title={label}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
