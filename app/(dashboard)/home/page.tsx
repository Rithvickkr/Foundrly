"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

import {
  MessageCircle,
  Send,
  X,
  FileText,
  Star,
  Brain,
  Book,
  ArrowRight,
  Sparkles,
  Zap,
  Clock,
  ChevronRight,
  BarChart,
  Activity,
  Lightbulb,
  ThumbsUp,
  MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Expandable,
  ExpandableCard,
  ExpandableCardContent,
  ExpandableCardFooter,
  ExpandableCardHeader,
  ExpandableContent,
  ExpandableTrigger,
} from "@/components/ui/expandable";
import { getDecks } from "@/lib/actions/getdecks";
import type { PitchDeckResponseDetails } from "@/lib/actions/getdecks";
import { useExpandable } from "@/components/ui/expandable";
import { getUser } from "@/lib/actions/getuser";

export default function DashboardHome() {
  const [userName, setUserName] = useState("user");
  const [chatOpen, setChatOpen] = useState(false);
  const [recentDecks, setRecentDecks] = useState<PitchDeckResponseDetails[]>([]);
  const [activeTab, setActiveTab] = useState("insights");
  const [showWelcome, setShowWelcome] = useState(true);
  const [totalDecks, setTotalDecks] = useState(0);
  const isExpanded = useExpandable();


  const [chatMessages, setChatMessages] = useState([
    {
      sender: "AI",
      message:
        "Hi there! I'm your AI pitch assistant. Need help with your investor deck?",
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
        console.log(decks);
        setTotalDecks(decks.length);
        // Sort decks by created_at date in descending order and get the latest 4
        const sortedDecks = [...decks].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setRecentDecks(sortedDecks.slice(0, 4));
      } else {
        console.error("Failed to fetch decks");
      }
    };
    fetchUser();
    fetchDecks();

    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const deckCompletion = 85;

  const aiInsights = [
    {
      title: "Value Proposition",
      description:
        "Your pitch needs a clearer unique value proposition to stand out to investors.",
      icon: <ThumbsUp className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />,
      action: "Enhance Now",
      importance: "high",
    },
    {
      title: "Financial Projections",
      description:
        "Add detailed 3-year revenue models backed by market research.",
      icon: <BarChart className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />,
      action: "Review Models",
      importance: "medium",
    },
    {
      title: "Competitor Analysis",
      description:
        "Your competitive landscape section needs more differentiation points.",
      icon: <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />,
      action: "Update Analysis",
      importance: "high",
    },
  ];

  const learningResources = [
    {
      title: "Pitch Deck Essentials",
      description:
        "Master the 10 key slides every successful investor pitch includes.",
      readTime: "5 min read",
      category: "Fundamentals",
    },
    {
      title: "AI-Powered Pitch Tips",
      description:
        "Learn how to leverage AI to create compelling investment narratives.",
      readTime: "8 min read",
      category: "Advanced",
    },
    {
      title: "Investor Psychology Guide",
      description:
        "Understand what VCs look for and how to address their concerns.",
      readTime: "10 min read",
      category: "Psychology",
    },
  ];

  const recentActivity = [
    {
      action: "Updated financial projections",
      project : "SaaS Platform Pitch",
      time: "2 hours ago",
    },
    {
      action: "Created new pitch deck",
      project: "Mobile App Venture",
      time: "Yesterday",
    },
    {
      action: "Received AI feedback",
      project: "E-commerce Solution",
      time: "3 days ago",
    },
  ];

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      const currentTime = new Date().toISOString();

      setChatMessages([
        ...chatMessages,
        { sender: "You", message, timestamp: currentTime },
      ]);

      setTimeout(() => {
        setChatMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: "AI",
            message:
              "I can help with that! Which specific section of your pitch deck are you working on?",
            timestamp: new Date().toISOString(),
          },
        ]);
      }, 700);

      setMessage("");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-blue-950 text-gray-800 dark:text-gray-100 transition-colors duration-200 overflow-x-hidden">
      <div className="pt-4 md:pt-8 pb-20 px-4 sm:px-6 lg:px-8 max-w-[96%] sm:max-w-7xl mx-auto space-y-6 md:space-y-8">
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.4 }}
              className="relative"
            >
              <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-800 backdrop-blur-lg shadow-lg border-none rounded-2xl overflow-hidden">
                <Button
                  variant="ghost"
                  className="absolute top-2 right-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1"
                  onClick={() => setShowWelcome(false)}
                  aria-label="Close welcome banner"
                >
                  <X className="w-4 h-4" />
                </Button>
                <CardContent className="px-4 sm:px-6 md:px-8 py-6 md:py-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4 w-full">
                    <div className="bg-white/20 p-2 sm:p-3 rounded-full flex-shrink-0">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
                        Welcome back, {userName}!
                      </h2>
                      <p className="text-sm sm:text-base text-white/80 mt-1">
                        Ready to create investor-ready pitches with AI assistance
                      </p>
                    </div>
                  </div>
                  <Button
                    className="bg-white text-indigo-700 hover:bg-white/90 rounded-lg px-4 py-2 text-sm font-medium w-full sm:w-auto"
                    onClick={() => router.push("/createpitchdeck")}
                  >
                    New Pitch Deck
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        >
          {[
            {
              title: "Active Projects",
              value: totalDecks || 0,
              icon: (
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              ),
              bg: "bg-blue-100 dark:bg-blue-900/30",
            },
            {
              title: "AI Generated Sections",
              value: 14,
              icon: (
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
              ),
              bg: "bg-indigo-100 dark:bg-indigo-900/30",
            },
            {
              title: "Latest Pitch Score",
              value: "9.2/10",
              icon: (
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
              ),
              bg: "bg-purple-100 dark:bg-purple-900/30",
            },
          ].map((stat, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="bg-white dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200/60 dark:border-gray-700/60 shadow-sm rounded-xl hover:shadow-md transition-all duration-200 overflow-hidden h-full">
                <CardContent className="p-4 sm:p-5 flex items-center">
                  <div
                    className={`${stat.bg} p-2 sm:p-3 rounded-xl mr-3 sm:mr-4 flex-shrink-0`}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <h4 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100">
                      {stat.value}
                    </h4>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.3 }}
        >
          <Card className="relative bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-800 border-none shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="relative px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 flex flex-col lg:flex-row items-start lg:items-center justify-between z-10 space-y-6 lg:space-y-0">
              <div className="mb-0 lg:mr-8 w-full">
                <div className="inline-flex items-center bg-white/20 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm text-white mb-3">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span>AI-Powered Creation</span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                  Create your next investor-winning pitch deck in minutes
                </h2>
                <p className="text-sm sm:text-base text-white/80 mt-2 max-w-lg">
                  Our AI analyzes thousands of successful pitch decks to help you
                  craft presentations that resonate with investors and secure
                  funding.
                </p>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mt-4 sm:mt-6">
                  <Button
                    onClick={() => router.push("/createpitchdeck")}
                    className="bg-white hover:bg-white/90 text-indigo-700 dark:text-indigo-700 rounded-xl px-4 sm:px-6 py-2 text-sm font-medium transition-all duration-200 hover:shadow-lg flex items-center gap-2 w-full sm:w-auto"
                    aria-label="Start New Pitch Deck"
                  >
                    Start New Pitch Deck
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/30 hover:border-white/60 bg-transparent hover:bg-white/10 text-white rounded-xl px-4 sm:px-6 py-2 text-sm font-medium transition-all duration-200 w-full sm:w-auto"
                    onClick={() => router.push("/templates")}
                    aria-label="Browse Templates"
                  >
                    Browse Templates
                  </Button>
                </div>
              </div>
              <div className="hidden lg:block relative w-full lg:w-auto">
                <div className="w-32 sm:w-40 h-32 sm:h-40 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-2xl flex items-center justify-center p-4 sm:p-5 rotate-6 shadow-xl mx-auto lg:mx-0">
                  <Brain className="w-16 sm:w-20 h-16 sm:h-20 text-white/80" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <motion.div
            className="lg:col-span-2"
            variants={itemVariants}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200/60 dark:border-gray-700/60 shadow-md rounded-xl overflow-hidden">
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-700/60 bg-gray-50/80 dark:bg-gray-800/80">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                    Your Recent Projects
                  </CardTitle>
                  <Button
                    variant="ghost"
                    className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg text-sm font-medium flex items-center"
                    onClick={() => router.push("/decks")}
                    aria-label="View All Projects"
                  >
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-5 py-4">
                {recentDecks && recentDecks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 py-4">
                    {recentDecks.map((project, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <Expandable
                          expandDirection="both"
                          expandBehavior="push"
                          initialDelay={0.2}
                          onExpandStart={() =>
                            console.log("Expanding meeting card...")
                          }
                          onExpandEnd={() =>
                            console.log("Meeting card expanded!")
                          }
                        >
                          {({ isExpanded }) => (
                            <ExpandableTrigger className="flex items-center">
                              <ExpandableCard
                                className="relative dark:bg-gray-800/80 rounded-xl overflow-hidden w-full"
                                collapsedSize={{ width: 400, height: 220 }}
                                expandedSize={{ width: 450, height: 480 }}
                                hoverToExpand={true}
                                expandDelay={200}
                                collapseDelay={200}
                              >
                                <ExpandableCardHeader className="p-4 sm:p-5 bg-white/70 dark:bg-gray-800/80 backdrop-blur-lg rounded-t-xl">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <div className="flex items-center">
                                        <span
                                          className={`w-2 h-2 rounded-full mr-2 ${
                                            index % 3 === 0
                                              ? "bg-green-500"
                                              : index % 3 === 1
                                              ? "bg-yellow-500"
                                              : "bg-purple-500"
                                          }`}
                                        ></span>
                                        <span className="text-xs uppercase font-medium text-gray-500 dark:text-gray-400">
                                          {project.industry || "Technology"}
                                        </span>
                                      </div>
                                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 line-clamp-1">
                                        {project.title}
                                      </h3>
              
                                    </div>
                                  </div>
                                </ExpandableCardHeader>
                                <ExpandableCardContent className="px-4 sm:px-5 py-3">
                                  <div className="flex flex-col space-y-4">
                                    <div className="flex flex-col space-y-1">
                                      <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-gray-600 dark:text-black">
                                          Completion
                                        </span>
                                        <span className="font-medium text-gray-800 dark:text-gray-200">
                                          {deckCompletion}%
                                        </span>
                                      </div>
                                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
                                          style={{
                                            width: `${deckCompletion}%`,
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                    
                                    <ExpandableContent preset="blur-md">
                                      <div className=" grid grid-cols-2 gap-3 mt-2  p-5 bg-gray-50/70 dark:bg-gray-800/80 rounded-lg">
                                        <div className="flex flex-col items-center  justify-center bg-gray-100/70 dark:bg-gray-700/40 rounded-lg p-2 sm:p-3">
                                          
                                          <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                            {project.target_market ||
                                              "Enterprise"}
                                          </p>
                                        </div>
                                        <div className="flex flex-col items-center bg-gray-100/70 dark:bg-gray-700/40 rounded-lg p-2 sm:p-3">
                                          
                                          <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                            {project.startup_stage || "Seed"}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="dark:bg-gray-400 flex flex-col items-center justify-between mt-3 p-3 pb-5 rounded-lg">
                                        <p className="text-xs sm:text-sm font-medium dark:text-gray-800 text-black">
                                          Project Description
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-black mt-1 line-clamp-2">
                                          {project.description}
                                        </p>
                                      </div>
                                      <div className="bg-gray-400 flex items-center justify-between mt-3">
                                        <p> 
                                          <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">
                                            {}
                                          </span>
                                        </p>
                                      </div>
                                     
                                      
                                    </ExpandableContent>
                                  </div>
                                </ExpandableCardContent>
                                <ExpandableContent preset="slide-up">
                                  <ExpandableCardFooter className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/80 backdrop-blur-lg rounded-b-xl">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-2" />
                                        <span>
                                          Updated on {new Date(project.created_at).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <Button
                                        size="sm"
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs px-3 py-1"
                                        onClick={() =>
                                          router.push(
                                            `/pitchdeck/${project.id}`
                                          )
                                        }
                                        aria-label="Edit Project"
                                      >
                                        Edit Deck
                                      </Button>
                                    </div>
                                  </ExpandableCardFooter>
                                </ExpandableContent>
                              </ExpandableCard>
                            </ExpandableTrigger>
                          )}
                        </Expandable>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                    <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                      No projects yet
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-4">
                      Create your first pitch deck with our AI-powered tools
                    </p>
                    <Button
                      onClick={() => router.push("/createpitchdeck")}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm px-4 py-2"
                    >
                      Create First Deck
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            className="space-y-6"
            variants={itemVariants}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-white dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200/60 dark:border-gray-700/60 shadow-md rounded-xl overflow-hidden">
              <CardHeader className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-700/60 bg-gray-50/80 dark:bg-gray-800/90">
                <CardTitle className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-100 flex items-center">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-gray-600 dark:text-gray-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-2 sm:space-x-3"
                  >
                    <div
                      className={`w-2 h-2 mt-1 rounded-full ${
                        index === 0
                          ? "bg-green-500"
                          : index === 1
                          ? "bg-blue-500"
                          : "bg-purple-500"
                      }`}
                    ></div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">
                        {activity.action}
                      </p>
                      <div className="flex items-center mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.project}
                        </p>
                        <span className="mx-1 text-gray-300 dark:text-gray-600">
                          •
                        </span>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200/60 dark:border-gray-700/60 shadow-md rounded-xl overflow-hidden">
              <CardHeader className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-700/60 bg-gray-50/80 dark:bg-gray-800/90">
                <div className="flex flex-wrap gap-1">
                  <Button
                    variant={activeTab === "insights" ? "default" : "ghost"}
                    className={`rounded-lg text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 ${
                      activeTab === "insights"
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                        : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                    onClick={() => setActiveTab("insights")}
                  >
                    <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                    AI Insights
                  </Button>
                  <Button
                    variant={activeTab === "learning" ? "default" : "ghost"}
                    className={`rounded-lg text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 ${
                      activeTab === "learning"
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                        : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                    onClick={() => setActiveTab("learning")}
                  >
                    <Book className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                    Learning
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <AnimatePresence mode="wait">
                  {activeTab === "insights" ? (
                    <motion.div
                      key="insights"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2 sm:space-y-3"
                    >
                      {aiInsights.map((insight, index) => (
                        <div
                          key={index}
                          className={`p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 ${
                            insight.importance === "high"
                              ? "border-l-red-500"
                              : "border-l-yellow-500"
                          } hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors duration-200`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                                <Lightbulb className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5 text-indigo-500" />
                                {insight.title}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {insight.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="learning"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2 sm:space-y-3"
                    >
                      {learningResources.map((resource, index) => (
                        <div
                          key={index}
                          className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors duration-200 cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center">
                                <span className="text-xs font-medium px-1.5 sm:px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">
                                  {resource.category}
                                </span>
                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                  {resource.readTime}
                                </span>
                              </div>
                              <h4 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1 sm:mt-1.5">
                                {resource.title}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {resource.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <div
        className={`fixed bottom-4 right-2 sm:right-4 w-[calc(100%-16px)] sm:w-full max-w-xs sm:max-w-sm transition-transform duration-300 ${
          chatOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700/60 bg-gray-50/80 dark:bg-gray-800/90">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-indigo-600 dark:text-indigo-400" />
                Chat with AI
              </CardTitle>
              <Button
                variant="ghost"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 sm:p-2"
                onClick={() => setChatOpen(!chatOpen)}
                aria-label="Toggle chat"
              >
                {chatOpen ? (
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            <div className="max-h-[250px] sm:max-h-[300px] overflow-y-auto space-y-2 sm:space-y-3">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.sender === "You" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base ${
                      msg.sender === "You"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
                    }`}
                  >
                    <p>{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center mt-2 sm:mt-3">
              <Input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-grow bg-gray-100 dark:bg-gray-700 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition duration-200"
                aria-label="Type your message"
              />
              <Button
                className="ml-1 sm:ml-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-sm"
                onClick={handleSendMessage}
                aria-label="Send message"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}