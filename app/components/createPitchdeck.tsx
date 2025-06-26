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
  Wand,
} from "lucide-react";

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

import { cn } from "@/lib/utils";
import { getAuthToken } from "@/lib/actions/getauthtoken";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Buttonload } from "@/components/ui/stateful-button";
import { AnimatedSubscribeButton } from "@/components/magicui/animated-subscribe-button";
import { toast } from "sonner";

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
  { value: "seed", label: "Seed Stage", icon: FileText },
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
        
        toast.success("Draft loaded successfully", {
          description: "Your previously saved draft has been restored",
        });
      } catch (error) {
        console.error("Error loading draft:", error);
        toast.error("Failed to load draft", {
          description: "There was an error loading your saved draft",
        });
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
    
    // Show completion toast when important fields are filled
    if (name === "industry" && value) {
      toast.success("Industry selected", {
        description: `Great! You've selected ${value} as your industry`,
      });
    }
  };

  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Handle market suggestion selection
  const handleSelectMarket = (market: string) => {
    setFormData((prev) => ({ ...prev, targetMarket: market }));
    setShowMarketSuggestions(false);
    
    toast.success("Target market selected", {
      description: `${market} has been set as your target market`,
    });
  };

  // Save draft
  const saveDraft = () => {
    try {
      const draftData = { ...formData, logo: null, businessDocuments: [] };
      localStorage.setItem("pitchDeckDraft", JSON.stringify(draftData));
      
      toast.success("Draft saved successfully", {
        description: "Your pitch deck draft has been saved locally",
        action: {
          label: "View Details",
          onClick: () => {
            const savedDraft = localStorage.getItem("pitchDeckDraft");
            if (savedDraft) {
              const parsedDraft = JSON.parse(savedDraft);
              console.log("Saved Draft:", parsedDraft);
              toast.info("Draft details logged to console");
            }
          }
        },
      });
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft", {
        description: "There was an error saving your draft to local storage",
      });
    }
  };

  // Generate pitch deck
  const generatePitchDeck = async () => {
    const { title, description, industry, startupStage, targetMarket } = formData;
    
    // Validation
    if (!title || !description || !industry || !startupStage) {
      toast.error("Missing required fields", {
        description: "Please fill in all required fields: Title, Description, Industry, and Startup Stage",
      });
      return;
    }

    if (errors.title) {
      toast.error("Please fix validation errors", {
        description: "Make sure your title meets the length requirements",
      });
      return;
    }

    setIsGenerating(true);
    
    // Show loading toast
    const loadingToast = toast.loading("Generating your pitch deck...", {
      description: "This may take a few moments. Please don't close this page.",
    });

    try {
      const authToken = await getAuthToken();
      if (!authToken) {
        console.error("User not authenticated. Please log in.");
        toast.error("Authentication required", {
          description: "Please log in to generate a pitch deck",
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to generate pitch deck`);
      }

      const data = await response.json();
      setGeneratedPitch(data);
      console.log("Generated pitch deck:", data.pitch_deck);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success("Pitch deck generated successfully!", {
        description: "Redirecting you to your new pitch deck...",
      });
      
      // Clear draft from localStorage since we've successfully generated
      localStorage.removeItem("pitchDeckDraft");
      
      setTimeout(() => {
        router.push(`/pitchdeck/${data.pitch_deck}`);
      }, 2000);

    } catch (error) {
      console.error("Error:", error);
      toast.dismiss(loadingToast);
      
      if (error instanceof Error) {
        toast.error("Generation failed", {
          description: error.message,
          action: {
            label: "Retry",
            onClick: () => generatePitchDeck(),
          },
        });
      } else {
        toast.error("Unexpected error", {
          description: "Something went wrong while generating your pitch deck. Please try again.",
          action: {
            label: "Retry",
            onClick: () => generatePitchDeck(),
          },
        });
      }
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
          toast.success("Logo uploaded", {
            description: `${file.name} has been uploaded successfully`,
          });
        } else {
          toast.error("Invalid file type", {
            description: "Please upload PNG, JPG, or SVG files only",
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
          toast.error("Some files were rejected", {
            description: "Only PDF and DOCX files are accepted",
          });
        }
        
        if (validFiles.length > 0) {
          setFormData((prev) => ({
            ...prev,
            businessDocuments: [...prev.businessDocuments, ...validFiles],
          }));
          toast.success("Documents uploaded", {
            description: `${validFiles.length} document(s) uploaded successfully`,
          });
        }
      }
    }
  };

  // Show warning when leaving with unsaved changes
  useEffect(() => {
    const hasUnsavedChanges = formData.title || formData.description || formData.industry || formData.targetMarket;
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !localStorage.getItem("pitchDeckDraft")) {
        e.preventDefault();
        e.returnValue = '';
        
        toast.warning("Unsaved changes", {
          description: "You have unsaved changes. Consider saving a draft before leaving.",
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData]);

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
      transition: { type: "spring" as const, stiffness: 300, damping: 20 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:bg-gradient-to-br dark:from-gray-950 dark:via-slate-900 dark:to-slate-800 text-gray-900 dark:text-slate-100 pt-20 pb-24">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 sm:px-8 max-w-4xl mb-12 text-center"
      >
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-slate-50">
            Craft Your <span className="text-indigo-600 dark:text-indigo-400">Investor-Ready</span>{" "}
            Pitch Deck
          </h1>
          <p className="text-base text-gray-600 dark:text-slate-300 max-w-2xl">
            Transform your startup vision into a compelling pitch with AI-driven
            insights and seamless automation.
          </p>
          {/* Progress Indicator */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-slate-300">Completion</span>
              <span className="text-sm text-gray-600 dark:text-slate-300">
                {completionPercentage}%
              </span>
            </div>
            <div className="relative w-full h-2 bg-gray-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-indigo-500 dark:bg-indigo-400 transition-all duration-300"
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
          <Card className="mb-12 bg-white dark:bg-slate-900/50 border-gray-200 dark:border-slate-700/50 shadow-md dark:shadow-slate-950/20 rounded-xl hover:shadow-lg dark:hover:shadow-slate-950/30 transition-all duration-200 backdrop-blur-sm">
            <CardHeader className="px-8 py-6">
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-slate-50 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-indigo-500 dark:text-indigo-400" />
                Pitch Essentials
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-slate-300">
                Define the core elements of your pitch deck.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 py-6 grid grid-cols-1 lg:grid-row-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="title"
                    className="text-sm font-semibold text-gray-900 dark:text-slate-50"
                  >
                    Title <span className="text-red-500 dark:text-red-400">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border-gray-200 dark:border-slate-600">
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
                    "bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 rounded-lg hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-200 placeholder:text-gray-500 dark:placeholder:text-slate-400",
                    errors.title && "border-red-400 dark:border-red-500"
                  )}
                />
                <AnimatePresence>
                  {errors.title && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-xs text-red-500 dark:text-red-400"
                    >
                      {errors.title}
                    </motion.p>
                  )}
                </AnimatePresence>
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  {formData.title.length}/100
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-semibold text-gray-900 dark:text-slate-50"
                  >
                    Description <span className="text-red-500 dark:text-red-400">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border-gray-200 dark:border-slate-600">
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
                  className="bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 rounded-lg min-h-[120px] hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-200 placeholder:text-gray-500 dark:placeholder:text-slate-400"
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  {formData.description.length}/500
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Business Profile */}
        <motion.div variants={itemVariants}>
          <Card className="mb-12 bg-white dark:bg-slate-900/50 border-gray-200 dark:border-slate-700/50 shadow-md dark:shadow-slate-950/20 rounded-xl hover:shadow-lg dark:hover:shadow-slate-950/30 transition-all duration-200 backdrop-blur-sm">
            <CardHeader className="px-8 py-6">
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-slate-50 flex items-center">
                <Target className="w-6 h-6 mr-2 text-indigo-500 dark:text-indigo-400" />
                Business Profile
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-slate-300">
                Provide key details about your venture.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 py-6 space-y-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="industry"
                    className="text-sm font-semibold text-gray-900 dark:text-slate-50"
                  >
                    Industry <span className="text-red-500 dark:text-red-400">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border-gray-200 dark:border-slate-600">
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
                    className="bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 rounded-lg hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-200"
                  >
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-slate-100">
                    {industries.map((industry) => (
                      <SelectItem
                        key={industry}
                        value={industry}
                        className="text-sm hover:bg-gray-100 dark:hover:bg-slate-700/50 focus:bg-gray-100 dark:focus:bg-slate-700/50"
                      >
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-semibold text-gray-900 dark:text-slate-50">
                    Startup Stage <span className="text-red-500 dark:text-red-400">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border-gray-200 dark:border-slate-600">
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
                          "flex flex-col items-center p-4 rounded-lg border cursor-pointer text-sm transition-all duration-200",
                          formData.startupStage === stage.value
                            ? "border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-100"
                            : "border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800/50 text-gray-900 dark:text-slate-100"
                        )}
                      >
                        <stage.icon className={cn(
                          "h-8 w-8 mb-2",
                          formData.startupStage === stage.value
                            ? "text-indigo-500 dark:text-indigo-400"
                            : "text-indigo-500 dark:text-indigo-400"
                        )} />
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
                    className="text-sm font-semibold text-gray-900 dark:text-slate-50"
                  >
                    Target Market <span className="text-red-500 dark:text-red-400">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border-gray-200 dark:border-slate-600">
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
                  className="bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 rounded-lg hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-200 placeholder:text-gray-500 dark:placeholder:text-slate-400"
                />
                <AnimatePresence>
                  {showMarketSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg dark:shadow-slate-950/20 max-h-60 overflow-auto"
                    >
                      <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100 dark:border-slate-700">
                        <span className="text-sm text-gray-500 dark:text-slate-400">
                          Suggestions
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowMarketSuggestions(false)}
                          aria-label="Close suggestions"
                          className="text-gray-900 dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700/50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {filteredMarkets.map((market) => (
                        <div
                          key={market}
                          className="px-4 py-2 text-sm text-gray-900 dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700/50 cursor-pointer rounded transition-colors duration-150"
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
          className="flex flex-col sm:flex-row gap-4 items-center justify-center"
        >
            <AnimatedSubscribeButton
            subscribeStatus={false}
            onClick={saveDraft}
            className="bg-gray-100 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg px-8 py-3 text-base shadow-md dark:shadow-slate-950/20 transition-all duration-200 focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 hover:shadow-lg dark:hover:shadow-slate-950/30"
            >
            <span className="flex items-center transition-colors duration-200">
              <Save className="h-5 w-5 mr-2" />
              Save Draft
            </span>
            <span className="flex items-center transition-colors duration-200">
              <Check className="h-5 w-5 mr-2" />
              Saved!
            </span>
            </AnimatedSubscribeButton>
          <Buttonload
            onClick={generatePitchDeck}
            disabled={!!errors.title || isGenerating}
            className={cn(
              "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg px-8 py-2 text-base shadow-md dark:shadow-slate-950/20 transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 flex items-center justify-center",
              (!!errors.title || isGenerating) && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex items-center justify-center">
              <Wand className="h-5 w-5 mr-2" />
              {isGenerating ? "Generating..." : "Generate Deck"}
            </div>
          </Buttonload>
        </motion.div>
      </motion.div>
    </div>
  );
}
