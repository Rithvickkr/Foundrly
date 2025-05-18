"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { MessageCircle, Send, X, FileText, Star, Brain, Book, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardHome() {
  const [userName, setUserName] = useState("Rithvick");
  const [chatOpen, setChatOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: "AI", message: "Welcome! Need help crafting your pitch deck?" },
  ]);
  const [message, setMessage] = useState("");
  const router = useRouter();

  // Sample data
  const recentProjects = [
    { title: "AI Startup", lastEdited: "Feb 26, 2025", status: "Draft" },
    { title: "FinTech Revolution", lastEdited: "Feb 25, 2025", status: "AI-Generated" },
    { title: "HealthTech Vision", lastEdited: "Feb 24, 2025", status: "Published" },
  ];

  const aiInsights = [
    { title: "Optimize Your Value Proposition", description: "AI suggests clarifying your unique value to attract investors." },
    { title: "Enhance Financial Projections", description: "Add detailed revenue models to strengthen your pitch." },
    { title: "Competitor Analysis", description: "Include a competitive landscape slide to stand out." },
  ];

  const learningHub = [
    { title: "Pitch Deck Essentials", description: "Master the key slides every investor expects." },
    { title: "AI-Powered Pitch Tips", description: "Leverage AI to create compelling narratives." },
    { title: "Investor Pitch Guide", description: "Learn how to present with confidence." },
  ];

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      setChatMessages([...chatMessages, { sender: "You", message }]);
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-950 dark:bg-gradient-to-br dark:from-gray-900 dark:to-blue-950 text-gray-100">
     

      {/* Main Content */}
      <div className="pt-20 pb-8 px-4 sm:px-8 max-w-5xl mx-auto space-y-12">
        {/* Welcome Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Card className="bg-gray-800 backdrop-blur-lg border-gray-700 shadow-md rounded-2xl">
            <CardHeader className="px-8 py-8 text-center">
              <CardTitle className="text-4xl font-bold text-gray-100 flex items-center justify-center">
                <Star className="w-8 h-8 mr-3 text-indigo-600" />
                Welcome, {userName}!
              </CardTitle>
              <p className="text-base text-gray-400 mt-2">Let’s craft your next investor-ready pitch deck with AI.</p>
            </CardHeader>
            <CardContent className="px-8 py-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => router.push("/createpitchdeck")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 py-3 text-base font-medium transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-indigo-500"
                aria-label="Start New Pitch Deck"
              >
                Start New Pitch Deck
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 bg-gray-700 text-gray-100 hover:bg-gray-600 rounded-lg px-6 py-3 text-base font-medium transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                onClick={() => router.push("/projects")}
                aria-label="View My Projects"
              >
                View My Projects
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Pitch Generator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          <Card className="bg-gray-800 backdrop-blur-lg border-gray-700 shadow-md rounded-2xl hover:shadow-lg transition-all duration-200">
            <CardHeader className="px-8 py-8">
              <CardTitle className="text-2xl font-semibold text-gray-100 flex items-center">
                <Brain className="w-6 h-6 mr-2 text-indigo-600" />
                AI Pitch Generator
              </CardTitle>
              <p className="text-base text-gray-400 mt-2">Create investor-ready pitch decks in minutes with our AI-powered tool.</p>
            </CardHeader>
            <CardContent className="px-8 py-8">
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 py-3 text-base font-medium transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-indigo-500"
                onClick={() => router.push("/createpitchdeck")}
                aria-label="Generate Pitch Deck Now"
              >
                Generate Pitch Deck Now
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Your Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          <Card className="bg-gray-800 backdrop-blur-lg border-gray-700 shadow-md rounded-2xl hover:shadow-lg transition-all duration-200">
            <CardHeader className="px-8 py-8">
              <CardTitle className="text-2xl font-semibold text-gray-100 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-teal-500" />
                Your Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentProjects.map((project, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-700 rounded-lg border border-gray-700 hover:bg-gray-600 hover:-translate-y-1 transition-all duration-200"
                >
                  <h4 className="text-base font-semibold text-gray-100">{project.title}</h4>
                  <p className="text-sm text-gray-400 mt-1">Last Edited: {project.lastEdited}</p>
                  <p className="text-sm text-gray-400 mt-1">Status: {project.status}</p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-700 bg-gray-700 text-gray-100 hover:bg-gray-600 rounded-lg"
                      aria-label={`Edit ${project.title}`}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-100 hover:bg-gray-600 rounded-lg"
                      aria-label={`View ${project.title}`}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        

        {/* AI Chat Assistant */}
        <div className="fixed bottom-6 right-6 z-30">
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-indigo-500"
            onClick={() => setChatOpen(!chatOpen)}
            aria-label={chatOpen ? "Close AI Chat" : "Open AI Chat"}
          >
            {chatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
          </Button>
          <AnimatePresence>
            {chatOpen && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="absolute bottom-16 right-0 w-80 sm:w-96 bg-gray-800 backdrop-blur-lg border-gray-700 shadow-xl rounded-2xl max-h-96">
                  <CardHeader className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-100">
                      AI Assistant 🤖
                    </CardTitle>
                    <Button
                      variant="ghost"
                      className="text-gray-100 hover:bg-gray-700 rounded-full p-1"
                      onClick={() => setChatOpen(false)}
                      aria-label="Close AI Chat"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-6 h-64 overflow-y-auto space-y-4">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg text-base ${
                          msg.sender === "AI" ? "bg-gray-700" : "bg-indigo-900/50"
                        }`}
                      >
                        <strong className="text-gray-100">{msg.sender}: </strong>
                        <span className="text-gray-100">{msg.message}</span>
                      </div>
                    ))}
                  </CardContent>
                  <div className="flex gap-2 p-6 border-t border-gray-700">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask AI about your pitch deck..."
                      className="bg-gray-800 border-gray-700 text-gray-100 focus:ring-2 focus:ring-indigo-500"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendMessage();
                      }}
                      aria-label="Type your message to AI"
                    />
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-2"
                      onClick={handleSendMessage}
                      aria-label="Send message to AI"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}