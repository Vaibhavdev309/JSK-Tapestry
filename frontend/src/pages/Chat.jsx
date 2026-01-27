import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { IoChatbubbleEllipsesSharp, IoClose } from "react-icons/io5";
import io from "socket.io-client";

const UserChat = () => {
  const { backendUrl, token } = useContext(ShopContext);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Initialize Socket.IO connection dynamically using backendUrl from context
  useEffect(() => {
    if (!backendUrl) return;
    
    // Disconnect existing socket if backendUrl changes
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // Create new socket connection with the correct backend URL
    const socket = io(backendUrl);
    socketRef.current = socket;

    socket.on("connect", () => console.log("User socket connected to:", backendUrl));
    socket.on("disconnect", () => console.log("User socket disconnected"));

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [backendUrl]);

  useEffect(() => {
    if (userId && socketRef.current) {
      socketRef.current.emit("setup", { _id: userId });
      console.log("Socket setup for user:", userId);
    }
  }, [userId]);

  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;
    
    socket.on("message received", (msg) => {
      if (!chatId || String(msg?.chatId) !== String(chatId)) return;
      setMessages((prev) => {
        const id = msg?._id;
        if (!id || prev.some((m) => String(m._id) === String(id))) return prev;
        return [...prev, msg];
      });
      if (isOpen && msg?.sender === "admin") {
        axios.post(
          `${backendUrl}/api/message/mark-read`,
          { chatId, isAdmin: false },
          { headers: { token } }
        ).then(() => setUnreadCount(0)).catch(() => {});
      }
    });
    return () => socket.off("message received");
  }, [chatId, isOpen, backendUrl, token]);

  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;
    
    socket.on("unread update", (data) => {
      if (!data?.chatId || String(data.chatId) !== String(chatId) || isOpen) return;
      if (typeof data.count === "number") {
        setUnreadCount(data.count);
      } else {
        fetchUnreadCount(chatId);
      }
    });
    return () => socket.off("unread update");
  }, [chatId, isOpen]);

  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;
    
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
    return () => {
      socket.off("typing");
      socket.off("stop typing");
    };
  }, []);

  useEffect(() => {
    const fetchChat = async () => {
      if (!token) return;
      try {
        const response = await axios.post(
          `${backendUrl}/api/chat/accesschat`,
          {},
          { headers: { token } }
        );
        if (response.data.success) {
          const fetchedChatId = response.data.chat._id;
          const fetchedUserId = response.data.chat.userId?._id;
          setChatId(fetchedChatId);
          setUserId(fetchedUserId);
          if (socketRef.current) {
            socketRef.current.emit("join chat", String(fetchedChatId));
          }
          fetchMessages(fetchedChatId);
          fetchUnreadCount(fetchedChatId);
        }
      } catch (error) {
        console.error("Chat fetch error:", error.message);
      }
    };
    fetchChat();
  }, [backendUrl, token]);

  const fetchMessages = async (chatIdParam, options = {}) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/message/${chatIdParam}`,
        { headers: { token } }
      );
      if (response.data.success) {
        setMessages(response.data.messages);
        if (socketRef.current) {
          socketRef.current.emit("join chat", String(chatIdParam));
        }
        if (options.markRead) {
          await axios.post(
            `${backendUrl}/api/message/mark-read`,
            { chatId: chatIdParam, isAdmin: false },
            { headers: { token } }
          );
          setUnreadCount(0);
        }
      }
    } catch (error) {
      console.error("Message fetch error:", error.message);
    }
  };

  const fetchUnreadCount = async (chatIdParam) => {
    const id = chatIdParam ?? chatId;
    if (!id || isOpen || !token) return;
    try {
      const response = await axios.get(
        `${backendUrl}/api/message/unread/${id}`,
        { headers: { token } }
      );
      setUnreadCount(response.data.count ?? 0);
    } catch (error) {
      console.error("Error fetching unread count:", error.message);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;
    try {
      const response = await axios.post(
        `${backendUrl}/api/message/send`,
        { chatId, content: newMessage, isAdmin: false },
        { headers: { token } }
      );
      if (response.data.success) {
        setMessages((prev) => [...prev, response.data.message]);
        setNewMessage("");
        if (socketRef.current) {
          socketRef.current.emit("new Message", response.data);
          socketRef.current.emit("stop typing", String(chatId));
        }
      }
    } catch (error) {
      console.error("Message send error:", error.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketRef.current || !chatId) return;

    if (!typingTimeout) {
      socketRef.current.emit("typing", String(chatId));
    }

    if (typingTimeout) clearTimeout(typingTimeout);

    setTypingTimeout(
      setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit("stop typing", String(chatId));
        }
        setTypingTimeout(null);
      }, 2000)
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col items-end z-50">
      <button
        onClick={() => {
          const opening = !isOpen;
          setIsOpen(opening);
          if (opening && chatId) {
            fetchMessages(chatId, { markRead: true });
          }
        }}
        className="bg-amber-600 text-white p-3 sm:p-4 rounded-full shadow-xl hover:bg-amber-700 transition-all duration-300 hover:scale-110 hover:shadow-2xl relative focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        aria-label="Open support chat"
      >
        <IoChatbubbleEllipsesSharp size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="fixed left-4 right-4 bottom-24 sm:left-auto sm:right-6 sm:w-80 w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] sm:max-w-[22rem] bg-white shadow-2xl border border-stone-200 rounded-2xl flex flex-col"
          style={{
            maxHeight: "min(70vh, calc(100vh - 120px))",
            height: "70vh",
          }}
        >
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-3 flex justify-between items-center rounded-t-2xl">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Support Chat</span>
              {token && isTyping && (
                <span className="text-xs opacity-90">Admin is typing...</span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-amber-700/80 p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Close chat"
            >
              <IoClose size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-stone-50">
            {!token ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                <p className="text-stone-600">Log in to chat with our support team.</p>
                <button
                  onClick={() => { setIsOpen(false); navigate("/login"); }}
                  className="px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                >
                  Go to Login
                </button>
              </div>
            ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg._id || msg.createdAt}
                  className={`flex ${
                    msg.sender === "admin" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl p-3 ${
                      msg.sender === "admin"
                        ? "bg-white text-stone-800 shadow-md border border-stone-100"
                        : "bg-amber-600 text-white"
                    }`}
                  >
                    <p className="text-sm break-words">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender === "admin" ? "text-stone-500" : "opacity-80"
                    }`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="h-full flex items-center justify-center">
                  <p className="text-stone-500 text-sm text-center">
                    Start a conversation with our support team
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            )}
          </div>

          {token && (
          <div className="p-4 border-t border-stone-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message... (Enter to send)"
                value={newMessage}
                onChange={typingHandler}
                onKeyDown={handleKeyDown}
                className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/40 text-sm text-stone-800 placeholder-stone-400"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="bg-amber-600 text-white p-2.5 rounded-xl hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                aria-label="Send message"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserChat;
