"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, FileText, ChevronDown, ChevronUp, BarChart3, PieChart, Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  fetchGeneratedPitch,
  PitchDeckRequest,
  PitchDeckResponse,
} from "@/lib/actions/getaipitch";
import { getAuthToken } from "@/lib/actions/getauthtoken";
import { toast } from "@/components/use-toast";

interface PitchDeck {
  id: string;
  title: string;
  description: string;
  industry: string;
  startup_stage: string;
  target_market: string;
}

interface PitchSection {
  title: string;
  content: string;
  isMainHeading?: boolean;
}

export default function PitchDeckDetail() {
  const router = useRouter();
  const { pitchid: id } = useParams();
  const [loading, setLoading] = useState(true);
  const [pitchDeck, setPitchDeck] = useState<PitchDeck | null>(null);
  const [aiContent, setAiContent] = useState<PitchDeckResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [competitorLoading, setCompetitorLoading] = useState(false);
  const [financialLoading, setFinancialLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const ids = Array.isArray(id) ? id[0] : id;
    if (!ids) {
      console.error("Pitch Deck ID is missing!");
      return;
    }

    const fetchPitchDeck = async () => {
      try {
        const token = await getAuthToken();
        if (!token) throw new Error("User not authenticated");

        const response = await fetch(`http://127.0.0.1:8000/pitchdecks/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch pitch deck");

        const data: PitchDeck = await response.json();
        setPitchDeck(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPitchDeck();
  }, [id]);

  const handleGenerateAIContent = async () => {
    if (!pitchDeck) return;

    setAiLoading(true);
    const pitchRequest: PitchDeckRequest = {
      title: pitchDeck.title,
      description: pitchDeck.description,
      industry: pitchDeck.industry,
      startup_stage: pitchDeck.startup_stage,
      target_market: pitchDeck.target_market,
    };

    try {
      const generatedData = await fetchGeneratedPitch(pitchRequest);
      setAiContent(generatedData);
      toast({ title: "Success", description: "AI insights generated successfully!", variant: "default" });
    } catch (error) {
      console.error("Error generating AI content:", error);
      toast({ title: "Error", description: "Failed to generate AI insights.", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateAIEnhancement = async (type: 'competitor' | 'financial') => {
    if (!pitchDeck) return;

    const setLoading = {
      competitor: setCompetitorLoading,
      financial: setFinancialLoading,
    }[type];

    setLoading(true);
    const pitchRequest: PitchDeckRequest = {
      title: pitchDeck.title,
      description: pitchDeck.description,
      industry: pitchDeck.industry,
      startup_stage: pitchDeck.startup_stage,
      target_market: pitchDeck.target_market,
    };

    try {
      const generatedData = await fetchGeneratedPitch(pitchRequest); // Mocked; adjust for specific enhancement
      setAiContent(generatedData); // Update with specific enhancement data
      toast({ title: "Success", description: `${type.charAt(0).toUpperCase() + type.slice(1)} analysis generated!`, variant: "default" });
    } catch (error) {
      console.error(`Error generating ${type} analysis:`, error);
      toast({ title: "Error", description: `Failed to generate ${type} analysis.`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSlideContent = () => {
    if (!pitchDeck) return;

    // Navigate to /testingpage/[id] with pitch deck details as query parameters
    router.push(
      `/Slideplayground/${id}?${new URLSearchParams({
        title: pitchDeck.title,
        description: pitchDeck.description,
        industry: pitchDeck.industry,
        startup_stage: pitchDeck.startup_stage,
        target_market: pitchDeck.target_market,
      }).toString()}`
    );
  };

  const parseAIResponse = (content: PitchDeckResponse): PitchSection[] => {
    const text = content.generated_pitch || "";
    const sections: PitchSection[] = [];
    
    const regex = /\*\*(.*?)\*\*\s*([^**]*?(?=\*\*|$))/g;
    let match;
    let isFirst = true;

    while ((match = regex.exec(text)) !== null) {
      const title = match[1].trim();
      const content = match[2].trim();
      
      if (title && content) {
        sections.push({
          title,
          content,
          isMainHeading: isFirst,
        });
        isFirst = false;
      }
    }

    if (sections.length === 0 && text) {
      sections.push({
        title: "Pitch Summary",
        content: text,
        isMainHeading: true,
      });
    }

    return sections;
  };

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-950 dark:bg-gradient-to-br dark:from-gray-900 dark:to-blue-950 px-4">
        <Card className="bg-gray-800 backdrop-blur-sm border-gray-700 shadow-xl w-full max-w-md">
          <CardContent className="p-10 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin w-14 h-14 text-indigo-600" />
            <p className="text-lg font-medium text-gray-400">Loading Pitch Deck...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!pitchDeck) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-950 dark:bg-gradient-to-br dark:from-gray-900 dark:to-blue-950 px-4">
        <Card className="bg-gray-800 backdrop-blur-sm border-gray-700 shadow-xl w-full max-w-md">
          <CardContent className="p-10 text-center flex flex-col gap-6">
            <p className="text-xl font-semibold text-red-400">Pitch Deck Not Found</p>
            <Button
              onClick={() => router.push("/")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-base font-medium transition-all duration-200 hover:scale-105 shadow-indigo-500/50"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-8 lg:px-8 bg-gradient-to-br from-gray-900 to-blue-950 dark:bg-gradient-to-br dark:from-gray-900 dark:to-blue-950 text-gray-100">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="bg-gray-700 border-gray-700 text-gray-100 hover:bg-gray-600 rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-indigo-500"
                  aria-label="Back to Dashboard"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Dashboard
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-gray-100 border-gray-700">
                <p>Return to the main dashboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-indigo-500 shadow-indigo-500/50"
                  onClick={() => handleGenerateAIEnhancement('competitor')}
                  disabled={competitorLoading}
                  aria-label={competitorLoading ? "Generating Competitor Analysis" : "Generate Competitor Analysis"}
                >
                  {competitorLoading ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5 mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Competitor Analysis
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-gray-100 border-gray-700">
                <p>Generate AI-driven competitor analysis</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-indigo-500 shadow-indigo-500/50"
                  onClick={() => handleGenerateAIEnhancement('financial')}
                  disabled={financialLoading}
                  aria-label={financialLoading ? "Generating Financial Projections" : "Generate Financial Projections"}
                >
                  {financialLoading ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5 mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <PieChart className="w-5 h-5 mr-2" />
                      Financial Projections
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-gray-100 border-gray-700">
                <p>Generate AI-driven financial forecasts</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-indigo-500 shadow-indigo-500/50"
                  onClick={handleSlideContent}
                  aria-label="Generate Slide Content"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Slide Content
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-gray-100 border-gray-700">
                <p>Generate AI-driven slide content</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-indigo-500 shadow-indigo-500/50"
                  onClick={handleGenerateAIContent}
                  disabled={aiLoading}
                  aria-label={aiLoading ? "Generating AI Insights" : "Generate AI Insights"}
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5 mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5 mr-2" />
                      Generate AI Insights
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-gray-100 border-gray-700">
                <p>Generate comprehensive AI-driven pitch insights</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>

        <AnimatePresence>
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-12"
          >
            {/* Pitch Deck Overview */}
            <Card className="bg-gray-800 backdrop-blur-sm border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
              <CardHeader className="border-b border-gray-700 px-6 py-8 sm:px-8">
                <CardTitle className="text-3xl sm:text-4xl font-bold text-gray-100 flex items-center">
                  <FileText className="w-8 h-8 mr-3 text-indigo-600" />
                  {pitchDeck.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-8 sm:px-8 grid gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-xl font-semibold mb-3 text-gray-100">Industry</h3>
                    <p className="text-base text-gray-400 leading-relaxed">{pitchDeck.industry}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="text-xl font-semibold mb-3 text-gray-100">Stage</h3>
                    <p className="text-base text-gray-400 leading-relaxed">{pitchDeck.startup_stage}</p>
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-xl font-semibold mb-3 text-gray-100">Description</h3>
                  <p className="text-base text-gray-400 leading-relaxed">{pitchDeck.description}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-xl font-semibold mb-3 text-gray-100">Target Market</h3>
                  <p className="text-base text-gray-400 leading-relaxed">{pitchDeck.target_market}</p>
                </motion.div>
              </CardContent>
            </Card>

            {/* AI-Generated Content */}
            {aiContent && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Card className="bg-gray-800 backdrop-blur-sm border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
                  <CardHeader className="border-b border-gray-700 px-6 py-8 sm:px-8">
                    <CardTitle className="text-2xl sm:text-3xl font-semibold text-gray-100">
                      AI-Generated Pitch Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 py-8 sm:px-8 grid gap-8">
                    {parseAIResponse(aiContent).map((section, index) => (
                      <motion.div
                        key={section.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.7, duration: 0.4 }}
                        className="border-l-4 border-indigo-600 pl-4 sm:pl-6"
                      >
                        <button
                          onClick={() => toggleSection(section.title)}
                          className="w-full flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-indigo-600 rounded-lg"
                          aria-expanded={expandedSections[section.title] || section.isMainHeading}
                          aria-controls={`section-${index}`}
                        >
                          {section.isMainHeading ? (
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-4">{section.title}</h2>
                          ) : (
                            <h3 className="text-xl sm:text-2xl font-semibold text-gray-100 mb-3">{section.title}</h3>
                          )}
                          {!section.isMainHeading && (
                            <span className="text-indigo-600">
                              {expandedSections[section.title] ? (
                                <ChevronUp className="w-6 h-6" />
                              ) : (
                                <ChevronDown className="w-6 h-6" />
                              )}
                            </span>
                          )}
                        </button>
                        {(expandedSections[section.title] || section.isMainHeading) && (
                          <motion.p
                            id={`section-${index}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-base text-gray-400 leading-relaxed"
                          >
                            {section.content}
                          </motion.p>
                        )}
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.section>
            )}
          </motion.section>
        </AnimatePresence>
      </div>
    </div>
  );
}