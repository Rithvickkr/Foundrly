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
  Target,
  Users,
  TrendingUp,
  Zap,
  Palette,
  Presentation,
  Search,
  Filter,
  Download,
  Share2,
  Eye,
  Bot,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getDecks } from "@/lib/actions/getdecks";
import type { PitchDeckResponseDetails } from "@/lib/actions/getdecks";
import { getUser } from "@/lib/actions/getuser";

// Mock tools data
const mockTools = [
  {
    id: 1,
    name: "Market Research",
    description: "AI-powered market analysis and competitor insights",
    icon: BarChart3,
    color: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
    category: "Research",
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
    name: "Team Builder",
    description: "Optimize team structure and role definitions",
    icon: Users,
    color: "bg-green-500",
    hoverColor: "hover:bg-green-600",
    category: "Management",
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
    name: "Quick Pitch",
    description: "Generate elevator pitches in seconds",
    icon: Zap,
    color: "bg-orange-500",
    hoverColor: "hover:bg-orange-600",
    category: "Creative",
    isNew: false,
  },
];

export default function DashboardHome() {
  const [userName, setUserName] = useState("user");
  const [chatOpen, setChatOpen] = useState(false);
  const [recentDecks, setRecentDecks] = useState<PitchDeckResponseDetails[]>([]);
  const [totalDecks, setTotalDecks] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedToolCategory, setSelectedToolCategory] = useState("All");
  const [hoveredTool, setHoveredTool] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "AI",
      message: "Hi! Ready to build an investor-winning pitch deck?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
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
        const sortedDecks = [...decks].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setTotalDecks(decks.length);
        setRecentDecks(sortedDecks.slice(0, 4));
      } else {
        console.error("Failed to fetch decks");
      }
    };
    fetchUser();
    fetchDecks();

    const timer = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const deckCompletion = 85;
  const categories = ["All", "Research", "Creative", "Strategy", "Management", "Analytics"];
  
  const filteredTools = selectedToolCategory === "All" 
    ? mockTools 
    : mockTools.filter(tool => tool.category === selectedToolCategory);

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      const currentTime = new Date().toISOString();
      setChatMessages([
        ...chatMessages,
        { sender: "You", message, timestamp: currentTime },
      ]);
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: "AI",
            message: "Great! Which pitch deck section needs assistance?",
            timestamp: new Date().toISOString(),
          },
        ]);
      }, 500);
      setMessage("");
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
      transition: { duration: 0.2, ease: "easeOut" } 
    },
  };

  const statsVariants = {
    hidden: { scale: 0, opacity: 0 },
    show: { 
      scale: 1, 
      opacity: 1, 
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 20, 
        delay: 0.2 
      } 
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 text-gray-800 dark:text-gray-100 relative overflow-hidden">
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
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
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

        {/* Stats Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <motion.div variants={statsVariants}>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden border border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Decks</p>
                    <motion.p 
                      className="text-3xl font-bold text-indigo-600"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    >
                      {totalDecks}
                    </motion.p>
                  </div>
                  <motion.div
                    className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Presentation className="w-6 h-6 text-indigo-600" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={statsVariants}>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden border border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
                    <motion.p 
                      className="text-3xl font-bold text-green-600"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                    >
                      {deckCompletion}%
                    </motion.p>
                  </div>
                  <motion.div
                    className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full"
                    whileHover={{ scale: 1.1 }}
                  >
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={statsVariants}>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden border border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Views This Month</p>
                    <motion.p 
                      className="text-3xl font-bold text-purple-600"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                    >
                      2.4k
                    </motion.p>
                  </div>
                  <motion.div
                    className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Eye className="w-6 h-6 text-purple-600" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={statsVariants}>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden border border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Shares</p>
                    <motion.p 
                      className="text-3xl font-bold text-orange-600"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                    >
                      347
                    </motion.p>
                  </div>
                  <motion.div
                    className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-full"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Share2 className="w-6 h-6 text-orange-600" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Tools Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden border border-white/20">
            <CardHeader className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800/80 dark:to-blue-900/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="text-2xl font-bold flex items-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
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
                        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 relative">
                          {tool.isNew && (
                            <motion.div
                              className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
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
                                <IconComponent className="w-7 h-7 text-white" />
                                <motion.div
                                  className="absolute inset-0 bg-white/20 rounded-2xl"
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={hoveredTool === tool.id ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
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
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden border border-white/20">
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
                      className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="p-6 relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <motion.span
                            className={`w-3 h-3 rounded-full ${
                              index % 3 === 0 ? "bg-green-500" : index % 3 === 1 ? "bg-yellow-500" : "bg-purple-500"
                            }`}
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
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
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600 dark:text-gray-400 font-medium">Completion</span>
                            <span className="font-bold text-gray-800 dark:text-gray-200">
                              {deckCompletion}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${deckCompletion}%` }}
                              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(project.created_at).toLocaleDateString()}</span>
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              size="sm"
                              className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-4 py-2 font-semibold shadow-lg"
                              onClick={() => router.push(`/pitchdeck/${project.id}`)}
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
                <motion.div 
                  className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800/50 dark:to-blue-900/20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    No projects yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Start creating your first pitch deck and unlock the power of AI-driven presentations.
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
      <motion.div
        className={`fixed bottom-0 right-0 w-full sm:w-96 transition-all duration-500 ${
          chatOpen ? "translate-y-0" : "translate-y-full"
        } h-[400px] sm:h-[500px] z-50`}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: chatOpen ? 0 : 100, opacity: chatOpen ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <Card className="bg-white dark:bg-gray-800 shadow-2xl rounded-t-2xl h-full flex flex-col border-t border-gray-200 dark:border-gray-700 backdrop-blur-lg">
          <CardHeader className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800/80 dark:to-purple-900/20 flex-shrink-0 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  <MessageCircle className="w-6 h-6 mr-3 text-indigo-500" />
                </motion.div>
                AI Assistant
                <motion.div
                  className="ml-2 w-3 h-3 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </CardTitle>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setChatOpen(false)}
                  aria-label="Close chat"
                >
                  <X className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-800">
            <div className="space-y-4">
              <AnimatePresence>
                {chatMessages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-sm font-medium shadow-lg ${
                        msg.sender === "You"
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                          : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600"
                      }`}
                    >
                      <p className="leading-relaxed">{msg.message}</p>
                      <p className={`text-xs mt-2 ${
                        msg.sender === "You" ? "text-white/70" : "text-gray-500"
                      }`}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
          <div className="p-4 border-t border-gray-200 dark:border-gray-600 flex-shrink-0 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <Input
                type="text"
                placeholder="Ask about your pitch deck..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 border-0 shadow-inner"
                aria-label="Type your message"
              />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl p-3 shadow-lg"
                  onClick={handleSendMessage}
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Chat Toggle Button */}
      <motion.div
        className={`z-50 fixed bottom-24 right-6 transition-all duration-300 ${
          chatOpen ? "opacity-0 pointer-events-none scale-90" : "opacity-100 scale-100"
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full p-4 shadow-2xl relative overflow-hidden group"
          onClick={() => setChatOpen(true)}
          aria-label="Open AI chat"
        >
          <div className="absolute inset-0 bg-white/20 transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full" />
          <MessageCircle className="w-7 h-7 relative z-10" />
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </Button>
      </motion.div>
    </div>
  );
}