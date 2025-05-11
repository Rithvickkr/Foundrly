"use client";

import { useState, useEffect, useRef } from "react";
import { Download, Mic, RefreshCw, Palette, ChevronLeft, ChevronRight, Save, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { toast } from "./use-toast";
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import dynamic from "next/dynamic";
import "reveal.js/dist/reveal.css";
import "reveal.js/dist/theme/white.css";
import { jsPDF } from "jspdf";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuthToken } from "@/lib/actions/getauthtoken";

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
            value={slide.title}
            onEditorChange={(content) => onTitleChange && onTitleChange(content)}
            init={{
              inline: true,
              menubar: false,
              plugins: ["lists link"],
              toolbar: "undo redo | bold italic | alignleft aligncenter alignright | bullist numlist",
              content_style: `body { font-family: ${slide.fontFamily || "Inter"}; font-size: ${titleFontSize || "2.5rem"}; text-align: center; }`,
            }}
            apiKey="v31jdsle08zrmxiz0jkp99x1k7xph3sdxml6ya1ws3k2ak5p"
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
          <div className="mt-4" style={{ marginTop: textBoxSpacing || "1rem" }}>
            {isEditable ? (
              <Editor
                value={slide.content}
                onEditorChange={(content) => onContentChange && onContentChange(content)}
                init={{
                  inline: true,
                  menubar: false,
                  plugins: ["advlist autolink lists link image charmap preview anchor", "searchreplace visualblocks code fullscreen", "insertdatetime media table paste code help wordcount"],
                  toolbar:
                    "undo redo | formatselect | fontselect fontsizeselect | " +
                    "bold italic underline | alignleft aligncenter alignright alignjustify | " +
                    "bullist numlist outdent indent | link image | removeformat | help",
                  font_formats: FONTS.join(";"),
                  fontsize_formats: "8pt 10pt 12pt 14pt 18pt 24pt 36pt",
                  content_style: `body { font-family: ${slide.fontFamily || "Inter"}; font-size: ${contentFontSize || "1rem"}; text-align: center; }`,
                }}
                apiKey="v31jdsle08zrmxiz0jkp99x1k7xph3sdxml6ya1ws3k2ak5p"
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
            value={slide.title}
            onEditorChange={(content) => onTitleChange && onTitleChange(content)}
            init={{
              inline: true,
              menubar: false,
              plugins: ["lists link"],
              toolbar: "undo redo | bold italic | alignleft aligncenter alignright | bullist numlist",
              content_style: `body { font-family: ${slide.fontFamily || "Inter"}; font-size: ${titleFontSize || "2rem"}; text-align: center; }`,
            }}
            apiKey="v31jdsle08zrmxiz0jkp99x1k7xph3sdxml6ya1ws3k2ak5p"
          />
        ) : (
          <h2
            className="text-center font-bold mb-4"
            style={{ fontFamily: slide.fontFamily, fontSize: "2rem" }}
          >
            {slide.title}
          </h2>
        )}
        {isEditable ? (
          <Editor
            value={slide.content}
            onEditorChange={(content) => onContentChange && onContentChange(content)}
            init={{
              inline: true,
              menubar: false,
              plugins: ["advlist autolink lists link image charmap preview anchor", "searchreplace visualblocks code fullscreen", "insertdatetime media table paste code help wordcount"],
              toolbar:
                "undo redo | formatselect | fontselect fontsizeselect | " +
                "bold italic underline | alignleft aligncenter alignright alignjustify | " +
                "bullist numlist outdent indent | link image | removeformat | help",
              font_formats: FONTS.join(";"),
              fontsize_formats: "8pt 10pt 12pt 14pt 18pt 24pt 36pt",
              content_style: `body { font-family: ${slide.fontFamily || "Inter"}; font-size: ${contentFontSize || "1rem"}; }`,
            }}
            apiKey="v31jdsle08zrmxiz0jkp99x1k7xph3sdxml6ya1ws3k2ak5p"
           
          />
        ) : (
          <div
            className="flex-1 text-center"
            dangerouslySetInnerHTML={{ __html: slide.content }}
            style={{ fontFamily: slide.fontFamily, fontSize: "1rem", marginTop: "1rem" }}
          />
        )}
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
            value={slide.title}
            onEditorChange={(content) => onTitleChange && onTitleChange(content)}
            init={{
              inline: true,
              menubar: false,
              plugins: ["lists link"],
              toolbar: "undo redo | bold italic | alignleft aligncenter alignright | bullist numlist",
              content_style: `body { font-family: ${slide.fontFamily || "Inter"}; font-size: ${titleFontSize || "2rem"}; text-align: center; }`,
            }}
            apiKey="v31jdsle08zrmxiz0jkp99x1k7xph3sdxml6ya1ws3k2ak5p"
          />
        ) : (
          <h2
            className="text-center font-bold mb-4"
            style={{ fontFamily: slide.fontFamily, fontSize: "2rem" }}
          >
            {slide.title}
          </h2>
        )}
        <div className="flex flex-row flex-1" style={{ gap: textBoxSpacing || "1rem", marginTop: textBoxSpacing || "1rem" }}>
          {isEditable ? (
            <>
              <Editor
                value={slide.content}
                onEditorChange={(content) => onContentChange && onContentChange(content)}
                init={{
                  inline: true,
                  menubar: false,
                  plugins: ["advlist autolink lists link image charmap preview anchor", "searchreplace visualblocks code fullscreen", "insertdatetime media table paste code help wordcount"],
                  toolbar:
                    "undo redo | formatselect | fontselect fontsizeselect | " +
                    "bold italic underline | alignleft aligncenter alignright alignjustify | " +
                    "bullist numlist outdent indent | link image | removeformat | help",
                  font_formats: FONTS.join(";"),
                  fontsize_formats: "8pt 10pt 12pt 14pt 18pt 24pt 36pt",
                  content_style: `body { font-family: ${slide.fontFamily || "Inter"}; font-size: ${contentFontSize || "1rem"}; }`,
                }}
                apiKey="v31jdsle08zrmxiz0jkp99x1k7xph3sdxml6ya1ws3k2ak5p"
                
              />
              <Editor
                value={slide.content}
                onEditorChange={(content) => onContentChange && onContentChange(content)}
                init={{
                  inline: true,
                  menubar: false,
                  plugins: ["advlist autolink lists link image charmap preview anchor", "searchreplace visualblocks code fullscreen", "insertdatetime media table paste code help wordcount"],
                  toolbar:
                    "undo redo | formatselect | fontselect fontsizeselect | " +
                    "bold italic underline | alignleft aligncenter alignright alignjustify | " +
                    "bullist numlist outdent indent | link image | removeformat | help",
                  font_formats: FONTS.join(";"),
                  fontsize_formats: "8pt 10pt 12pt 14pt 18pt 24pt 36pt",
                  content_style: `body { font-family: ${slide.fontFamily || "Inter"}; font-size: ${contentFontSize || "1rem"}; }`,
                }}
                apiKey="v31jdsle08zrmxiz0jkp99x1k7xph3sdxml6ya1ws3k2ak5p"
              />
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
  const revealRef = useRef<any>(null);

  // Design settings
  const [designSettings, setDesignSettings] = useState({
    primaryColor: "#4f46e5",
    secondaryColor: "#8b5cf6",
    accentColor: "#f97316",
    fontFamily: "Inter",
    titleFontSize: "2rem", // Default title font size
    contentFontSize: "1rem", // Default content font size
    textBoxSpacing: "1rem", // Default spacing between text boxes
    animationSpeed: 0.5,
    darkMode: false,
    backgroundImage: "",
    slideTransition: "slide",
  });

  // Initialize Reveal.js for presentation mode
  useEffect(() => {
    if (isPresenting && slides.length > 0) {
      import("reveal.js").then((Reveal) => {
        if (revealRef.current) {
          revealRef.current.destroy();
        }
        revealRef.current = new Reveal.default({
          hash: true,
          transition: designSettings.slideTransition as "slide" | "none" | "fade" | "convex" | "concave" | "zoom" | undefined,
          transitionSpeed: designSettings.animationSpeed <= 0.3 ? "slow" : designSettings.animationSpeed >= 0.7 ? "fast" : "default",
          width: containerSize.width,
          height: containerSize.height,
          center: true,
          controls: true,
          progress: true,
        });
        revealRef.current.initialize();
      });
    }
    return () => {
      if (revealRef.current) {
        revealRef.current.destroy();
      }
    };
  }, [isPresenting, slides, designSettings.slideTransition, designSettings.animationSpeed, containerSize]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById("pitch-preview-container");
      if (container) {
        const width = Math.min(container.offsetWidth, 800); // Cap width for centering
        const height = width * 0.5625; // 16:9 aspect ratio
        setContainerSize({ width, height: Math.min(height, window.innerHeight * 0.7) });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

      const response = await fetch(`http://127.0.0.1:8000/generate-slides`, {
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

        // Handle case where data.slides is a string (wrapped in ```json ... ```)
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

        // Validate that parsedSlides is an array of objects with title and content
        if (!Array.isArray(parsedSlides) || parsedSlides.some((slide: any) => !slide.title)) {
          throw new Error("Invalid slides format: Expected an array of objects with title and content");
        }

        // Initialize slides with default layout and font, ensuring content is not empty
        setSlides(
          parsedSlides.map((slide: any) => ({
            title: slide.title,
            content: slide.content || "<p>No content provided.</p>",
            background: designSettings.primaryColor,
            transition: designSettings.slideTransition,
            fontFamily: designSettings.fontFamily,
            layout: "title-content" as "title-content",
          }))
        );
        toast({ title: "Slides Generated", description: "Successfully fetched slides from AI." });
      } else {
        setError(data.error || "Failed to generate slides");
        toast({ title: "Error", description: data.error || "Failed to generate slides", variant: "destructive" });
      }
    } catch (err) {
      const errorMessage = "Error fetching slides: " + (err as Error).message;
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  // Update slide content, font, or layout
  const updateSlideContent = (index: number, field: keyof SlideContent, value: string) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setSlides(newSlides);
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

  // Handle PDF download
  const handleDownload = () => {
    const doc = new jsPDF();
    slides.forEach((slide, index) => {
      if (index > 0) doc.addPage();
      doc.setFontSize(20);
      doc.text(slide.title, 10, 20);
      doc.setFontSize(12);
      // Strip HTML tags and clean up content for PDF
      const content = slide.content
        .replace(/<[^>]+>/g, "") // Remove HTML tags
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim();
      // Split content into lines to wrap text properly
      const lines = doc.splitTextToSize(content, 180);
      doc.text(lines, 10, 40);
    });
    doc.save("pitch-deck.pdf");
    toast({ title: "PDF Downloaded", description: "Your pitch deck has been saved as a PDF." });
  };

  // Handle voiceover (placeholder)
  const handleVoiceover = () => {
    toast({ title: "Voiceover Generation", description: "Voiceover generation is not implemented yet." });
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

  // Render slide in edit or preview mode
  const renderSlide = () => {
    if (slides.length === 0) return <p className="text-center text-gray-500">No slides available. Generate slides to start.</p>;

    const slide = slides[currentSlide];
    const bgColor = slide.background || "#ffffff";
    const textColor = slide.background ? "#ffffff" : "#1a1a1a";
    const layout = slide.layout || "title-content";

    return (
      <div className="flex justify-center items-center w-full">
        <Card
          id={`slide-${currentSlide}`}
          className="relative overflow-hidden rounded-lg transition-all duration-300 ease-in-out shadow-md max-w-[800px]"
          style={{
            width: containerSize.width,
            height: containerSize.height,
            backgroundColor: bgColor,
            backgroundImage: designSettings.backgroundImage ? `url(${designSettings.backgroundImage})` : undefined,
            backgroundSize: "cover",
            fontFamily: slide.fontFamily || designSettings.fontFamily,
            color: textColor,
            padding: "20px",
          }}
        >
          {LAYOUTS[layout].render(
            slide,
            true, // Enable editing in preview
            (content) => updateSlideContent(currentSlide, "title", content),
            (content) => updateSlideContent(currentSlide, "content", content),
            designSettings.titleFontSize,
            designSettings.contentFontSize,
            designSettings.textBoxSpacing
          )}
          <div
            className="absolute bottom-2 right-4 opacity-70"
            style={{ fontSize: `${containerSize.width * 0.015}px` }}
          >
            {currentSlide + 1}/{slides.length}
          </div>
        </Card>
      </div>
    );
  };

  // Render presentation mode with Reveal.js
  const renderPresentation = () => (
    <div className="flex justify-center items-center w-full h-full">
      <div className="reveal max-w-[800px]">
        <div className="slides">
          {slides.map((slide, index) => (
            <section
              key={index}
              style={{
                backgroundColor: slide.background || "#ffffff",
                backgroundImage: designSettings.backgroundImage ? `url(${designSettings.backgroundImage})` : undefined,
                backgroundSize: "cover",
                fontFamily: slide.fontFamily || designSettings.fontFamily,
                padding: "20px",
                width: containerSize.width,
                height: containerSize.height,
              }}
            >
              {LAYOUTS[slide.layout || "title-content"].render(slide, false)}
            </section>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4 md:px-6">
            <div className="flex items-center gap-2 font-semibold">
              <Palette size={24} className="text-gray-800 dark:text-gray-200 ml-7" />
              <span>Pitch Deck Playground</span>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            className="min-w-[300px] max-w-[300px] bg-gray-50 dark:bg-gray-800 shadow-sm border-r rounded-r-lg"
          >
            <SidebarHeader className="border px-4 py-2">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Slide Editor</h2>
            </SidebarHeader>
            <SidebarContent className="p-4">
              <Tabs defaultValue="design" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                  <TabsTrigger value="design" className="text-gray-800 dark:text-gray-200">Design</TabsTrigger>
                  <TabsTrigger value="slides" className="text-gray-800 dark:text-gray-200">Slides</TabsTrigger>
                </TabsList>

                <TabsContent value="design" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor" className="text-gray-700 dark:text-gray-300 font-medium">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={designSettings.primaryColor}
                        onChange={(e) => setDesignSettings({ ...designSettings, primaryColor: e.target.value })}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={designSettings.primaryColor}
                        onChange={(e) => setDesignSettings({ ...designSettings, primaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor" className="text-gray-700 dark:text-gray-300 font-medium">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={designSettings.secondaryColor}
                        onChange={(e) => setDesignSettings({ ...designSettings, secondaryColor: e.target.value })}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={designSettings.secondaryColor}
                        onChange={(e) => setDesignSettings({ ...designSettings, secondaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accentColor" className="text-gray-700 dark:text-gray-300 font-medium">Accent Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={designSettings.accentColor}
                        onChange={(e) => setDesignSettings({ ...designSettings, accentColor: e.target.value })}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={designSettings.accentColor}
                        onChange={(e) => setDesignSettings({ ...designSettings, accentColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fontFamily" className="text-gray-700 dark:text-gray-300 font-medium">Global Font Family</Label>
                    <select
                      id="fontFamily"
                      value={designSettings.fontFamily}
                      onChange={(e) => setDesignSettings({ ...designSettings, fontFamily: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background dark:bg-gray-700 dark:text-gray-200"
                    >
                      {FONTS.map((font) => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="titleFontSize" className="text-gray-700 dark:text-gray-300 font-medium">Title Font Size</Label>
                    <Slider
                      id="titleFontSize"
                      min={0.5}
                      max={4}
                      step={0.1}
                      value={[parseFloat(designSettings.titleFontSize)]}
                      onValueChange={(value) => setDesignSettings({ ...designSettings, titleFontSize: `${value[0]}rem` })}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Small</span>
                      <span>Large</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contentFontSize" className="text-gray-700 dark:text-gray-300 font-medium">Content Font Size</Label>
                    <Slider
                      id="contentFontSize"
                      min={0.5}
                      max={2}
                      step={0.1}
                      value={[parseFloat(designSettings.contentFontSize)]}
                      onValueChange={(value) => setDesignSettings({ ...designSettings, contentFontSize: `${value[0]}rem` })}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Small</span>
                      <span>Large</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="textBoxSpacing" className="text-gray-700 dark:text-gray-300 font-medium">Text Box Spacing</Label>
                    <Slider
                      id="textBoxSpacing"
                      min={0}
                      max={3}
                      step={0.1}
                      value={[parseFloat(designSettings.textBoxSpacing)]}
                      onValueChange={(value) => setDesignSettings({ ...designSettings, textBoxSpacing: `${value[0]}rem` })}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>None</span>
                      <span>Wide</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backgroundImage" className="text-gray-700 dark:text-gray-300 font-medium">Background Image URL</Label>
                    <Input
                      id="backgroundImage"
                      value={designSettings.backgroundImage}
                      onChange={(e) => setDesignSettings({ ...designSettings, backgroundImage: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="dark:bg-gray-700 dark:text-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slideTransition" className="text-gray-700 dark:text-gray-300 font-medium">Slide Transition</Label>
                    <select
                      id="slideTransition"
                      value={designSettings.slideTransition}
                      onChange={(e) => setDesignSettings({ ...designSettings, slideTransition: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background dark:bg-gray-700 dark:text-gray-200"
                    >
                      <option value="slide">Slide</option>
                      <option value="fade">Fade</option>
                      <option value="convex">Convex</option>
                      <option value="concave">Concave</option>
                      <option value="zoom">Zoom</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="animationSpeed" className="text-gray-700 dark:text-gray-300 font-medium">Animation Speed</Label>
                    <Slider
                      id="animationSpeed"
                      min={0.1}
                      max={1}
                      step={0.1}
                      value={[designSettings.animationSpeed]}
                      onValueChange={(value) => setDesignSettings({ ...designSettings, animationSpeed: value[0] })}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Slow</span>
                      <span>Fast</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="slides" className="space-y-4 mt-4">
                  {slides.map((slide, index) => (
                    <div key={index} className="space-y-4 border-b pb-4">
                      <div className="space-y-2">
                        <Label htmlFor={`slide-title-${index}`} className="text-gray-700 dark:text-gray-300 font-medium">Slide {index + 1} Title</Label>
                        <Input
                          id={`slide-title-${index}`}
                          value={slide.title}
                          onChange={(e) => updateSlideContent(index, "title", e.target.value)}
                          className="dark:bg-gray-700 dark:text-gray-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`slide-content-${index}`} className="text-gray-700 dark:text-gray-300 font-medium">Content</Label>
                        <Editor
                          id={`slide-content-${index}`}
                          value={slide.content}
                          onEditorChange={(content) => updateSlideContent(index, "content", content)}
                          init={{
                            height: 300,
                            menubar: true,
                            plugins: [
                              "advlist autolink lists link image charmap print preview anchor",
                              "searchreplace visualblocks code fullscreen",
                              "insertdatetime media table paste code help wordcount",
                            ],
                            toolbar:
                              "undo redo | formatselect | fontselect fontsizeselect | " +
                              "bold italic underline | alignleft aligncenter alignright alignjustify | " +
                              "bullist numlist outdent indent | link image | removeformat | help",
                            font_formats: FONTS.join(";"),
                            fontsize_formats: "8pt 10pt 12pt 14pt 18pt 24pt 36pt",
                            content_style: `body { font-family: ${slide.fontFamily || designSettings.fontFamily}; }`,
                          }}
                          apiKey="v31jdsle08zrmxiz0jkp99x1k7xph3sdxml6ya1ws3k2ak5p"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`slide-font-${index}`} className="text-gray-700 dark:text-gray-300 font-medium">Font Family</Label>
                        <select
                          id={`slide-font-${index}`}
                          value={slide.fontFamily || designSettings.fontFamily}
                          onChange={(e) => updateSlideContent(index, "fontFamily", e.target.value)}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background dark:bg-gray-700 dark:text-gray-200"
                        >
                          {FONTS.map((font) => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`slide-layout-${index}`} className="text-gray-700 dark:text-gray-300 font-medium">Layout</Label>
                        <select
                          id={`slide-layout-${index}`}
                          value={slide.layout || "title-content"}
                          onChange={(e) => updateSlideContent(index, "layout", e.target.value)}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background dark:bg-gray-700 dark:text-gray-200"
                        >
                          {Object.entries(LAYOUTS).map(([key, layout]) => (
                            <option key={key} value={key}>{layout.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`slide-background-${index}`} className="text-gray-700 dark:text-gray-300 font-medium">Background Color</Label>
                        <Input
                          id={`slide-background-${index}`}
                          type="color"
                          value={slide.background || designSettings.primaryColor}
                          onChange={(e) => updateSlideContent(index, "background", e.target.value)}
                          className="w-12 h-10 p-1"
                        />
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </SidebarContent>
          </Sidebar>

          <main className="flex-1 overflow-auto p-4 md:p-6 -ml-30">
            <div className="flex justify-center items-start w-full mt-5">
              <div className="w-full max-w-5xl space-y-6 bg-amber-300/10 p-4 rounded-lg">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Pitch Deck Preview</h1>
                {error && (
                  <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}
                {isPresenting ? renderPresentation() : renderSlide()}
                {!isPresenting && (
                  <div className="flex justify-center gap-2 mt-4">
                    <Button variant="outline" size="icon" onClick={prevSlide} disabled={currentSlide === 0}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={nextSlide}
                      disabled={currentSlide === slides.length - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <Button onClick={fetchSlides} className="flex items-center gap-2" disabled={isGenerating}>
                    <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                    {isGenerating ? "Generating..." : "Generate Slides"}
                  </Button>
                  <Button
                    onClick={() => setIsPresenting(!isPresenting)}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <Palette className="h-4 w-4" />
                    {isPresenting ? "Edit Mode" : "Present Slides"}
                  </Button>
                  <Button onClick={handleDownload} className="flex items-center gap-2" variant="outline">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button onClick={handleVoiceover} className="flex items-center gap-2" variant="outline">
                    <Mic className="h-4 w-4" />
                    Generate Voiceover
                  </Button>
                  <Button
                    onClick={() => toast({ title: "Saved", description: "Slides saved locally." })}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <Save className="h-4 w-4" />
                    Save Slides
                  </Button>
                  <Button
                    onClick={handleSlideAnalysis}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <BarChart2 className="h-4 w-4" />
                    Slide Analysis
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}