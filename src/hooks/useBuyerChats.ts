import { useState, useEffect, useCallback } from 'react';

interface ChatPreview {
  id: string;
  farmerId: string;
  farmerName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  avatar?: string | null;
}

export const useBuyerChats = (buyerId: string | null) => {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const loadChats = useCallback(async () => {
    if (!buyerId) {
      setChats([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/chat/user/${buyerId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });


      if (!res.ok) throw new Error('Failed to fetch chats');

      const data: ChatPreview[] = await res.json();
      setChats(data);
    } catch (err) {
      console.error('❌ Failed to load chats:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [buyerId]);

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 10000);
    return () => clearInterval(interval);
  }, [loadChats]);

  return {
    chats,
    loading,
    error,
    refresh: loadChats
  };
};
