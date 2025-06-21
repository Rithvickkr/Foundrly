"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Send,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Database,
  ExternalLink,
  Building,
  Calendar,
  User,
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
  campaign_name: string;
  investor_name: string;
  outreach_id: string;
}

interface OutreachRecord {
  id: string;
  email_subject: string;
  email_body: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface OutreachData {
  campaign_id: string;
  investor_id: string;
  investor_name: string;
  investor_email: string;
  investor_firm: string;
  outreach_records: OutreachRecord[];
  total_outreach_count: number;
}

interface OutreachStats {
  total_emails: number;
  sent_emails: number;
  pending_emails: number;
  responses: number;
  response_rate: number;
}

export default function InvestorDashboard() {
  const params = useParams();
  const investor_id = params.investor_id as string;
  const campaign_id = params.campaign_id as string;

  const [investor, setInvestor] = useState<Investor | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [emailData, setEmailData] = useState<EmailData | null>(null);
  const [outreachData, setOutreachData] = useState<OutreachData | null>(null);
  const [outreachStats, setOutreachStats] = useState<OutreachStats | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvestorData();
    fetchOutreachData();
    fetchOutreachStats();
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
      console.log("Investor Data:", data);

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

  const fetchOutreachData = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch(
        `http://127.0.0.1:8000/outreach/${campaign_id}/${investor_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOutreachData(data);
        console.log("Outreach Data:", data);
      }
    } catch (error) {
      console.error("Failed to fetch outreach data:", error);
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
      }
    } catch (error) {
      console.error("Failed to fetch outreach stats:", error);
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
      toast.success("Cold email generated successfully!");
      fetchOutreachData();
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
      const response = await fetch("/api/outreach/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          outreach_id: emailData.outreach_id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      toast.success("Email sent successfully!");
      fetchOutreachData();
      fetchOutreachStats();
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "sent":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading investor data...</p>
        </div>
      </div>
    );
  }

  if (error || !investor || !campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {error || "Investor not found"}
          </h2>
          <p className="text-muted-foreground mb-4">
            Unable to load investor or campaign data
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            Investor Outreach Dashboard
          </h1>
          <p className="text-muted-foreground">
            Campaign: {campaign?.campaign_name || "Unknown Campaign"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {outreachStats ? (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Emails
                      </p>
                      <p className="text-2xl font-bold">
                        {outreachStats.total_emails}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Send className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Sent</p>
                      <p className="text-2xl font-bold">
                        {outreachStats.sent_emails}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold">
                        {outreachStats.pending_emails}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Responses</p>
                      <p className="text-2xl font-bold">
                        {outreachStats.responses}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-indigo-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Response Rate
                      </p>
                      <p className="text-2xl font-bold">
                        {outreachStats.response_rate}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="lg:col-span-5">
              <CardContent className="p-6">
                <div className="flex items-center justify-center text-center">
                  <div>
                    <Database className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      No outreach statistics available
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Outreach Data Summary */}
        {outreachData && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Outreach Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Investor Name</p>
                  <p className="font-semibold">{outreachData.investor_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{outreachData.investor_email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Firm</p>
                  <p className="font-semibold">
                    {outreachData.investor_firm || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-sm">
                  Total Outreach: {outreachData.total_outreach_count}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Investor Information */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Investor Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {investor.name || "Unknown Investor"}
                </h3>

                {investor.firm && (
                  <div className="flex items-center gap-2 mt-1">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <p className="text-muted-foreground">{investor.firm}</p>
                  </div>
                )}

                <p className="text-sm text-muted-foreground mt-1">
                  {investor.email || "No email available"}
                </p>

                {investor.linkedin_url && (
                  <a
                    href={investor.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-1"
                  >
                    LinkedIn Profile
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">Industry Focus</h4>
                <div className="flex flex-wrap gap-2">
                  {investor.industry_focus &&
                  investor.industry_focus.length > 0 ? (
                    investor.industry_focus.map((area, index) => (
                      <Badge key={index} variant="secondary">
                        {area}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No industry focus specified
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Investment Stage</h4>
                {investor.investment_stage ? (
                  <Badge variant="outline">{investor.investment_stage}</Badge>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No investment stage specified
                  </p>
                )}
              </div>

              {investor.portfolio_companies &&
                investor.portfolio_companies.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Portfolio Companies</h4>
                    <div className="flex flex-wrap gap-2">
                      {investor.portfolio_companies.map((company, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {company}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {investor.source && (
                <div>
                  <h4 className="font-medium mb-2">Source</h4>
                  <Badge variant="secondary">{investor.source}</Badge>
                </div>
              )}

              <Button
                onClick={generateColdEmail}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Generate Cold Email
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Email Preview and Editor */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Email Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {emailData ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Subject
                    </label>
                    <Input
                      value={emailData.email_subject || ""}
                      onChange={(e) =>
                        setEmailData({
                          ...emailData,
                          email_subject: e.target.value,
                        })
                      }
                      className="font-medium"
                      placeholder="Email subject"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email Body
                    </label>
                    <Textarea
                      value={emailData.email_body || ""}
                      onChange={(e) =>
                        setEmailData({
                          ...emailData,
                          email_body: e.target.value,
                        })
                      }
                      rows={12}
                      className="resize-none"
                      placeholder="Email content will appear here..."
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={sendEmail}
                      disabled={
                        isSending ||
                        !emailData.email_subject ||
                        !emailData.email_body
                      }
                      className="flex-1"
                    >
                      {isSending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Email
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={generateColdEmail}
                      disabled={isGenerating}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerate
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Email Generated
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Click "Generate Cold Email" to create a personalized email
                    for this investor.
                  </p>
                  <Button
                    onClick={generateColdEmail}
                    disabled={isGenerating}
                    variant="outline"
                  >
                    {isGenerating ? "Generating..." : "Generate Now"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Outreach Records */}
        {outreachData && outreachData.outreach_records.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Outreach History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {outreachData.outreach_records.map((record) => (
                  <div
                    key={record.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">
                          {record.email_subject || "No Subject"}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created: {formatDate(record.created_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Updated: {formatDate(record.updated_at)}
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={`ml-4 ${getStatusBadgeColor(record.status)}`}
                        variant="outline"
                      >
                        {record.status}
                      </Badge>
                    </div>

                    <div className="bg-muted/30 rounded-md p-3">
                      <p className="text-sm whitespace-pre-wrap">
                        {record.email_body || "No email body available"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
