"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { FileUp, Save, Wand2, Sun, Moon, X, Check, Sparkles, Rocket, BarChart3, PieChart, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "@/components/use-toast"
import { cn } from "@/lib/utils"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { getAuthToken } from "@/lib/actions/getauthtoken"
import { useRouter } from "next/navigation"

// Industry options
const industries = [
  "Technology", "Healthcare", "Finance", "Education", "E-commerce", "Real Estate",
  "Food & Beverage", "Entertainment", "Transportation", "Energy", "Manufacturing", "Other",
]

// Startup stages
const startupStages = [
  { value: "idea", label: "Idea", icon: Sparkles },
  { value: "mvp", label: "MVP", icon: Rocket },
  { value: "scaling", label: "Scaling", icon: BarChart3 },
  { value: "revenue", label: "Revenue Stage", icon: PieChart },
]

// Popular markets
const popularMarkets = [
  "B2B", "B2C", "Enterprise", "Small Business", "North America", "Europe",
  "Asia Pacific", "Global", "Millennials", "Gen Z",
]

interface FormData {
  title: string
  description: string
  industry: string
  startupStage: string
  targetMarket: string
  aiCompetitorAnalysis: boolean
  aiFinancialProjections: boolean
  aiSlideContent: boolean
  logo: File | null
  businessDocuments: File[]
}

export function CreatePitchDeck() {
  const { theme, setTheme } = useTheme()
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    industry: "",
    startupStage: "idea",
    targetMarket: "",
    aiCompetitorAnalysis: true,
    aiFinancialProjections: true,
    aiSlideContent: true,
    logo: null,
    businessDocuments: [],
  })
  const [errors, setErrors] = useState({ title: "" })
  const [showMarketSuggestions, setShowMarketSuggestions] = useState(false)
  const [filteredMarkets, setFilteredMarkets] = useState(popularMarkets)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPitch, setGeneratedPitch] = useState<string | null>(null)
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const documentsInputRef = useRef<HTMLInputElement>(null)

  // Load draft from localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem("pitchDeckDraft")
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft)
        setFormData((prevData) => ({
          ...prevData,
          title: parsedDraft.title || "",
          description: parsedDraft.description || "",
          industry: parsedDraft.industry || "",
          startupStage: parsedDraft.startupStage || "idea",
          targetMarket: parsedDraft.targetMarket || "",
          aiCompetitorAnalysis: parsedDraft.aiCompetitorAnalysis ?? true,
          aiFinancialProjections: parsedDraft.aiFinancialProjections ?? true,
          aiSlideContent: parsedDraft.aiSlideContent ?? true,
        }))
      } catch (error) {
        console.error("Error loading draft:", error)
      }
    }
  }, [])

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === "title") {
      setErrors((prev) => ({
        ...prev,
        title: value.length < 5 ? "Title must be at least 5 characters" : value.length > 100 ? "Title must be less than 100 characters" : "",
      }))
    }

    if (name === "targetMarket") {
      const filtered = popularMarkets.filter((market) => market.toLowerCase().includes(value.toLowerCase()))
      setFilteredMarkets(filtered)
      setShowMarketSuggestions(value.length > 0 && filtered.length > 0)
    }
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  // Handle market suggestion selection
  const handleSelectMarket = (market: string) => {
    setFormData((prev) => ({ ...prev, targetMarket: market }))
    setShowMarketSuggestions(false)
  }

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (!["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)) {
        toast({ title: "Invalid file type", description: "Please upload PNG, JPG, or SVG files only", variant: "destructive" })
        return
      }
      setFormData((prev) => ({ ...prev, logo: file }))
    }
  }

  // Handle document upload
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const validFiles = files.filter((file) =>
        ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)
      )
      if (validFiles.length !== files.length) {
        toast({ title: "Invalid file type", description: "Please upload PDF or DOCX files only", variant: "destructive" })
      }
      setFormData((prev) => ({ ...prev, businessDocuments: [...prev.businessDocuments, ...validFiles] }))
    }
  }

  // Remove document
  const removeDocument = (index: number) => {
    setFormData((prev) => ({ ...prev, businessDocuments: prev.businessDocuments.filter((_, i) => i !== index) }))
  }

  // Remove logo
  const removeLogo = () => {
    setFormData((prev) => ({ ...prev, logo: null }))
    if (logoInputRef.current) logoInputRef.current.value = ""
  }

  // Save draft
  const saveDraft = () => {
    const draftData = { ...formData, logo: null, businessDocuments: [] }
    localStorage.setItem("pitchDeckDraft", JSON.stringify(draftData))
    toast({ title: "Draft saved", description: "Your pitch deck draft has been saved locally" })
  }

  // Generate pitch deck
  const generatePitchDeck = async () => {
    const { title, description, industry, startupStage, targetMarket } = formData;
    if (!title || !description || !industry || !startupStage) {
      toast({ title: "Error", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // 🔥 Get the auth token (modify this based on your auth system)
      const authToken = await getAuthToken(); // Example for token storage
      console.log("authToken", authToken?.length);
      if (!authToken) {
        console.error("User not authenticated. Please log in.");
        setLoading(false);
        return;
      }

    try {
      const response = await fetch("http://127.0.0.1:8000/pitchdecks", {
        method: "POST",
        headers: { "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`, 
         },
        body: JSON.stringify({
          title,
          description,
          industry,
          startup_stage: startupStage,
          target_market: targetMarket,
          // ai_features: ["slide_content", "competitor_analysis", "financial_projections"], 
        }),
      });

      if (!response.ok) throw new Error("Failed to generate pitch deck");

      const data = await response.json();
      setGeneratedPitch(data);
      console.log("Generated pitch deck:", data.pitch_deck);
      setTimeout(() => {
        router.push(`/pitchdeck/${data.pitch_deck}`);
      }, 4000);
      
      // toast({ title: "Success", description: "Pitch deck generated successfully!", variant: "default" });
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Error", description: "Failed to generate pitch deck.", variant: "destructive" });
    }

    setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Error", description: "Failed to generate pitch deck.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
    
  

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()
  const handleDrop = (e: React.DragEvent, type: "logo" | "documents") => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (type === "logo") {
        const file = e.dataTransfer.files[0]
        if (["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)) {
          setFormData((prev) => ({ ...prev, logo: file }))
        } else {
          toast({ title: "Invalid file type", description: "Please upload PNG, JPG, or SVG files only", variant: "destructive" })
        }
      } else {
        const files = Array.from(e.dataTransfer.files)
        const validFiles = files.filter((file) =>
          ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)
        )
        if (validFiles.length !== files.length) {
          toast({ title: "Invalid file type", description: "Please upload PDF or DOCX files only", variant: "destructive" })
        }
        if (validFiles.length > 0) {
          setFormData((prev) => ({ ...prev, businessDocuments: [...prev.businessDocuments, ...validFiles] }))
        }
      }
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  }

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
  }

  return (
    <div className="min-h-screen bg-background pt-8 pb-16">
      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
               
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
        >
          <div>
         
            <h1 className="text-3xl sm:text-4xl font-semibold text-foreground">
              Create Pitch Deck
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-xl">
              Build an AI-powered pitch deck to showcase your startup vision.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hover:bg-muted rounded-full"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </motion.div>
      </div>

      {/* Main Form */}
      <motion.div
        className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
      
        {/* Basic Information */}
        <motion.div variants={itemVariants}>
        <div>
        
          <Card className="mb-6 border border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium">Basic Information</CardTitle>
              <CardDescription className="text-sm">Start with the essentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Your pitch deck title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={cn("text-sm", errors.title && "border-red-500")}
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                <div className="text-xs text-muted-foreground">{formData.title.length}/100</div>
              </div>
              <div className="space-y-2">
         
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Briefly describe your startup"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="text-sm min-h-[100px]"
                  maxLength={500}
                />
                <div className="text-xs text-muted-foreground">{formData.description.length}/500</div>
              </div>
            </CardContent>
          </Card>
          </div>
        </motion.div>

        {/* Business Details */}
        <motion.div variants={itemVariants}>
          <Card className="mb-6 border border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium">Business Details</CardTitle>
              <CardDescription className="text-sm">Tell us about your venture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="industry" className="text-sm font-medium">Industry</Label>
                <Select value={formData.industry} onValueChange={(value) => handleSelectChange("industry", value)}>
                  <SelectTrigger id="industry" className="text-sm">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry} className="text-sm">{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Startup Stage</Label>
                <RadioGroup
                  value={formData.startupStage}
                  onValueChange={(value) => handleSelectChange("startupStage", value)}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                >
                  {startupStages.map((stage) => (
                    <div key={stage.value}>
                      <RadioGroupItem value={stage.value} id={stage.value} className="sr-only" />
                      <Label
                        htmlFor={stage.value}
                        className={cn(
                          "flex flex-col items-center p-3 rounded-md border cursor-pointer text-sm",
                          formData.startupStage === stage.value ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                        )}
                      >
                        <stage.icon className="h-5 w-5 mb-1" />
                        {stage.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-2 relative">
                <Label htmlFor="targetMarket" className="text-sm font-medium">Target Market</Label>
                <Input
                  id="targetMarket"
                  name="targetMarket"
                  placeholder="e.g., B2B, Millennials"
                  value={formData.targetMarket}
                  onChange={handleInputChange}
                  className="text-sm"
                />
                <AnimatePresence>
                  {showMarketSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-sm max-h-60 overflow-auto"
                    >
                      {filteredMarkets.map((market) => (
                        <div
                          key={market}
                          className="px-3 py-2 text-sm hover:bg-muted cursor-pointer"
                          onClick={() => handleSelectMarket(market)}
                        >
                          {market}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Assistance */}
        <motion.div variants={itemVariants}>
          <Card className="mb-6 border border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium">AI Assistance</CardTitle>
              <CardDescription className="text-sm">Enhance with AI features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: "aiCompetitorAnalysis", label: "Competitor Analysis", icon: BarChart3 },
                { id: "aiFinancialProjections", label: "Financial Projections", icon: PieChart },
                { id: "aiSlideContent", label: "Slide Content", icon: Sparkles },
              ].map((feature) => (
                <div
                  key={feature.id}
                  className="flex items-center justify-between p-3 rounded-md border border-border hover:bg-muted"
                >
                  <div className="flex items-center gap-2">
                    <feature.icon className="h-4 w-4 text-primary" />
                    <Label htmlFor={feature.id} className="text-sm font-medium">{feature.label}</Label>
                  </div>
                  <Switch
                    id={feature.id}
                    checked={formData[feature.id as keyof FormData] as boolean}
                    onCheckedChange={(checked) => handleSwitchChange(feature.id, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upload & Attachments */}
        <motion.div variants={itemVariants}>
          <Card className="mb-6 border border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium">Uploads</CardTitle>
              <CardDescription className="text-sm">Add your logo and documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Logo</Label>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-md p-4 text-center text-sm",
                    formData.logo ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  )}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, "logo")}
                >
                  {formData.logo ? (
                    <div className="flex items-center justify-between">
                      <span className="truncate max-w-[200px]">{formData.logo.name}</span>
                      <Button variant="ghost" size="icon" onClick={removeLogo} aria-label="Remove logo">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <p>
                      Drop logo here or{" "}
                      <span className="text-primary cursor-pointer" onClick={() => logoInputRef.current?.click()}>
                        browse
                      </span>
                    </p>
                  )}
                  <input
                    type="file"
                    ref={logoInputRef}
                    className="hidden"
                    accept=".png,.jpg,.jpeg,.svg"
                    onChange={handleLogoUpload}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Documents</Label>
                <div
                  className="border-2 border-dashed rounded-md p-4 text-center text-sm border-border hover:border-primary/50"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, "documents")}
                >
                  <p>
                    Drop documents here or{" "}
                    <span className="text-primary cursor-pointer" onClick={() => documentsInputRef.current?.click()}>
                      browse
                    </span>
                  </p>
                  <input
                    type="file"
                    ref={documentsInputRef}
                    className="hidden"
                    accept=".pdf,.docx"
                    multiple
                    onChange={handleDocumentUpload}
                  />
                </div>
                <AnimatePresence>
                  {formData.businessDocuments.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      {formData.businessDocuments.map((doc, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center justify-between text-sm p-2 bg-muted rounded-md"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <span className="truncate max-w-[200px]">{doc.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDocument(index)}
                            aria-label="Remove document"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div className="flex flex-col sm:flex-row gap-3 justify-end" variants={itemVariants}>
          <Button
            variant="outline"
            onClick={saveDraft}
            className="text-sm border-border hover:bg-muted"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={generatePitchDeck}
            disabled={isGenerating || !!errors.title}
            className="text-sm"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Deck
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}


