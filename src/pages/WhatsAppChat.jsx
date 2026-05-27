import React, { useState, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';
import { 
  Search, 
  Send, 
  Paperclip, 
  Smile, 
  MessageSquare, 
  MoreVertical, 
  Check, 
  CheckCheck, 
  Lock, 
  X, 
  User, 
  AlertCircle,
  Loader2,
  RefreshCw,
  MessageCircle
} from 'lucide-react';
import { encryptData, decryptData } from '../utils/encryption';

/**
 * Utility to calculate exact relative time break-downs, e.g., "51 minutes 7 seconds ago"
 */
const formatDetailedRelativeTime = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const past = new Date(dateString);
  if (isNaN(past.getTime())) return '';
  const diffMs = now.getTime() - past.getTime();
  if (diffMs < 0) return 'Just now';

  let seconds = Math.floor(diffMs / 1000);
  let minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;
  let hours = Math.floor(minutes / 60);
  minutes = minutes % 60;
  let days = Math.floor(hours / 24);
  hours = hours % 24;
  let weeks = Math.floor(days / 7);
  days = days % 7;

  const parts = [];
  if (weeks > 0) parts.push(`${weeks} week${weeks > 1 ? 's' : ''}`);
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} second${seconds > 1 ? 's' : ''}`);

  // Only take the first two largest units to avoid extremely long strings
  const formattedParts = parts.slice(0, 2);
  return formattedParts.join(' ') + ' ago';
};

/**
 * Utility to format message dates exactly like the design, e.g., "Wednesday 8th April 2026 11:08:12 am"
 */
const formatMessageDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayName = days[date.getDay()];
  const dayOfMonth = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  
  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  
  return `${dayName} ${getOrdinal(dayOfMonth)} ${monthName} ${year} ${hours}:${minutes}:${seconds} ${ampm}`;
};

export default function WhatsAppChat() {
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);

  const selectedChatRef = useRef(selectedChat);
  const searchQueryRef = useRef(searchQuery);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  // Real-time integration via Pusher
  useEffect(() => {
    const vendorUid = localStorage.getItem('vendor_uid') || localStorage.getItem('vendor_id');
    if (!vendorUid) return;

    const fetchChatsSilent = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/list`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            data: encryptData({
              page: '1',
              limit: '15',
              search: searchQueryRef.current || ''
            })
          })
        });

        const encryptedResponse = await response.json();
        let data = encryptedResponse;
        if (encryptedResponse && encryptedResponse.payload) {
          data = decryptData(encryptedResponse.payload);
        }

        if (response.ok && data && data.success) {
          const chatsList = data.data?.chats || [];
          setChats(prev => {
            const newChats = chatsList.filter(c => c).map(c => {
              // Ensure we don't accidentally set unread_count > 0 for the currently open chat
              const isActive = selectedChatRef.current && String(selectedChatRef.current._id) === String(c._id);
              if (isActive) {
                return { ...c, unread_count: 0 };
              }
              return c;
            });
            const existingIds = new Set(newChats.map(c => c._id));
            const remainingOldChats = prev.filter(c => c && !existingIds.has(c._id));
            
            return [...newChats, ...remainingOldChats].sort((a, b) => 
              new Date(b.last_message_time || 0) - new Date(a.last_message_time || 0)
            );
          });
        }
      } catch (err) {
        console.error('Error in silent chat fetch:', err);
      }
    };

    const pusher = new Pusher('47cad4071c70ec772da2', {
      cluster: 'ap2',
      forceTLS: true
    });

    const channelName = `whatsappChat${vendorUid}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('whatsappChat', (data) => {
      console.log("PUSHER EVENT RECEIVED", data);

      if (!data) return;

      // Always fetch chats silently to guarantee the sidebar snippet and unread counts 
      // are perfectly in sync with the backend, especially since the payload lacks the message text.
      let shouldFetchChats = true;

      setChats(prev => {
        let isFound = false;

        const updatedChats = prev.map(chat => {
          if (!chat) return chat;

          const matched =
            String(chat._uid || '') === String(data.contactUid || '');

          if (!matched) return chat;

          isFound = true;
          const isCurrentChat =
            selectedChatRef.current &&
            String(selectedChatRef.current._uid || '') === String(data.contactUid || '');

          return {
            ...chat,
            unread_count:
              isCurrentChat
                ? 0
                : data.isNewIncomingMessage
                  ? Number(chat.unread_count || 0) + 1
                  : Number(chat.unread_count || 0),
            last_message_time:
              data.formatted_last_message_time ||
              chat.last_message_time ||
              new Date().toISOString()
          };
        });

        if (!isFound && data.contactUid) {
          shouldFetchChats = true;
        }

        return [...updatedChats].sort((a, b) =>
          new Date(b.last_message_time || 0) -
          new Date(a.last_message_time || 0)
        );
      });

      if (shouldFetchChats) {
        // Use a 1000ms delay to prevent race conditions where the backend database
        // hasn't fully committed the new message before we fetch it.
        setTimeout(() => {
          fetchChatsSilent();
        }, 1000);
      }

      const isCurrentChat =
        selectedChatRef.current &&
        String(selectedChatRef.current._uid) === String(data.contactUid);

      // Refresh currently opened chat only
      if (isCurrentChat) {
        setTimeout(() => {
          fetchHistorySilent(selectedChatRef.current);
        }, 1000);
      }

      // Message status update
      if (data.message_status && data.lastMessageUid) {
        setMessages(prev =>
          prev.map(m => {
            const msgUid = String(m._uid || m.wamid || m.logId);
            if (msgUid === String(data.lastMessageUid)) {
              return {
                ...m,
                status: data.message_status
              };
            }
            return m;
          })
        );
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, []);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [showWarningBanner, setShowWarningBanner] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingMoreHistory, setLoadingMoreHistory] = useState(false);

  const messagesEndRef = useRef(null);
  const dropdownRef = useRef(null);
  const chatBodyRef = useRef(null);
  const isLoadingHistoryRef = useRef(false);

  // Debounced search trigger (handles both initial load and query changes)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchChats(1, searchQuery);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Poll active chat history every 5 seconds silently
  useEffect(() => {
    if (!selectedChat) return;

    // Scroll to bottom on chat change
    scrollToBottom();

    const interval = setInterval(() => {
  fetchHistorySilent(selectedChat);
}, 15000);

    return () => clearInterval(interval);
  }, [selectedChat]);

  // Click outside dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatBodyRef.current) {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
      }
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, 150);
  };

  // Fetch Chats API
  const fetchChats = async (pageNumber = 1, searchVal = '', append = false) => {
    try {
      if (pageNumber === 1 && !append) {
        setLoadingChats(true);
      }
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          data: encryptData({
            page: String(pageNumber),
            limit: '15',
            search: searchVal
          })
        })
      });

      const encryptedResponse = await response.json();
      let data = encryptedResponse;
      if (encryptedResponse && encryptedResponse.payload) {
        data = decryptData(encryptedResponse.payload);
      }

      if (response.ok && data && data.success) {
        const chatsList = data.data?.chats || [];
        if (append) {
          setChats(prev => {
            const existingIds = new Set(prev.filter(c => c).map(c => c._id));
            const filtered = chatsList.filter(c => c && !existingIds.has(c._id));
            return [...prev, ...filtered];
          });
        } else {
          setChats(chatsList.filter(c => c));
        }
        if (data.data?.pagination) {
          setPage(Number(data.data.pagination.page));
          setTotalPages(Number(data.data.pagination.totalPages));
        }
      } else {
        console.error('Failed to fetch chats:', data?.message);
        if (!append) setChats([]);
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
      if (!append) setChats([]);
    } finally {
      setLoadingChats(false);
    }
  };

  // Fetch History API
  const fetchHistory = async (chatItem, pageNumber = 1, append = false) => {
    if (!chatItem || isLoadingHistoryRef.current) return;
    try {
      isLoadingHistoryRef.current = true;
      if (append) {
        setLoadingMoreHistory(true);
      } else {
        setLoadingHistory(true);
        setHistoryPage(1);
        setHistoryTotalPages(1);
      }
      
      const scrollHeightBefore = chatBodyRef.current?.scrollHeight || 0;

      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          data: encryptData({
            page: String(pageNumber),
            limit: '20',
            contactId: Number(chatItem._id)
          })
        })
      });

      const encryptedResponse = await response.json();
      let data = encryptedResponse;
      if (encryptedResponse && encryptedResponse.payload) {
        data = decryptData(encryptedResponse.payload);
      }

      if (response.ok && data && data.success) {
        const historyList = data.data?.messages || data.data?.chats || data.data || [];
        if (append) {
          // Prepend older messages
          setMessages(prev => [...historyList, ...prev]);
          
          // Maintain scroll position after DOM re-renders
          setTimeout(() => {
            if (chatBodyRef.current) {
              const scrollHeightAfter = chatBodyRef.current.scrollHeight;
              chatBodyRef.current.scrollTop = scrollHeightAfter - scrollHeightBefore;
            }
          }, 0);
        } else {
          setMessages(historyList);
          scrollToBottom();
        }
        
        if (data.data?.pagination) {
          setHistoryPage(Number(data.data.pagination.page));
          setHistoryTotalPages(Number(data.data.pagination.totalPages));
        } else if (data.pagination) {
          setHistoryPage(Number(data.pagination.page));
          setHistoryTotalPages(Number(data.pagination.totalPages));
        } else {
          // Fallback if pagination metadata is missing from response
          const limitVal = 20;
          const returnedCount = historyList.length;
          setHistoryPage(pageNumber);
          if (returnedCount >= limitVal) {
            setHistoryTotalPages(pageNumber + 1);
          } else {
            setHistoryTotalPages(pageNumber);
          }
        }
      } else {
        console.error('Failed to fetch history:', data?.message);
        if (!append) setMessages([]);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      if (!append) setMessages([]);
    } finally {
      isLoadingHistoryRef.current = false;
      if (append) {
        setLoadingMoreHistory(false);
      } else {
        setLoadingHistory(false);
      }
    }
  };

  // Silent history fetch for polling
  const fetchHistorySilent = async (chatItem) => {
    if (!chatItem) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          data: encryptData({
            page: '1',
            limit: '20',
            contactId: Number(chatItem._id)
          })
        })
      });

      const encryptedResponse = await response.json();
      let data = encryptedResponse;
      if (encryptedResponse && encryptedResponse.payload) {
        data = decryptData(encryptedResponse.payload);
      }

      if (response.ok && data && data.success) {
        const historyList = data.data?.messages || data.data?.chats || data.data || [];

        if (historyList.length > 0) {
  const latestMessage = historyList[historyList.length - 1];

  setChats(prev =>
    prev.map(c => {
      if (c && c._id === chatItem._id) {
        return {
          ...c,
          last_message:
            latestMessage.message ||
            latestMessage.text ||
            c.last_message,
          last_message_time:
            latestMessage.created_at ||
            c.last_message_time
        };
      }
      return c;
    })
  );
}

        if (historyList.length > 0) {
          const latestPolledMsg = historyList[historyList.length - 1];
          
          setMessages(prev => {
            if (prev.length === 0) {
              return historyList;
            }
            
            const latestCurrentMsg = prev[prev.length - 1];
            const currentId = latestCurrentMsg._id || latestCurrentMsg.logId || latestCurrentMsg.wamid;
            const polledId = latestPolledMsg._id || latestPolledMsg.logId || latestPolledMsg.wamid;
            const currentText = latestCurrentMsg.message || latestCurrentMsg.text;
            const polledText = latestPolledMsg.message || latestPolledMsg.text;
            
            const isSame = (currentId && polledId && currentId === polledId) || 
                           (!currentId && !polledId && currentText === polledText);
            
            if (!isSame) {
              const indexOfCurrent = historyList.findIndex(m => {
                const mid = m._id || m.logId || m.wamid;
                const mtext = m.message || m.text;
                return (mid && currentId && mid === currentId) || (mtext === currentText);
              });
              
              let newMessages = [];
              if (indexOfCurrent !== -1) {
                newMessages = historyList.slice(indexOfCurrent + 1);
              } else {
                newMessages = [latestPolledMsg];
              }
              
              if (newMessages.length > 0) {
  setTimeout(() => {
    scrollToBottom();
  }, 100);

  const existingIds = new Set(
  prev.map(m => m._id || m.logId || m.wamid)
);

const filteredNewMessages = newMessages.filter(m => {
  const id = m._id || m.logId || m.wamid;
  return !existingIds.has(id);
});

return [...prev, ...filteredNewMessages];
}
            }
            return prev;
          });
        }
      }
    } catch (err) {
      console.error('Error polling history:', err);
    }
  };

  // Automatic load older messages on scroll top
  const handleChatScroll = (e) => {
    const element = e.target;
    if (element.scrollTop < 30 && historyPage < historyTotalPages && !loadingHistory && !loadingMoreHistory && !isLoadingHistoryRef.current) {
      fetchHistory(selectedChat, historyPage + 1, true);
    }
  };

  // Send Message API
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedChat || sending) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          data: encryptData({
            message: messageText,
            contactId: Number(selectedChat._id)
          })
        })
      });

      const encryptedResponse = await response.json();
      let data = encryptedResponse;
      if (encryptedResponse && encryptedResponse.payload) {
        data = decryptData(encryptedResponse.payload);
      }

      if (response.ok && data && data.success) {
        const newMsg = data.data || {
          message: messageText,
          created_at: new Date().toISOString(),
          is_incoming_message: false,
          status: 'accepted'
        };
        
        // Append sent message to local view immediately
        setMessages(prev => [...prev, newMsg]);
        scrollToBottom();

        setTimeout(() => {
  fetchHistorySilent(selectedChat);
}, 1000);

        // Update the chats list last message snippet
        setChats(prev => prev.map(c => {
          if (c && c._id === selectedChat._id) {
            return {
              ...c,
              last_message: messageText,
              last_message_time:
  data.formatted_last_message_time ||
  new Date().toISOString(),
              unread_count: 0
            };
          }
          return c;
        }));
      } else {
        alert(data?.message || 'Error sending message. Please try again.');
        setInputText(messageText);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setInputText(messageText);
    } finally {
      setSending(false);
    }
  };

  // Search Handler with button or simple enter press
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    fetchChats(1, searchQuery);
  };

  // Load More Chats pagination
  const handleLoadMoreChats = () => {
    if (page < totalPages) {
      fetchChats(page + 1, searchQuery, true);
    }
  };

  // Get Initials for Avatar
  const getInitials = (chatItem) => {
    if (!chatItem) return '~';
    if (chatItem.first_name) {
      const first = chatItem.first_name.trim();
      const last = (chatItem.last_name || '').trim();
      
      if (first.startsWith('~')) {
        return '~';
      }
      
      const char1 = first.charAt(0).toUpperCase();
      const char2 = last ? last.charAt(0).toUpperCase() : '';
      return char1 + char2;
    }
    
    return '~';
  };

  // Determine message direction
  const isMessageIncoming = (msg) => {
    if (!msg) return false;
    if (msg.is_incoming_message === true || msg.is_incoming_message === 1) return true;
    if (msg.direction === 'incoming') return true;
    if (msg.sender === 'customer') return true;
    if (msg.from_me === false) return true;
    return false;
  };

  // Local filter for instant query feedback
  const filteredChats = chats.filter(chat => {
    if (!chat) return false;
    const name = `${chat.first_name || ''} ${chat.last_name || ''}`.toLowerCase();
    const phone = String(chat.phone_number || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || phone.includes(query);
  });

  return (
    <div style={{
      height: 'calc(100vh - 100px)',
      display: 'flex',
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
    }}>
      
      {/* LEFT COLUMN: CHAT LIST PANEL */}
      <div style={{
        width: '380px',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        flexShrink: 0
      }}>
        {/* Search header */}
        <div style={{
          padding: '1.25rem 1rem',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{
              position: 'relative',
              flex: 1
            }}>
              <Search size={18} style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name or phone..."
                style={{
                  width: '100%',
                  padding: '0.5rem 1rem 0.5rem 2.5rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  outline: 'none',
                  backgroundColor: '#f8fafc',
                  transition: 'border-color 0.2s'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    fetchChats(1, searchQuery);
                  }
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{
              width: 'auto',
              padding: '0.5rem 1rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '8px'
            }}>
              Search
            </button>
          </form>
        </div>

        {/* Chats scroll container */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.5rem'
        }} className="custom-scroll">
          {loadingChats && filteredChats.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem 1rem',
              color: '#64748b'
            }}>
              <Loader2 size={32} className="animate-spin" style={{ color: 'var(--wa-green)', marginBottom: '0.75rem' }} />
              <span style={{ fontSize: '0.9rem' }}>Loading chats...</span>
            </div>
          ) : filteredChats.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              color: '#94a3b8',
              fontSize: '0.9rem'
            }}>
              <MessageSquare size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              No chats found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {filteredChats.map((chat) => {
                if (!chat) return null;
                const isSelected = selectedChat && selectedChat._id === chat._id;
                const initials = getInitials(chat);
                const nameDisplay = chat.first_name || chat.last_name 
                  ? `${chat.first_name || ''} ${chat.last_name || ''}`.trim() 
                  : `+${chat.phone_number || ''}`;

                return (
                  <div
                    key={chat._id}
                    onClick={() => {
                      setSelectedChat(chat);
                      fetchHistory(chat);
                      // Clear unread count locally when chat is clicked/opened
                      setChats(prev => prev.map(c => {
                        if (c && c._id === chat._id) {
                          return { ...c, unread_count: 0 };
                        }
                        return c;
                      }));
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1rem 0.75rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'rgba(37, 211, 102, 0.08)' : 'transparent',
                      borderLeft: isSelected ? '4px solid var(--wa-green)' : '4px solid transparent',
                      transition: 'all 0.2s ease',
                      borderBottom: '1px solid #f8fafc'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: '#20c997',
                      color: 'white',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      flexShrink: 0,
                      boxShadow: '0 2px 4px rgba(32, 201, 151, 0.2)'
                    }}>
                      {initials}
                    </div>

                    {/* Chat details */}
                    <div style={{
                      marginLeft: '0.75rem',
                      flex: 1,
                      minWidth: 0
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: '0.25rem'
                      }}>
                        <h4 style={{
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: '#1e293b',
                          margin: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          flex: 1
                        }}>
                          {nameDisplay}
                        </h4>
                        
                        {/* Time */}
                        <span style={{
                          fontSize: '0.7rem',
                          color: '#94a3b8',
                          marginLeft: '0.5rem',
                          flexShrink: 0
                        }}>
                          {chat.last_message_time ? formatDetailedRelativeTime(chat.last_message_time) : formatDetailedRelativeTime(chat.created_at)}
                        </span>
                      </div>

                      {/* Phone / Subtitle */}
                      {chat.first_name && (
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#64748b',
                          marginBottom: '0.25rem'
                        }}>
                          +{chat.phone_number}
                        </div>
                      )}

                      {/* Preview */}
                      <p style={{
                        fontSize: '0.8rem',
                        color: chat.unread_count > 0 ? '#1e293b' : '#64748b',
                        fontWeight: chat.unread_count > 0 ? 500 : 400,
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {chat.last_message || 'No messages yet'}
                      </p>
                    </div>

                    {/* Unread badge */}
                    {chat.unread_count > 0 && (
                      <div style={{
                        marginLeft: '0.5rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        borderRadius: '50%',
                        minWidth: '20px',
                        height: '20px',
                        padding: '0 4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        flexShrink: 0
                      }}>
                        {chat.unread_count}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Pagination load more */}
              {page < totalPages && (
                <button
                  onClick={handleLoadMoreChats}
                  style={{
                    margin: '0.75rem auto',
                    padding: '0.4rem 1rem',
                    fontSize: '0.75rem',
                    color: 'var(--wa-green)',
                    backgroundColor: 'rgba(37, 211, 102, 0.08)',
                    border: '1px dashed var(--wa-green)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontWeight: 600
                  }}
                >
                  <RefreshCw size={12} />
                  Load More Chats
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: CONVERSATION AREA */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#efeae2',
        position: 'relative'
      }}>
        {selectedChat ? (
          <>
            {/* Header */}
            <div style={{
              height: '60px',
              backgroundColor: '#075e54',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 1.25rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              zIndex: 10,
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setShowDetailsModal(true)}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  marginRight: '0.75rem'
                }}>
                  {getInitials(selectedChat)}
                </div>
                <div>
                  <h3 style={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    margin: 0
                  }}>
                    {selectedChat.first_name || selectedChat.last_name 
                      ? `${selectedChat.first_name || ''} ${selectedChat.last_name || ''}`.trim() 
                      : `+${selectedChat.phone_number}`}
                  </h3>
                  <div style={{
                    fontSize: '0.7rem',
                    color: '#a7f3d0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: '0.1rem'
                  }}>
                    <span>+{selectedChat.phone_number}</span>
                    <span style={{
                      backgroundColor: selectedChat.disable_ai_bot === 1 ? '#ef4444' : '#10b981',
                      color: 'white',
                      padding: '0.05rem 0.35rem',
                      borderRadius: '4px',
                      fontSize: '0.6rem',
                      fontWeight: 700
                    }}>
                      AI Bot: {selectedChat.disable_ai_bot === 1 ? 'OFF' : 'ON'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Three-dots menu */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <MoreVertical size={20} />
                </button>
                {showDropdown && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '0.5rem',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e2e8f0',
                    zIndex: 50,
                    width: '180px',
                    overflow: 'hidden'
                  }}>
                    <button
                      onClick={() => {
                        setShowDetailsModal(true);
                        setShowDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        textAlign: 'left',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        color: '#1e293b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <User size={14} /> View Details
                    </button>
                    <button
                      onClick={async () => {
                        // Optimistically toggle client-side
                        const newBotVal = selectedChat.disable_ai_bot === 1 ? 0 : 1;
                        setSelectedChat(prev => ({ ...prev, disable_ai_bot: newBotVal }));
                        setChats(prev => prev.map(c => c && c._id === selectedChat._id ? { ...c, disable_ai_bot: newBotVal } : c));
                        setShowDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        textAlign: 'left',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        color: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        borderTop: '1px solid #f1f5f9'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <MessageCircle size={14} /> Toggle AI Bot
                    </button>
                  </div>
                )}
              </div>
            </div>



            {/* Messages Body */}
            <div 
              ref={chatBodyRef}
              onScroll={handleChatScroll}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.5rem',
                backgroundImage: 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 0)',
                backgroundSize: '24px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }} className="custom-scroll">
              {loadingHistory ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#64748b'
                }}>
                  <Loader2 size={36} className="animate-spin" style={{ color: '#075e54', marginBottom: '0.75rem' }} />
                  <span style={{ fontSize: '0.9rem' }}>Loading conversation history...</span>
                </div>
              ) : messages.length === 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#94a3b8',
                  fontSize: '0.9rem'
                }}>
                  <MessageSquare size={44} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                  No messages in this chat yet. Send a message to start.
                </div>
              ) : (
                <>
                  {loadingMoreHistory && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', width: '100%' }}>
                      <Loader2 size={20} className="animate-spin" style={{ color: '#075e54' }} />
                    </div>
                  )}
                  {messages.map((msg, index) => {
                    const incoming = isMessageIncoming(msg);
                    return (
                    <div
                      key={msg._id || index}
                      style={{
                        display: 'flex',
                        justifyContent: incoming ? 'flex-start' : 'flex-end',
                        width: '100%'
                      }}
                    >
                      {/* Bubble */}
                      <div style={{
                        maxWidth: '70%',
                        backgroundColor: incoming ? '#ffffff' : '#d9fdd3',
                        color: '#303030',
                        padding: '0.6rem 0.85rem',
                        borderRadius: incoming 
                          ? '0px 12px 12px 12px' 
                          : '12px 0px 12px 12px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        position: 'relative'
                      }}>
                        {/* Text */}
                        <p style={{
                          fontSize: '0.88rem',
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.4
                        }}>
                          {msg.message || msg.text || ''}
                        </p>

                        {/* Metadata: Time and Status */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: '0.25rem',
                          marginTop: '0.35rem',
                          fontSize: '0.65rem',
                          color: '#8c8c8c'
                        }}>
                          <span>{formatMessageDate(msg.created_at)}</span>
                          
                          {!incoming && (
                            <span style={{ color: '#53bdeb' }}>
                              {msg.status === 'read' ? (
                                <CheckCheck size={14} />
                              ) : (
                                <Check size={14} />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer Bar */}
            <form
              onSubmit={handleSendMessage}
              style={{
                height: '64px',
                backgroundColor: '#f0f2f5',
                display: 'flex',
                alignItems: 'center',
                padding: '0 1rem',
                gap: '0.75rem',
                borderTop: '1px solid #e2e8f0',
                flexShrink: 0
              }}
            >
              {/* Emoji icon */}
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#54656f',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                <Smile size={24} />
              </button>

              {/* Paperclip icon */}
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#54656f',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                <Paperclip size={22} />
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: '0.6rem 1rem',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                }}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: (!inputText.trim() || sending) ? '#cbd5e1' : '#25d366',
                  color: 'white',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: (!inputText.trim() || sending) ? 'default' : 'pointer',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  transition: 'background-color 0.2s',
                  flexShrink: 0
                }}
              >
                {sending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} style={{ transform: 'translateX(1px)' }} />
                )}
              </button>
            </form>
          </>
        ) : (
          /* Placeholder empty state */
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            backgroundColor: '#f8fafc',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(37, 211, 102, 0.1)',
              color: 'var(--wa-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              boxShadow: '0 8px 16px rgba(37, 211, 102, 0.1)'
            }}>
              <MessageSquare size={40} />
            </div>
            
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#1e293b',
              margin: '0 0 0.5rem'
            }}>
              SaleGrowy WhatsApp Chat
            </h2>
            
            <p style={{
              fontSize: '0.9rem',
              color: '#64748b',
              maxWidth: '380px',
              margin: '0 0 1.5rem',
              lineHeight: 1.5
            }}>
              Select a conversation from the list to view history, reply in real-time, and manage automated bot reply tags.
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: '#94a3b8'
            }}>
              <Lock size={12} />
              <span>End-to-end encrypted integration</span>
            </div>
          </div>
        )}

        {/* DETAILS MODAL */}
        {showDetailsModal && selectedChat && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(3px)'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              width: '500px',
              maxWidth: '90%',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
              {/* Modal Header */}
              <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Contact Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '50%',
                    display: 'flex'
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: '#20c997',
                    color: 'white',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    boxShadow: '0 4px 10px rgba(32, 201, 151, 0.3)'
                  }}>
                    {getInitials(selectedChat)}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>First Name</label>
                    <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>{selectedChat.first_name || '-'}</span>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Last Name</label>
                    <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>{selectedChat.last_name || '-'}</span>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Phone Number</label>
                    <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>+{selectedChat.phone_number}</span>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>AI Bot Status</label>
                    <span style={{
                      fontSize: '0.85rem',
                      color: selectedChat.disable_ai_bot === 1 ? '#ef4444' : '#10b981',
                      fontWeight: 700
                    }}>
                      {selectedChat.disable_ai_bot === 1 ? 'Disabled' : 'Enabled'}
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Chat UUID</label>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace', wordBreak: 'break-all' }}>{selectedChat._uid}</span>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Created At</label>
                  <span style={{ fontSize: '0.85rem', color: '#334155' }}>{new Date(selectedChat.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'flex-end',
                backgroundColor: '#f8fafc'
              }}>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  style={{
                    padding: '0.5rem 1.5rem',
                    backgroundColor: '#64748b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
