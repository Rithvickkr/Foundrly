"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Plus,
  X,
  FileText,
  Clock,
  Sparkles,
  Send,
  BarChart3,
  Lightbulb,
  Users,
  TrendingUp,
  Zap,
  Presentation,
  Bot,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getDecks } from "@/lib/actions/getdecks";
import type { PitchDeckResponseDetails } from "@/lib/actions/getdecks";
import { getUser } from "@/lib/actions/getuser";
import { getAuthToken } from "@/lib/actions/getauthtoken";
import { ScrollArea } from "@/components/ui/scroll-area";
// tools data
const Tools = [
  {
    id: 1,
    name: "Market Research",
    description: "AI-powered market analysis and competitor insights",
    icon: BarChart3,
    color: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
    category: "Research",
    location: "/tools/market-research",
    isNew: true,
  },
  {
    id: 2,
    name: "Idea Generator",
    description: "Generate innovative business concepts and solutions",
    icon: Lightbulb,
    color: "bg-yellow-500",
    hoverColor: "hover:bg-yellow-600",
    category: "Creative",
    isNew: false,
  },
  {
    id: 3,
    name: "CoFounder chat",
    description: "Collaborate with AI on strategic planning and goal setting",
    icon: Bot,
    color: "bg-red-500",
    hoverColor: "hover:bg-red-600",
    category: "Strategy",
    isNew: false,
  },
  {
    id: 4,
    name: "Slide Designer",
    description: "Create stunning pitch deck slides with AI assistance",
    icon: Users,
    color: "bg-green-500",
    hoverColor: "hover:bg-green-600",
    category: "Creative",
    isNew: false,
  },
  {
    id: 5,
    name: "Growth Metrics",
    description: "Track and forecast business growth indicators",
    icon: TrendingUp,
    color: "bg-purple-500",
    hoverColor: "hover:bg-purple-600",
    category: "Analytics",
    isNew: true,
  },
  {
    id: 6,
    name: "AI Pitch",
    description: "Generate elevator pitches in seconds",
    icon: Zap,
    color: "bg-orange-500",
    hoverColor: "hover:bg-orange-600",
    category: "Creative",
    isNew: false,
  },
];

interface ChatMessage {
  sender: "You" | "AI";
  message: string;
  timestamp: string;
}

export default function Dashboard() {
  const [userName, setUserName] = useState("user");
  const [chatOpen, setChatOpen] = useState(false);
  const [recentDecks, setRecentDecks] = useState<PitchDeckResponseDetails[]>(
    []
  );
  const [totalDecks, setTotalDecks] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedToolCategory, setSelectedToolCategory] = useState("All");
  const [hoveredTool, setHoveredTool] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: "AI",
      message:
        "Hi! I'm your AI assistant. I can help you with pitch deck creation, investor outreach, and answer any questions about our platform. What would you like to know?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [message, setMessage] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedToolId, setSelectedToolId] = useState<number | null>(null);
  const [deckss, setDeckss] = useState<PitchDeckResponseDetails[]>([]);
  const router = useRouter();

  // Tool categories
  const categories = [
    "All",
    "Research",
    "Creative",
    "Strategy",
    "Management",
    "Analytics",
  ];

  useEffect(() => {
    setIsClient(true);

    const fetchUser = async () => {
      const user = await getUser();
      if (user) {
        setUserName(user.name);
      } else {
        console.error("Failed to fetch user");
      }
    };
    const fetchDecks = async () => {
      const decks = await getDecks();
      if (decks) {
        setDeckss(decks);
        const sortedDecks = [...decks].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setTotalDecks(decks.length);
        setRecentDecks(sortedDecks.slice(0, 4));
      } else {
        setDeckss([]);
        console.error("Failed to fetch decks");
      }
    };
    fetchUser();
    fetchDecks();

    const timer = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!isClient) {
    return null;
  }

  const filteredTools =
    selectedToolCategory === "All"
      ? Tools
      : Tools.filter((tool) => tool.category === selectedToolCategory);

  const handleSendMessage = async () => {
    if (message.trim() === "" || isLoadingChat) return;

    const userMessage = message.trim();
    const currentTime = new Date().toISOString();

    // Add user message to chat
    const newUserMessage: ChatMessage = {
      sender: "You",
      message: userMessage,
      timestamp: currentTime,
    };

    setChatMessages((prev) => [...prev, newUserMessage]);
    setMessage("");
    setIsLoadingChat(true);

    try {
      // Prepare chat history for API
      const chatHistory = chatMessages.map((msg) => ({
        role: msg.sender === "You" ? "user" : "assistant",
        content: msg.message,
      }));

      // Call the helper chat API

      const token = await getAuthToken();
      const response = await fetch("http://127.0.0.1:8000/helper-chat", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          history: chatHistory,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from helper chat");
      }

      const data = await response.json();

      // Add AI response to chat
      const aiMessage: ChatMessage = {
        sender: "AI",
        message: data.response,
        timestamp: new Date().toISOString(),
      };

      setChatMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);

      // Add error message
      const errorMessage: ChatMessage = {
        sender: "AI",
        message:
          "Sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
      };

      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleToolClick = (toolId: number) => {
    setSelectedToolId(toolId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedToolId(null);
  };

  const handleDeckSelect = (deckId: string) => {
    if (selectedToolId) {
      // CoFounder chat tool has id 3
      if (selectedToolId === 3) {
        router.push(`/CofChat/${deckId}`);
      } else if (selectedToolId === 4) {
        const selectedDeck = deckss.find(deck => deck.id === deckId);
        if (selectedDeck) {
          const params = new URLSearchParams({
            title: selectedDeck.title,
            description: selectedDeck.description || '',
            industry: selectedDeck.industry || '',
            startup_stage: selectedDeck.startup_stage || '',
            target_market: selectedDeck.target_market || ''
          });
          router.push(`/Slideplayground/${deckId}?${params.toString()}`);
        }
      } else {
        router.push(`/pitchdeck/${deckId}`);
      }
      handleModalClose();
    }
  };

  const handleCreateNewDeck = () => {
    if (selectedToolId) {
      router.push(`/createpitchdeck`);
      handleModalClose();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    show: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.4 } },
    hover: { scale: 1.03, y: -5, transition: { duration: 0.2 } },
  };

  const toolVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.9 },
    show: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.5 } },
    hover: {
      scale: 1.05,
      y: -8,
      transition: { duration: 0.2 },
    },
  };

  const statsVariants = {
    hidden: { scale: 0, opacity: 0 },
    show: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 20,
        delay: 0.2,
      },
    },
  };

  const selectedTool = Tools.find((tool) => tool.id === selectedToolId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 text-gray-800 dark:text-gray-100 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
        animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 90, 0],
        }}
        transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear",
        }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"
        animate={{
        scale: [1.2, 1, 1.2],
        rotate: [0, -90, 0],
        }}
        transition={{
        duration: 25,
        repeat: Infinity,
        ease: "linear",
        }}
      />
      </div>

      <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 relative z-10">
      {/* Welcome Banner */}
      <AnimatePresence>
        {showWelcome && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-700 dark:via-purple-700 dark:to-pink-700 shadow-2xl rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
          <Button
            variant="ghost"
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 z-10"
            onClick={() => setShowWelcome(false)}
            aria-label="Close welcome banner"
          >
            <X className="w-5 h-5" />
          </Button>
          <CardContent className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
              Welcome back, {userName}!
              </h2>
              <p className="text-white/90 text-lg">
              Ready to craft pitches that win investors?
              </p>
            </div>
            </div>
            <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            >
            <Button
              className=" bg-white text-indigo-700 hover:bg-white/90 rounded-xl px-6 py-3 text-base font-semibold shadow-lg w-full lg:w-auto"
              onClick={() => router.push("/createpitchdeck")}
            >
              <Plus className="w-5 h-5 mr-2" />
              New Pitch Deck
            </Button>
            </motion.div>
          </CardContent>
          </Card>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Simplified Dashboard Overview */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mb-8"
      >
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg shadow-xl rounded-3xl overflow-hidden border border-white/30 dark:border-gray-700/30">
          {/* Header Section */}
          <CardHeader className="relative p-8 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-800/80 dark:via-blue-900/20 dark:to-indigo-900/20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-gray-800/50" />
        <div className="relative z-10">
          <CardTitle className="text-3xl font-bold flex items-center text-gray-800 dark:text-gray-100">
            <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0] 
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="mr-4"
            >
          <BarChart3 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </motion.div>
            Dashboard Overview
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            Track your progress and manage your pitch decks
          </p>
        </div>
          </CardHeader>

          {/* Stats Grid */}
          <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* Total Decks Card */}
          <motion.div 
            variants={statsVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 border-0 shadow-2xl rounded-2xl group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
            <p className="text-white/80 text-sm font-medium uppercase tracking-wider">
              Total Decks
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <p className="text-5xl font-bold text-white">
                {totalDecks}
              </p>
            </motion.div>
            <p className="text-white/70 text-sm">
              Pitch decks created
            </p>
              </div>
              <motion.div
            className="relative"
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ duration: 0.3 }}
              >
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
              <Presentation className="w-10 h-10 text-white" />
            </div>
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
              </motion.div>
            </div>
          </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity Card */}
          <motion.div 
            variants={statsVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 border-0 shadow-2xl rounded-2xl group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
            <p className="text-white/80 text-sm font-medium uppercase tracking-wider">
              This Month
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            >
              <p className="text-5xl font-bold text-white">
                +{Math.max(0, totalDecks)}
              </p>
            </motion.div>
            <p className="text-white/70 text-sm">
              Decks this period
            </p>
              </div>
              <motion.div
            className="relative"
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ duration: 0.3 }}
              >
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            <motion.div
              className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
              </motion.div>
            </div>
          </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Action Card */}
        <motion.div 
          variants={statsVariants}
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 border-0 shadow-2xl rounded-2xl group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <CardContent className="p-6 relative z-10">
          <div className="text-center space-y-6">
            <motion.div
              className="mx-auto w-fit"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
            <Zap className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            
            <div className="space-y-3">
              <p className="text-white/80 text-sm font-medium uppercase tracking-wider">
            Quick Start
              </p>
              <h3 className="text-xl font-bold text-white">
            Ready to Create?
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
            Launch a new pitch deck with AI assistance
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm rounded-xl px-8 py-3 font-semibold text-base shadow-lg transition-all duration-300 hover:shadow-xl"
            onClick={() => router.push("/createpitchdeck")}
              >
            <Plus className="w-5 h-5 mr-2" />
            Create Deck
              </Button>
            </motion.div>
          </div>
            </CardContent>
          </Card>
        </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tools Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-2xl border border-white/20">
        <CardHeader className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800/80 dark:to-blue-900/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-2xl font-bold flex items-center">
            <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            >
            <Zap className="w-7 h-7 mr-3 text-indigo-500" />
            </motion.div>
            AI-Powered Tools
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
            <motion.button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedToolCategory === category
                ? "bg-indigo-500 text-white shadow-lg"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
              onClick={() => setSelectedToolCategory(category)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
            ))}
          </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          layout
          >
          <AnimatePresence mode="wait">
            {filteredTools.map((tool, index) => {
            const IconComponent = tool.icon;
            return (
              <motion.div
              key={tool.id}
              variants={toolVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              whileHover="hover"
              layout
              transition={{ delay: index * 0.1 }}
              className="relative group cursor-pointer"
              onHoverStart={() => setHoveredTool(tool.id)}
              onHoverEnd={() => setHoveredTool(null)}
              >
              <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl border border-gray-100 dark:border-gray-700 relative">
                {tool.isNew && (
                <motion.div
                  className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                  delay: 0.5,
                  type: "spring",
                  stiffness: 200,
                  }}
                >
                  NEW
                </motion.div>
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-indigo-50/50 dark:to-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-6 relative z-10">
                <div className="flex items-start gap-4">
                  <motion.div
                  className={`p-3 ${tool.color} rounded-2xl relative`}
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                  >
                  <IconComponent className="w-8 h-8 text-white" />
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-2xl"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={
                    hoveredTool === tool.id
                      ? { scale: 1, opacity: 1 }
                      : { scale: 0, opacity: 0 }
                    }
                    transition={{ duration: 0.2 }}
                  />
                  </motion.div>
                  <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {tool.description}
                  </p>
                  <motion.div
                    className="mt-4 flex items-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ x: 5 }}
                    onClick={() => handleToolClick(tool.id)}
                  >
                    Launch Tool →
                  </motion.div>
                  </div>
                </div>
                </CardContent>
              </Card>
              </motion.div>
            );
            })}
          </AnimatePresence>
          </motion.div>
        </CardContent>
        </Card>
      </motion.div>

      {/* Recent Projects */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-2xl border border-white/20">
        <CardHeader className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800/80 dark:to-blue-900/20">
          <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center">
            <FileText className="w-7 h-7 mr-3 text-indigo-500" />
            Recent Projects
          </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {recentDecks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {recentDecks.map((project, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              initial="hidden"
              animate="show"
              whileHover="hover"
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="p-6 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <motion.span
                className={`w-3 h-3 rounded-full ${
                  index % 3 === 0
                  ? "bg-green-500"
                  : index % 3 === 1
                  ? "bg-yellow-500"
                  : "bg-purple-500"
                }`}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                />
                <span className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 tracking-wider">
                {project.industry || "Technology"}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 line-clamp-1 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {project.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4">
                {project.description}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {new Date(
                  project.created_at
                  ).toLocaleDateString()}
                </span>
                </div>
                <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                >
                <Button
                  size="sm"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-4 py-2 font-semibold shadow-lg"
                  onClick={() =>
                  router.push(`/pitchdeck/${project.id}`)
                  }
                  aria-label={`Edit ${project.title}`}
                >
                  Edit
                </Button>
                </motion.div>
              </div>
              </div>
            </motion.div>
            ))}
          </div>
          ) : (
          <>
            <motion.div
            className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800/50 dark:to-blue-900/20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              }}
            >
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              No projects yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Start creating your first pitch deck and unlock the power
              of AI-driven presentations.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
              onClick={() => router.push("/createpitchdeck")}
              className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-6 py-3 font-semibold shadow-lg"
              >
              <Plus className="w-5 h-5 mr-2" />
              Create First Deck
              </Button>
            </motion.div>
            </motion.div>
          </>
          )}
        </CardContent>
        </Card>
      </motion.div>
      </div>

      {/* Floating Action Button */}
      <motion.div
      className="z-50 fixed bottom-6 right-6"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      >
      <Button
        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full p-4 shadow-2xl relative overflow-hidden group"
        onClick={() => router.push("/createpitchdeck")}
        aria-label="Create new pitch deck"
      >
        <div className="absolute inset-0 bg-white/20 transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full" />
        <Plus className="w-7 h-7 relative z-10" />
      </Button>
      </motion.div>

      {/* Enhanced Chat Interface */}
      <AnimatePresence>
      {chatOpen && (
        <motion.div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setChatOpen(false)}
        />
      )}
      </AnimatePresence>

      <motion.div
      className={`fixed bottom-0 right-0 w-full sm:w-[450px] lg:w-[520px] transition-all duration-700 ease-out ${
        chatOpen ? "translate-y-0" : "translate-y-full"
      } h-[85vh] sm:h-[650px] lg:h-[700px] z-50`}
      initial={{ y: 100, opacity: 0, scale: 0.95 }}
      animate={{
        y: chatOpen ? 0 : 100,
        opacity: chatOpen ? 1 : 0,
        scale: chatOpen ? 1 : 0.95,
      }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
      <Card className="relative h-full flex flex-col overflow-hidden border-0 shadow-2xl backdrop-blur-2xl bg-gradient-to-b from-white/95 via-white/90 to-white/95 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/95">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Header */}
        <CardHeader className="relative p-4 sm:p-6 bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-pink-50/80 dark:from-gray-800/80 dark:via-purple-900/20 dark:to-pink-900/20 flex-shrink-0 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/30">
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-gray-800/50" />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
        <motion.div
        className="relative p-2.5 sm:p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg"
        animate={{
        boxShadow: [
          "0 0 20px rgba(99, 102, 241, 0.3)",
          "0 0 30px rgba(147, 51, 234, 0.4)",
          "0 0 20px rgba(99, 102, 241, 0.3)",
        ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        <motion.div
        className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-white shadow-lg"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        />
        </motion.div>
        <div>
        <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
        AI Assistant
        </CardTitle>
        <motion.p
        className="text-xs sm:text-sm text-gray-500 dark:text-gray-400"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
        >
        Online • Ready to help
        </motion.p>
        </div>
        </div>
        <div className="flex items-center gap-2">
        <motion.button
        className="p-2 rounded-xl bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
        whileHover={{ scale: 1.05, rotate: 90 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setChatOpen(false)}
        >
        <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.button>
        </div>
      </div>
        </CardHeader>

        {/* Message Area */}
        <CardContent className="relative flex-1 p-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent dark:via-gray-800/20 pointer-events-none" />
      <ScrollArea
        className="h-full"
        ref={(ref) => {
        if (ref && chatMessages.length > 0) {
        const scrollContainer = ref.querySelector(
        "[data-radix-scroll-area-viewport]"
        );
        if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth'
          });
        }, 100);
        }
        }
        }}
      >
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 min-h-full">
        <AnimatePresence mode="popLayout">
        {chatMessages.map((msg, index) => (
        <motion.div
          key={index}
          layout
          initial={{ opacity: 0, y: 30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.8 }}
          transition={{
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
        layout: { duration: 0.3 },
          }}
          className={`flex ${
        msg.sender === "You" ? "justify-end" : "justify-start"
          }`}
        >
          <div
        className={`flex items-end gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] ${
          msg.sender === "You" ? "flex-row-reverse" : "flex-row"
        }`}
          >
        {/* Avatar */}
        <motion.div
          className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
          msg.sender === "You"
          ? "bg-gradient-to-br from-indigo-500 to-purple-600"
          : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800"
          }`}
          whileHover={{ scale: 1.1 }}
        >
          {msg.sender === "You" ? (
          <span className="text-white text-xs sm:text-sm font-bold">
          U
          </span>
          ) : (
          <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-300" />
          )}
        </motion.div>

        {/* Message Bubble */}
        <motion.div
          className={`relative p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-lg backdrop-blur-sm ${
          msg.sender === "You"
          ? "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white"
          : "bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white border border-gray-200/50 dark:border-gray-700/50"
          }`}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {msg.sender !== "You" && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-gray-700/50 rounded-2xl sm:rounded-3xl" />
          )}

          <div className="relative">
          <p className="text-sm sm:text-base leading-relaxed font-medium break-words">
          {msg.message}
          </p>
          <motion.p
          className={`text-xs mt-1 sm:mt-2 font-normal ${
          msg.sender === "You"
            ? "text-white/70"
            : "text-gray-500 dark:text-gray-400"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          >
          {new Date(msg.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          })}
          </motion.p>
          </div>

          {/* Message tail */}
          <div
          className={`absolute bottom-2 ${
          msg.sender === "You"
          ? "right-[-6px] sm:right-[-8px]"
          : "left-[-6px] sm:left-[-8px]"
          } w-3 h-3 sm:w-4 sm:h-4 transform rotate-45 ${
          msg.sender === "You"
          ? "bg-gradient-to-br from-indigo-500 to-purple-500"
          : "bg-white/90 dark:bg-gray-800/90 border-r border-b border-gray-200/50 dark:border-gray-700/50"
          }`}
          />
        </motion.div>
          </div>
        </motion.div>
        ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isLoadingChat && (
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex items-end gap-2 sm:gap-3"
        >
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
          <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-300" />
        </div>
        <div className="bg-white/90 dark:bg-gray-800/90 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2">
        <motion.div
          className="flex gap-1"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {[0, 1, 2].map((i) => (
          <motion.div
          key={i}
          className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full"
          animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 1, 0.3],
          }}
          transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: i * 0.2,
          }}
          />
          ))}
        </motion.div>
        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
          AI is thinking...
        </span>
          </div>
        </div>
        </motion.div>
        )}
        </div>
      </ScrollArea>
        </CardContent>

        {/* Input Area */}
        <div className="relative p-3 sm:p-6 bg-gradient-to-r from-white/95 via-white/90 to-white/95 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/95 backdrop-blur-xl border-t border-white/20 dark:border-gray-700/30 flex-shrink-0">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50 dark:to-gray-900/50" />
      <div className="relative flex items-end gap-2 sm:gap-4">
        <div className="flex-1 relative">
        <Input
        type="text"
        placeholder="Type your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) =>
        e.key === "Enter" && !e.shiftKey && handleSendMessage()
        }
        className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 shadow-lg transition-all duration-200 resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
        disabled={isLoadingChat}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-gray-700/20 rounded-xl sm:rounded-2xl pointer-events-none" />
        </div>

        <motion.button
        className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg transition-all duration-300 backdrop-blur-sm flex-shrink-0 ${
        isLoadingChat || !message.trim()
        ? "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
        : "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white hover:shadow-xl hover:shadow-indigo-500/25"
        }`}
        whileHover={
        !isLoadingChat && message.trim()
        ? {
        scale: 1.05,
        boxShadow: "0 20px 40px rgba(99, 102, 241, 0.3)",
          }
        : {}
        }
        whileTap={
        !isLoadingChat && message.trim() ? { scale: 0.95 } : {}
        }
        onClick={handleSendMessage}
        disabled={isLoadingChat || !message.trim()}
        >
        <AnimatePresence mode="wait">
        {isLoadingChat ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0, rotate: -180 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: 180 }}
        >
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
        </motion.div>
        ) : (
        <motion.div
          key="send"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          whileHover={{ x: 2 }}
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.div>
        )}
        </AnimatePresence>
        </motion.button>
      </div>

      {/* Quick Actions */}
      <motion.div
        className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {[
        "How to create a pitch deck?",
        "Best practices",
        "Investor tips",
        ].map((suggestion, index) => (
        <motion.button
        key={suggestion}
        className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 text-gray-600 dark:text-gray-300 rounded-lg sm:rounded-xl hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50"
        onClick={() => setMessage(suggestion)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 + index * 0.1 }}
        >
        {suggestion}
        </motion.button>
        ))}
      </motion.div>
      </div>
      </Card>
      </motion.div>
      

      {/* Chat Toggle Button */}
      <motion.div
      className={`z-50 fixed bottom-24 right-6 transition-all duration-300 ${
        chatOpen
        ? "opacity-0 pointer-events-none scale-90"
        : "opacity-100 scale-100"
      }`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      >
      <Button
        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full p-4 shadow-2xl relative overflow-hidden group"
        onClick={() => setChatOpen(true)}
        aria-label="Open AI helper chat"
      >
        <div className="absolute inset-0 bg-white/20 transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full" />
        <MessageCircle className="w-7 h-7 relative z-10" />
      </Button>
      </motion.div>

      {/* Enhanced Pitch Deck Selection Modal */}
      <AnimatePresence>
      {isModalOpen && (
        <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50"
        onClick={handleModalClose}
        >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative px-4 sm:px-8 py-4 sm:py-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"
          >
          <div className="absolute inset-0 bg-black/10" />
          <motion.button
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full backdrop-blur-sm"
            onClick={handleModalClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-5 h-5" />
          </motion.button>

          <div className="relative z-10 flex items-center gap-3 sm:gap-6">
            {selectedTool && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 300,
              }}
              className="flex-shrink-0"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/30">
              <selectedTool.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </motion.div>
            )}
            <div className="flex-1 min-w-0">
            <motion.h2
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 truncate"
            >
              {selectedTool?.name}
            </motion.h2>
            <motion.p
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white/80 text-sm sm:text-base leading-relaxed line-clamp-2"
            >
              {selectedTool?.description}
            </motion.p>
            </div>
          </div>
          </motion.div>

          {/* Modal Content */}
          <div className="flex-1 p-4 sm:p-8 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900">
          {deckss.length > 0 ? (
            <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 sm:space-y-6"
            >
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-1 h-4 sm:h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
              <h3 className="font-bold text-lg sm:text-xl text-gray-800 dark:text-gray-200">
              Select Your Deck
              </h3>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700" />
            </div>

            <ScrollArea className="h-60 sm:h-80">
              <div className="grid gap-3 sm:gap-4 pr-2 sm:pr-4">
              {deckss.map((deck, index) => (
                <motion.button
                key={deck.id}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 + 0.3 }}
                className="group relative p-3 sm:p-5 mt-1 sm:mt-2 mr-1 sm:mr-2 ml-1 sm:ml-2 bg-white/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 text-left overflow-hidden"
                onClick={() => handleDeckSelect(deck.id)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                >
                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-full transform translate-x-12 sm:translate-x-16 -translate-y-12 sm:-translate-y-16 group-hover:scale-150 transition-transform duration-500" />

                <div className="relative z-10 flex items-center gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  </div>
                  <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 truncate text-base sm:text-lg mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {deck.title}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
                    {deck.description ||
                    "No description available"}
                  </p>
                  <div className="flex items-center gap-2 sm:gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className="hidden sm:inline">
                      {new Date(
                      deck.created_at
                      ).toLocaleDateString()}
                    </span>
                    <span className="sm:hidden">
                      {new Date(
                      deck.created_at
                      ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      })}
                    </span>
                    </span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                    {deck.industry || "Business"}
                    </span>
                  </div>
                  </div>
                  <motion.div
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hidden sm:block"
                  whileHover={{ x: 5 }}
                  >
                  <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">→</span>
                  </div>
                  </motion.div>
                </div>
                </motion.button>
              ))}
              </div>
            </ScrollArea>

            {deckss.length > 6 && (
              <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-4"
              >
              Showing 6 of {deckss.length} decks
              </motion.p>
            )}
            </motion.div>
          ) : (
            <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-8 sm:py-16"
            >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              }}
              className="mb-4 sm:mb-6"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl sm:rounded-2xl mx-auto flex items-center justify-center">
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
            </motion.div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              No Pitch Decks Yet
            </h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed px-4">
              Start your journey by creating your first pitch deck and
              unlock the power of AI-driven presentations.
            </p>
            </motion.div>
          )}
          </div>

          {/* Modal Footer */}
          <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-blue-50/50 dark:from-gray-800 dark:to-blue-900/10 border-t border-gray-200/50 dark:border-gray-700/50"
          >
          <motion.button
            className="group relative w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl sm:rounded-2xl px-6 sm:px-8 py-3 sm:py-4 font-semibold text-base sm:text-lg shadow-xl transition-all duration-300 overflow-hidden"
            onClick={handleCreateNewDeck}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-4">
            <motion.div
              className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl"
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.div>
            <span>Create New Pitch Deck</span>
            <motion.div
              className="opacity-0 group-hover:opacity-100 transition-all duration-200 hidden sm:block"
              whileHover={{ x: 3 }}
            >
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm">→</span>
              </div>
            </motion.div>
            </div>
          </motion.button>
          </motion.div>
        </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
