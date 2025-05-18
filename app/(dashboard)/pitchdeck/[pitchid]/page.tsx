"use client";

import React, { useState, useEffect, useRef, useCallback, memo, use } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  ArrowLeft,
  FileText,
  BarChart3,
  Sparkles,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Save,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  fetchGeneratedPitch,
  PitchDeckRequest,
} from "@/lib/actions/getaipitch";
import { getAuthToken } from "@/lib/actions/getauthtoken";
import { toast } from "@/components/use-toast";
import { fetchCompanalysis } from "@/lib/actions/getcompanalysis";

// Define interfaces for better TypeScript support
interface PitchDeck {
  id: string;
  title: string;
  description: string;
  industry: string;
  startup_stage: string;
  target_market: string;
}

interface PitchDeckResponse {
  generatedcontent?: string;
  competitor_analysis?: string;
  validation_score?: number;
  reasoning?: string[];
  [key: string]: string | number | string[] | undefined;
}

interface ContentSectionItem {
  type: "paragraph" | "bulletList";
  content: string | string[];
}

interface ContentSection {
  type: "section";
  header: string;
  children: ContentSectionItem[];
}

interface TypewriterProps {
  text: string;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}

// Memoized TypewriterText for better performance
const TypewriterText = memo(
  ({ text, delay = 30, className, onComplete }: TypewriterProps) => {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const words = text.split(" ").filter((word) => word);

    useEffect(() => {
      if (currentIndex < words.length) {
        const timeout = setTimeout(() => {
          setDisplayedText((prev) =>
            prev ? prev + " " + words[currentIndex] : words[currentIndex]
          );
          setCurrentIndex(currentIndex + 1);
        }, delay);
        return () => clearTimeout(timeout);
      } else if (onComplete) {
        onComplete();
      }
    }, [currentIndex, words, delay, onComplete]);

    return <span className={className}>{displayedText}</span>;
  }
);

TypewriterText.displayName = "TypewriterText";

// Memoized ActionButton for performance
const ActionButton = memo(
  ({
    onClick,
    icon,
    label,
    loading,
    disabled,
    tooltip,
  }: {
    onClick: () => void;
    icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
    label: string;
    loading?: boolean;
    disabled?: boolean;
    tooltip: string;
  }) => (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-indigo-500 shadow-indigo-500/50"
            onClick={onClick}
            disabled={disabled || loading}
            aria-label={loading ? `Generating ${label}` : label}
          >
            {loading ? (
              <>
                <Loader2
                  className="animate-spin w-5 h-5 mr-2"
                  aria-hidden="true"
                />
                <span>Generating...</span>
              </>
            ) : (
              <>
                {React.cloneElement(icon, {
                  "aria-hidden": "true",
                  className: "w-5 h-5 mr-2",
                })}
                <span>{label}</span>
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-800 text-gray-100 border-gray-700">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
);

ActionButton.displayName = "ActionButton";

// Markdown renderer component with improved parsing
const MarkdownRenderer = memo(({ content }: { content: string | string[] }) => {
  if (Array.isArray(content)) {
    return (
      <ul className="text-base text-gray-300 leading-relaxed font-light list-disc pl-6 space-y-2">
        {content.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }

  const formattedContent = content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>");

  return (
    <p
      className="text-base text-gray-300 leading-relaxed font-light"
      dangerouslySetInnerHTML={{ __html: formattedContent }}
    />
  );
});

MarkdownRenderer.displayName = "MarkdownRenderer";

// Animated section component
const ContentSectionComponent = memo(
  ({
    title,
    icon,
    sections,
    color,
    sectionRef,
  }: {
    title: string;
    icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
    sections: ContentSection[];
    color: "indigo" | "purple" | "green";
    sectionRef?: React.RefObject<HTMLDivElement | null>;
  }) => {
    const [visibleSections, setVisibleSections] = useState(0);
    const borderColor =
      color === "indigo"
        ? "border-indigo-500"
        : color === "purple"
        ? "border-purple-500"
        : "border-green-500";
    const headerColor =
      color === "indigo"
        ? "text-indigo-300"
        : color === "purple"
        ? "text-purple-300"
        : "text-green-300";
    const headerGradient =
      color === "indigo"
        ? "from-indigo-900/30"
        : color === "purple"
        ? "from-purple-900/30"
        : "from-green-900/30";
    const accentColor =
      color === "indigo"
        ? "bg-indigo-500/10"
        : color === "purple"
        ? "bg-purple-500/10"
        : "bg-green-500/10";

    const handleSectionComplete = useCallback(() => {
      setVisibleSections((prev) => prev + 1);
    }, []);

    return (
      <motion.section
        ref={sectionRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full"
      >
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-sm border-gray-700 shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 rounded-xl overflow-hidden transform hover:-translate-y-1">
          <CardHeader
            className={`border-b border-gray-700 px-6 py-8 sm:px-8 bg-gradient-to-r ${headerGradient} to-transparent`}
          >
            <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-100 flex items-center">
              {React.cloneElement(icon, {
                "aria-hidden": "true",
                className: "w-8 h-8 mr-3",
              })}
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-8 sm:px-8 grid gap-8">
            {sections.slice(0, visibleSections + 1).map((section, index) => (
              <motion.div
                key={`section-${index}-${section.header}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className={`relative bg-gray-900/50 rounded-lg p-6 border-l-4 ${borderColor} hover:bg-gray-900/70 transition-colors duration-200`}
              >
                <h3
                  className={`text-xl sm:text-2xl font-bold ${headerColor} mb-4 tracking-tight`}
                >
                  <TypewriterText
                    text={section.header || "Overview"}
                    delay={30}
                    onComplete={
                      index === visibleSections && section.children.length === 0
                        ? handleSectionComplete
                        : undefined
                    }
                  />
                </h3>
                {section.children.map((child, childIndex) => (
                  <div key={`${child.type}-${childIndex}`} className="mb-4">
                    {child.type === "paragraph" && (
                      <p className="text-base text-gray-300 leading-relaxed font-light">
                        {(child.content as string)
                          .split("\n")
                          .map((line, i, arr) => (
                            <span key={i}>
                              <TypewriterText
                                text={line}
                                delay={30}
                                onComplete={
                                  index === visibleSections &&
                                  childIndex === section.children.length - 1 &&
                                  i === arr.length - 1
                                    ? handleSectionComplete
                                    : undefined
                                }
                              />
                              {i < arr.length - 1 && <br />}
                            </span>
                          ))}
                      </p>
                    )}
                    {child.type === "bulletList" && (
                      <ul className="text-base text-gray-300 leading-relaxed font-light list-disc pl-6 space-y-2">
                        {(child.content as string[]).map((item, i) => (
                          <li key={i}>
                            <TypewriterText
                              text={item}
                              delay={30}
                              onComplete={
                                index === visibleSections &&
                                childIndex === section.children.length - 1 &&
                                i === (child.content as string[]).length - 1
                                  ? handleSectionComplete
                                  : undefined
                              }
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                <div
                  className={`absolute top-0 right-0 w-16 h-16 ${accentColor} rounded-bl-full`}
                  aria-hidden="true"
                />
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.section>
    );
  }
);

ContentSectionComponent.displayName = "ContentSection";

export default function PitchDeckDetail() {
  const router = useRouter();
  const { pitchid: id } = useParams();
  const [loading, setLoading] = useState(true);
  const [pitchDeck, setPitchDeck] = useState<PitchDeck | null>(null);
  const [aiContent, setAiContent] = useState<PitchDeckResponse | null>(null);
  const [competitorContent, setCompetitorContent] =
    useState<PitchDeckResponse | null>(null);
  const [validationContent, setValidationContent] =
    useState<PitchDeckResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [competitorLoading, setCompetitorLoading] = useState(false);
  const [validationLoading, setValidationLoading] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const aiSectionRef = useRef<HTMLDivElement>(null);
  const competitorSectionRef = useRef<HTMLDivElement>(null);
  const validationSectionRef = useRef<HTMLDivElement>(null);

  // Fetch pitch deck data
  useEffect(() => {
    const fetchPitchDeck = async () => {
      if (!id) {
        console.error("Pitch Deck ID is missing!");
        setLoading(false);
        return;
      }

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

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch pitch deck: ${response.status} - ${errorText}`
          );
        }

        const data: PitchDeck = await response.json();
        setPitchDeck(data);
      } catch (error) {
        console.error("Failed to fetch pitch deck:", error);
        toast({
          title: "Error",
          description: "Failed to load pitch deck.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPitchDeck();
  }, [id]);
   useEffect(() => {
    // Fetch previously generated content if available
    const fetchPreviousGenerations = async () => {
      if (!id) return;
      
      try {
        const token = await getAuthToken();
        if (!token) throw new Error("User not authenticated");
        
        const response = await fetch(`http://127.0.0.1:8000/get-gen/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (response.status === 404) {
          // Generation not found, which is okay
          return;
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch previous generations: ${errorText}`);
        }
        
        const data = await response.json();
        console.log("Found previous generations:", data);
        
        if (data.generation) {
          const gen = data.generation;
          
          // Set previously generated content if available
          if (gen.ai_content) {
            setAiContent({ generatedcontent: gen.ai_content });
          }
          
          if (gen.competitor_analysis) {
            setCompetitorContent({ competitor_analysis: gen.competitor_analysis });
          }
          
          if (gen.validation_score !== null) {
            setValidationContent({
              validation_score: gen.validation_score,
              reasoning: gen.validation_reasoning || []
            });
          }
        }
      } catch (error) {
        console.error("Error fetching previous generations:", error);
        // Don't show a toast here as it's not crucial for the user experience
      }
    };

    fetchPreviousGenerations();
  }, [id]); // Add dependency array with id
  
  // Scroll to AI section when content loads
  useEffect(() => {
    if (aiContent && aiSectionRef.current) {
      aiSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [aiContent]);

  // Scroll to competitor section when content loads
  useEffect(() => {
    if (competitorContent && competitorSectionRef.current) {
      competitorSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [competitorContent]);

  // Scroll to validation section when content loads
  useEffect(() => {
    if (validationContent && validationSectionRef.current) {
      validationSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [validationContent]);

  // Improved markdown parser with better section detection
  const parseAIResponse = useCallback(
    (content: PitchDeckResponse): ContentSection[] => {
      const text=content.competitor_analysis || content.generatedcontent || "";
      console.log("content yeh hai", text);
      
      if (!text) return [];

      const sections: ContentSection[] = [];
      const lines = text.split("\n").filter((line) => line.trim());
      let currentSection: ContentSection | null = null;
      let currentBullets: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        const boldHeaderMatch = line.match(/^\*\*(.*?)\*\*$/);
        const markdownHeaderMatch = line.match(/^(#{1,3})\s+(.*)$/);
        const capitalizedHeaderMatch =
          line.toUpperCase() === line && line.length < 40 && !/^\*\s/.test(line)
            ? line
            : null;

        if (boldHeaderMatch || markdownHeaderMatch || capitalizedHeaderMatch) {
          if (currentSection) {
            if (currentBullets.length) {
              currentSection.children.push({
                type: "bulletList",
                content: [...currentBullets],
              });
              currentBullets = [];
            }
            sections.push(currentSection);
          }

          currentSection = {
            type: "section",
            header: boldHeaderMatch
              ? boldHeaderMatch[1].trim()
              : markdownHeaderMatch
              ? markdownHeaderMatch[2].trim()
              : (capitalizedHeaderMatch as string),
            children: [],
          };
          continue;
        }

        const bulletMatch = line.match(/^[\*\-]\s+(.*)$/);
        if (bulletMatch) {
          currentBullets.push(bulletMatch[1].trim());

          const isLastLine = i === lines.length - 1;
          const nextLineIsNotBullet =
            !isLastLine && !lines[i + 1].match(/^[\*\-]\s+/);

          if (isLastLine || nextLineIsNotBullet) {
            if (currentSection) {
              currentSection.children.push({
                type: "bulletList",
                content: [...currentBullets],
              });
            } else {
              currentSection = {
                type: "section",
                header: "",
                children: [
                  {
                    type: "bulletList",
                    content: [...currentBullets],
                  },
                ],
              };
              sections.push(currentSection);
              currentSection = null;
            }
            currentBullets = [];
          }
          continue;
        }

        if (line.trim()) {
          if (currentBullets.length) {
            if (currentSection) {
              currentSection.children.push({
                type: "bulletList",
                content: [...currentBullets],
              });
            } else {
              sections.push({
                type: "section",
                header: "",
                children: [
                  {
                    type: "bulletList",
                    content: [...currentBullets],
                  },
                ],
              });
            }
            currentBullets = [];
          }

          if (currentSection) {
            currentSection.children.push({
              type: "paragraph",
              content: line.trim(),
            });
          } else {
            currentSection = {
              type: "section",
              header: "",
              children: [
                {
                  type: "paragraph",
                  content: line.trim(),
                },
              ],
            };
          }
        }
      }

      if (currentSection) {
        if (currentBullets.length) {
          currentSection.children.push({
            type: "bulletList",
            content: currentBullets,
          });
        }
        if (currentSection.header || currentSection.children.length) {
          sections.push(currentSection);
        }
      }

      return sections;
    },
    []
  );

  // Function to fetch validation score
  const fetchValidationScore = async (request: PitchDeckRequest) => {
    try {
      const token = await getAuthToken();
      if (!token) throw new Error("User not authenticated");

      const response = await fetch("http://127.0.0.1:8000/validator", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch validation score: ${response.status} - ${errorText}`
        );
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  // Generate content with improved error handling
  const generateContent = useCallback(
    async (type: "ai" | "competitor" | "validation") => {
      if (!pitchDeck) {
        toast({
          title: "Error",
          description: "No pitch deck data available.",
          variant: "destructive",
        });
        return;
      }

      const config = {
        ai: {
          setLoading: setAiLoading,
          setContent: setAiContent,
          fetch: fetchGeneratedPitch,
          key: "generatedcontent",
          keys: ["generated_pitch"],
        },
        competitor: {
          setLoading: setCompetitorLoading,
          setContent: setCompetitorContent,
          fetch: fetchCompanalysis,
          key: "competitor_analysis",
          keys: ["competitor_analysis"],
        },
        validation: {
          setLoading: setValidationLoading,
          setContent: setValidationContent,
          fetch: fetchValidationScore,
          key: "validation_score",
          keys: ["validation_score", "reasoning"],
        },
      }[type];

      const pitchRequest: PitchDeckRequest = {
        title: pitchDeck.title,
        description: pitchDeck.description,
        industry: pitchDeck.industry,
        startup_stage: pitchDeck.startup_stage,
        target_market: pitchDeck.target_market,
      };

      config.setLoading(true);

      try {
        const data = await config.fetch(pitchRequest);
        if (!data) throw new Error(`No ${type} data returned`);

        const normalizedData: PitchDeckResponse = {
  [config.key]: data[config.key] ?? data,
  ...(type === 'validation' ? { 
    reasoning: data.reasoning || [],
    // Extract just the numeric validation_score from the response object
    validation_score: typeof data.validation_score === 'object' 
      ? (data.validation_score.validation_score || 0)
      : (data.validation_score ?? 0)
  } : {}),
};

        if (normalizedData[config.key] == null) {
          throw new Error(`Invalid ${type} data format`);
        }
        console.log("response yeh aarah bhai", normalizedData[config.key]);
        
        console.log("normalise data before processing", normalizedData);
        // Check if the data is an object structure
        if (typeof normalizedData[config.key] === 'object' && 
          !Array.isArray(normalizedData[config.key]) && 
          normalizedData[config.key] !== null) {
          
          // If it's an object, extract the relevant content as string
          // Cast to Record<string, any> to make TypeScript happy
          const keyValue = normalizedData[config.key] as Record<string, any>;
          const extractedContent = Object.values(keyValue)[0];
          
          if (typeof extractedContent === 'string') {
            normalizedData[config.key] = extractedContent;
          } else if (extractedContent && typeof extractedContent === 'object') {
            // Handle nested object case if needed
            normalizedData[config.key] = JSON.stringify(extractedContent);
          }
        }

        console.log("Normalized data after processing:", normalizedData);
        config.setContent(normalizedData);
        console.log("Data set successfully:", normalizedData);
       
      } catch (error) {
        console.error(`Failed to generate ${type}:`, error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : `Failed to generate ${type}`,
          variant: "destructive",
        });
      } finally {
        config.setLoading(false);
      }
    },
    [pitchDeck]
  );

  // Navigate to slide playground with pitch data
  const handleSlideContent = useCallback(() => {
    if (!pitchDeck) {
      toast({
        title: "Error",
        description: "No pitch deck data available.",
        variant: "destructive",
      });
      return;
    }

    const queryParams = new URLSearchParams({
      title: pitchDeck.title,
      description: pitchDeck.description,
      industry: pitchDeck.industry,
      startup_stage: pitchDeck.startup_stage,
      target_market: pitchDeck.target_market,
    }).toString();

    router.push(`/Slideplayground/${id}?${queryParams}`);
  }, [pitchDeck, id, router]);

  // Toggle reasoning visibility
  const toggleReasoning = useCallback(() => {
    setShowReasoning((prev) => !prev);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-950 px-4">
        <Card className="bg-gray-800 backdrop-blur-sm border-gray-700 shadow-xl w-full max-w-md">
          <CardContent className="p-10 flex flex-col items-center gap-4">
            <Loader2
              className="animate-spin w-14 h-14 text-indigo-600"
              aria-hidden="true"
            />
            <p className="text-lg font-medium text-gray-400">
              Loading Pitch Deck...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state - pitch deck not found
  if (!pitchDeck) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-950 px-4">
        <Card className="bg-gray-800 backdrop-blur-sm border-gray-700 shadow-xl w-full max-w-md">
          <CardContent className="p-10 text-center flex flex-col gap-6">
            <p className="text-xl font-semibold text-red-400" role="alert">
              Pitch Deck Not Found
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-base font-medium transition-all duration-200 hover:scale-105 shadow-indigo-500/50"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 mr-2" aria-hidden="true" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen py-8 px-4 sm:px-8 lg:px-8 bg-gradient-to-br from-gray-900 to-blue-950 text-gray-100">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Dashboard Button - Keep this at the top */}
        
         
        <AnimatePresence mode="wait">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-12"
          >
            {/* Pitch Deck Overview */}
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-sm border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
              <CardHeader className="border-b border-gray-700 px-5 py-6 bg-gradient-to-r from-gray-900/50 to-transparent">
                <CardTitle className="text-2xl font-bold text-gray-100 flex items-center">
                  <FileText
                    className="w-6 h-6 mr-3 text-indigo-600"
                    aria-hidden="true"
                  />
                  {pitchDeck.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 py-6 grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-800/60 p-4 rounded-lg border border-gray-700"
                  >
                    <h3 className="text-lg font-semibold mb-2 text-gray-100">
                      Industry
                    </h3>
                    <p className="text-sm text-gray-300">
                      {pitchDeck.industry}
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-800/60 p-4 rounded-lg border border-gray-700"
                  >
                    <h3 className="text-lg font-semibold mb-2 text-gray-100">
                      Stage
                    </h3>
                    <p className="text-sm text-gray-300">
                      {pitchDeck.startup_stage}
                    </p>
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gray-800/60 p-4 rounded-lg border border-gray-700"
                >
                  <h3 className="text-lg font-semibold mb-2 text-gray-100">
                    Description
                  </h3>
                  <p className="text-sm text-gray-300">
                    {pitchDeck.description}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gray-800/60 p-4 rounded-lg border border-gray-700"
                >
                  <h3 className="text-lg font-semibold mb-2 text-gray-100">
                    Target Market
                  </h3>
                  <p className="text-sm text-gray-300">
                    {pitchDeck.target_market}
                  </p>
                </motion.div>
              </CardContent>
            </Card>

            {/* Action Buttons - Moved to below the pitch deck section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8"
            >
              <ActionButton
                onClick={() => generateContent("ai")}
                icon={<FileText />}
                label="Generate AI Insights"
                loading={aiLoading}
                tooltip="Generate comprehensive AI-driven pitch insights"
              />
              
              <ActionButton
                onClick={() => generateContent("competitor")}
                icon={<BarChart3 />}
                label="Competitor Analysis"
                loading={competitorLoading}
                tooltip="Generate AI-driven competitor analysis"
              />

              <ActionButton
                onClick={() => {
                  generateContent("validation");
                  console.log("validation content", validationContent);
                }}
                icon={<CheckCircle />}
                label="Validate Idea"
                loading={validationLoading}
                tooltip="Validate your startup idea"
              />

              <ActionButton
                onClick={handleSlideContent}
                icon={<Sparkles />}
                label="Slide Content"
                tooltip="Generate AI-driven slide content"
              />
              <ActionButton
                onClick={async () => {
                  try {
                    if (!aiContent && !competitorContent && !validationContent) {
                      toast({
                        title: "No content to save",
                        description: "Please generate content first before saving.",
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    const token = await getAuthToken();
                    if (!token) throw new Error("User not authenticated");
                    
                    const contentToSave = {
                      pitch_id: id,
                      ai_content: aiContent?.generatedcontent || null,
                      competitor_analysis: competitorContent?.competitor_analysis || null,
                      validation_score: validationContent?.validation_score || null,
                      validation_reasoning: validationContent?.reasoning || null,
                    };
                    console.log("Content to save:", contentToSave);
                    const response = await fetch("http://127.0.0.1:8000/save-content", {
                      method: "POST",
                      headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(contentToSave),
                    });
                    
                    if (!response.ok) throw new Error("Failed to save content");
                    
                    toast({
                      title: "Success",
                      description: "Content saved successfully!",
                      variant: "default",
                    });
                  } catch (error) {
                    console.error("Failed to save content:", error);
                    toast({
                      title: "Error",
                      description: error instanceof Error ? error.message : "Failed to save content",
                      variant: "destructive",
                    });
                  }
                }}
                icon={<Save />}
                label="Save Content"
                tooltip="Save all generated content for future reference"
              />
            </motion.div>

            {/* AI-Generated Content */}
            {aiContent && (
              <ContentSectionComponent
                title="AI-Generated Pitch Insights"
                icon={<FileText className="text-indigo-400 animate-pulse" />}
                sections={parseAIResponse(aiContent)}
                color="indigo"
                sectionRef={aiSectionRef}
              />
            )}

            {/* Competitor Analysis Section */}
            {competitorContent && (
              <ContentSectionComponent
                title="Competitor Analysis"
                icon={<BarChart3 className="text-purple-400 animate-pulse" />}
                sections={parseAIResponse(competitorContent)}
                color="purple"
                sectionRef={competitorSectionRef}
              />
            )}

            {/* Validation Score Section */}
            {validationContent && (
              <ContentSectionComponent
                title="Idea Validation"
                icon={<CheckCircle className="text-green-400 animate-pulse" />}
                sections={[
                  {
                    type: "section",
                    header: "Validation Results",
                    children: [
                      {
                        type: "paragraph",
                        content: `Your startup idea received a validation score of ${
                          typeof validationContent.validation_score === "object"
                            ? JSON.stringify(validationContent.validation_score)
                            : validationContent.validation_score
                        } out of 100.`,
                      },
                      ...(validationContent.reasoning && showReasoning
                        ? [
                            {
                              type: "bulletList" as const,
                              content: validationContent.reasoning,
                            },
                          ]
                        : []),
                    ],
                  },
                ]}
                color="green"
                sectionRef={validationSectionRef}
              />
            )}

            {/* Toggle Reasoning Button */}
            {validationContent?.reasoning?.length && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex justify-center"
              >
                <Button
                  onClick={toggleReasoning}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 hover:scale-105"
                  aria-label={
                    showReasoning
                      ? "Hide validation details"
                      : "Show validation details"
                  }
                >
                  {showReasoning ? (
                    <>
                      <ChevronUp className="w-5 h-5 mr-2" aria-hidden="true" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown
                        className="w-5 h-5 mr-2"
                        aria-hidden="true"
                      />
                      Show Details
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </motion.section>
        </AnimatePresence>
      </div>
    </div>
  );
}