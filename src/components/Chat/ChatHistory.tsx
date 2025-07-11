import React, { useState, useEffect } from 'react';
import { MessageCircle, Search, User, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { chatAPI } from '../../services/api';

interface ChatHistoryProps {
  onSelectChat: (farmerId: string, farmerName: string) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ onSelectChat }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      // For now, we'll simulate chat history
      // In a real app, you'd have an API endpoint to get user's chat history
      const mockChats = [
        {
          id: '1',
          farmerId: 'farmer1',
          farmerName: 'Green Acres Farm',
          lastMessage: 'Thank you for your order! It will be delivered tomorrow.',
          lastMessageTime: '2024-01-15T14:30:00Z',
          unreadCount: 2,
          avatar: null
        },
        {
          id: '2',
          farmerId: 'farmer2',
          farmerName: 'Sunny Dale Organic',
          lastMessage: 'The tomatoes are fresh and ready for pickup.',
          lastMessageTime: '2024-01-14T10:15:00Z',
          unreadCount: 0,
          avatar: null
        },
        {
          id: '3',
          farmerId: 'farmer3',
          farmerName: 'Valley Fresh Produce',
          lastMessage: 'Hi! Are the apples still available?',
          lastMessageTime: '2024-01-13T16:45:00Z',
          unreadCount: 1,
          avatar: null
        }
      ];

      setChats(mockChats);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading chat history...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <MessageCircle className="h-5 w-5" />
          <span>Messages</span>
        </h2>
        
        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.farmerId, chat.farmerName)}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {chat.avatar ? (
                    <img
                      src={chat.avatar}
                      alt={chat.farmerName}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {chat.farmerName}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(chat.lastMessageTime)}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span className="bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            {searchQuery ? (
              <div>
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No conversations found matching "{searchQuery}"</p>
              </div>
            ) : (
              <div>
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No conversations yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Start chatting with farmers by clicking the chat button on any product
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;