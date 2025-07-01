"use client";

import { useState, useEffect, useRef } from "react";
import { Download, Mic, RefreshCw, Palette, ChevronLeft, ChevronRight, Save, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import dynamic from "next/dynamic";
import "reveal.js/dist/reveal.css";
import "reveal.js/dist/theme/white.css";
import { jsPDF } from "jspdf";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuthToken } from "@/lib/actions/getauthtoken";
import { motion, AnimatePresence } from "framer-motion";

// Dynamically import TinyMCE to avoid SSR issues
const Editor = dynamic(() => import("@tinymce/tinymce-react").then((mod) => mod.Editor), { ssr: false });

// Define types
type SlideContent = {
  title: string;
  content: string;
  background?: string;
  transition?: string;
  fontFamily?: string;
  layout?: "title-only" | "title-content" | "two-content";
};

// Predefined layouts
const LAYOUTS = {
  "title-only": {
    name: "Title Only",
    render: (
      slide: SlideContent,
      isEditable: boolean,
      onTitleChange?: (content: string) => void,
      onContentChange?: (content: string) => void,
      titleFontSize?: string,
      contentFontSize?: string,
      textBoxSpacing?: string
    ) => (
      <div className="flex flex-col items-center justify-center h-full">
        {isEditable ? (
          <Editor
            key={`title-${titleFontSize}`}
            value={slide.title}
            onEditorChange={(content) => onTitleChange && onTitleChange(content)}
            init={{
              inline: true,
              menubar: false,
              plugins: ["lists", "link"], // Fixed: Use array for plugins
              toolbar: "undo redo | bold italic | alignleft aligncenter alignright | bullist numlist",
              content_style: `.mce-content-body { font-family: ${slide.fontFamily || "Inter"}; font-size: ${titleFontSize || "2.5rem"}; text-align: center; }`,
                setup: (editor: { on: (arg0: string, arg1: { (): void; (err: any): void; }) => void; }) => {
                  editor.on("init", () => {
                    console.log("TinyMCE initialized for title editor (title-only)");
                  });
                  editor.on("error", (...args: any[]) => {
                    const [err] = args;
                    if (err) {
                      console.error("TinyMCE error in title editor (title-only):", err);
                    }
                  });
                },
              }}
              apiKey={process.env.NEXT_PUBLIC_TINY_API_KEY}
                />
              ) : (
          <h2
            className="text-center font-bold"
            style={{ fontFamily: slide.fontFamily, fontSize: "2.5rem" }}
          >
            {slide.title}
          </h2>
        )}
        {slide.content && (
          <div key={`spacing-${textBoxSpacing}`} style={{ marginTop: textBoxSpacing || "1rem" }}>
            {isEditable ? (
              <Editor
                key={`content-${contentFontSize}`}
                value={slide.content}
                onEditorChange={(content) => onContentChange && onContentChange(content)}
                init={{
                  inline: true,
                  menubar: false,
                  plugins: [
                    "advlist",
                    "autolink",
                    "lists",
                    "link",
                    "image",
                    "charmap",
                    "preview",
                    "anchor",
                    "searchreplace",
                    "visualblocks",
                    "code",
                    "fullscreen",
                    "insertdatetime",
                    "media",
                    "table",
                    "help",
                    "wordcount",
                  ], // Fixed: Use array for plugins
                  toolbar:
                    "undo redo | formatselect | fontselect fontsizeselect | " +
                    "bold italic underline | alignleft aligncenter alignright alignjustify | " +
                    "bullist numlist outdent indent | link image | removeformat | help",
                  font_formats: FONTS.join(";"),
                  fontsize_formats: "8pt 10pt 12pt 14pt 18pt 24pt 36pt",
                  content_style: `.mce-content-body { font-family: ${slide.fontFamily || "Inter"}; font-size: ${contentFontSize || "1rem"}; text-align: center; }`,
                  setup: (editor: { on: (arg0: string, arg1: { (): void; (err: any): void; }) => void; }) => {
                    editor.on("init", () => {
                      console.log("TinyMCE initialized for content editor (title-only)");
                    });
                    editor.on("error", (...args: any[]) => {
                      const [err] = args;
                      if (err) {
                        console.error("TinyMCE error in content editor (title-only):", err);
                      } else {
                        console.error("TinyMCE error in content editor (title-only): Unknown error");
                      }
                    });
                  },
                }}
                apiKey={process.env.NEXT_PUBLIC_TINY_API_KEY}
              />
            ) : (
              <div
                className="text-center"
                dangerouslySetInnerHTML={{ __html: slide.content }}
                style={{ fontFamily: slide.fontFamily, fontSize: "1rem" }}
              />
            )}
          </div>
        )}
      </div>
    ),
  },
  "title-content": {
    name: "Title and Content",
    render: (
      slide: SlideContent,
      isEditable: boolean,
      onTitleChange?: (content: string) => void,
      onContentChange?: (content: string) => void,
      titleFontSize?: string,
      contentFontSize?: string,
      textBoxSpacing?: string
    ) => (
      <div className="flex flex-col h-full">
        {isEditable ? (
          <Editor
            key={`title-${titleFontSize}`}
            value={slide.title}
            onEditorChange={(content) => onTitleChange && onTitleChange(content)}
            init={{
              inline: true,
              menubar: false,
              plugins: ["lists", "link"], // Fixed: Use array for plugins
              toolbar: "undo redo | bold italic | alignleft aligncenter alignright | bullist numlist",
              content_style: `.mce-content-body { font-family: ${slide.fontFamily || "Inter"}; font-size: ${titleFontSize || "2rem"}; text-align: center; }`,
              setup: (editor: { on: (arg0: string, arg1: { (): void; (err: any): void; }) => void; }) => {
                editor.on("init", () => {
                  console.log("TinyMCE initialized for title editor (title-content)");
                });
                editor.on("error", (...args: any[]) => {
                  const [err] = args;
                  if (err) {
                    console.error("TinyMCE error in title editor (title-content):", err);
                  } else {
                    console.error("TinyMCE error in title editor (title-content): Unknown error");
                  }
                });
              },
            }}
            apiKey={process.env.NEXT_PUBLIC_TINY_API_KEY}
          />
        ) : (
          <h2
            className="text-center font-bold mb-4"
            style={{ fontFamily: slide.fontFamily, fontSize: "2rem" }}
          >
            {slide.title}
          </h2>
        )}
        <div key={`spacing-${textBoxSpacing}`} style={{ marginTop: textBoxSpacing || "1rem" }}>
          {isEditable ? (
            <Editor
              key={`content-${contentFontSize}`}
              value={slide.content}
              onEditorChange={(content) => onContentChange && onContentChange(content)}
              init={{
                inline: true,
                menubar: false,
                plugins: [
                  "advlist",
                  "autolink",
                  "lists",
                  "link",
                  "image",
                  "charmap",
                  "preview",
                  "anchor",
                  "searchreplace",
                  "visualblocks",
                  "code",
                  "fullscreen",
                  "insertdatetime",
                  "media",
                  "table",
                  "help",
                  "wordcount",
                ], // Fixed: Use array for plugins
                toolbar:
                  "undo redo | formatselect | fontselect fontsizeselect | " +
                  "bold italic underline | alignleft aligncenter alignright alignjustify | " +
                  "bullist numlist outdent indent | link image | removeformat | help",
                font_formats: FONTS.join(";"),
                fontsize_formats: "8pt 10pt 12pt 14pt 18pt 24pt 36pt",
                content_style: `.mce-content-body { font-family: ${slide.fontFamily || "Inter"}; font-size: ${contentFontSize || "1rem"}; }`,
                setup: (editor: { on: (arg0: string, arg1: { (): void; (err: any): void; }) => void; }) => {
                  editor.on("init", () => {
                    console.log("TinyMCE initialized for content editor (title-content)");
                  });
                  editor.on("error", (...args: any[]) => {
                    const [err] = args;
                    if (err) {
                      console.error("TinyMCE error in content editor (title-content):", err);
                    } else {
                      console.error("TinyMCE error in content editor (title-content): Unknown error");
                    }
                  });
                },
              }}
              apiKey={process.env.NEXT_PUBLIC_TINY_API_KEY}
            />
          ) : (
            <div
              className="flex-1 text-center"
              dangerouslySetInnerHTML={{ __html: slide.content }}
              style={{ fontFamily: slide.fontFamily, fontSize: "1rem" }}
            />
          )}
        </div>
      </div>
    ),
  },
  "two-content": {
    name: "Two Content",
    render: (
      slide: SlideContent,
      isEditable: boolean,
      onTitleChange?: (content: string) => void,
      onContentChange?: (content: string) => void,
      titleFontSize?: string,
      contentFontSize?: string,
      textBoxSpacing?: string
    ) => (
      <div className="flex flex-col h-full">
        {isEditable ? (
          <Editor
            key={`title-${titleFontSize}`}
            value={slide.title}
            onEditorChange={(content) => onTitleChange && onTitleChange(content)}
            init={{
              inline: true,
              menubar: false,
              plugins: ["lists", "link"], // Fixed: Use array for plugins
              toolbar: "undo redo | bold italic | alignleft aligncenter alignright | bullist numlist",
              content_style: `.mce-content-body { font-family: ${slide.fontFamily || "Inter"}; font-size: ${titleFontSize || "2rem"}; text-align: center; }`,
              setup: (editor: { on: (arg0: string, arg1: { (): void; (err: any): void; }) => void; }) => {
                editor.on("init", () => {
                  console.log("TinyMCE initialized for title editor (two-content)");
                });
                editor.on("error", (...args: any[]) => {
                  const [err] = args;
                  if (err) {
                    console.error("TinyMCE error in title editor (two-content):", err);
                  } else {
                    console.error("TinyMCE error in title editor (two-content): Unknown error");
                  }
                });
              },
            }}
           apiKey={process.env.NEXT_PUBLIC_TINY_API_KEY}
          />
        ) : (
          <h2
            className="text-center font-bold mb-4"
            style={{ fontFamily: slide.fontFamily, fontSize: "2rem" }}
          >
            {slide.title}
          </h2>
        )}
        <div
          key={`spacing-${textBoxSpacing}`}
          className="flex flex-row flex-1"
          style={{ gap: textBoxSpacing || "1rem", marginTop: textBoxSpacing || "1rem" }}
        >
          {isEditable ? (
            <>
              <div className="w-1/2">
                <Editor
                  key={`content-left-${contentFontSize}`}
                  value={slide.content}
                  onEditorChange={(content) => onContentChange && onContentChange(content)}
                  init={{
                    inline: true,
                    menubar: false,
                    plugins: [
                      "advlist",
                      "autolink",
                      "lists",
                      "link",
                      "image",
                      "charmap",
                      "preview",
                      "anchor",
                      "searchreplace",
                      "visualblocks",
                      "code",
                      "fullscreen",
                      "insertdatetime",
                      "media",
                      "table",
                      "paste",
                      "code",
                      "help",
                      "wordcount",
                    ], // Fixed: Use array for plugins
                    toolbar:
                      "undo redo | formatselect | fontselect fontsizeselect | " +
                      "bold italic underline | alignleft aligncenter alignright alignjustify | " +
                      "bullist numlist outdent indent | link image | removeformat | help",
                    font_formats: FONTS.join(";"),
                    fontsize_formats: "8pt 10pt 12pt 14pt 18pt 24pt 36pt",
                    content_style: `.mce-content-body { font-family: ${slide.fontFamily || "Inter"}; font-size: ${contentFontSize || "1rem"}; }`,
                    setup: (editor: { on: (arg0: string, arg1: { (): void; (err: any): void; }) => void; }) => {
                      editor.on("init", () => {
                        console.log("TinyMCE initialized for left content editor (two-content)");
                      });
                      editor.on("error", (err = null) => {
                        if (err) {
                          console.error("TinyMCE error in left content editor (two-content):", err);
                        } else {
                          console.error("TinyMCE error in left content editor (two-content): Unknown error");
                        }
                      });
                    },
                  }}
                  apiKey={process.env.NEXT_PUBLIC_TINY_API_KEY}
                />
              </div>
              <div className="w-1/2">
                <Editor
                  key={`content-right-${contentFontSize}`}
                  value={slide.content}
                  onEditorChange={(content) => onContentChange && onContentChange(content)}
                  init={{
                    inline: true,
                    menubar: false,
                    plugins: [
                      "advlist",
                      "autolink",
                      "lists",
                      "link",
                      "image",
                      "charmap",
                      "preview",
                      "anchor",
                      "searchreplace",
                      "visualblocks",
                      "code",
                      "fullscreen",
                      "insertdatetime",
                      "media",
                      "table",
                      "paste",
                      "code",
                      "help",
                      "wordcount",
                    ], // Fixed: Use array for plugins
                    toolbar:
                      "undo redo | formatselect | fontselect fontsizeselect | " +
                      "bold italic underline | alignleft aligncenter alignright alignjustify | " +
                      "bullist numlist outdent indent | link image | removeformat | help",
                    font_formats: FONTS.join(";"),
                    fontsize_formats: "8pt 10pt 12pt 14pt 18pt 24pt 36pt",
                    content_style: `.mce-content-body { font-family: ${slide.fontFamily || "Inter"}; font-size: ${contentFontSize || "1rem"}; }`,
                    setup: (editor: { on: (arg0: string, arg1: { (): void; (err: any): void; }) => void; }) => {
                      editor.on("init", () => {
                        console.log("TinyMCE initialized for right content editor (two-content)");
                      });
                      editor.on("error", (err?: any) => {
                        if (err) {
                          console.error("TinyMCE error in right content editor (two-content):", err);
                        } else {
                          console.error("TinyMCE error in right content editor (two-content): Unknown error");
                        }
                      });
                    },
                  }}
                  apiKey={process.env.NEXT_PUBLIC_TINY_API_KEY}
                />
              </div>
            </>
          ) : (
            <>
              <div
                className="w-1/2 text-left"
                dangerouslySetInnerHTML={{ __html: slide.content }}
                style={{ fontFamily: slide.fontFamily, fontSize: "1rem" }}
              />
              <div
                className="w-1/2 text-left"
                dangerouslySetInnerHTML={{ __html: slide.content }}
                style={{ fontFamily: slide.fontFamily, fontSize: "1rem" }}
              />
            </>
          )}
        </div>
      </div>
    ),
  },
};

// Available fonts
const FONTS = [
  "Inter",
  "Poppins",
  "Roboto",
  "Montserrat",
  "Arial",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Verdana",
];

// CSS reset for non-slide elements
const globalStyles = `
  .sidebar, .sidebar *, header, header *, h1, h2:not(.slide-content), label, input, select, button {
    font-size: inherit !important;
  }
  .slide-content {
    font-size: inherit;
  }
`;

// Inject global styles
const GlobalStyles = () => (
  <style jsx global>{globalStyles}</style>
);

export function PitchDeckPlayground() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 450 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);
  const [slides, setSlides] = useState<SlideContent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSlideAnalysis, setShowSlideAnalysis] = useState(false);
  const [slideNotes, setSlideNotes] = useState<{ [key: number]: string }>({});
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [slideHistory, setSlideHistory] = useState<SlideContent[][]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const revealRef = useRef<any>(null);
  console.log(isMobile, "isMobile in PitchDeckPlayground");

  // Design settings with enhanced options
  const [designSettings, setDesignSettings] = useState({
    primaryColor: "#4f46e5",
    secondaryColor: "#8b5cf6",
    accentColor: "#f97316",
    fontFamily: "Inter",
    titleFontSize: "2.5rem",
    contentFontSize: "1rem",
    textBoxSpacing: "1rem",
    animationSpeed: 0.5,
    darkMode: false,
    backgroundImage: "",
    slideTransition: "slide",
    theme: "modern",
    borderRadius: "8px",
    shadowIntensity: 0.3,
  });

  // Save to history when slides change
  const saveToHistory = (newSlides: SlideContent[]) => {
    const newHistory = slideHistory.slice(0, currentHistoryIndex + 1);
    newHistory.push([...newSlides]);
    setSlideHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
  };

  // Undo/Redo functionality
  const undo = () => {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(currentHistoryIndex - 1);
      setSlides([...slideHistory[currentHistoryIndex - 1]]);
    }
  };

  const redo = () => {
    if (currentHistoryIndex < slideHistory.length - 1) {
      setCurrentHistoryIndex(currentHistoryIndex + 1);
      setSlides([...slideHistory[currentHistoryIndex + 1]]);
    }
  };

  // Initialize Reveal.js for presentation mode
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isDestroyed = false;
    
    if (isPresenting && slides.length > 0) {
      const initializeReveal = async () => {
        try {
          // Add a small delay to ensure DOM is ready
          await new Promise(resolve => setTimeout(resolve, 100));
          
          if (isDestroyed) return;
          
          const Reveal = (await import("reveal.js")).default;
          
          // Clean up existing instance
          if (revealRef.current) {
            try {
              revealRef.current.destroy();
            } catch (e) {
              console.warn("Error destroying previous Reveal instance:", e);
            }
            revealRef.current = null;
          }
          
          if (isDestroyed) return;
          
          // Wait for the reveal container to be rendered
          const revealContainer = document.querySelector(".reveal") as HTMLElement;
          if (!revealContainer) {
            throw new Error("Reveal.js container not found");
          }
          
          if (isDestroyed) return;
          
          revealRef.current = new Reveal(revealContainer, {
            hash: false, // Disable hash to prevent navigation issues
            transition: designSettings.slideTransition as "slide" | "none" | "fade" | "convex" | "concave" | "zoom" | undefined,
            transitionSpeed: "default",
            width: containerSize.width,
            height: containerSize.height,
            center: true,
            controls: true,
            progress: true,
            keyboard: true,
            touch: true,
            loop: false,
            rtl: false,
            embedded: true, // Add embedded mode
          });
          
          if (isDestroyed) return;
          
          await revealRef.current.initialize();
          console.log("Reveal.js initialized successfully");
        } catch (err) {
          if (!isDestroyed) {
            console.error("Error initializing Reveal.js:", err);
            setError("Failed to initialize presentation mode: " + (err as Error).message);
            toast("Failed to initialize presentation mode", {
              description: (err as Error).message,
              action: {
              label: "Retry",
              onClick: () => setIsPresenting(false),
              },
            });
          }
        }
      };
      
      // Debounce initialization
      timeoutId = setTimeout(initializeReveal, 200);
    }
    
    return () => {
      isDestroyed = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (revealRef.current) {
        try {
          revealRef.current.destroy();
          revealRef.current = null;
        } catch (err) {
          console.warn("Error destroying Reveal.js:", err);
        }
      }
    };
  }, [isPresenting, slides.length]); // Simplified dependencies

  // Handle window resize with responsive breakpoints
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById("pitch-preview-container");
      if (container) {
        const windowWidth = window.innerWidth;
        const containerWidth = container.offsetWidth;
        
        let width, height;
        
        if (windowWidth < 640) { // Mobile
          width = Math.min(containerWidth - 32, 320);
          height = width * 0.5625;
        } else if (windowWidth < 768) { // Small tablet
          width = Math.min(containerWidth - 48, 480);
          height = width * 0.5625;
        } else if (windowWidth < 1024) { // Tablet
          width = Math.min(containerWidth - 64, 640);
          height = width * 0.5625;
        } else { // Desktop
          width = Math.min(containerWidth, 800);
          height = width * 0.5625;
        }
        
        setContainerSize({ 
          width, 
          height: Math.min(height, window.innerHeight * 0.6) 
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update sidebar visibility based on screen size
  useEffect(() => {
    setShowSidebar(!isMobile);
  }, [isMobile]);

  // Helper function to strip ```json and ``` markers
  const stripCodeBlockMarkers = (input: string): string => {
    const jsonMarkerStart = "```json";
    const codeBlockEnd = "```";
    let cleaned = input.trim();
    
    if (cleaned.startsWith(jsonMarkerStart)) {
      cleaned = cleaned.slice(jsonMarkerStart.length);
    }
    if (cleaned.endsWith(codeBlockEnd)) {
      cleaned = cleaned.slice(0, -codeBlockEnd.length);
    }
    
    return cleaned.trim();
  };

  // Fetch slides from FastAPI backend using URL parameters
  const fetchSlides = async () => {
    const pitchData = {
      title: searchParams.get("title") || "SKZIISELL",
      description: searchParams.get("description") || "Connect buyers and sellers of used PCs and consoles",
      industry: searchParams.get("industry") || "E-commerce",
      startup_stage: searchParams.get("startup_stage") || "Seed",
      target_market: searchParams.get("target_market") || "$10.8B by 2025",
    };
    console.log("Fetching slides with data:", pitchData);

    if (!pitchData.industry) {
      setError("Please provide an industry");
      setIsGenerating(false);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const token = await getAuthToken();
      if (!token) throw new Error("User not authenticated");

      const response = await fetch(`https://pitchdeckbend.onrender.com/generate-slides`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(pitchData),
      });
      const data = await response.json();
      console.log("Response data:", data);

      if (data.success) {
        console.log("Raw slides data:", data.slides);

        let parsedSlides: any[];

        if (typeof data.slides === "string") {
          try {
            const cleanedSlides = stripCodeBlockMarkers(data.slides);
            parsedSlides = JSON.parse(cleanedSlides);
          } catch (parseError) {
            throw new Error("Failed to parse slides JSON: " + (parseError as Error).message);
          }
        } else {
          parsedSlides = data.slides;
        }

        if (!Array.isArray(parsedSlides) || parsedSlides.some((slide: any) => !slide.title)) {
          throw new Error("Invalid slides format: Expected an array of objects with title and content");
        }

        const newSlides = parsedSlides.map((slide: any) => ({
          title: slide.title,
          content: slide.content || "<p>No content provided.</p>",
          background: designSettings.primaryColor,
          transition: designSettings.slideTransition,
          fontFamily: designSettings.fontFamily,
          layout: "title-content" as "title-content",
        }));

        setSlides(newSlides);
        saveToHistory(newSlides);
        toast("Slides generated successfully!", {
          description: `${newSlides.length} slides created for your pitch deck`,
          action: {
            label: "View All",
            onClick: () => setCurrentSlide(0),
          },
        });
            } else {
        setError(data.error || "Failed to generate slides");
        toast("Failed to generate slides", {
          description: data.error || "An error occurred while generating your slides",
          action: {
            label: "Retry",
            onClick: () => fetchSlides(),
          },
        });
            }
          } catch (err) {
            const errorMessage = "Error fetching slides: " + (err as Error).message;
            setError(errorMessage);
            toast("Error fetching slides", {
        description: errorMessage,
        action: {
          label: "Try Again",
          onClick: () => fetchSlides(),
        },
            });
    } finally {
      setIsGenerating(false);
    }
  };

  // Update slide content with history tracking
  const updateSlideContent = (index: number, field: keyof SlideContent, value: string) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setSlides(newSlides);
    saveToHistory(newSlides);
  };

  // Add new slide
  const addSlide = () => {
    const newSlide: SlideContent = {
      title: "New Slide",
      content: "<p>Enter your content here...</p>",
      background: designSettings.primaryColor,
      transition: designSettings.slideTransition,
      fontFamily: designSettings.fontFamily,
      layout: "title-content",
    };
    const newSlides = [...slides, newSlide];
    setSlides(newSlides);
    saveToHistory(newSlides);
    setCurrentSlide(slides.length);
  };

  // Delete slide
  const deleteSlide = (index: number) => {
    if (slides.length > 1) {
      const newSlides = slides.filter((_, i) => i !== index);
      setSlides(newSlides);
      saveToHistory(newSlides);
      if (currentSlide >= newSlides.length) {
        setCurrentSlide(newSlides.length - 1);
      }
    }
  };

  // Duplicate slide
  const duplicateSlide = (index: number) => {
    const slideToClone = { ...slides[index] };
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, slideToClone);
    setSlides(newSlides);
    saveToHistory(newSlides);
  };

  // Handle slide navigation
  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // Enhanced PDF download with better formatting
  const handleDownload = () => {
    const doc = new jsPDF();
    slides.forEach((slide, index) => {
      if (index > 0) doc.addPage();
      
      // Add background color
      doc.setFillColor(slide.background || designSettings.primaryColor);
      doc.rect(0, 0, 210, 297, 'F');
      
      // Title
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      const title = slide.title.replace(/<[^>]+>/g, "");
      doc.text(title, 105, 40, { align: 'center' });
      
      // Content
      doc.setFontSize(14);
      const content = slide.content
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();
      const lines = doc.splitTextToSize(content, 170);
      doc.text(lines, 20, 70);
      
      // Footer
      doc.setFontSize(10);
      doc.text(`Slide ${index + 1} of ${slides.length}`, 105, 280, { align: 'center' });
    });
    
    doc.save(`${searchParams.get("title") || "pitch-deck"}.pdf`);
    toast("PDF Downloaded", {
      description: "Your pitch deck has been saved as a PDF with enhanced formatting.",
      action: {
        label: "View PDF",
        onClick: () => window.open(doc.output("bloburl"), "_blank"),
      },
    });
    };

    // Handle voiceover (enhanced placeholder)
    const handleVoiceover = () => {
    toast("Voiceover Generation", {
      description: "AI voiceover generation will be available soon!",
      action: {
        label: "Learn More",
        onClick: () => window.open("https://example.com/voiceover", "_blank"),
      },
    });
    };

  // Handle slide analysis navigation
  const handleSlideAnalysis = () => {
    router.push(
      `/slide-analysis?${new URLSearchParams({
        title: slides[0]?.title || "SKZIISELL",
        description: slides[1]?.content || "Connect buyers and sellers",
        industry: searchParams.get("industry") || "E-commerce",
        startup_stage: searchParams.get("startup_stage") || "Seed",
        target_market: searchParams.get("target_market") || "$10.8B by 2025",
      }).toString()}`
    );
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  // Auto-save functionality
  useEffect(() => {
    const pathSegments = window.location.pathname.split('/').pop(); // Gets the last segment which is the UUID
    const pitchId = pathSegments; // Gets the last segment which is the UUID
    console.log(`Auto-saving pitch deck with ID: ${pitchId}`);
    
    const autoSave = setTimeout(() => {
      if (slides.length > 0 && pitchId) {
        localStorage.setItem(`pitch-deck-slides-${pitchId}`, JSON.stringify(slides));
        localStorage.setItem(`pitch-deck-settings-${pitchId}`, JSON.stringify(designSettings));
        localStorage.setItem(`pitch-deck-pitch-id`, pitchId);
      }
    }, 5000);

    return () => clearTimeout(autoSave);
  }, [slides, designSettings]);

  // Load from localStorage on mount
  useEffect(() => {
    const pitchIdFromUrl = window.location.pathname.split('/').pop(); // Gets the last segment which is the UUID
    const savedPitchId = localStorage.getItem('pitch-deck-pitch-id');
    
    // Only load saved slides if the URL pitch ID matches the saved pitch ID
    if (pitchIdFromUrl && savedPitchId && pitchIdFromUrl === savedPitchId) {
      const savedSlides = localStorage.getItem(`pitch-deck-slides-${pitchIdFromUrl}`);
      const savedSettings = localStorage.getItem(`pitch-deck-settings-${pitchIdFromUrl}`);
      
      if (savedSlides) {
        const parsedSlides = JSON.parse(savedSlides);
        setSlides(parsedSlides);
        saveToHistory(parsedSlides);
      }
      
      if (savedSettings) {
        setDesignSettings(JSON.parse(savedSettings));
      }
    }
  }, [searchParams]);

  // Enhanced loading animation
  const renderLoadingAnimation = () => (
    <motion.div
      className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ minHeight: containerSize.height }}
    >
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-gradient-to-r from-indigo-500 to-purple-500 rounded-full border-t-transparent animate-spin"></div>
      </motion.div>
      <motion.div
        className="mt-4 sm:mt-6 space-y-2 text-center px-4"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200">
          Generating Your Slides
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          AI is crafting your perfect pitch deck...
        </p>
      </motion.div>
      <motion.div
        className="mt-3 sm:mt-4 flex space-x-1"
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        initial="initial"
        animate="animate"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-indigo-500 rounded-full"
            variants={{
              initial: { y: 0 },
              animate: {
                y: [-10, 0, -10],
                transition: {
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              },
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );

  // Enhanced slide rendering
  const renderSlide = () => {
    if (isGenerating) {
      return renderLoadingAnimation();
    }

    if (slides.length === 0) {
      return (
        <motion.div
          className="flex flex-col items-center justify-center w-full bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 sm:p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ minHeight: containerSize.height }}
        >
          <motion.div
            className="text-center space-y-3 sm:space-y-4 max-w-xs sm:max-w-md"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
              <Palette className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200">
              Ready to Create Your Pitch Deck?
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Generate AI-powered slides tailored to your business. Click "Generate Slides" to begin.
            </p>
          </motion.div>
        </motion.div>
      );
    }

    const slide = slides[currentSlide];
    const bgColor = slide.background || designSettings.primaryColor;
    const textColor = slide.background ? "#ffffff" : "#1a1a1a";
    const layout = slide.layout || "title-content";

    return (
      <motion.div
        className="flex justify-center items-center w-full"
        key={`slide-${currentSlide}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          id={`slide-${currentSlide}`}
          className="relative overflow-hidden transition-all duration-300 ease-in-out shadow-xl hover:shadow-2xl w-full max-w-full slide-content"
          style={{
            width: containerSize.width,
            height: containerSize.height,
            backgroundColor: bgColor,
            backgroundImage: designSettings.backgroundImage ? `url(${designSettings.backgroundImage})` : 
              `linear-gradient(135deg, ${bgColor}aa, ${designSettings.secondaryColor}aa)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            fontFamily: slide.fontFamily || designSettings.fontFamily,
            color: textColor,
            padding: isMobile ? "16px" : "24px",
            borderRadius: designSettings.borderRadius,
            border: `2px solid ${designSettings.accentColor}20`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10 pointer-events-none" />
          
          {LAYOUTS[layout].render(
            slide,
            true,
            (content) => updateSlideContent(currentSlide, "title", content),
            (content) => updateSlideContent(currentSlide, "content", content),
            isMobile ? "1.5rem" : designSettings.titleFontSize,
            isMobile ? "0.8rem" : designSettings.contentFontSize,
            isMobile ? "0.5rem" : designSettings.textBoxSpacing
          )}
          
          <div
            className="absolute bottom-2 sm:bottom-3 right-2 sm:right-4 px-2 py-1 bg-black/20 backdrop-blur-sm rounded-full text-white/80 text-xs sm:text-sm"
          >
            {currentSlide + 1} / {slides.length}
          </div>
          
          {slideNotes[currentSlide] && (
            <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-4 px-2 py-1 bg-yellow-500/20 backdrop-blur-sm rounded-full">
              <span className="text-xs text-yellow-800 dark:text-yellow-200">📝</span>
            </div>
          )}
        </Card>
      </motion.div>
    );
  };

  // Enhanced presentation mode
  const renderPresentation = () => {
    return (
      <div className="flex justify-center items-center w-full h-full bg-black">
        <div className="reveal w-full max-w-full">
          <div className="slides">
            {slides.map((slide, index) => {
              const layout = slide.layout || "title-content";
              return (
                <section
                  key={index}
                  style={{
                    backgroundColor: slide.background || designSettings.primaryColor,
                    backgroundImage: designSettings.backgroundImage ? 
                      `url(${designSettings.backgroundImage})` : 
                      `linear-gradient(135deg, ${slide.background || designSettings.primaryColor}, ${designSettings.secondaryColor})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    fontFamily: slide.fontFamily || designSettings.fontFamily,
                    padding: isMobile ? "20px" : "40px",
                    width: containerSize.width,
                    height: containerSize.height,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10" />
                  {LAYOUTS[layout].render(slide, false)}
                </section>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <SidebarProvider>
      <GlobalStyles />
      <div className="flex-1 flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
        {/* Enhanced Responsive Header */}
        <motion.header 
          className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 shadow-sm relative z-20"
          animate={{
            marginLeft: !isMobile && showSidebar ? 320 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.div
          className="p-1.5 sm:p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg"
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
              >
          <Palette size={isMobile ? 20 : 24} className="text-white" />
              </motion.div>
              <div>
          <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Pitch Deck Studio
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
            AI-Powered Presentation Builder
          </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Desktop controls */}
              {!isMobile && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={currentHistoryIndex <= 0}
              className="text-gray-600 hover:text-gray-800"
            >
              ↶
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={currentHistoryIndex >= slideHistory.length - 1}
              className="text-gray-600 hover:text-gray-800"
            >
              ↷
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-gray-600 hover:text-gray-800"
            >
              {isFullScreen ? "⊞" : "⊡"}
            </Button>
          </>
              )}
              
              {/* Auto-save indicator */}
              <div className="flex items-center gap-1 text-xs text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="hidden sm:inline">Auto-saved</span>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="flex flex-1 overflow-hidden relative">
          {/* Enhanced Mobile-First Sidebar */}
            <AnimatePresence>
            {showSidebar && (
              <motion.div
              initial={{ x: isMobile ? -320 : -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isMobile ? -320 : -320, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'fixed left-0 top-0 z-30'}`}
              style={{ 
                position: 'fixed',
                top: 0,
                bottom: 0,
                left: 0,
                height: '100vh',
                width: isMobile ? '280px' : '320px'
              }}
              >
              {isMobile && (
                <div 
                className="absolute inset-0 bg-black/50 z-40"
                onClick={() => setShowSidebar(false)}
                />
              )}
              <div className={`${isMobile ? 'w-[280px]' : 'w-[320px]'} h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-xl border-r border-gray-200/50 dark:border-gray-700/50 relative z-50 flex flex-col`}>
                <div className="border-b border-gray-200/50 dark:border-gray-700/50 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0" >
                <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                Slide Editor
                </h2>
                <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(false)}
                className="text-gray-500 hover:text-gray-700"
                >
                <ChevronLeft className="h-4 w-4" />
                </Button>
                </div>
                </div>
                
                <div className="flex-1 p-3 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
                <Tabs defaultValue="design" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-1">
                <TabsTrigger value="design" className="text-xs sm:text-sm font-medium">Design</TabsTrigger>
                <TabsTrigger value="slides" className="text-xs sm:text-sm font-medium">Slides</TabsTrigger>
                <TabsTrigger value="notes" className="text-xs sm:text-sm font-medium">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="design" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                {/* Responsive Color Scheme */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">Color Scheme</h3>
                  
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {["primaryColor", "secondaryColor", "accentColor"].map((color, idx) => (
                  <div key={color} className="space-y-2">
                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {["Primary", "Secondary", "Accent"][idx]}
                  </Label>
                  <div className="relative">
                    <Input
                    type="color"
                    value={designSettings[color as keyof typeof designSettings] as string}
                    onChange={(e) => setDesignSettings({ 
                    ...designSettings, 
                    [color]: e.target.value 
                    })}
                    className="h-8 sm:h-10 w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer"
                    />
                  </div>
                  </div>
                  ))}
                  </div>
                </div>

                {/* Responsive Typography */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">Typography</h3>
                  
                  <div className="space-y-3">
                  <div>
                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                  Font Family
                  </Label>
                  <select
                  value={designSettings.fontFamily}
                  onChange={(e) => setDesignSettings({ ...designSettings, fontFamily: e.target.value })}
                  className="w-full h-8 sm:h-10 px-2 sm:px-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:border-indigo-500 transition-colors text-sm"
                  >
                  {FONTS.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                  </select>
                  </div>
                  
                  {!isMobile && (
                  <>
                  <div>
                    <Label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                    Title Size: {designSettings.titleFontSize}
                    </Label>
                    <Slider
                    min={1}
                    max={4}
                    step={0.1}
                    value={[parseFloat(designSettings.titleFontSize)]}
                    onValueChange={(value) => setDesignSettings({ 
                    ...designSettings, 
                    titleFontSize: `${value[0]}rem` 
                    })}
                    className="w-full"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                    Content Size: {designSettings.contentFontSize}
                    </Label>
                    <Slider
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={[parseFloat(designSettings.contentFontSize)]}
                    onValueChange={(value) => setDesignSettings({ 
                    ...designSettings, 
                    contentFontSize: `${value[0]}rem` 
                    })}
                    className="w-full"
                    />
                  </div>
                  </>
                  )}
                  </div>
                </div>

                {/* Responsive Animation & Effects */}
                {!isMobile && (
                  <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">Animation & Effects</h3>
                  
                  <div className="space-y-3">
                  <div>
                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                    Transition
                  </Label>
                  <select
                    value={designSettings.slideTransition}
                    onChange={(e) => setDesignSettings({ 
                    ...designSettings, 
                    slideTransition: e.target.value 
                    })}
                    className="w-full h-8 sm:h-10 px-2 sm:px-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:border-indigo-500 transition-colors text-sm"
                  >
                    <option value="slide">Slide</option>
                    <option value="fade">Fade</option>
                    <option value="convex">Convex</option>
                    <option value="concave">Concave</option>
                    <option value="zoom">Zoom</option>
                  </select>
                  </div>
                  
                  <div>
                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                    Animation Speed
                  </Label>
                  <Slider
                    min={0.1}
                    max={1}
                    step={0.1}
                    value={[designSettings.animationSpeed]}
                    onValueChange={(value) => setDesignSettings({ 
                    ...designSettings, 
                    animationSpeed: value[0] 
                    })}
                    className="w-full"
                  />
                  </div>
                  </div>
                  </div>
                )}

                {/* Background */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">Background</h3>
                  <Input
                  placeholder="Background image URL..."
                  value={designSettings.backgroundImage}
                  onChange={(e) => setDesignSettings({ 
                  ...designSettings, 
                  backgroundImage: e.target.value 
                  })}
                  className="w-full h-8 sm:h-10 rounded-lg border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 transition-colors text-sm"
                  />
                </div>
                </TabsContent>

                <TabsContent value="slides" className="space-y-4 mt-4 sm:mt-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">Slides ({slides.length})</h3>
                  <Button
                  onClick={addSlide}
                  size="sm"
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-xs sm:text-sm"
                  >
                  + Add
                  </Button>
                </div>
                
                <div className="space-y-3 max-h-64 sm:max-h-96 overflow-y-auto">
                  {slides.map((slide, index) => (
                  <motion.div
                  key={index}
                  className={`p-2 sm:p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  currentSlide === index
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  >
                  <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-xs sm:text-sm text-gray-800 dark:text-gray-200 truncate">
                    {slide.title || `Slide ${index + 1}`}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {slide.content.replace(/<[^>]+>/g, '').substring(0, 50)}...
                    </p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                    e.stopPropagation();
                    duplicateSlide(index);
                    }}
                    className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-gray-400 hover:text-gray-600 text-xs"
                    >
                    📄
                    </Button>
                    {slides.length > 1 && (
                    <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                    e.stopPropagation();
                    deleteSlide(index);
                    }}
                    className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-red-400 hover:text-red-600 text-xs"
                    >
                    🗑️
                    </Button>
                    )}
                  </div>
                  </div>
                  </motion.div>
                  ))}
                </div>
                </TabsContent>

                <TabsContent value="notes" className="space-y-4 mt-4 sm:mt-6">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">Speaker Notes</h3>
                {slides.length > 0 && (
                  <div className="space-y-3">
                  <Label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Notes for Slide {currentSlide + 1}
                  </Label>
                  <textarea
                  value={slideNotes[currentSlide] || ''}
                  onChange={(e) => setSlideNotes({
                  ...slideNotes,
                  [currentSlide]: e.target.value
                  })}
                  placeholder="Add speaker notes for this slide..."
                  className="w-full h-24 sm:h-32 p-2 sm:p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:border-indigo-500 transition-colors resize-none text-xs sm:text-sm"
                  />
                  </div>
                )}
                </TabsContent>
                </Tabs>
                </div>
              </div>
              </motion.div>
            )}
            </AnimatePresence>

          {/* Main Content with responsive margins */}
          <motion.main
            className="flex-1 overflow-auto p-3 sm:p-6"
            animate={{
              marginLeft: !isMobile && showSidebar ? 320 : 0,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-2 sm:gap-4">
                  {/* Sidebar toggle button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <ChevronRight className={`h-4 w-4 transition-transform ${showSidebar ? 'rotate-180' : ''}`} />
                  </Button>
                  <div>
                    <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                      Pitch Deck Preview
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
                      Create and customize your presentation slides
                    </p>
                  </div>
                </div>
                
                {/* {slides.length > 0 && (
                  <Button
                    onClick={handleSlideAnalysis}
                    variant="outline"
                    className="flex items-center gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-sm"
                  >
                    <BarChart2 className="h-4 w-4" />
                    Analyze Slides
                  </Button>
                )} */}
              </div>

              {error && (
                <motion.div
                  className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              <div 
                id="pitch-preview-container"
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-8"
              >
                <AnimatePresence mode="wait">
                  {isPresenting ? renderPresentation() : renderSlide()}
                </AnimatePresence>

                {!isPresenting && slides.length > 0 && (
                  <div className="flex justify-center items-center gap-3 sm:gap-4 mt-4 sm:mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevSlide}
                      disabled={currentSlide === 0}
                      className="rounded-full h-8 w-8 sm:h-10 sm:w-10 p-0"
                    >
                      <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    
                    <div className="flex space-x-1 sm:space-x-2">
                      {slides.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            currentSlide === index
                              ? 'bg-indigo-500 w-4 sm:w-6'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextSlide}
                      disabled={currentSlide === slides.length - 1}
                      className="rounded-full h-8 w-8 sm:h-10 sm:w-10 p-0"
                    >
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Responsive Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={fetchSlides}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium py-2 sm:py-3 rounded-xl shadow-lg text-sm sm:text-base"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
                    {isGenerating ? "Generating..." : "Generate Slides"}
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => setIsPresenting(!isPresenting)}
                    disabled={slides.length === 0}
                    variant="outline"
                    className="w-full border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 py-2 sm:py-3 rounded-xl text-sm sm:text-base"
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    {isPresenting ? "Edit Mode" : "Present"}
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleDownload}
                    disabled={slides.length === 0}
                    variant="outline"
                    className="w-full border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 py-2 sm:py-3 rounded-xl text-sm sm:text-base"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleVoiceover}
                    disabled={slides.length === 0}
                    variant="outline"
                    className="w-full border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 py-2 sm:py-3 rounded-xl text-sm sm:text-base"
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    Voiceover
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={async () => {
                        try {
                          const token = await getAuthToken();
                          if (!token) throw new Error("User not authenticated");

                          const pitchId = window.location.pathname.split('/').pop();
                          
                          // Save slides as a single JSON object
                          const pitchDeckData = {
                            slides: slides.map((slide, index) => ({
                              title: slide.title.replace(/<[^>]+>/g, ''), // Strip HTML tags from title
                              content: slide.content,
                              background: slide.background,
                              transition: slide.transition,
                              fontFamily: slide.fontFamily,
                              layout: slide.layout,
                              order: index
                            })),
                            designSettings: designSettings,
                            slideNotes: slideNotes,
                            metadata: {
                              totalSlides: slides.length,
                              currentSlide: currentSlide,
                              lastModified: new Date().toISOString(),
                              version: "1.0"
                            }
                          };
                          
                          const requestBody = {
                            pitch_deck_id: pitchId,
                            slides_data: JSON.stringify(pitchDeckData) // Send as single JSON string
                          };
                          
                          console.log("Saving pitch deck:", requestBody);
                          
                          const response = await fetch(`https://pitchdeckbend.onrender.com/save-slides`, {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              "Authorization": `Bearer ${token}`,
                            },
                            body: JSON.stringify(requestBody),
                          });
                          
                          const data = await response.json();
                          
                          if (response.ok) {
                            toast("Saved Successfully", {
                              description: data.message || "Pitch deck saved successfully",
                              action: {
                                label: "View",
                                onClick: () => console.log(`Pitch deck saved: ${pitchId}`),
                              },
                            });
                          } else {
                            throw new Error(data.detail || "Failed to save pitch deck");
                          }
                        } catch (error) {
                          console.error("Save error:", error);
                          toast("Save Failed", {
                            description: (error as Error).message,
                            action: {
                              label: "Retry",
                              onClick: () => console.log("Retry save"),
                            },
                          });
                        }
                      }}
                      disabled={slides.length === 0}
                      variant="outline"
                      className="w-full border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 py-2 sm:py-3 rounded-xl text-sm sm:text-base"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                </motion.div>
              </div>
            </div>
          </motion.main>
        </div>
      </div>
    </SidebarProvider>
  );
}