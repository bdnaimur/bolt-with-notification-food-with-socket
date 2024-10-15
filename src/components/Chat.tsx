import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Minimize2, Maximize2 } from 'lucide-react';

const Chat = ({ socket, chatId, setUnreadMessages, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);

  useEffect(() => {
    if (socket) {
      socket.on(`chat message ${chatId}`, (msg) => {
        setMessages((prevMessages) => [...prevMessages, msg]);
        setUnreadMessages((prev) => ({ ...prev, [chatId]: 0 }));
      });
    }
  }, [socket, chatId, setUnreadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage && socket) {
      const message = { text: inputMessage, sender: 'user', chatId };
      socket.emit('chat message', message);
      setMessages((prevMessages) => [...prevMessages, message]);
      setInputMessage('');
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  useEffect(() => {
    const chatElement = chatRef.current;
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    const dragMouseDown = (e) => {
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    };

    const elementDrag = (e) => {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      chatElement.style.top = (chatElement.offsetTop - pos2) + "px";
      chatElement.style.left = (chatElement.offsetLeft - pos1) + "px";
    };

    const closeDragElement = () => {
      document.onmouseup = null;
      document.onmousemove = null;
    };

    const header = chatElement.querySelector('.chat-header');
    if (header) {
      header.onmousedown = dragMouseDown;
    }

    return () => {
      if (header) {
        header.onmousedown = null;
      }
    };
  }, []);

  return (
    <div ref={chatRef} className="bg-white rounded-lg shadow-md p-4 flex flex-col absolute" style={{ width: '300px', height: isMinimized ? '40px' : '500px', resize: 'both', overflow: 'auto' }}>
      <div className="chat-header flex justify-between items-center mb-4 cursor-move">
        <h2 className="text-xl font-bold">Chat with Restaurant Owner</h2>
        <div className="flex space-x-2">
          <button onClick={toggleMinimize} className="text-gray-500 hover:text-gray-700">
            {isMinimized ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
          </button>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
      </div>
      {!isMinimized && (
        <>
          <div className="flex-grow overflow-y-auto mb-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="flex items-center">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              className="bg-orange-500 text-white px-4 py-2 rounded-r-lg hover:bg-orange-600 transition-colors duration-200"
            >
              <Send size={20} />
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default Chat;