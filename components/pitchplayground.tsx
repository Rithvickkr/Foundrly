"use client"

import { useState, useEffect } from "react"
import { Download, Mic, RefreshCw, Palette, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/components/use-toast"


import { Sidebar, SidebarContent, SidebarHeader, SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar"

import { useIsMobile } from "@/hooks/use-mobile"

// Define slide types
type SlideContent = {
  title: string
  content: string[]
  background?: string
}

export function PitchDeckPlayground() {
  
  const isMobile = useIsMobile()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [containerSize, setContainerSize] = useState({ width: 800, height: 450 })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCustomizing, setIsCustomizing] = useState(false)

  // Pitch deck content state
  const [pitchContent, setPitchContent] = useState({
    businessName: "Innovate AI",
    problem: "Businesses struggle to create professional pitch decks quickly",
    solution: "AI-powered pitch deck generator that creates stunning presentations in minutes",
    marketSize: "$5.2B presentation software market growing at 11% CAGR",
    competition: "Traditional design agencies, PowerPoint templates, Canva",
    usp: "10x faster creation with AI-driven content and design suggestions",
    financials: {
      year1: "250K",
      year2: "1.2M",
      year3: "4.8M",
    },
    teamMembers: ["Jane Doe, CEO (Ex-Google)", "John Smith, CTO (MIT AI Lab)", "Sarah Johnson, Design Lead (IDEO)"],
  })

  // Design settings
  const [designSettings, setDesignSettings] = useState({
    primaryColor: "#4f46e5",
    secondaryColor: "#8b5cf6",
    accentColor: "#f97316",
    fontFamily: "Inter",
    animationSpeed: 0.5,
    darkMode: false,
  })

  // Generate slides based on pitch content
  const generateSlides = (): SlideContent[] => {
    return [
      {
        title: pitchContent.businessName,
        content: ["Transforming how businesses create pitch decks"],
        background: designSettings.primaryColor,
      },
      {
        title: "The Problem",
        content: [pitchContent.problem],
      },
      {
        title: "Our Solution",
        content: [pitchContent.solution],
      },
      {
        title: "Market Opportunity",
        content: [pitchContent.marketSize],
      },
      {
        title: "Competitive Landscape",
        content: [pitchContent.competition.split(", ").join(", ")],
      },
      {
        title: "Why Us?",
        content: [pitchContent.usp],
      },
      {
        title: "Financials",
        content: [
          `Year 1: $${pitchContent.financials.year1}`,
          `Year 2: $${pitchContent.financials.year2}`,
          `Year 3: $${pitchContent.financials.year3}`,
        ],
      },
      {
        title: "Our Team",
        content: pitchContent.teamMembers,
      },
      {
        title: "Thank You!",
        content: ["Contact: hello@" + pitchContent.businessName.toLowerCase().replace(/\s+/g, "") + ".com"],
        background: designSettings.secondaryColor,
      },
    ]
  }

  const slides = generateSlides()

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById("pitch-preview-container")
      if (container) {
        const width = container.offsetWidth
        const height = width * 0.5625 // 16:9 aspect ratio
        setContainerSize({ width, height: Math.min(height, window.innerHeight * 0.7) })
      }
    }

    // Only run in browser
    if (typeof window !== "undefined") {
      handleResize()
      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Handle slide navigation
  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  // Handle regeneration
  const handleRegenerate = () => {
    setIsGenerating(true)
    // Simulate AI regeneration
    setTimeout(() => {
      setIsGenerating(false)
      toast({
        title: "Pitch Deck Regenerated",
        description: "Your pitch deck has been updated with AI suggestions.",
      })
    }, 2000)
  }

  // Handle PDF download
  const handleDownload = () => {
    toast({
      title: "Downloading PDF",
      description: "Your pitch deck is being prepared for download.",
    })
    // In a real implementation, we would use a library like jsPDF or html2canvas
  }

  // Handle voiceover generation
  const handleVoiceover = () => {
    toast({
      title: "Generating Voiceover",
      description: "AI is creating a voiceover for your presentation.",
    })
    // In a real implementation, we would use a text-to-speech API
  }

  // Render current slide using HTML/CSS instead of Konva
  const renderSlide = () => {
    const slide = slides[currentSlide]
    const bgColor = slide.background || "#ffffff"
    const textColor = slide.background ? "#ffffff" : "#1a1a1a"

    return (
      <div
        className="relative overflow-hidden rounded-lg transition-all duration-300 ease-in-out"
        style={{
          width: "100%",
          height: containerSize.height,
          backgroundColor: bgColor,
          fontFamily: designSettings.fontFamily || "Inter",
        }}
      >
        {/* Title */}
        <h2
          className="text-center font-bold transition-all duration-300"
          style={{
            color: textColor,
            fontSize: `${containerSize.width * 0.05}px`,
            marginTop: `${containerSize.height * 0.15}px`,
          }}
        >
          {slide.title}
        </h2>

        {/* Content */}
        <div className="flex flex-col items-center justify-center mt-8">
          {slide.content.map((item, index) => (
            <p
              key={index}
              className="text-center transition-all duration-300 mb-4 px-8"
              style={{
                color: textColor,
                fontSize: `${containerSize.width * 0.025}px`,
                maxWidth: "80%",
              }}
            >
              {item}
            </p>
          ))}
        </div>

        {/* Slide number */}
        <div
          className="absolute bottom-2 right-4 opacity-70"
          style={{
            color: textColor,
            fontSize: `${containerSize.width * 0.015}px`,
          }}
        >
          {currentSlide + 1}/{slides.length}
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4 md:px-6">
            <SidebarTrigger />
            <div className="flex items-center gap-2 font-semibold">
              <RefreshCw className="h-5 w-5 text-primary" />
              <span>Pitch Deck Playground</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <Sidebar>
            <SidebarHeader className="border-b px-4 py-2">
              <h2 className="text-lg font-semibold">Pitch Settings</h2>
            </SidebarHeader>
            <SidebarContent>
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="design">Design</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={pitchContent.businessName}
                      onChange={(e) => setPitchContent({ ...pitchContent, businessName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="problem">Problem Statement</Label>
                    <Textarea
                      id="problem"
                      value={pitchContent.problem}
                      onChange={(e) => setPitchContent({ ...pitchContent, problem: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="solution">Solution</Label>
                    <Textarea
                      id="solution"
                      value={pitchContent.solution}
                      onChange={(e) => setPitchContent({ ...pitchContent, solution: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="marketSize">Market Size</Label>
                    <Input
                      id="marketSize"
                      value={pitchContent.marketSize}
                      onChange={(e) => setPitchContent({ ...pitchContent, marketSize: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="competition">Competition</Label>
                    <Input
                      id="competition"
                      value={pitchContent.competition}
                      onChange={(e) => setPitchContent({ ...pitchContent, competition: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usp">Unique Selling Proposition</Label>
                    <Textarea
                      id="usp"
                      value={pitchContent.usp}
                      onChange={(e) => setPitchContent({ ...pitchContent, usp: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Financials</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label htmlFor="year1" className="text-xs">
                          Year 1
                        </Label>
                        <Input
                          id="year1"
                          value={pitchContent.financials.year1}
                          onChange={(e) =>
                            setPitchContent({
                              ...pitchContent,
                              financials: { ...pitchContent.financials, year1: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="year2" className="text-xs">
                          Year 2
                        </Label>
                        <Input
                          id="year2"
                          value={pitchContent.financials.year2}
                          onChange={(e) =>
                            setPitchContent({
                              ...pitchContent,
                              financials: { ...pitchContent.financials, year2: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="year3" className="text-xs">
                          Year 3
                        </Label>
                        <Input
                          id="year3"
                          value={pitchContent.financials.year3}
                          onChange={(e) =>
                            setPitchContent({
                              ...pitchContent,
                              financials: { ...pitchContent.financials, year3: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="design" className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
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
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
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
                    <Label htmlFor="accentColor">Accent Color</Label>
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
                    <Label htmlFor="fontFamily">Font Family</Label>
                    <select
                      id="fontFamily"
                      value={designSettings.fontFamily}
                      onChange={(e) => setDesignSettings({ ...designSettings, fontFamily: e.target.value })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Montserrat">Montserrat</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="animationSpeed">Animation Speed</Label>
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
              </Tabs>
            </SidebarContent>
          </Sidebar>

          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="mx-auto max-w-5xl space-y-6">
              <Card className="overflow-hidden">
                <div id="pitch-preview-container" className="relative bg-muted/20 p-4">
                  {renderSlide()}

                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
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
                </div>
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button onClick={handleRegenerate} className="flex items-center gap-2" disabled={isGenerating}>
                  <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                  {isGenerating ? "Regenerating..." : "Regenerate Pitch"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setIsCustomizing(!isCustomizing)}
                  className="flex items-center gap-2"
                >
                  <Palette className="h-4 w-4" />
                  Customize Design
                </Button>

                <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>

                <Button variant="outline" onClick={handleVoiceover} className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Generate Voiceover
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

