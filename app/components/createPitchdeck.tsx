"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileUp,
  Save,
  Wand2,
  Sun,
  Moon,
  X,
  Check,
  Sparkles,
  Rocket,
  BarChart3,
  PieChart,
  Target,
  Upload,
  Info,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/use-toast";
import { cn } from "@/lib/utils";
import { getAuthToken } from "@/lib/actions/getauthtoken";
import { useRouter } from "next/navigation";

// Industry options
const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "E-commerce",
  "Real Estate",
  "Food & Beverage",
  "Entertainment",
  "Transportation",
  "Energy",
  "Manufacturing",
  "Other",
  "Retail",
  "Telecommunications",
  "Media",
  "Travel & Hospitality",
  "Agriculture",
  "Construction",
  "Insurance",
  "Pharmaceuticals",
  "Biotechnology",
  "Automotive",
  "Aerospace",
  "Logistics",
  "Cybersecurity",
  "Artificial Intelligence",
  "Blockchain",
  "Internet of Things (IoT)",
  "Virtual Reality (VR)",
  "Augmented Reality (AR)",
  "Gaming",
  "Social Media",
  "Digital Marketing",
  "Cloud Computing",
  "Big Data",
  "Analytics",
  "Fintech",
  "Edtech",
  "Healthtech",
  "Proptech",
  "Insurtech",
  "Martech",
  "Adtech",
  "Regtech",
  "Legaltech",
  "Mediatech",
  "Cleantech",
  "Greentech",
  "SaaS",
  "PaaS",
  "IaaS",
  "DaaS",
  "XaaS",
  "Mobility",
];

// Startup stages
const startupStages = [
  { value: "idea", label: "Idea", icon: Sparkles },
  { value: "mvp", label: "MVP", icon: Rocket },
  { value: "scaling", label: "Scaling", icon: BarChart3 },
  { value: "revenue", label: "Revenue Stage", icon: PieChart },
  { value: "growth", label: "Growth Stage", icon: Target },
  { value: "expansion", label: "Expansion Stage", icon: FileText },
  { value: "mature", label: "Mature Stage", icon: FileUp },
  { value: "exit", label: "Exit Stage", icon: X },
  { value: "other", label: "Other", icon: Info },
  { value: "not_applicable", label: "Not Applicable", icon: Check },
  { value: "unknown", label: "Unknown", icon: Sun },
  { value: "not_sure", label: "Not Sure", icon: Moon },
];

// Popular markets
const popularMarkets = [
  "B2B",
  "B2C",
  "Enterprise",
  "Small Business",
  "North America",
  "Europe",
  "Asia Pacific",
  "Global",
  "Millennials",
  "Gen Z",
  "Health & Wellness",
  "SaaS",
  "Fintech",
  "Edtech",
  "E-commerce",
  "Travel & Hospitality",
  "Food & Beverage",
  "Real Estate",
  "Entertainment",
  "Transportation",
  "Energy & Utilities",
  "Manufacturing",
  "Retail",
  "Telecommunications",
  "Media & Advertising",
  "Gaming",
  "Artificial Intelligence",
  "Blockchain",
  "Cybersecurity",
  "Internet of Things (IoT)",
  "Augmented Reality (AR)",
  "Virtual Reality (VR)",
  "Cloud Computing",
  "Big Data",
  "Analytics",
  "Digital Marketing",
  "Social Media",
  "Mobile Apps",
  "Wearable Technology",
  "Smart Home",
  "Smart Cities",
  "Sustainability",
  "Green Technology",
  "Healthtech",
  "Biotech",
  "Pharmaceuticals",
  "Medical Devices",
  "Telemedicine",
  "Health Insurance",
  "Fitness & Nutrition",
  "Mental Health",
  "Elderly Care",
  "Childcare",
  "Pet Care",
  "Home Improvement",
  "Home Services",
  "Personal Finance",
  "Investment",
  "Insurance",
  "Wealth Management",
  "Cryptocurrency",
  "Peer-to-Peer Lending",
  "Crowdfunding",
  "Real Estate Investment",
  "Stock Market",
  "Retirement Planning",
];

interface FormData {
  title: string;
  description: string;
  industry: string;
  startupStage: string;
  targetMarket: string;
  aiCompetitorAnalysis: boolean;
  aiFinancialProjections: boolean;
  aiSlideContent: boolean;
  logo: File | null;
  businessDocuments: File[];
}

export function CreatePitchDeck() {
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
  });
  const [errors, setErrors] = useState({ title: "" });
  const [showMarketSuggestions, setShowMarketSuggestions] = useState(false);
  const [filteredMarkets, setFilteredMarkets] = useState(popularMarkets);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPitch, setGeneratedPitch] = useState<string | null>(null);
  const router = useRouter();

  const logoInputRef = useRef<HTMLInputElement>(null);
  const documentsInputRef = useRef<HTMLInputElement>(null);

  // Calculate form completion percentage
  const completionPercentage = Math.round(
    (Object.entries(formData).reduce((count, [key, value]) => {
      if (key === "logo" || key === "businessDocuments") return count;
      if (typeof value === "string" && value) return count + 1;
      if (typeof value === "boolean" && value) return count + 1;
      return count;
    }, 0) /
      8) *
      100
  );

  // Load draft from localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem("pitchDeckDraft");
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
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
        }));
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }
  }, []);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "title") {
      setErrors((prev) => ({
        ...prev,
        title:
          value.length < 5
            ? "Title must be at least 5 characters"
            : value.length > 100
            ? "Title must be less than 100 characters"
            : "",
      }));
    }

    if (name === "targetMarket") {
      const filtered = popularMarkets.filter((market) =>
        market.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredMarkets(filtered);
      setShowMarketSuggestions(value.length > 0 && filtered.length > 0);
    }
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Handle market suggestion selection
  const handleSelectMarket = (market: string) => {
    setFormData((prev) => ({ ...prev, targetMarket: market }));
    setShowMarketSuggestions(false);
  };

  // Save draft
  const saveDraft = () => {
    const draftData = { ...formData, logo: null, businessDocuments: [] };
    localStorage.setItem("pitchDeckDraft", JSON.stringify(draftData));
    toast({
      title: "Draft Saved",
      description: "Your pitch deck draft has been saved locally.",
      variant: "default",
    });
  };

  // Generate pitch deck
  const generatePitchDeck = async () => {
    const { title, description, industry, startupStage, targetMarket } =
      formData;
    if (!title || !description || !industry || !startupStage) {
      toast({
        title: "Error",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const authToken = await getAuthToken();
      if (!authToken) {
        console.error("User not authenticated. Please log in.");
        toast({
          title: "Error",
          description: "Please log in to generate a pitch deck.",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/pitchdecks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title,
          description,
          industry,
          startup_stage: startupStage,
          target_market: targetMarket,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate pitch deck");

      const data = await response.json();
      setGeneratedPitch(data);
      console.log("Generated pitch deck:", data.pitch_deck);
      setTimeout(() => {
        router.push(`/pitchdeck/${data.pitch_deck}`);
      }, 4000);

      toast({
        title: "Success",
        description: "Pitch deck generated successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to generate pitch deck.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, type: "logo" | "documents") => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (type === "logo") {
        const file = e.dataTransfer.files[0];
        if (["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)) {
          setFormData((prev) => ({ ...prev, logo: file }));
        } else {
          toast({
            title: "Invalid file type",
            description: "Please upload PNG, JPG, or SVG files only",
            variant: "destructive",
          });
        }
      } else {
        const files = Array.from(e.dataTransfer.files);
        const validFiles = files.filter((file) =>
          [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ].includes(file.type)
        );
        if (validFiles.length !== files.length) {
          toast({
            title: "Invalid file type",
            description: "Please upload PDF or DOCX files only",
            variant: "destructive",
          });
        }
        if (validFiles.length > 0) {
          setFormData((prev) => ({
            ...prev,
            businessDocuments: [...prev.businessDocuments, ...validFiles],
          }));
        }
      }
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-indigo-900 dark:bg-gradient-to-br dark:from-gray-900 dark:to-blue-950 text-gray-100 pt-20 pb-24">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 sm:px-8 max-w-4xl mb-12 text-center"
      >
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-100">
            Craft Your <span className="text-teal-500">Investor-Ready</span>{" "}
            Pitch Deck
          </h1>
          <p className="text-base text-gray-400 max-w-2xl">
            Transform your startup vision into a compelling pitch with AI-driven
            insights and seamless automation.
          </p>
          {/* Progress Indicator */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Completion</span>
              <span className="text-sm text-gray-400">
                {completionPercentage}%
              </span>
            </div>
            <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Form */}
      <motion.div
        className="container mx-auto px-4 sm:px-8 max-w-4xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Pitch Essentials */}
        <motion.div variants={itemVariants}>
          <Card className="mb-12 bg-gray-800 border-gray-700 shadow-md rounded-xl hover:shadow-lg transition-all duration-200 backdrop-blur-sm">
            <CardHeader className="px-8 py-6">
              <CardTitle className="text-2xl font-semibold text-gray-100 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-indigo-600" />
                Pitch Essentials
              </CardTitle>
              <CardDescription className="text-sm text-gray-400">
                Define the core elements of your pitch deck.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 py-6 grid grid-cols-1 lg:grid-row-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="title"
                    className="text-sm font-semibold text-gray-100"
                  >
                    Title <span className="text-red-400">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-800 text-gray-100 border-gray-700">
                        <p>
                          A concise title that captures your startup's essence.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter your pitch deck title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={cn(
                    "bg-gray-850 border-gray-700 text-gray-100 focus:ring-2 focus:ring-indigo-500 rounded-lg hover:border-indigo-600 transition-all duration-200",
                    errors.title && "border-red-400"
                  )}
                />
                <AnimatePresence>
                  {errors.title && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-xs text-red-400"
                    >
                      {errors.title}
                    </motion.p>
                  )}
                </AnimatePresence>
                <div className="text-xs text-gray-400">
                  {formData.title.length}/100
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-semibold text-gray-100"
                  >
                    Description <span className="text-red-400">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-800 text-gray-100 border-gray-700">
                        <p>
                          Briefly describe your startup's mission and value
                          proposition.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your startup's vision"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="bg-gray-850 border-gray-700 text-gray-100 focus:ring-2 focus:ring-indigo-500 rounded-lg min-h-[120px] hover:border-indigo-600 transition-all duration-200"
                  maxLength={500}
                />
                <div className="text-xs text-gray-400">
                  {formData.description.length}/500
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Business Profile */}
        <motion.div variants={itemVariants}>
          <Card className="mb-12 bg-gray-800 border-gray-700 shadow-md rounded-xl hover:shadow-lg transition-all duration-200 backdrop-blur-sm">
            <CardHeader className="px-8 py-6">
              <CardTitle className="text-2xl font-semibold text-gray-100 flex items-center">
                <Target className="w-6 h-6 mr-2 text-indigo-600" />
                Business Profile
              </CardTitle>
              <CardDescription className="text-sm text-gray-400">
                Provide key details about your venture.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 py-6 space-y-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="industry"
                    className="text-sm font-semibold text-gray-100"
                  >
                    Industry <span className="text-red-400">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-800 text-gray-100 border-gray-700">
                        <p>Select the industry your startup operates in.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select
                  value={formData.industry}
                  onValueChange={(value) =>
                    handleSelectChange("industry", value)
                  }
                >
                  <SelectTrigger
                    id="industry"
                    className="bg-gray-850 border-gray-700 text-gray-100 focus:ring-2 focus:ring-indigo-500 rounded-lg hover:border-indigo-600 transition-all duration-200"
                  >
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                    {industries.map((industry) => (
                      <SelectItem
                        key={industry}
                        value={industry}
                        className="text-sm hover:bg-gray-700"
                      >
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-semibold text-gray-100">
                    Startup Stage <span className="text-red-400">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-800 text-gray-100 border-gray-700">
                        <p>Choose the current stage of your startup.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <RadioGroup
                  value={formData.startupStage}
                  onValueChange={(value) =>
                    handleSelectChange("startupStage", value)
                  }
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  {startupStages.map((stage) => (
                    <div key={stage.value}>
                      <RadioGroupItem
                        value={stage.value}
                        id={stage.value}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={stage.value}
                        className={cn(
                          "flex flex-col items-center p-4 rounded-lg border cursor-pointer text-sm",
                          formData.startupStage === stage.value
                            ? "border-indigo-600 bg-indigo-900/50"
                            : "border-gray-700 hover:bg-gray-700"
                        )}
                      >
                        <stage.icon className="h-8 w-8 mb-2 text-indigo-600" />
                        {stage.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-2 relative">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="targetMarket"
                    className="text-sm font-semibold text-gray-100"
                  >
                    Target Market <span className="text-red-400">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-800 text-gray-100 border-gray-700">
                        <p>Specify your primary audience or market segment.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="targetMarket"
                  name="targetMarket"
                  placeholder="e.g., B2B, Millennials"
                  value={formData.targetMarket}
                  onChange={handleInputChange}
                  className="bg-gray-850 border-gray-700 text-gray-100 focus:ring-2 focus:ring-indigo-500 rounded-lg hover:border-indigo-600 transition-all duration-200"
                />
                <AnimatePresence>
                  {showMarketSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute z-10 w-full mt-1 bg-gray-800 border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto"
                    >
                      <div className="flex justify-between items-center px-4 py-2">
                        <span className="text-sm text-gray-400">
                          Suggestions
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowMarketSuggestions(false)}
                          aria-label="Close suggestions"
                          className="text-gray-100 hover:bg-gray-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {filteredMarkets.map((market) => (
                        <div
                          key={market}
                          className="px-4 py-2 text-sm text-gray-100 hover:bg-gray-700 cursor-pointer rounded"
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

        {/* Actions */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            variant="outline"
            onClick={saveDraft}
            className="bg-gray-700 border-gray-700 text-gray-100 hover:bg-gray-600 rounded-lg px-8 py-3 text-base shadow-md transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-indigo-500"
          >
            <Save className="h-5 w-5 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={generatePitchDeck}
            disabled={isGenerating || !!errors.title}
            className={cn(
              "bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-8 py-3 text-base shadow-md shadow-indigo-500/50 transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-indigo-500",
              (isGenerating || !!errors.title) &&
                "opacity-50 cursor-not-allowed"
            )}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5 mr-2" />
                Generate Deck
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
