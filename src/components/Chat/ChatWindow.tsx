import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Smile, MoreVertical } from 'lucide-react';
import { chatAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import io from 'socket.io-client';

interface ChatWindowProps {
  farmerId: string;
  farmerName: string;
  onClose?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  farmerId,
  farmerName,
  onClose,
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // 🧠 Normalize message for UI compatibility
  const normalizeMessage = (msg: any) => ({
    ...msg,
    createdAt: msg.createdAt || msg.created_at || new Date().toISOString(),
  });

  useEffect(() => {
    initializeChat();

    const newSocket = io('http://localhost:3001'); // ✅ Make sure backend socket server is here
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [farmerId]);

  useEffect(() => {
    if (chatId && socket) {
      socket.emit('join-chat', chatId);

      socket.on('new-message', (message: any) => {
        const normalized = normalizeMessage(message);

        // ✅ Avoid adding duplicate message (based on ID)
        setMessages(prev => {
          const alreadyExists = prev.some(m => m.id === normalized.id);
          return alreadyExists ? prev : [...prev, normalized];
        });
      });


      return () => {
        socket.off('new-message');
      };
    }
  }, [chatId, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      const response = await chatAPI.createChat(farmerId);
      const chat = response?.data?.id ? response.data : response;
      setChatId(chat.id);

      const messagesResponse = await chatAPI.getMessages(chat.id);

      const loadedMessages = Array.isArray(messagesResponse?.messages)
        ? messagesResponse.messages
        : Array.isArray(messagesResponse)
          ? messagesResponse
          : [];

      if (!Array.isArray(loadedMessages)) {
        console.warn('⚠️ Expected array but got:', messagesResponse);
      }

      setMessages(loadedMessages.map(normalizeMessage));
    } catch (error) {
      console.error('❌ Failed to initialize chat:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    const tempMessage = {
      id: Date.now().toString(), // temporary unique ID
      chatId,
      content: newMessage,
      type: 'text',
      senderId: user?.id,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      socket?.emit('send-message', tempMessage);
      await chatAPI.sendMessage(chatId, newMessage);
    } catch (error) {
      console.error('❌ Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white rounded-lg shadow-sm border">
        <div className="text-gray-500">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-semibold text-gray-900">{farmerName}</h3>
          <p className="text-sm text-green-600">Online</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <MoreVertical className="h-5 w-5 text-gray-500" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.senderId === user?.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-900'
                  }`}
              >
                {message.type === 'text' ? (
                  <p className="text-sm">{message.content}</p>
                ) : (
                  <img
                    src={message.content}
                    alt="Shared image"
                    className="max-w-full h-auto rounded-md"
                  />
                )}
                <p className={`text-xs mt-1 ${message.senderId === user?.id ? 'text-green-100' : 'text-gray-500'
                  }`}>
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Image className="h-5 w-5 text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Smile className="h-5 w-5 text-gray-500" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
