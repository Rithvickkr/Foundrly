'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getAuthToken } from '@/lib/actions/getauthtoken';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, Plus, ChevronLeft, 
  ChevronRight, Calendar, ArrowLeft, Trash2,
  MoreHorizontal, Lightbulb, Copy, CheckCircle,
  Download, Sparkles, Brain, MessageCircle, Rocket,
  Star, X
} from 'lucide-react';

// Typography for AI Co-founder persona
const personas = [
  { 
    id: 'strategic',
    name: 'Strategic Advisor', 
    icon: <Brain className="text-purple-500 dark:text-purple-400" size={18} />,
    description: 'Focuses on business strategy and planning'
  },
  { 
    id: 'analytical', 
    name: 'Analytical Mind', 
    icon: <Lightbulb className="text-yellow-500 dark:text-yellow-400" size={18} />,
    description: 'Data-driven insights and market analysis'
  },
  { 
    id: 'creative', 
    name: 'Creative Innovator', 
    icon: <Sparkles className="text-pink-500 dark:text-pink-400" size={18} />,
    description: 'Helps with brainstorming and creative solutions'
  },
  { 
    id: 'supportive', 
    name: 'Supportive Partner', 
    icon: <MessageCircle className="text-green-500 dark:text-green-400" size={18} />,
    description: 'Serves as a sounding board and motivator'
  }
];

// Common suggested questions by category
const suggestedQuestions = {
  strategy: [
    "How can I improve our go-to-market strategy?",
    "What are potential risks in our business model?",
    "How should we prioritize our product roadmap?"
  ],
  funding: [
    "How can we make our pitch deck more compelling?",
    "What metrics should we highlight for investors?",
    "How do we value our startup at this stage?"
  ],
  growth: [
    "What channels should we focus on for user acquisition?",
    "How can we improve our conversion rates?",
    "What retention strategies would work for our business?"
  ]
};

interface Message {
  role: 'user' | 'cofounder' | 'assistant';
  content: string;
  id: string;
  typing?: boolean;
  persona?: string;
}

interface Chat {
  id: string;
  messages: Message[];
  created_at: string;
  title?: string;
}

interface CofounderChatProps {
  pitchDeckId: string;
}

export default function CofounderChat({ pitchDeckId }: CofounderChatProps) {
  // State management
  const [userMessage, setUserMessage ] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedChats, setSavedChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [displayText, setDisplayText] = useState<{[key: string]: string}>({});
  const [wordIndices, setWordIndices] = useState<{[key: string]: number}>({});
  const [typingSpeed] = useState(100); // Adjusted for word-by-word (ms per word)
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [activeCategory, setActiveCategory] = useState('strategy');
  const [activeFocus, setActiveFocus] = useState('strategic');
  const [showPersonaTooltip, setShowPersonaTooltip] = useState(false);
  const [starredMessages, setStarredMessages] = useState<string[]>([]);
  const [showStarredPanel, setShowStarredPanel] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Refs
  const historyRef = useRef<Message[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const pitchId = params.pitchid as string;

  // Use pitchId if pitchDeckId isn't provided externally
  const effectivePitchDeckId = pitchDeckId || pitchId;

  // Effects
  useEffect(() => {
    historyRef.current = messages;
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, displayText]);

  // Typewriter effect for AI responses (word-by-word)
  useEffect(() => {
    const typingMessages = messages.filter(msg => 
      msg.role === 'cofounder' && 
      !msg.typing && 
      wordIndices[msg.id] !== undefined && 
      wordIndices[msg.id] < msg.content.split(/\s+/).length
    );
    
    if (typingMessages.length > 0) {
      const message = typingMessages[0];
      const words = message.content.split(/\s+/);
      const currentWordIndex = wordIndices[message.id] || 0;
      
      if (currentWordIndex < words.length) {
        const timer = setTimeout(() => {
          const newText = words.slice(0, currentWordIndex + 1).join(' ');
          setDisplayText(prev => ({
            ...prev,
            [message.id]: newText
          }));
          setWordIndices(prev => ({
            ...prev,
            [message.id]: currentWordIndex + 1
          }));
        }, typingSpeed);
        
        return () => clearTimeout(timer);
      }
    }
  }, [messages, wordIndices, typingSpeed]);

  // Check screen size for responsive design
  useEffect(() => {
    const checkScreenSize = () => {
      const isMobile = window.innerWidth < 768;
      setIsSmallScreen(isMobile);
      setShowSidebar(!isMobile);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Fetch saved chats
  useEffect(() => {
    fetchSavedChats();
    const saved = localStorage.getItem('starredMessages');
    if (saved) {
      setStarredMessages(JSON.parse(saved));
    }
  }, [effectivePitchDeckId]);

  // Handle modal keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (deleteConfirmId && e.key === 'Escape') {
        setDeleteConfirmId(null);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [deleteConfirmId]);

  // Generate unique ID for messages
  const generateId = () => {
    return `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  const fetchSavedChats = async () => {
    if (!effectivePitchDeckId) return;
    
    try {
      const token = await getAuthToken();
      const response = await fetch(`http://127.0.0.1:8000/cofounder/chats/${effectivePitchDeckId}`, {
        headers: {
          'authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch chats');
      
      const chats = await response.json();
      const processedChats = chats.map((chat: Chat) => {
        if (!chat.title && chat.messages.length > 0) {
          const firstUserMsg = chat.messages.find(m => m.role === 'user');
          if (firstUserMsg) {
            const content = firstUserMsg.content;
            return {
              ...chat,
              title: content.length > 30 
                ? content.substring(0, 30) + '...' 
                : content
            };
          }
        }
        return chat;
      });
      
      setSavedChats(processedChats);
    } catch (error) {
      console.error('Error fetching saved chats:', error);
    }
  };

  const loadChat = (chatId: string) => {
    const chat = savedChats.find(c => c.id === chatId);
    if (chat) {
      const formattedMessages = chat.messages.map(msg => ({
        role: msg.role === 'assistant' ? 'cofounder' : msg.role,
        content: msg.content,
        id: generateId(),
        persona: msg.role === 'assistant' ? getRandomPersona() : undefined
      })) as Message[];
      
      const newDisplayText: {[key: string]: string} = {};
      const newWordIndices: {[key: string]: number} = {};
      formattedMessages.forEach(msg => {
        if (msg.role === 'cofounder') {
          newDisplayText[msg.id] = msg.content;
          newWordIndices[msg.id] = msg.content.split(/\s+/).length;
        }
      });
      
      setDisplayText(newDisplayText);
      setWordIndices(newWordIndices);
      setMessages(formattedMessages);
      setActiveChatId(chatId);
      if (isSmallScreen) {
        setShowSidebar(false);
      }
      setShowSuggestions(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setDisplayText({});
    setWordIndices({});
    setActiveChatId(null);
    setShowSuggestions(true);
    if (isSmallScreen) {
      setShowSidebar(false);
    }
    setTimeout(() => {
      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
    }, 100);
  };

  const getRandomPersona = () => {
    return personas[Math.floor(Math.random() * personas.length)].id;
  };

  async function sendMessage(e?: React.FormEvent, customMessage?: string) {
    if (e) e.preventDefault();
    
    const messageToSend = customMessage || userMessage;
    if ((!messageToSend.trim() && !customMessage) || loading) return;

    const newUserMsg: Message = { role: 'user', content: messageToSend, id: generateId() };
    setMessages((prev) => [...prev, newUserMsg]);
    
    const nextPersona = activeFocus || getRandomPersona();
    
    const placeholderId = generateId();
    setMessages((prev) => [...prev, { 
      role: 'cofounder', 
      content: '', 
      id: placeholderId,
      typing: true,
      persona: nextPersona
    }]);
    
    if (!customMessage) setUserMessage('');
    setLoading(true);
    setShowSuggestions(false);

    const historyForBackend = historyRef.current
      .filter(m => !m.typing)
      .map((m) => ({
        role: m.role === 'cofounder' ? 'assistant' : m.role,
        content: m.content
      }));

    try {
      const token = await getAuthToken();
      
      const response = await fetch('http://127.0.0.1:8000/cofounder/save', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pitch_deck_id: effectivePitchDeckId,
          user_message: newUserMsg.content,
          history: historyForBackend,
          persona: nextPersona 
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === placeholderId
            ? { 
                role: 'cofounder', 
                content: data.reply, 
                id: placeholderId,
                persona: nextPersona 
              }
            : msg
        )
      );
      
      setDisplayText(prev => ({
        ...prev,
        [placeholderId]: ''
      }));
      
      setWordIndices(prev => ({
        ...prev,
        [placeholderId]: 0
      }));
      
      setActiveChatId(data.chat_id);
      fetchSavedChats();
    } catch (err) {
      console.error(err);
      const errorMessage = '⚠️ Error getting response. Please try again.';
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === placeholderId
            ? { role: 'cofounder', content: errorMessage, id: placeholderId }
            : msg
        )
      );
      
      setDisplayText(prev => ({
        ...prev,
        [placeholderId]: errorMessage
      }));
      
      setWordIndices(prev => ({
        ...prev,
        [placeholderId]: errorMessage.split(/\s+/).length
      }));
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    }).format(date);
  };

  const getPreviewText = (chat: Chat) => {
    if (chat.title) {
      return chat.title;
    }
    
    const messages = chat.messages;
    if (messages.length === 0) return "Empty chat";
    
    const lastMessage = messages[messages.length - 1];
    const content = lastMessage.content;
    
    return content.length > 40 ? content.substring(0, 40) + '...' : content;
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const deleteChat = async (chatId: string) => {
    setIsDeleting(true);
    try {
      const token = await getAuthToken();
      const response = await fetch(`http://127.0.0.1:8000/cofounder/chats/${chatId}`, {
        method: 'DELETE',
        headers: {
          'authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete chat');
      
      setSavedChats(savedChats.filter(chat => chat.id !== chatId));
      if (activeChatId === chatId) {
        setMessages([]);
        setDisplayText({});
        setWordIndices({});
        setActiveChatId(null);
        setShowSuggestions(true);
      }
      setDeleteConfirmId(null);
      setToast({ message: 'Chat deleted successfully', type: 'success' });
    } catch (error) {
      console.error('Error deleting chat:', error);
      setToast({ message: 'Failed to delete chat', type: 'error' });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const copyMessageToClipboard = async (message: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(message);
      setCopiedMessageId(messageId);
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const selectSuggestion = (question: string) => {
    sendMessage(undefined, question);
  };

  const toggleStarMessage = (messageId: string, content: string) => {
    let updated;
    if (starredMessages.includes(messageId)) {
      updated = starredMessages.filter(id => id !== messageId);
    } else {
      updated = [...starredMessages, messageId];
    }
    setStarredMessages(updated);
    localStorage.setItem('starredMessages', JSON.stringify(updated));
  };

  const exportChat = () => {
    if (messages.length === 0) return;
    
    let content = `# AI Co-founder Chat - ${new Date().toLocaleString()}\n\n`;
    
    messages.forEach(msg => {
      const role = msg.role === 'user' ? 'You' : 'AI Co-founder';
      content += `## ${role}\n\n${msg.content}\n\n`;
    });
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-cofounder-chat-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getPersonaIcon = (personaId?: string) => {
    if (!personaId) return null;
    
    const persona = personas.find(p => p.id === personaId);
    if (!persona) return null;
    
    return (
      <div 
        className="absolute -left-1 -top-1 p-1 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700"
        onMouseEnter={() => setShowPersonaTooltip(true)}
        onMouseLeave={() => setShowPersonaTooltip(false)}
      >
        {persona.icon}
      </div>
    );
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-800 dark:text-gray-200 overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {isSmallScreen && (
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle sidebar"
              >
                {showSidebar ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>
            )}
            <h1 className="text-lg md:text-xl font-bold flex items-center">
              <span className="text-blue-600 dark:text-blue-400 mr-2">
                <Rocket size={24} className="animate-pulse" />
              </span>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-transparent bg-clip-text">
                AI Co-Founder Chat
              </span>
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={startNewChat}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 text-sm"
              aria-label="New chat"
            >
              <Plus size={16} />
              <span className="hidden md:inline">New Chat</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar / Chat History */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div 
              initial={{ x: isSmallScreen ? '-100%' : -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isSmallScreen ? '-100%' : -300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`${
                isSmallScreen 
                  ? 'fixed inset-y-0 left-0 z-20 w-3/4 max-w-xs' 
                  : 'relative w-64 md:w-80'
              } border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col shadow-lg`}
            >
              <div className="p-4 border-b dark:bg-gray-800  border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-850">
                <h2 className="text-sm font-semibold flex items-center">
                  <Calendar size={16} className="mr-2 text-blue-500 dark:text-blue-400" />
                  Conversation History
                </h2>
                {isSmallScreen && (
                  <button 
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    aria-label="Close sidebar"
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                {savedChats.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <MessageSquare className="mx-auto mb-2 opacity-50" size={36} />
                      <p className="text-sm">No conversation history yet</p>
                      <p className="text-xs mt-2 max-w-xs mx-auto">Start a new chat to begin your conversation with your AI co-founder</p>
                    </motion.div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedChats.map((chat) => (
                      <motion.div 
                        key={chat.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative p-3 rounded-lg border transition-all group ${
                          activeChatId === chat.id 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md' 
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750'
                        }`}
                      >
                        <div 
                          onClick={() => loadChat(chat.id)}
                          className="pr-8"
                        >
                          <p className="text-sm font-medium mb-1 truncate">{getPreviewText(chat)}</p>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Calendar size={12} className="mr-1" />
                            <span>{formatDate(chat.created_at)}</span>
                          </div>
                        </div>

                        {/* Chat Actions (Delete only) */}
                        <div className="absolute right-2 top-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(chat.id);
                            }}

                            className="p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                            aria-label="Delete chat"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Starred messages section */}
              {starredMessages.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-3">
                  <button 
                    onClick={() => setShowStarredPanel(!showStarredPanel)}
                    className="flex items-center justify-between w-full text-sm font-medium text-gray-700 dark:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-750 rounded-md transition-colors"
                  >
                    <div className="flex items-center">
                      <Star size={14} className="mr-2 text-yellow-500 dark:text-yellow-400" />
                      <span>Saved Insights</span>
                    </div>
                    <ChevronRight size={16} className={`transition-transform ${showStarredPanel ? 'rotate-90' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showStarredPanel && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 space-y-2 max-h-40 overflow-y-auto p-1">
                          {messages.filter(msg => starredMessages.includes(msg.id)).map(msg => (
                            <div 
                              key={`starred-${msg.id}`} 
                              className="text-xs p-2 bg-gray-50 dark:bg-gray-750 rounded border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                            >
                              <p className="truncate">{msg.content.length > 60 ? msg.content.substring(0, 60) + '...' : msg.content}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              
              {/* Export chat button */}
              {messages.length > 0 && (
                <div className="p-3 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={exportChat}
                    className="flex items-center justify-center w-full py-2 px-3 bg-blue-900 dark:bg-gray-750 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-800 dark:text-gray-200 darK:bg-gray-800"
                  >
                    <Download size={14} className="mr-2" />
                    Export Conversation
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full relative">
          {/* Small screen back button */}
          {!showSidebar && isSmallScreen && (
            <button 
              onClick={toggleSidebar}
              className="absolute top-2 left-2 z-10 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
              aria-label="Show chat history"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          
          {/* Persona selector bar */}
          {messages.length > 0 && (
            <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 flex flex-col items-start overflow-x-auto scrollbar-thin">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-2 mb-2">Focus:</span>
              <div className="flex flex-wrap gap-2 px-2">
                {personas.map(persona => (
                  <button
                    key={persona.id}
                    onClick={() => setActiveFocus(persona.id)}
                    className={`flex items-center px-3 py-1.5 rounded-full text-xs transition-colors ${
                      activeFocus === persona.id 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 font-medium' 
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-650'
                    }`}
                  >
                    <span className="mr-1">{persona.icon}</span>
                    {persona.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900 scroll-smooth"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-500 dark:text-gray-400">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-md"
                >
                  <div className="bg-gradient-to-r from-blue-400 to-indigo-500 p-6 rounded-2xl mb-6 inline-block shadow-xl">
                    <Rocket size={48} className="text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-gray-700 dark:text-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-transparent bg-clip-text">Talk with Your AI Co-founder</h3>
                  <p className="mb-8 text-sm md:text-base text-gray-600 dark:text-gray-300">Get instant feedback, brainstorm ideas, and strategize your startup's growth with an AI partner built to help you succeed.</p>
                  
                  {showSuggestions && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md mt-4">
                        <div className="flex flex-wrap justify-center mb-4 gap-2">
                          <button
                            onClick={() => setActiveCategory('strategy')}
                            className={`px-3 py-1 rounded-full text-sm transition ${
                              activeCategory === 'strategy' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                          >
                            Strategy
                          </button>
                          <button
                            onClick={() => setActiveCategory('funding')}
                            className={`px-3 py-1 rounded-full text-sm transition ${
                              activeCategory === 'funding' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 distance:0 dark:text-blue-300' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                          >
                            Funding
                          </button>
                          <button
                            onClick={() => setActiveCategory('growth')}
                            className={`px-3 py-1 rounded-full text-sm transition ${
                              activeCategory === 'growth' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                          >
                            Growth
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          {suggestedQuestions[activeCategory as keyof typeof suggestedQuestions].map((question, idx) => (
                            <motion.div
                              key={`${activeCategory}-${idx}`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => selectSuggestion(question)}
                              className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 cursor-pointer hover:shadow-md transition-all duration-200 text-sm"
                            >
                              <p className="text-gray-800 dark:text-gray-200 font-medium">{question}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            ) : (
              <div className="space-y-4 pb-2">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[90%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm relative group ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-sm' 
                          : 'bg-white dark:bg-gray-800 rounded-bl-sm border border-gray-100 dark:border-gray-700'
                      }`}
                    >
                      {msg.role === 'cofounder' && !msg.typing && getPersonaIcon(msg.persona)}
                      
                      {msg.typing ? (
                        <div className="flex space-x-1 items-center h-8 px-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      ) : msg.role === 'cofounder' ? (
                        <div>
                          <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                            <div dangerouslySetInnerHTML={{ 
                              __html: (displayText[msg.id] || '').replace(/\n/g, '<br>') + 
                                (wordIndices[msg.id] !== undefined && 
                                wordIndices[msg.id] < msg.content.split(/\s+/).length ? 
                                  '<span class="cursor animate-pulse"> |</span>' : '')
                            }} />
                          </div>
                          
                          {wordIndices[msg.id] >= msg.content.split(/\s+/).length && (
                            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => copyMessageToClipboard(msg.content, msg.id)}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                                aria-label="Copy message"
                              >
                                {copiedMessageId === msg.id ? <CheckCircle size= {14} className="text-green-500 dark:text-green-400" /> : <Copy size={14} />}
                              </button>
                              <button 
                                onClick={() => toggleStarMessage(msg.id, msg.content)} 
                                className={`p-1 transition-colors ${
                                  starredMessages.includes(msg.id) 
                                    ? 'text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300' 
                                    : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                                }`}
                                aria-label={starredMessages.includes(msg.id) ? "Unstar message" : "Star message"}
                              >
                                <Star size={14} fill={starredMessages.includes(msg.id) ? "currentColor" : "none"} />
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br>') }} />
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {messages.length > 0 && messages[messages.length - 1].role === 'cofounder' && 
                 !messages[messages.length - 1].typing && 
                 wordIndices[messages[messages.length - 1].id] >= messages[messages.length - 1].content.split(/\s+/).length && (
                  <div className="flex justify-center">
                    <span className="text-xs text-gray-400 dark:text-gray-500">Waiting for your message...</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Message Input */}
          <motion.div 
            className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <form onSubmit={sendMessage} className="flex space-x-2 max-w-3xl mx-auto">
              <div className="flex-1 relative">
                <textarea
                  ref={messageInputRef}
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white resize-none outline-none transition-all shadow-sm text-sm"
                  rows={1}
                  value={userMessage}
                  onChange={(e) => {
                    setUserMessage(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask your AI co-founder anything..."
                  disabled={loading}
                />
                <motion.button
                  type="submit"
                  disabled={loading || !userMessage.trim()}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-2 bottom-2 p-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-indigo-700 transition-colors shadow-sm hover:shadow-md"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-labelledby="delete-modal-title"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 id="delete-modal-title" className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Delete Conversation
                </h3>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete this conversation? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                  aria-label="Cancel deletion"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteChat(deleteConfirmId)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Confirm deletion"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg text-sm ${
            toast.type === 'success' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          }`}
        >
          {toast.message}
        </motion.div>
      )}

      {/* Styling */}
      <style jsx global>{`
        .cursor {
          display: inline-block;
          width: 2px;
          height: 1em;
          background: currentColor;
          vertical-align: middle;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 2px;
        }
        
        .dark .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #4a5568;
        }
        
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }
        
        .dark ::-webkit-scrollbar-thumb {
          background: #4a5568;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
        
        .dark ::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }
        
        .bg-gray-750 {
          background-color: #2d3748;
        }
        
        .bg-gray-850 {
          background-color: #1a202c;
        }
        
        .bg-gray-650 {
          background-color: #4a5568;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .animate-pulse {
          animation: pulse 2s infinite;
        }
        
        @media (max-width: 768px) {
          .fixed.inset-y-0 {
            z-index: 20;
          }
          .max-w-3xl {
            max-w: 100%;
          }
          .text-sm {
            font-size: 0.875rem;
          }
          .text-xs {
            font-size: 0.75rem;
          }
          .rounded-2xl {
            border-radius: 1rem;
          }
          .p-6 {
            padding: 1rem;
          }
          .space-y-6 {
            margin-top: 0.5rem;
            margin-bottom: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}