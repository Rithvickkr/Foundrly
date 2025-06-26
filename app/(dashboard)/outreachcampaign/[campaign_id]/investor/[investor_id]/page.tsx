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
  id: string;
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
        `http://127.0.0.1:8000/campaigns/${campaign_id}/investors/${investor_id}`,
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
        `http://127.0.0.1:8000/campaigns/${campaign_id}/investors/${investor_id}/outreach-tracking`,
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
            (email: { id: any; status: string }) => ({
              id: email.id,
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
        "http://127.0.0.1:8000/outreach/generate-cold-email",
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
      const token = await getAuthToken();
      const response = await fetch("http://127.0.0.1:8000/outreach/send-email", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: emailData.id,
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
          email.id === emailData.id
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
        `http://127.0.0.1:8000/outreach-tracking/${emailData.id}`,
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
          email.id === emailData.id
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
        `http://127.0.0.1:8000/outreach-tracking/${id}`,
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
        prev.filter((email) => email.id !== id)
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="text-center animate-pulse">
          <div className="relative">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-indigo-500 dark:text-indigo-400" />
            <div className="absolute inset-0 h-12 w-12 mx-auto rounded-full bg-indigo-500/20 dark:bg-indigo-400/20 animate-ping"></div>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
            Loading Dashboard
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Fetching investor data...
          </p>
        </div>
      </div>
    );
  }

  if (error || !investor || !campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-rose-50 dark:bg-rose-950 transition-colors duration-300">
        <div className="text-center animate-bounce">
          <AlertCircle className="h-16 w-16 text-rose-500 dark:text-rose-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-rose-800 dark:text-rose-200">
            {error || "Investor not found"}
          </h2>
          <p className="text-rose-600 dark:text-rose-300 mb-6">
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
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 max-w-7xl">
        <div
          className={`mb-6 sm:mb-8 transform transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
          }`}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-800 dark:to-violet-800 rounded-2xl blur-3xl opacity-20 animate-pulse"></div>
            <Card className="relative border-0 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent mb-2">
                      Investor Outreach Hub
                    </h1>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 dark:text-indigo-400" />
                      <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300">
                        Campaign:{" "}
                        <span className="font-semibold">
                          {campaign?.campaign_name}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
                    <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      Active Campaign
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div
          className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 transform transition-all duration-1000 delay-200 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {outreachStats ? (
            <>
              {[
                {
                  label: "Total Emails",
                  value:
                    emailStatus?.total || outreachStats.total_emails_generated,
                  icon: Mail,
                  type: "total",
                },
                {
                  label: "Sent",
                  value: emailStatus?.sent,
                  icon: Send,
                  type: "sent",
                },
                {
                  label: "Pending",
                  value: emailStatus?.pending,
                  icon: Clock,
                  type: "pending",
                },
                {
                  label: "Responses",
                  value: outreachStats.responses,
                  icon: CheckCircle,
                  type: "responses",
                },
                {
                  label: "Response Rate",
                  value: `${outreachStats.response_rate}%`,
                  icon: TrendingUp,
                  type: "rate",
                },
              ].map((stat, index) => (
                <Card
                  key={stat.label}
                  className={`group hover:scale-105 transition-all duration-300 delay-${
                    index * 100
                  } border-0 shadow-lg hover:shadow-xl bg-gradient-to-br ${getStatColor(
                    stat.type
                  )} text-white overflow-hidden relative ${
                    index >= 3 ? "col-span-2 sm:col-span-1" : ""
                  }`}
                >
                  <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-sm"></div>
                  <CardContent className="p-3 sm:p-4 lg:p-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-xs sm:text-sm font-medium mb-1">
                          {stat.label}
                        </p>
                        <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-white">
                          {stat.value}
                        </p>
                      </div>
                      <stat.icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white/80 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 opacity-20">
                      <stat.icon className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <Card className="col-span-2 sm:col-span-3 lg:col-span-5 border-dashed border-2 border-gray-300 dark:border-gray-600">
              <CardContent className="p-6 sm:p-8 lg:p-12">
                <div className="flex items-center justify-center text-center">
                  <div className="animate-bounce">
                    <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
                      No outreach statistics available yet
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                      Generate your first email to see stats
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div
          className={`grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 transform transition-all duration-1000 delay-400 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <Card className="md:col-span-2 border-0 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-gray-800 dark:text-gray-100">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-500 dark:text-indigo-400" />
                Investor Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="text-center pb-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 to-violet-600 dark:from-indigo-600 dark:to-violet-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                  <User className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h3 className="font-bold text-lg sm:text-xl text-gray-800 dark:text-gray-100">
                  {investor.name || "Unknown Investor"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {investor.email || "No email available"}
                </p>
              </div>

              <Separator className="bg-gray-200 dark:bg-gray-700" />

              {investor.firm && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Building className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Firm
                    </p>
                    <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                      {investor.firm}
                    </p>
                  </div>
                </div>
              )}

              {investor.linkedin_url && (
                <Button
                  variant="outline"
                  className="relative inline-flex w-full items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={() => window.open(investor.linkedin_url, "_blank")}
                  size="sm"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">View LinkedIn Profile</span>
                  <span className="sm:hidden">LinkedIn</span>
                </Button>
              )}

              <div>
                <h4 className="font-semibold mb-2 sm:mb-3 text-gray-700 dark:text-gray-200 text-sm sm:text-base">
                  Industry Focus
                </h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {investor.industry_focus &&
                  investor.industry_focus.length > 0 ? (
                    investor.industry_focus.map((area, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/70 transition-colors duration-200 text-xs"
                      >
                        {area}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      No industry focus specified
                    </p>
                  )}
                </div>
              </div>

              {investor.investment_stage && (
                <div>
                  <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-200 text-sm sm:text-base">
                    Investment Stage
                  </h4>
                  <Badge
                    variant="outline"
                    className="bg-violet-50 dark:bg-violet-900/50 border-violet-200 dark:border-violet-700 text-violet-700 dark:text-violet-300 text-xs"
                  >
                    {investor.investment_stage}
                  </Badge>
                </div>
              )}

              {investor.portfolio_companies &&
              investor.portfolio_companies.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 sm:mb-3 text-gray-700 dark:text-gray-200 text-sm sm:text-base">
                    Portfolio Companies
                  </h4>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-24 sm:max-h-32 overflow-y-auto">
                    {investor.portfolio_companies.map((company, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs bg-emerald-50 dark:bg-emerald-900/50 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300"
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
                className="relative inline-flex w-full items-center justify-center px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-600 dark:from-indigo-600 dark:to-violet-700 rounded-md hover:from-indigo-600 hover:to-violet-700 dark:hover:from-indigo-700 dark:hover:to-violet-800 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    <span className="hidden sm:inline">Generating Magic...</span>
                    <span className="sm:hidden">Generating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">Generate Cold Email</span>
                    <span className="sm:hidden">Generate Email</span>
                    <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-3 border-0 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-gray-800 dark:text-gray-100">
                <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-violet-500 dark:text-violet-400" />
                Email Composer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {emailData ? (
                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
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
                      className="font-medium text-base sm:text-lg border-2 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                      placeholder="Enter email subject..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
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
                      rows={10}
                      className="resize-none border-2 focus:border-violet-500 dark:focus:border-violet-400 transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm sm:text-base"
                      placeholder="Your personalized email content will appear here..."
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 sm:gap-3 pt-4">
                    <Button
                      onClick={sendEmail}
                      disabled={
                        isSending ||
                        !emailData.email_subject ||
                        !emailData.email_body
                      }
                      className="relative inline-flex flex-1 sm:flex-none items-center justify-center px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 rounded-md hover:from-emerald-600 hover:to-teal-700 dark:hover:from-emerald-700 dark:hover:to-teal-800 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                      size="lg"
                    >
                      {isSending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          <span className="hidden sm:inline">Sending...</span>
                          <span className="sm:hidden">Send...</span>
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="hidden sm:inline">Send Email</span>
                          <span className="sm:hidden">Send</span>
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
                      className="relative inline-flex flex-1 sm:flex-none items-center justify-center px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 rounded-md hover:from-cyan-600 hover:to-blue-700 dark:hover:from-cyan-700 dark:hover:to-blue-800 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                      size="lg"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          <span className="hidden sm:inline">Saving...</span>
                          <span className="sm:hidden">Save...</span>
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="hidden sm:inline">Save Edits</span>
                          <span className="sm:hidden">Save</span>
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={copyToClipboard}
                      className="relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      disabled={
                        !emailData.email_subject || !emailData.email_body
                      }
                      size="sm"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={generateColdEmail}
                      disabled={isGenerating}
                      className="relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      size="sm"
                    >
                      <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 sm:py-16">
                  <div className="relative mb-4 sm:mb-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-violet-400 to-pink-400 dark:from-violet-500 dark:to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
                      <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                    </div>
                    <div className="absolute inset-0 w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-violet-400/30 dark:bg-violet-500/30 animate-ping"></div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100">
                    Ready to Create Magic?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base px-4">
                    Generate a personalized cold email tailored specifically for
                    this investor using AI.
                  </p>
                  <Button
                    onClick={generateColdEmail}
                    disabled={isGenerating}
                    className="relative inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-violet-500 to-pink-500 dark:from-violet-600 dark:to-pink-600 rounded-md hover:from-violet-600 hover:to-pink-600 dark:hover:from-violet-700 dark:hover:to-pink-700 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        <span className="hidden sm:inline">Creating Magic...</span>
                        <span className="sm:hidden">Creating...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">Generate Email Now</span>
                        <span className="sm:hidden">Generate Now</span>
                        <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}

              {recentEmails.length > 0 && (
                <div className="mt-6 sm:mt-8">
                  <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-gray-100">
                    Recent Email Generations
                  </h4>
                  <ScrollArea className="h-[16rem] sm:h-[20rem] md:h-[24rem] w-full rounded-md border border-gray-200 dark:border-gray-700">
                    <div className="p-3 sm:p-4 space-y-3">
                      {recentEmails.map((email, index) => (
                        <Card
                          key={index}
                          className="bg-gray-50 dark:bg-gray-700/50 border-0"
                        >
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex flex-col gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm sm:text-base truncate">
                                  {email.email_subject}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                                  {email.email_body}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  Generated: {email.created_at || "Unknown"}
                                </p>
                              </div>
                              <div className="flex gap-2 w-full">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => editRecentEmail(email)}
                                  className="relative inline-flex flex-1 items-center justify-center px-3 py-1 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                >
                                  <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                  <span className="text-xs sm:text-sm">Edit</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    console.log("Deleting email:", email.id);
                                    deleteEmail(email.id);
                                  }}
                                  className="relative inline-flex flex-1 items-center justify-center px-3 py-1 text-xs sm:text-sm font-medium text-rose-600 dark:text-rose-400 border border-gray-300 dark:border-gray-600 rounded-md hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                                >
                                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                  <span className="text-xs sm:text-sm">Delete</span>
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
}