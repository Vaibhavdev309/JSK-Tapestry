import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import io from "socket.io-client";
import { useAdminContext } from "../context/AdminContext";

const ENDPOINT = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
const socket = io(ENDPOINT);

const Chat = ({ token, isAdmin }) => {
  const { refreshCounts } = useAdminContext();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    socket.emit("setup", { _id: "admin" });
    socket.on("connect", () => console.log("Admin socket connected"));
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchChats();
  }, [token]);

  useEffect(() => {
    socket.on("message received", (msg) => {
      const msgChatId = msg?.chatId;
      if (selectedChat && String(selectedChat._id) === String(msgChatId)) {
        setMessages((prev) => {
          const id = msg?._id;
          if (!id || prev.some((m) => String(m._id) === String(id))) return prev;
          return [...prev, msg];
        });
        if (msg?.sender === "user") {
          axios.post(
            `${backendUrl}/api/message/mark-read`,
            { chatId: msgChatId, isAdmin: true },
            { headers: { token } }
          ).then(() => {
            setUnreadCounts((prev) => ({ ...prev, [String(msgChatId)]: 0 }));
          }).catch(() => {});
        }
      } else if (msgChatId) {
        fetchUnreadCount(msgChatId);
      }
    });
    return () => socket.off("message received");
  }, [selectedChat, token]);

  useEffect(() => {
    socket.on("unread update", (data) => {
      const dChatId = data?.chatId;
      if (!dChatId) return;
      if (selectedChat && String(selectedChat._id) === String(dChatId)) return;
      const cid = String(dChatId);
      if (typeof data.count === "number") {
        setUnreadCounts((prev) => ({ ...prev, [cid]: data.count }));
      } else {
        setUnreadCounts((prev) => ({ ...prev, [cid]: (prev[cid] ?? 0) + 1 }));
        fetchUnreadCount(dChatId);
      }
    });
    return () => socket.off("unread update");
  }, [selectedChat]);

  useEffect(() => {
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
    return () => {
      socket.off("typing");
      socket.off("stop typing");
    };
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChats = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/chat/fetchchats", {
        headers: { token },
      });
      if (response.data.success) {
        setChats(response.data.chats);
        const counts = {};
        for (const chat of response.data.chats) {
          const cid = String(chat._id);
          const unreadResponse = await axios.get(
            `${backendUrl}/api/message/unread/${cid}`,
            { headers: { token } }
          );
          counts[cid] = unreadResponse.data.count ?? 0;
        }
        setUnreadCounts(counts);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await axios.get(`${backendUrl}/api/message/${chatId}`, {
        headers: { token },
      });
      if (response.data.success) {
        setMessages(response.data.messages);
        socket.emit("join chat", String(chatId));
        await axios.post(
          `${backendUrl}/api/message/mark-read`,
          { chatId, isAdmin: true },
          { headers: { token } }
        );
        setUnreadCounts((prev) => ({ ...prev, [String(chatId)]: 0 }));
        // Refresh counts when messages are marked as read
        if (refreshCounts) {
          refreshCounts();
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const fetchUnreadCount = async (chatId) => {
    if (selectedChat && String(selectedChat._id) === String(chatId)) return; // Skip if viewing this chat
    try {
      const cid = String(chatId);
      const response = await axios.get(
        `${backendUrl}/api/message/unread/${cid}`,
        { headers: { token } }
      );
      setUnreadCounts((prev) => ({
        ...prev,
        [cid]: response.data.count ?? 0,
      }));
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const handleChatClick = (chat) => {
    setSelectedChat(chat);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(
        backendUrl + `/api/chat/searchuser?search=${searchQuery}`,
        { headers: { token } }
      );
      if (response.data.success) {
        setSearchResults(response.data.users);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const startNewChat = async (userId) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/chat/accesschat",
        { userId },
        { headers: { token } }
      );
      if (response.data.success) {
        setSelectedChat(response.data.chat);
        fetchChats();
      }
    } catch (error) {
      console.error("Error starting new chat:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const response = await axios.post(
        backendUrl + "/api/message/send",
        {
          chatId: selectedChat._id,
          content: newMessage,
          isAdmin: true,
        },
        { headers: { token } }
      );
      if (response.data.success) {
        setMessages((prev) => [...prev, response.data.message]);
        setNewMessage("");
        socket.emit("new Message", response.data);
        socket.emit("stop typing", String(selectedChat._id));
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !selectedChat?._id) return;

    if (!typingTimeout) {
      socket.emit("typing", String(selectedChat._id));
    }

    if (typingTimeout) clearTimeout(typingTimeout);

    setTypingTimeout(
      setTimeout(() => {
        socket.emit("stop typing", String(selectedChat._id));
        setTypingTimeout(null);
      }, 2000)
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getInitial = (name) => (name || "U").charAt(0).toUpperCase();

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] sm:h-[calc(100vh-7rem)] min-h-[400px] sm:min-h-[420px] bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Sidebar - Chat list */}
      <div className={`w-full lg:w-80 xl:w-96 shrink-0 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col bg-gray-50/50 ${selectedChat ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-3 sm:p-4 border-b border-gray-200 bg-white">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Messages</h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
            <button
              type="submit"
              className="px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 transition shrink-0"
            >
              Search
            </button>
          </form>
        </div>

        {searchResults.length > 0 && (
          <div className="p-2 sm:p-3 border-b border-gray-200 bg-white">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 sm:mb-2">New conversation</p>
            <div className="space-y-1 max-h-32 sm:max-h-40 overflow-y-auto">
              {searchResults.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => { startNewChat(user._id); setSearchQuery(""); setSearchResults([]); }}
                  className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-gray-100 transition text-left"
                >
                  <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs sm:text-sm font-medium shrink-0">
                    {getInitial(user.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{user.name || "Unknown"}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {chats.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {chats.map((chat) => {
                const isSelected = selectedChat && String(selectedChat._id) === String(chat._id);
                const unread = (unreadCounts[String(chat._id)] ?? 0) > 0;
                return (
                  <button
                    key={chat._id}
                    type="button"
                    onClick={() => handleChatClick(chat)}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 text-left transition ${
                      isSelected ? "bg-blue-50 border-l-2 border-l-blue-600" : "hover:bg-gray-100"
                    }`}
                  >
                    <span className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold shrink-0 ${
                      unread ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}>
                      {getInitial(chat.userId?.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{chat.userId?.name || "Unknown"}</p>
                      <p className="text-xs text-gray-500 truncate">{chat.userId?.email || "—"}</p>
                    </div>
                    {unread && (
                      <span className="bg-red-500 text-white text-xs font-medium min-w-[1.25rem] h-4 sm:h-5 px-1 sm:px-1.5 rounded-full flex items-center justify-center shrink-0">
                        {unreadCounts[String(chat._id)]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No conversations yet</p>
              <p className="text-xs text-gray-400 mt-1">Search for a user to start a chat</p>
            </div>
          )}
        </div>
      </div>

      {/* Main - Conversation */}
      <div className={`flex-1 flex flex-col min-w-0 bg-white ${selectedChat ? 'flex' : 'hidden lg:flex'}`}>
        {selectedChat ? (
          <>
            {/* Chat header */}
            <div className="px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 border-b border-gray-200 flex items-center gap-2 sm:gap-3 shrink-0">
              {isMobile && (
                <button
                  onClick={() => setSelectedChat(null)}
                  className="p-1.5 -ml-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  aria-label="Back to chat list"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
              )}
              <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs sm:text-sm font-semibold shrink-0">
                {getInitial(selectedChat.userId?.name)}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{selectedChat.userId?.name || "Unknown"}</h3>
                <p className="text-xs text-gray-500 truncate">{selectedChat.userId?.email}</p>
              </div>
              {isTyping && (
                <span className="text-xs text-gray-500 italic animate-pulse hidden sm:inline">typing...</span>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 bg-gray-50/60">
              {messages.length > 0 ? (
                <div className="space-y-2 sm:space-y-3 max-w-2xl mx-auto">
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] md:max-w-md px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl ${
                          msg.sender === "admin"
                            ? "bg-blue-600 text-white rounded-br-md"
                            : "bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm"
                        }`}
                      >
                        <p className="text-xs sm:text-sm break-words">{msg.content}</p>
                        <p className={`text-[10px] sm:text-xs mt-1 ${msg.sender === "admin" ? "text-blue-100" : "text-gray-400"}`}>
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-8 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3 sm:mb-4">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base text-gray-500 font-medium">No messages yet</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">Send a message to start the conversation</p>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 sm:p-4 lg:p-6 border-t border-gray-200 bg-white shrink-0">
              <div className="max-w-2xl mx-auto flex gap-2 sm:gap-3">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={typingHandler}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs sm:text-sm transition"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-3 sm:px-5 py-2 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Send</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3 sm:mb-4">
              <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-700">Select a conversation</h3>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xs">Choose a chat from the list or search for a user to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
