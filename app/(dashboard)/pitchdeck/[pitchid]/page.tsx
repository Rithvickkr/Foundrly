"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import {
  fetchGeneratedPitch,
  PitchDeckRequest,
  PitchDeckResponse,
} from "@/lib/actions/getaipitch";
import { getAuthToken } from "@/lib/actions/getauthtoken";

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

    const generatedData = await fetchGeneratedPitch(pitchRequest);
    setAiContent(generatedData);
    setAiLoading(false);
  };

  // Parse AI response to extract headings within ** ** and their content
  const parseAIResponse = (content: PitchDeckResponse): PitchSection[] => {
    const text = content.generated_pitch || "";
    const sections: PitchSection[] = [];
    
    // Regex to match text within ** **, capturing the content between and after
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

    // Fallback: If no headings are found, display the entire text as a single section
    if (sections.length === 0 && text) {
      sections.push({
        title: "Pitch Summary",
        content: text,
        isMainHeading: true,
      });
    }

    return sections;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700">
          <CardContent className="p-8">
            <Loader2 className="animate-spin w-12 h-12 mx-auto text-blue-500" />
            <p className="mt-4 text-gray-400">Loading pitch deck...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!pitchDeck) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700">
          <CardContent className="p-8 text-center">
            <p className="text-red-400 mb-6">Pitch Deck not found.</p>
            <Button
              onClick={() => router.push("/")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-8 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700 mb-8">
            <CardHeader className="border-b border-gray-700">
              <CardTitle className="text-2xl font-bold text-white">
                {pitchDeck.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid gap-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-gray-300 font-semibold mb-2">Industry</h3>
                  <p className="text-gray-400">{pitchDeck.industry}</p>
                </div>
                <div>
                  <h3 className="text-gray-300 font-semibold mb-2">Stage</h3>
                  <p className="text-gray-400">{pitchDeck.startup_stage}</p>
                </div>
              </div>
              <div>
                <h3 className="text-gray-300 font-semibold mb-2">Description</h3>
                <p className="text-gray-400 leading-relaxed">{pitchDeck.description}</p>
              </div>
              <div>
                <h3 className="text-gray-300 font-semibold mb-2">Target Market</h3>
                <p className="text-gray-400 leading-relaxed">{pitchDeck.target_market}</p>
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full sm:w-auto mb-8 bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
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
              "Generate AI Insights"
            )}
          </Button>

          {aiContent && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700">
                <CardHeader className="border-b border-gray-700">
                  <CardTitle className="text-xl font-semibold text-white">
                    AI-Generated Pitch Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 grid gap-6">
                  {parseAIResponse(aiContent).map((section, index) => (
                    <motion.div
                      key={section.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                    >
                      {section.isMainHeading ? (
                        <h2 className="text-2xl font-bold text-white mb-3">{section.title}</h2>
                      ) : (
                        <h3 className="text-lg font-semibold text-gray-200 mb-3">{section.title}</h3>
                      )}
                      <p className="text-gray-400 leading-relaxed">{section.content}</p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.section>
          )}

          <Button
            className="w-full sm:w-auto mt-8 bg-gray-600 hover:bg-gray-700 transition-colors duration-300"
            onClick={() => router.push("/")}
            aria-label="Return to Home"
          >
            Go Home
          </Button>
        </motion.section>
      </div>
    </div>
  );
}