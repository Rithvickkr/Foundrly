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
  Zap,
  TrendingUp,
  Brain,
  Target,
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
import { toast } from "sonner";
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

// Floating particles background component
const FloatingParticles = memo(() => {
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  if (!mounted) {
    return <div className="absolute inset-0 overflow-hidden pointer-events-none" />;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full"
          initial={{
            x: Math.random() * windowSize.width,
            y: Math.random() * windowSize.height,
          }}
          animate={{
            x: Math.random() * windowSize.width,
            y: Math.random() * windowSize.height,
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
});

FloatingParticles.displayName = "FloatingParticles";

// Enhanced TypewriterText with cursor animation
const TypewriterText = memo(
  ({ text, delay = 30, className, onComplete }: TypewriterProps) => {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showCursor, setShowCursor] = useState(true);
    const words = text.split(" ").filter((word) => word);

    useEffect(() => {
      const cursorInterval = setInterval(() => {
        setShowCursor((prev) => !prev);
      }, 500);
      return () => clearInterval(cursorInterval);
    }, []);

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

    return (
      <span className={className}>
        {displayedText}
        {currentIndex < words.length && (
          <span
            className={`inline-block w-0.5 h-4 ml-1 bg-current transition-opacity duration-100 ${
              showCursor ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </span>
    );
  }
);

TypewriterText.displayName = "TypewriterText";

// Enhanced ActionButton with ripple effect
const ActionButton = memo(
  ({
    onClick,
    icon,
    label,
    loading,
    disabled,
    tooltip,
    variant = "primary",
  }: {
    onClick: () => void;
    icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
    label: string;
    loading?: boolean;
    disabled?: boolean;
    tooltip: string;
    variant?: "primary" | "secondary" | "success" | "purple";
  }) => {
    const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRipple = { id: Date.now(), x, y };
      
      setRipples((prev) => [...prev, newRipple]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
      }, 600);
      
      onClick();
    };

    const getVariantClasses = () => {
      switch (variant) {
        case "secondary":
          return "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/50";
        case "success":
          return "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-green-500/50";
        case "purple":
          return "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-violet-500/50";
        default:
          return "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/50 dark:shadow-indigo-500/50";
      }
    };

    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                className={`${getVariantClasses()} text-white rounded-xl px-6 py-4 text-base font-semibold transition-all duration-300 hover:shadow-xl transform relative overflow-hidden group`}
                onClick={handleClick}
                disabled={disabled || loading}
                aria-label={loading ? `Generating ${label}` : label}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {ripples.map((ripple) => (
                  <motion.div
                    key={ripple.id}
                    className="absolute bg-white/30 rounded-full"
                    initial={{ width: 0, height: 0, opacity: 1 }}
                    animate={{ width: 100, height: 100, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{
                      left: ripple.x - 50,
                      top: ripple.y - 50,
                    }}
                  />
                ))}
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5 mr-3" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    {React.cloneElement(icon, {
                      className: "w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300",
                    })}
                    <span>{label}</span>
                  </>
                )}
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent className="bg-gray-800 dark:bg-gray-800 text-gray-100 dark:text-gray-100 border-gray-700 dark:border-gray-700 backdrop-blur-sm">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

ActionButton.displayName = "ActionButton";

// Enhanced MarkdownRenderer
const MarkdownRenderer = memo(({ content }: { content: string | string[] }) => {
  if (Array.isArray(content)) {
    return (
      <ul className="text-base text-gray-700 dark:text-gray-300 leading-relaxed font-light list-disc pl-6 space-y-3">
        {content.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
          >
            {item}
          </motion.li>
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
      className="text-base text-gray-700 dark:text-gray-300 leading-relaxed font-light"
      dangerouslySetInnerHTML={{ __html: formattedContent }}
    />
  );
});

MarkdownRenderer.displayName = "MarkdownRenderer";

// Enhanced ContentSectionComponent with advanced animations
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
    const [displayedText, setDisplayedText] = useState("");
    const [isComplete, setIsComplete] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const fullText = sections
      .map(section => 
        `${section.header ? `**${section.header}**\n\n` : ''}${section.children
          .map(child => 
            child.type === "paragraph" 
              ? child.content 
              : (child.content as string[]).map(item => `• ${item}`).join('\n')
          )
          .join('\n\n')}`
      )
      .join('\n\n');

    const getColorClasses = () => {
      switch (color) {
        case "purple":
          return {
            border: "border-purple-400/50 dark:border-purple-500",
            header: "text-purple-700 dark:text-purple-300",
            gradient: "from-purple-50/80 dark:from-purple-900/30",
            accent: "bg-purple-100/50 dark:bg-purple-500/10",
            glow: "shadow-purple-200/50 dark:shadow-purple-500/20",
          };
        case "green":
          return {
            border: "border-green-400/50 dark:border-green-500",
            header: "text-green-700 dark:text-green-300",
            gradient: "from-green-50/80 dark:from-green-900/30",
            accent: "bg-green-100/50 dark:bg-green-500/10",
            glow: "shadow-green-200/50 dark:shadow-green-500/20",
          };
        default:
          return {
            border: "border-blue-400/50 dark:border-indigo-500",
            header: "text-blue-700 dark:text-indigo-300",
            gradient: "from-blue-50/80 dark:from-indigo-900/30",
            accent: "bg-blue-100/50 dark:bg-indigo-500/10",
            glow: "shadow-blue-200/50 dark:shadow-indigo-500/20",
          };
      }
    };

    const colors = getColorClasses();

    useEffect(() => {
      if (!fullText) return;
      
      let currentIndex = 0;
      const words = fullText.split(' ');
      
      const interval = setInterval(() => {
        if (currentIndex < words.length) {
          setDisplayedText(prev => 
            currentIndex === 0 ? words[0] : prev + ' ' + words[currentIndex]
          );
          currentIndex++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, 50);

      return () => clearInterval(interval);
    }, [fullText]);

    const formatText = (text: string) => {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-gray-100">$1</strong>')
        .replace(/^• (.+)$/gm, '<span class="flex items-start gap-2 my-2"><span class="w-2 h-2 bg-current rounded-full mt-2 flex-shrink-0"></span><span>$1</span></span>')
        .replace(/\n/g, '<br />');
    };

    return (
      <motion.section
        ref={sectionRef}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.7, 
          delay: 0.3,
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
        className="w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card className={`bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-800 dark:to-gray-900 backdrop-blur-xl border-2 ${colors.border} shadow-2xl ${colors.glow} hover:shadow-3xl transition-all duration-500 rounded-2xl overflow-hidden transform hover:-translate-y-2 relative group`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          
          <CardHeader className={`border-b border-gray-200/50 dark:border-gray-700 px-8 py-6 bg-gradient-to-r ${colors.gradient} to-transparent relative overflow-hidden`}>
            <motion.div
              animate={isHovered ? { scale: 1.05, rotate: 5 } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute top-4 right-4 opacity-10"
            >
              {React.cloneElement(icon, { className: "w-24 h-24" })}
            </motion.div>
            
            <CardTitle className="text-2xl sm:text-3xl font-black text-gray-800 dark:text-gray-100 flex items-center relative z-10">
              <motion.div
                animate={isHovered ? { rotate: 360, scale: 1.1 } : { rotate: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                {React.cloneElement(icon, {
                  className: "w-8 h-8 mr-4 text-current",
                })}
              </motion.div>
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {title}
              </motion.span>
            </CardTitle>
          </CardHeader>

          <CardContent className="px-8 py-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative bg-white/70 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700 backdrop-blur-sm shadow-lg min-h-[200px]"
            >
              <div className="relative z-10">
                <div 
                  className="text-base text-gray-700 dark:text-gray-300 leading-relaxed font-light"
                  dangerouslySetInnerHTML={{ 
                    __html: formatText(displayedText) + 
                      (!isComplete ? '<span class="inline-block w-0.5 h-5 ml-1 bg-current animate-pulse"></span>' : '')
                  }}
                />
                
                {isComplete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    className="mt-6 flex justify-end"
                  >
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${colors.accent} ${colors.header} border ${colors.border}`}>
                      ✓ Generated
                    </div>
                  </motion.div>
                )}
              </div>

              <motion.div
                className={`absolute bottom-0 right-0 w-16 h-16 ${colors.accent} rounded-tl-full opacity-30`}
                animate={isHovered ? { scale: 1.2, rotate: 45 } : { scale: 1, rotate: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
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
        console.error("Startup Blueprint ID is missing!");
        setLoading(false);
        return;
      }

      try {
        const token = await getAuthToken();
        if (!token) throw new Error("User not authenticated");

        const response = await fetch(`https://pitchdeckbend.onrender.com/pitchdecks/${id}`, {
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
        toast("Error loading pitch deck", {
          description: "Failed to load pitch deck data. Please try again.",
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
        
        const response = await fetch(`https://pitchdeckbend.onrender.com/get-gen/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (response.status === 404) {
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
          console.log(gen)  
          
          if (gen.pitch) {
            setAiContent({ generatedcontent: gen.pitch });
            console.log("AI content loaded:", gen.pitch);
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
          
          toast("Previous content loaded", {
            description: "Your previously generated content has been restored.",
          });
        }
      } catch (error) {
        console.error("Error fetching previous generations:", error);
      }
    };

    fetchPreviousGenerations();
  }, [id]);
  
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

      const response = await fetch("https://pitchdeckbend.onrender.com/validator", {
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
        toast("No pitch deck data available", {
          description: "Unable to generate content without pitch deck information.",
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
          successMessage: "AI insights generated successfully",
          errorMessage: "Failed to generate AI insights",
        },
        competitor: {
          setLoading: setCompetitorLoading,
          setContent: setCompetitorContent,
          fetch: fetchCompanalysis,
          key: "competitor_analysis",
          keys: ["competitor_analysis"],
          successMessage: "Competitor analysis generated successfully",
          errorMessage: "Failed to generate competitor analysis",
        },
        validation: {
          setLoading: setValidationLoading,
          setContent: setValidationContent,
          fetch: fetchValidationScore,
          key: "validation_score",
          keys: ["validation_score", "reasoning"],
          successMessage: "Idea validation completed successfully",
          errorMessage: "Failed to validate idea",
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
        if (typeof normalizedData[config.key] === 'object' && 
          !Array.isArray(normalizedData[config.key]) && 
          normalizedData[config.key] !== null) {
          
          const keyValue = normalizedData[config.key] as Record<string, any>;
          const extractedContent = Object.values(keyValue)[0];
          
          if (typeof extractedContent === 'string') {
            normalizedData[config.key] = extractedContent;
          } else if (extractedContent && typeof extractedContent === 'object') {
            normalizedData[config.key] = JSON.stringify(extractedContent);
          }
        }

        console.log("Normalized data after processing:", normalizedData);
        config.setContent(normalizedData);
        console.log("Data set successfully:", normalizedData);
        
        toast(config.successMessage, {
          description: `Your ${type === 'ai' ? 'AI insights' : type === 'competitor' ? 'competitor analysis' : 'idea validation'} has been generated and is ready to view.`,
        });
       
      } catch (error) {
        console.error(`Failed to generate ${type}:`, error);
        toast(config.errorMessage, {
          description: error instanceof Error ? error.message : `An error occurred while generating ${type} content.`,
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
      toast("No pitch deck data available", {
        description: "Unable to navigate to slide content without pitch deck information.",
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
    
    toast("Navigating to slide playground", {
      description: "Opening slide content generator with your pitch deck data.",
    });
  }, [pitchDeck, id, router]);

  // Toggle reasoning visibility
  const toggleReasoning = useCallback(() => {
    setShowReasoning((prev) => !prev);
  }, []);

  // Loading state with enhanced animation
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200/60 via-indigo-200/70 to-purple-200/60 dark:from-gray-900 dark:via-blue-950/80 dark:to-indigo-950 px-4 relative overflow-hidden">
        {/* Animated floating particles and blurred color blobs */}
        <FloatingParticles />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-400/30 blur-3xl rounded-full animate-pulse-slow pointer-events-none" />
        <div className="absolute -bottom-40 right-0 w-96 h-96 bg-blue-400/30 blur-3xl rounded-full animate-pulse-slow pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, type: "spring", stiffness: 120 }}
        >
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl border-2 border-blue-200/60 dark:border-indigo-700 shadow-2xl w-full max-w-md rounded-2xl overflow-hidden relative">
            <CardContent className="p-12 flex flex-col items-center gap-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <span className="absolute -inset-2 rounded-full bg-gradient-to-tr from-blue-400/30 via-indigo-400/20 to-purple-400/30 blur-lg animate-pulse pointer-events-none" />
                <Loader2 className="w-20 h-20 text-blue-600 dark:text-indigo-400 drop-shadow-lg" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-blue-700 dark:text-indigo-300 tracking-tight"
              >
                Loading Startup Blueprint...
              </motion.p>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                className="h-2 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-full shadow-lg"
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-sm text-gray-500 dark:text-gray-400 mt-2"
              >
                Please wait while we fetch your pitch deck details...
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Error state - pitch deck not found
  if (!pitchDeck) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-50 dark:from-gray-900 dark:to-blue-950 px-4 relative overflow-hidden">
        <FloatingParticles />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-2 border-red-200/50 dark:border-gray-700 shadow-2xl w-full max-w-md rounded-2xl overflow-hidden">
            <CardContent className="p-12 text-center flex flex-col gap-6">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FileText className="w-16 h-16 text-red-500 mx-auto" />
              </motion.div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400" role="alert">
                Startup Blueprint Not Found
              </p>
              <ActionButton
                onClick={() => router.push("/")}
                icon={<ArrowLeft />}
                label="Back to Dashboard"
                tooltip="Return to the main dashboard"
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Main content with enhanced styling
  return (
    
    <div className="min-h-screen py-8 px-4 sm:px-8 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-blue-950/50 dark:to-indigo-950  dark:text-gray-100 text-gray-800  relative overflow-hidden">
      <FloatingParticles />
      
      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        <AnimatePresence mode="wait">
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-16"
          >
            {/* Startup Blueprint Overview with enhanced design */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            >
              <Card className="bg-gradient-to-br from-white/90 to-blue-50/90 dark:from-gray-800 dark:to-gray-900 backdrop-blur-xl border-2 border-blue-200/50 dark:border-gray-700 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                <CardHeader className="border-b border-blue-200/50 dark:border-gray-700 px-8 py-10 bg-gradient-to-r from-blue-50/80 dark:from-gray-900/50 to-transparent relative">
                  <motion.div
                    className="absolute top-4 right-4 opacity-10"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Brain className="w-24 h-24 text-blue-500" />
                  </motion.div>
                  
                  <CardTitle className="text-3xl font-black text-gray-800 dark:text-gray-100 flex items-center relative z-10">
                    <motion.div
                      whileHover={{ rotate: 15, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <FileText className="w-8 h-8 mr-4 text-blue-600 dark:text-indigo-600" />
                    </motion.div>
                    <motion.span
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {pitchDeck.title}
                    </motion.span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="px-8 py-10 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: "Industry", value: pitchDeck.industry, icon: <TrendingUp />, color: "from-green-500 to-emerald-500" },
                      { label: "Stage", value: pitchDeck.startup_stage, icon: <Target />, color: "from-purple-500 to-violet-500" },
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 100 }}
                        className="bg-white/70 dark:bg-gray-800/60 p-6 rounded-xl border border-gray-200/50 dark:border-gray-700 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-800/80 transition-all duration-300 group/card"
                      >
                        <div className="flex items-center mb-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color} text-white mr-3 group-hover/card:scale-110 transition-transform duration-300`}>
                            {React.cloneElement(item.icon, { className: "w-5 h-5" })}
                          </div>
                          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                            {item.label}
                          </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 font-medium">
                          {item.value}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  {[
                    { label: "Description", value: pitchDeck.description },
                    { label: "Target Market", value: pitchDeck.target_market },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1, type: "spring", stiffness: 100 }}
                      className="bg-white/70 dark:bg-gray-800/60 p-6 rounded-xl border border-gray-200/50 dark:border-gray-700 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-800/80 transition-all duration-300"
                    >
                      <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-100">
                        {item.label}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {item.value}
                      </p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4 sm:gap-6"
            >
              <ActionButton
              onClick={() => generateContent("ai")}
              icon={<Brain />}
              label="AI Pitch"
              loading={aiLoading}
              tooltip="Generate comprehensive AI-driven pitch insights"
              variant="primary"
              />
              
              <ActionButton
              onClick={() => generateContent("competitor")}
              icon={<BarChart3 />}
              label="Competitor Analysis"
              loading={competitorLoading}
              tooltip="Generate AI-driven competitor analysis"
              variant="secondary"
              />

              <ActionButton
              onClick={() => generateContent("validation")}
              icon={<CheckCircle />}
              label="Validate Idea"
              loading={validationLoading}
              tooltip="Validate your startup idea"
              variant="success"
              />

              <ActionButton
              onClick={handleSlideContent}
              icon={<Sparkles />}
              label="Slide Content"
              tooltip="Generate AI-driven slide content"
              variant="purple"
              />

              <ActionButton
              onClick={async () => {
                try {
                if (!aiContent && !competitorContent && !validationContent) {
                  toast("No content to save", {
                    description: "Please generate AI Pitch, competitor analysis, or idea validation first before saving.",
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
                
                const response = await fetch("https://pitchdeckbend.onrender.com/save-content", {
                  method: "POST",
                  headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                  },
                  body: JSON.stringify(contentToSave),
                });
                
                if (!response.ok) throw new Error("Failed to save content");
                
                toast("Content saved successfully!", {
                  description: "All your generated content has been saved and can be accessed later.",
                  action: {
                    label: "View Content",
                    onClick: () => {
                      if (aiContent && aiSectionRef.current) {
                        aiSectionRef.current.scrollIntoView({ behavior: "smooth" });
                      }
                    },
                  },
                });
                } catch (error) {
                console.error("Failed to save content:", error);
                toast("Failed to save content", {
                  description: error instanceof Error ? error.message : "An error occurred while saving your content. Please try again.",
                });
                }
              }}
              icon={<Save />}
              label="Save Content"
              tooltip="Save all generated content for future reference"
              variant="primary"
              />
            </motion.div>

            {/* Content Sections with enhanced animations */}
            {aiContent && (
              
              <ContentSectionComponent
                title="AI-Generated Pitch Insights"
                icon={<Brain className="text-blue-500 dark:text-indigo-400" />}
                sections={parseAIResponse(aiContent)}
                color="indigo"
                sectionRef={aiSectionRef}
              />
            )}

            {competitorContent && (
              <ContentSectionComponent
                title="Competitor Analysis"
                icon={<BarChart3 className="text-purple-500 dark:text-purple-400" />}
                sections={parseAIResponse(competitorContent)}
                color="purple"
                sectionRef={competitorSectionRef}
              />
            )}

            {validationContent && (
              <ContentSectionComponent
                title="Idea Validation"
                icon={<CheckCircle className="text-green-500 dark:text-green-400" />}
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

            {/* Enhanced Toggle Reasoning Button */}
            {validationContent?.reasoning?.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 150 }}
                className="flex justify-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  
                </motion.div>
              </motion.div>
            )}
          </motion.section>
        </AnimatePresence>
      </div>
    </div>
  );
}