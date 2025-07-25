"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Mail,
  Send,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Building,
  User,
  Edit,
  Save,
  X,
  Trash2,
  TrendingUp,
  Target,
  Zap,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { getAuthToken } from "@/lib/actions/getauthtoken";

interface Investor {
  id: string;
  name: string;
  email: string;
  firm: string;
  industry_focus: string[];
  investment_stage: string;
  linkedin_url: string;
  portfolio_companies: string[];
  source: string;
  created_at: string;
  campaign_id: string;
}

interface Campaign {
  id: string;
  campaign_name: string;
  status: string;
}

interface EmailData {
  email_subject: string;
  email_body: string;
  investor_name: string;
  outreach_id: string;
  created_at?: string;
  status?: string;
  investor_id?: string;
}

interface OutreachStats {
  total_emails: number;
  sent_emails: number;
  pending_emails: number;
  responses: number;
  response_rate: number;
  outreach_records?: EmailData[];
  total_emails_generated: number;
}

export default function InvestorDashboard() {
  const params = useParams();
  const investor_id = params.investor_id as string;
  const campaign_id = params.campaign_id as string;
  const [investor, setInvestor] = useState<Investor | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [emailData, setEmailData] = useState<EmailData | null>(null);
  const [recentEmails, setRecentEmails] = useState<EmailData[]>([]);
  const [outreachStats, setOutreachStats] = useState<OutreachStats | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{
    statuses: { id: any; status: string }[];
    total: number;
    sent: number;
    pending: number;
  } | null>(null);

  useEffect(() => {
    fetchInvestorData();
    fetchOutreachStats();
    setTimeout(() => setIsVisible(true), 100);
  }, [investor_id]);

  const fetchInvestorData = async () => {
    try {
      setError(null);
      const Token = await getAuthToken();
      const response = await fetch(
        `https://pitchdeckbend.onrender.com/campaigns/${campaign_id}/investors/${investor_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${Token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch investor data");
      }

      const data = await response.json();
      setInvestor(data.investor);
      setCampaign(data.campaign);
    } catch (error) {
      console.error("Error fetching investor data:", error);
      setError("Failed to fetch investor data");
      toast.error("Failed to fetch investor data");
    } finally {
      setLoading(false);
    }
  };

  const fetchOutreachStats = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch(
        `https://pitchdeckbend.onrender.com/campaigns/${campaign_id}/investors/${investor_id}/outreach-tracking`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const stats = await response.json();
        setOutreachStats(stats);
        console.log("Outreach Stats:", stats);
        if (stats.outreach_records && stats.outreach_records.length > 0) {
          setRecentEmails(stats.outreach_records);
          console.log("Recent Emails:", stats.outreach_records);
          const emailStatuses = stats.outreach_records.map(
            (email: { outreach_id: any; status: string }) => ({
              id: email.outreach_id,
              status:
                email.status === "generated"
                  ? "pending"
                  : email.status || "0",
            })
          );

          setEmailStatus({
            statuses: emailStatuses,
            total: emailStatuses.length,
            sent: emailStatuses.filter(
              (email: { status: string }) => email.status === "sent"
            ).length,
            pending: emailStatuses.filter(
              (email: { status: string }) => email.status === "pending"
            ).length,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch outreach stats:", error);
      toast.error("Failed to fetch outreach stats");
    }
  };

  const generateColdEmail = async () => {
    if (!campaign || !investor) return;

    setIsGenerating(true);
    try {
      const token = await getAuthToken();
      const response = await fetch(
        "https://pitchdeckbend.onrender.com/outreach/generate-cold-email",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            campaign_id: campaign.id,
            investor_id: investor.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate email");
      }

      const data = await response.json();
      setEmailData(data);
      console.log("Generated Email Data:", data);
      setRecentEmails((prev) => [data, ...prev.slice(0, 4)]);
      toast.success("🎉 Cold email generated successfully!");
      fetchOutreachStats();
    } catch (error) {
      console.error("Error generating email:", error);
      toast.error("Failed to generate cold email");
    } finally {
      setIsGenerating(false);
    }
  };

  const sendEmail = async () => {
    if (!emailData) return;

    setIsSending(true);
    try {
      console.log("Sending email with data:", emailData);
      const token = await getAuthToken();
      const response = await fetch("https://pitchdeckbend.onrender.com/outreach/send-email", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          outreach_id: emailData.outreach_id ,
          subject: emailData.email_subject,
          body: emailData.email_body,
          to_email: investor?.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to send email");
      }

      toast.success("📧 Email sent successfully!");
      setRecentEmails((prev) =>
        prev.map((email) =>
          email.outreach_id === emailData.outreach_id
            ? { ...email, status: "sent" }
            : email
        )
      );
      fetchOutreachStats();
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSending(false);
    }
  };

  const saveEmailEdits = async () => {
    if (!emailData) return;

    setIsSaving(true);
    try {
      const token = await getAuthToken();
      const response = await fetch(
        `https://pitchdeckbend.onrender.com/outreach-tracking/${emailData.outreach_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email_subject: emailData.email_subject,
            email_body: emailData.email_body,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save email edits");
      }

      setRecentEmails((prev) =>
        prev.map((email) =>
          email.outreach_id === emailData.outreach_id
            ? {
                ...email,
                email_subject: emailData.email_subject,
                email_body: emailData.email_body,
              }
            : email
        )
      );
      toast.success("💾 Email edits saved successfully!");
    } catch (error) {
      console.error("Error saving email edits:", error);
      toast.error("Failed to save email edits");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEmail = async (id: string) => {
    try {
      const token = await getAuthToken();
      console.log("Deleting email with ID:", id);
      const response = await fetch(
        `https://pitchdeckbend.onrender.com/outreach-tracking/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete email");
      }

      setRecentEmails((prev) =>
        prev.filter((email) => email.outreach_id !== id)
      );

      await fetchOutreachStats();

      toast.success("🗑️ Email deleted successfully!");
    } catch (error) {
      console.error("Error deleting email:", error);
      toast.error(
        `Failed to delete email: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const copyToClipboard = async () => {
    if (!emailData) return;

    const emailContent = `Subject: ${emailData.email_subject}\n\n${emailData.email_body}`;
    await navigator.clipboard.writeText(emailContent);
    setCopied(true);
    toast.success("Email copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const editRecentEmail = (email: EmailData) => {
    setEmailData(email);
  };

  const getStatColor = (type: string) => {
    switch (type) {
      case "total":
        return "from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700";
      case "sent":
        return "from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700";
      case "pending":
        return "from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700";
      case "responses":
        return "from-violet-500 to-violet-600 dark:from-violet-600 dark:to-violet-700";
      case "rate":
        return "from-cyan-500 to-cyan-600 dark:from-cyan-600 dark:to-cyan-700";
      default:
        return "from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4">
        <div className="text-center animate-pulse max-w-sm mx-auto">
          <div className="relative">
            <RefreshCw className="h-8 w-8 md:h-12 md:w-12 animate-spin mx-auto mb-4 text-indigo-500 dark:text-indigo-400" />
            <div className="absolute inset-0 h-8 w-8 md:h-12 md:w-12 mx-auto rounded-full bg-indigo-500/20 dark:bg-indigo-400/20 animate-ping"></div>
          </div>
          <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
            Loading Dashboard
          </h3>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
            Fetching investor data...
          </p>
        </div>
      </div>
    );
  }

  if (error || !investor || !campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-rose-50 dark:bg-rose-950 transition-colors duration-300 p-4">
        <div className="text-center animate-bounce max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 md:h-16 md:w-16 text-rose-500 dark:text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl md:text-2xl font-bold mb-2 text-rose-800 dark:text-rose-200">
            {error || "Investor not found"}
          </h2>
          <p className="text-sm md:text-base text-rose-600 dark:text-rose-300 mb-6">
            Unable to load investor or campaign data
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-rose-600 dark:text-rose-300 border border-rose-300 dark:border-rose-600 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 lg:py-10 xl:px-10 2xl:px-12 max-w-[1920px]">
        {/* Header Section */}
        <div
          className={`mb-4 sm:mb-6 md:mb-8 transform transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
          }`}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-800 dark:to-violet-800 rounded-xl md:rounded-2xl blur-2xl md:blur-3xl opacity-20 animate-pulse"></div>
            <Card className="relative border-0 shadow-xl md:shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
              <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent mb-1 sm:mb-2 leading-tight">
                      Investor Outreach Hub
                    </h1>
                    <div className="flex items-center gap-2">
                      <Target className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                      <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 dark:text-gray-300 truncate">
                        Campaign:{" "}
                        <span className="font-semibold">
                          {campaign?.campaign_name}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex-shrink-0">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
                      Active Campaign
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 md:mb-10 transform transition-all duration-1000 delay-200 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {outreachStats ? (
            <>
              {[
          {
            label: "Total Emails",
            value: emailStatus?.total || outreachStats.total_emails_generated,
            icon: Mail,
            type: "total",
            description: "Generated emails",
            growth: "+12%"
          },
          {
            label: "Sent",
            value: emailStatus?.sent || 0,
            icon: Send,
            type: "sent",
            description: "Successfully sent",
            growth: "+8%"
          },
          {
            label: "Pending",
            value: emailStatus?.pending || 0,
            icon: Clock,
            type: "pending",
            description: "Awaiting action",
            growth: "-5%"
          },
              ].map((stat, index) => (
          <Card
            key={stat.label}
            className={`group hover:scale-105 hover:rotate-1 transition-all duration-500 delay-${
              index * 50
            } border-0 shadow-lg hover:shadow-2xl bg-gradient-to-br ${getStatColor(
              stat.type
            )} text-white overflow-hidden relative backdrop-blur-sm`}
            style={{
              animationDelay: `${index * 200}ms`,
            }}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 backdrop-blur-sm"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Floating particles effect */}
            <div className="absolute top-2 right-2 w-1 h-1 bg-white/30 rounded-full animate-ping"></div>
            <div className="absolute top-4 right-6 w-0.5 h-0.5 bg-white/40 rounded-full animate-pulse delay-300"></div>
            <div className="absolute bottom-4 left-4 w-0.5 h-0.5 bg-white/20 rounded-full animate-bounce delay-700"></div>

            <CardContent className="p-4 sm:p-5 md:p-6 lg:p-8 relative z-10">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <p className="text-white/90 text-sm sm:text-base font-semibold truncate">
                {stat.label}
              </p>
              <div className="px-2 py-0.5 bg-white/20 rounded-full">
                <span className="text-xs font-medium text-white/80">
                  {stat.growth}
                </span>
              </div>
            </div>
            <p className="text-white/70 text-xs sm:text-sm truncate">
              {stat.description}
            </p>
                </div>
                <div className="relative ml-3">
            <stat.icon className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 text-white/90 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 flex-shrink-0 drop-shadow-lg" />
            <div className="absolute inset-0 blur-sm opacity-50">
              <stat.icon className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 text-white" />
            </div>
                </div>
              </div>
              
              <div className="relative">
                <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white truncate mb-2 drop-shadow-sm">
            {stat.value}
                </p>
                
                {/* Progress indicator */}
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white/40 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${Math.min((Number(stat.value) || 0) * 10, 100)}%`,
                animationDelay: `${index * 200 + 500}ms`
              }}
            ></div>
                </div>
              </div>

              {/* Decorative background icon */}
              <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                <stat.icon className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 rotate-12" />
              </div>
            </CardContent>

            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-white/10 to-transparent blur-xl"></div>
          </Card>
              ))}
            </>
          ) : (
            <Card className="col-span-1 sm:col-span-2 lg:col-span-3 border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-500">
              <CardContent className="p-6 sm:p-8 md:p-12 lg:p-16">
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="relative mb-6">
              {/* Animated background circles */}
              <div className="absolute inset-0 -m-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 animate-ping opacity-20"></div>
              </div>
              <div className="absolute inset-0 -m-2">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-violet-100 dark:bg-violet-900/30 animate-pulse opacity-30"></div>
              </div>
              
              {/* Main icon */}
              <div className="relative z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-violet-600 dark:from-indigo-600 dark:to-violet-700 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
            </div>
            
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">
              No Stats Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-2">
              Your outreach statistics will appear here
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-xs sm:text-sm">
              Generate your first email to see real-time analytics
            </p>
            
            {/* Decorative elements */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-2 h-2 bg-indigo-300 dark:bg-indigo-600 rounded-full animate-bounce delay-0"></div>
              <div className="w-2 h-2 bg-violet-300 dark:bg-violet-600 rounded-full animate-bounce delay-150"></div>
              <div className="w-2 h-2 bg-pink-300 dark:bg-pink-600 rounded-full animate-bounce delay-300"></div>
            </div>
          </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content Section */}
        <div
          className={`grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6 md:gap-8 transform transition-all duration-1000 delay-400 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {/* Investor Profile Card */}
          <Card className="xl:col-span-2 border-0 shadow-lg md:shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm hover:shadow-xl md:hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl text-gray-800 dark:text-gray-100">
                <User className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                <span className="truncate">Investor Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 md:space-y-6">
              <div className="text-center pb-3 sm:pb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-indigo-500 to-violet-600 dark:from-indigo-600 dark:to-violet-700 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4 shadow-lg">
                  <User className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white" />
                </div>
                <h3 className="font-bold text-base sm:text-lg md:text-xl text-gray-800 dark:text-gray-100 truncate px-2">
                  {investor.name || "Unknown Investor"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm truncate px-2">
                  {investor.email || "No email available"}
                </p>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-700" />

              {investor.firm && (
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Building className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Firm
                    </p>
                    <p className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100 truncate">
                      {investor.firm}
                    </p>
                  </div>
                </div>
              )}

              {investor.linkedin_url && (
                <Button
                  variant="outline"
                  className="relative inline-flex w-full items-center justify-center px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={() => window.open(investor.linkedin_url, "_blank")}
                  size="sm"
                >
                  <ExternalLink className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate">View LinkedIn Profile</span>
                </Button>
              )}

              <div>
                <h4 className="font-semibold mb-2 sm:mb-3 text-gray-700 dark:text-gray-200 text-xs sm:text-sm md:text-base">
                  Industry Focus
                </h4>
                <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2">
                  {investor.industry_focus &&
                  investor.industry_focus.length > 0 ? (
                    investor.industry_focus.map((area, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/70 transition-colors duration-200 text-xs px-2 py-0.5"
                      >
                        {area}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic">
                      No industry focus specified
                    </p>
                  )}
                </div>
              </div>

              {investor.investment_stage && (
                <div>
                  <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-200 text-xs sm:text-sm md:text-base">
                    Investment Stage
                  </h4>
                  <Badge
                    variant="outline"
                    className="bg-violet-50 dark:bg-violet-900/50 border-violet-200 dark:border-violet-700 text-violet-700 dark:text-violet-300 text-xs px-2 py-0.5"
                  >
                    {investor.investment_stage}
                  </Badge>
                </div>
              )}

              {investor.portfolio_companies &&
              investor.portfolio_companies.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 sm:mb-3 text-gray-700 dark:text-gray-200 text-xs sm:text-sm md:text-base">
                    Portfolio Companies
                  </h4>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2 max-h-20 sm:max-h-24 md:max-h-32 overflow-y-auto">
                    {investor.portfolio_companies.map((company, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs bg-emerald-50 dark:bg-emerald-900/50 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 px-2 py-0.5"
                      >
                        {company}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={generateColdEmail}
                disabled={isGenerating}
                className="relative inline-flex w-full items-center justify-center px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 text-xs sm:text-sm md:text-base font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-600 dark:from-indigo-600 dark:to-violet-700 rounded-md hover:from-indigo-600 hover:to-violet-700 dark:hover:from-indigo-700 dark:hover:to-violet-800 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 animate-spin flex-shrink-0" />
                    <span className="text-xs sm:text-sm md:text-base truncate">Generating Magic...</span>
                  </>
                ) : (
                  <>
                    <Zap className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0" />
                    <span className="text-xs sm:text-sm md:text-base truncate">Generate Cold Email</span>
                    <ArrowRight className="ml-1 sm:ml-2 h-2 w-2 sm:h-3 sm:w-3 md:h-4 md:w-4 flex-shrink-0" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Email Composer Card */}
          <Card className="xl:col-span-3 border-0 shadow-lg md:shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm hover:shadow-xl md:hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl text-gray-800 dark:text-gray-100">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-violet-500 dark:text-violet-400 flex-shrink-0" />
                <span className="truncate">Email Composer</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 md:space-y-6">
              {emailData ? (
                <div className="space-y-3 sm:space-y-4 md:space-y-6">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Subject Line
                    </label>
                    <Input
                      value={emailData.email_subject || ""}
                      onChange={(e) =>
                        setEmailData({
                          ...emailData,
                          email_subject: e.target.value,
                        })
                      }
                      className="font-medium text-sm sm:text-base md:text-lg border-2 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                      placeholder="Enter email subject..."
                    />
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Email Content
                    </label>
                    <Textarea
                      value={emailData.email_body || ""}
                      onChange={(e) =>
                        setEmailData({
                          ...emailData,
                          email_body: e.target.value,
                        })
                      }
                      rows={8}
                      className="resize-none border-2 focus:border-violet-500 dark:focus:border-violet-400 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-xs sm:text-sm md:text-base"
                      placeholder="Your personalized email content will appear here..."
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3 pt-2 sm:pt-4">
                    <Button
                      onClick={sendEmail}
                      disabled={
                        isSending ||
                        !emailData.email_subject ||
                        !emailData.email_body
                      }
                      className="relative inline-flex flex-1 sm:flex-none items-center justify-center px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 text-xs sm:text-sm md:text-base font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 rounded-md hover:from-emerald-600 hover:to-teal-700 dark:hover:from-emerald-700 dark:hover:to-teal-800 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                      size="lg"
                    >
                      {isSending ? (
                        <>
                          <RefreshCw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin flex-shrink-0" />
                          <span className="text-xs sm:text-sm md:text-base truncate">Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0" />
                          <span className="text-xs sm:text-sm md:text-base truncate">Send Email</span>
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={saveEmailEdits}
                      disabled={
                        isSaving ||
                        !emailData.email_subject ||
                        !emailData.email_body
                      }
                      className="relative inline-flex flex-1 sm:flex-none items-center justify-center px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 text-xs sm:text-sm md:text-base font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 rounded-md hover:from-cyan-600 hover:to-blue-700 dark:hover:from-cyan-700 dark:hover:to-blue-800 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                      size="lg"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin flex-shrink-0" />
                          <span className="text-xs sm:text-sm md:text-base truncate">Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0" />
                          <span className="text-xs sm:text-sm md:text-base truncate">Save Edits</span>
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={copyToClipboard}
                      className="relative inline-flex items-center justify-center px-2 py-2 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      disabled={
                        !emailData.email_subject || !emailData.email_body
                      }
                      size="sm"
                    >
                      {copied ? (
                        <Check className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500 dark:text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={generateColdEmail}
                      disabled={isGenerating}
                      className="relative inline-flex items-center justify-center px-2 py-2 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      size="sm"
                    >
                      <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 md:py-16">
                  <div className="relative mb-3 sm:mb-4 md:mb-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-violet-400 to-pink-400 dark:from-violet-500 dark:to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
                      <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white" />
                    </div>
                    <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto rounded-full bg-violet-400/30 dark:bg-violet-500/30 animate-ping"></div>
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-gray-800 dark:text-gray-100">
                    Ready to Create Magic?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 md:mb-6 max-w-md mx-auto text-xs sm:text-sm md:text-base px-4">
                    Generate a personalized cold email tailored specifically for
                    this investor using AI.
                  </p>
                  <Button
                    onClick={generateColdEmail}
                    disabled={isGenerating}
                    className="relative inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 text-xs sm:text-sm md:text-base font-medium text-white bg-gradient-to-r from-violet-500 to-pink-500 dark:from-violet-600 dark:to-pink-600 rounded-md hover:from-violet-600 hover:to-pink-600 dark:hover:from-violet-700 dark:hover:to-pink-700 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 animate-spin flex-shrink-0" />
                        <span className="text-xs sm:text-sm md:text-base truncate">Creating Magic...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm md:text-base truncate">Generate Email Now</span>
                        <ArrowRight className="ml-1 sm:ml-2 h-2 w-2 sm:h-3 sm:w-3 md:h-4 md:w-4 flex-shrink-0" />
                      </>
                    )}
                  </Button>
                </div>
              )}

              {recentEmails.length > 0 && (
                <div className="mt-4 sm:mt-6 md:mt-8">
                  <h4 className="text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-3 md:mb-4 text-gray-800 dark:text-gray-100">
                    Recent Email Generations
                  </h4>
                  <ScrollArea className="h-48 xs:h-52 sm:h-60 md:h-72 lg:h-80 xl:h-96 2xl:h-[28rem] w-full rounded-md border border-gray-200 dark:border-gray-700">
                    <div className="p-2 xs:p-2.5 sm:p-3 md:p-4 lg:p-5 xl:p-6 space-y-2 xs:space-y-2.5 sm:space-y-3 md:space-y-4">
                      {recentEmails.map((email, index) => (
                        <Card
                          key={index}
                          className="bg-gray-50 dark:bg-gray-700/50 border-0 hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-all duration-200"
                        >
                          <CardContent className="p-2 xs:p-2.5 sm:p-3 md:p-4 lg:p-5 xl:p-6">
                            <div className="flex flex-col gap-2 xs:gap-2.5 sm:gap-3 md:gap-4">
                              <div className="flex-1 min-w-0 space-y-1 xs:space-y-1.5 sm:space-y-2">
                                <p className="font-semibold text-gray-800 dark:text-gray-100 text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl line-clamp-1 break-all">
                                  {email.email_subject}
                                </p>
                                <p className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 line-clamp-2 xs:line-clamp-3 sm:line-clamp-4 leading-relaxed">
                                  {email.email_body}
                                </p>
                                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1 xs:gap-2">
                                  <p className="text-xs xs:text-sm text-gray-500 dark:text-gray-500">
                                    Generated: {email.created_at || "Unknown"}
                                  </p>
                                  {email.status && (
                                    <Badge
                                      variant={email.status === 'sent' ? 'default' : 'secondary'}
                                      className={`text-xs px-1.5 py-0.5 xs:px-2 xs:py-1 w-fit ${
                                        email.status === 'sent' 
                                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' 
                                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                                      }`}
                                    >
                                      {email.status === 'generated' ? 'pending' : email.status}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:flex md:flex-row gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 w-full">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => editRecentEmail(email)}
                                  className="relative inline-flex flex-1 items-center justify-center px-2 py-1.5 xs:px-2.5 xs:py-2 sm:px-3 sm:py-2 md:px-4 md:py-2.5 lg:px-5 lg:py-3 text-xs xs:text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                >
                                  <Edit className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5 mr-1 xs:mr-1.5 sm:mr-2 flex-shrink-0" />
                                  <span className="text-xs xs:text-sm sm:text-base truncate">Edit</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    console.log("Deleting email:", email.outreach_id);
                                    deleteEmail(email.outreach_id);
                                  }}
                                  className="relative inline-flex flex-1 items-center justify-center px-2 py-1.5 xs:px-2.5 xs:py-2 sm:px-3 sm:py-2 md:px-4 md:py-2.5 lg:px-5 lg:py-3 text-xs xs:text-sm sm:text-base font-medium text-rose-600 dark:text-rose-400 border border-gray-300 dark:border-gray-600 rounded-md hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                                >
                                  <Trash2 className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5 mr-1 xs:mr-1.5 sm:mr-2 flex-shrink-0" />
                                  <span className="text-xs xs:text-sm sm:text-base truncate">Delete</span>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
