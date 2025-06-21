"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/use-toast";
import { cn } from "@/lib/utils";
import { getAuthToken } from "@/lib/actions/getauthtoken";
import { useRouter } from "next/navigation";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { motion as motionComponent } from "framer-motion";
import { Mail, Save, Info, Wand2 } from "lucide-react";


interface PitchDeck {
    id: string;
    title: string;
}

interface FormData {
    campaignName: string;
    selectedPitchDeck: string;
}

export default function OutreachCampaignPage() {
    const [formData, setFormData] = useState<FormData>({
        campaignName: "",
        selectedPitchDeck: "",
    });
    const [pitchDecks, setPitchDecks] = useState<PitchDeck[]>([]);
    const [errors, setErrors] = useState({ campaignName: "" });
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();

    // Calculate form completion percentage
    const completionPercentage = Math.round(
        (Object.entries(formData).reduce((count, [key, value]) => {
            if (typeof value === "string" && value) return count + 1;
            return count;
        }, 0) / 2) * 100
    );

    // Fetch pitch decks on component mount
    useEffect(() => {
        fetchPitchDecks();
    }, []);

    const fetchPitchDecks = async () => {
        try {
            const authToken = await getAuthToken();
            if (!authToken) {
                toast({
                    title: "Error",
                    description: "Please log in to view pitch decks.",
                    variant: "destructive",
                });
                return;
            }

            const response = await fetch("http://127.0.0.1:8000/pitchdecks", {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (!response.ok) throw new Error("Failed to fetch pitch decks");

            const data = await response.json();
            setPitchDecks(data.map((deck: any) => ({ id: deck.id, title: deck.title })));
        } catch (error) {
            console.error("Error fetching pitch decks:", error);
            toast({
                title: "Error",
                description: "Failed to load pitch decks.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle input changes
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "campaignName") {
            setErrors((prev) => ({
                ...prev,
                campaignName:
                    value.length < 3
                        ? "Campaign name must be at least 3 characters"
                        : value.length > 50
                        ? "Campaign name must be less than 50 characters"
                        : "",
            }));
        }
    };

    // Handle select changes
    const handleSelectChange = (value: string) => {
        setFormData((prev) => ({ ...prev, selectedPitchDeck: value }));
    };

    // Save draft
    const saveDraft = () => {
        localStorage.setItem("outreachCampaignDraft", JSON.stringify(formData));
        toast({
            title: "Draft Saved",
            description: "Your outreach campaign draft has been saved locally.",
            variant: "default",
        });
    };

    // Create outreach campaign
    const createCampaign = async () => {
        const { campaignName, selectedPitchDeck } = formData;
        if (!campaignName || !selectedPitchDeck) {
            toast({
                title: "Error",
                description: "Please fill all required fields.",
                variant: "destructive",
            });
            return;
        }

        if (errors.campaignName) {
            toast({
                title: "Error",
                description: "Please fix validation errors before proceeding.",
                variant: "destructive",
            });
            return;
        }

        setIsCreating(true);
        try {
            const authToken = await getAuthToken();
            if (!authToken) {
                toast({
                    title: "Error",
                    description: "Please log in to create a campaign.",
                    variant: "destructive",
                });
                return;
            }

            const response = await fetch("http://127.0.0.1:8000/campaigns", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    campaign_name: campaignName,
                    pitch_deck_id: selectedPitchDeck,
                }),
            });

            if (!response.ok) throw new Error("Failed to create outreach campaign");

            const data = await response.json();
            toast({
                title: "Success",
                description: "Outreach campaign created successfully!",
                variant: "default",
            });

            // Clear form
            setFormData({ campaignName: "", selectedPitchDeck: "" });
            localStorage.removeItem("outreachCampaignDraft");

            // Navigate to campaign details or list
            setTimeout(() => {
                router.push(`/outreach/campaigns/${data.id}`);
            }, 1500);
        } catch (error) {
            console.error("Error:", error);
            toast({
                title: "Error",
                description: "Failed to create outreach campaign.",
                variant: "destructive",
            });
        } finally {
            setIsCreating(false);
        }
    };

    // Load draft from localStorage
    useEffect(() => {
        const savedDraft = localStorage.getItem("outreachCampaignDraft");
        if (savedDraft) {
            try {
                const parsedDraft = JSON.parse(savedDraft);
                setFormData((prevData) => ({
                    campaignName: parsedDraft.campaignName || "",
                    selectedPitchDeck: parsedDraft.selectedPitchDeck || "",
                }));
            } catch (error) {
                console.error("Error loading draft:", error);
            }
        }
    }, []);

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
                        Create <span className="text-teal-500">Outreach Campaign</span>
                    </h1>
                    <p className="text-base text-gray-400 max-w-2xl">
                        Launch targeted outreach campaigns for your pitch decks to reach potential investors and partners.
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
                {/* Campaign Details */}
                <motion.div variants={itemVariants}>
                    <Card className="mb-12 bg-gray-800 border-gray-700 shadow-md rounded-xl hover:shadow-lg transition-all duration-200 backdrop-blur-sm">
                        <CardHeader className="px-8 py-6">
                            <CardTitle className="text-2xl font-semibold text-gray-100 flex items-center">
                                <Mail className="w-6 h-6 mr-2 text-indigo-600" />
                                Campaign Details
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-400">
                                Configure your outreach campaign settings.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 py-6 space-y-8">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label
                                        htmlFor="campaignName"
                                        className="text-sm font-semibold text-gray-100"
                                    >
                                        Campaign Name <span className="text-red-400">*</span>
                                    </Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 text-gray-400" />
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-gray-800 text-gray-100 border-gray-700">
                                                <p>
                                                    A descriptive name for your outreach campaign.
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Input
                                    id="campaignName"
                                    name="campaignName"
                                    placeholder="Enter campaign name"
                                    value={formData.campaignName}
                                    onChange={handleInputChange}
                                    className={cn(
                                        "bg-gray-850 border-gray-700 text-gray-100 focus:ring-2 focus:ring-indigo-500 rounded-lg hover:border-indigo-600 transition-all duration-200",
                                        errors.campaignName && "border-red-400"
                                    )}
                                />
                                <AnimatePresence>
                                    {errors.campaignName && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            className="text-xs text-red-400"
                                        >
                                            {errors.campaignName}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                                <div className="text-xs text-gray-400">
                                    {formData.campaignName.length}/50
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label
                                        htmlFor="pitchDeck"
                                        className="text-sm font-semibold text-gray-100"
                                    >
                                        Select Pitch Deck <span className="text-red-400">*</span>
                                    </Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 text-gray-400" />
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-gray-800 text-gray-100 border-gray-700">
                                                <p>Choose which pitch deck to use for this campaign.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Select
                                    value={formData.selectedPitchDeck}
                                    onValueChange={handleSelectChange}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger
                                        id="pitchDeck"
                                        className="bg-gray-850 border-gray-700 text-gray-100 focus:ring-2 focus:ring-indigo-500 rounded-lg hover:border-indigo-600 transition-all duration-200"
                                    >
                                        <SelectValue 
                                            placeholder={isLoading ? "Loading pitch decks..." : "Select a pitch deck"} 
                                        />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                                        {pitchDecks.length > 0 ? (
                                            pitchDecks.map((deck) => (
                                                <SelectItem
                                                    key={deck.id}
                                                    value={deck.id}
                                                    className="text-sm hover:bg-gray-700"
                                                >
                                                    {deck.title}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="no-decks" disabled className="text-sm text-gray-400">
                                                No pitch decks available
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                {pitchDecks.length === 0 && !isLoading && (
                                    <p className="text-xs text-gray-400">
                                        You need to create a pitch deck first before creating a campaign.
                                    </p>
                                )}
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
                        onClick={createCampaign}
                        disabled={isCreating || !!errors.campaignName || pitchDecks.length === 0}
                        className={cn(
                            "bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-8 py-3 text-base shadow-md shadow-indigo-500/50 transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-indigo-500",
                            (isCreating || !!errors.campaignName || pitchDecks.length === 0) &&
                                "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isCreating ? (
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
                                Creating...
                            </>
                        ) : (
                            <>
                                <Wand2 className="h-5 w-5 mr-2" />
                                Create Campaign
                            </>
                        )}
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    );
}