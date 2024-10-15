import React, { useState, useEffect } from 'react';
import Chat from './Chat';
import { MessageCircle } from 'lucide-react';

const ChatList = ({ socket }) => {
  const [chats, setChats] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState({});

  useEffect(() => {
    if (socket) {
      socket.on('new chat', (chatId) => {
        setChats((prevChats) => [...prevChats, chatId]);
        setUnreadMessages((prev) => ({ ...prev, [chatId]: 0 }));
      });

      socket.on('chat message', (msg) => {
        setUnreadMessages((prev) => ({
          ...prev,
          [msg.chatId]: (prev[msg.chatId] || 0) + 1,
        }));
      });
    }
  }, [socket]);

  const closeChat = (chatId) => {
    setChats((prevChats) => prevChats.filter((id) => id !== chatId));
    setUnreadMessages((prev) => {
      const { [chatId]: _, ...rest } = prev;
      return rest;
    });
  };

  return (
    <>
      {chats.map((chatId) => (
        <Chat
          key={chatId}
          socket={socket}
          chatId={chatId}
          setUnreadMessages={setUnreadMessages}
          onClose={() => closeChat(chatId)}
        />
      ))}
      <button
        onClick={() => {
          const newChatId = `chat_${Date.now()}`;
          socket.emit('new chat', newChatId);
          setChats((prevChats) => [...prevChats, newChatId]);
        }}
        className="fixed bottom-4 right-4 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-colors duration-200"
      >
        <MessageCircle size={24} />
      </button>
    </>
  );
};

export default ChatList;