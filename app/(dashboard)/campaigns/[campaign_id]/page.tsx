'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, ArrowLeft, Mail, Building, Calendar, Target, Briefcase, Globe, Users } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthToken } from '@/lib/actions/getauthtoken';
import { UUID } from 'crypto';

interface Campaign {
    id: string;
    name: string;
    description: string;
    created_at: string;
}

interface Investor {
    id: string;
    name: string;
    email: string;
    firm: string;
    industry_focus: string[] | string;
    investment_stage: string;
    linkedin_url: string;
    portfolio_companies: string[] | string;
    source: string;
}

interface InvestorForm {
    name: string;
    email: string;
    firm: string;
    industry_focus: string;
    investment_stage: string;
    linkedin_url: string;
    portfolio_companies: string;
    source: string;
    campaign_id: UUID;
}

export default function CampaignDetailPage() {
    const params = useParams();
    const router = useRouter();
    const campaignId = params.campaign_id;

    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [investors, setInvestors] = useState<Investor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState<InvestorForm>({
        name: '',
        email: '',
        firm: '',
        industry_focus: '',
        investment_stage: '',
        linkedin_url: '',
        portfolio_companies: '',
        source: '',
        campaign_id: campaignId as UUID
    });
    

    useEffect(() => {
        fetchCampaign();
        fetchInvestors();
    }, [campaignId]);

    const fetchCampaign = async () => {
        try {
            const token = await getAuthToken();
            const response = await fetch(`http://127.0.0.1:8000/campaigns/${campaignId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            });
            if (response.ok) {
                const data = await response.json();
                setCampaign(data);
            }
        } catch (error) {
            toast.error('Failed to fetch campaign');
        }
    };

    const fetchInvestors = async () => {
        try {
            const token = await getAuthToken();
            const response = await fetch(`http://127.0.0.1:8000/campaigns/${campaignId}/investors`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            });
            if (response.ok) {
                const data = await response.json();
                setInvestors(data);
            }
        } catch (error) {
            toast.error('Failed to fetch investors');
        } finally {
            setLoading(false);
        }
    };

    const addInvestor = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = await getAuthToken();
            
            // Convert string fields to arrays for backend
            const payload = {
                ...formData,
                industry_focus: formData.industry_focus 
                    ? formData.industry_focus.split(',').map(item => item.trim()).filter(item => item.length > 0)
                    : [],
                portfolio_companies: formData.portfolio_companies 
                    ? formData.portfolio_companies.split(',').map(item => item.trim()).filter(item => item.length > 0)
                    : []
            };

            const response = await fetch(`http://127.0.0.1:8000/campaigns/${campaignId}/investors`, {
                method: 'POST',
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast.success('Investor added successfully');
                console.log("Investor added successfully")
                console.log(payload)
                setFormData({
                    name: '',
                    email: '',
                    firm: '',
                    industry_focus: '',
                    investment_stage: '',
                    linkedin_url: '',
                    portfolio_companies: '',
                    source: '',
                    campaign_id: campaignId as UUID
                });
                setShowAddForm(false);
                fetchInvestors();
            } else {
                const error = await response.json();
                toast.error(error.detail || 'Failed to add investor');
            }
        } catch (error) {
            toast.error('Failed to add investor');
        }
    };

    const removeInvestor = async (investorId: string) => {
        try {
            const token = await getAuthToken();
            const response = await fetch(`http://127.0.0.1:8000/campaigns/${campaignId}/investors/${investorId}`, {
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            });

            if (response.ok) {
                toast.success('Investor removed successfully');
                fetchInvestors();
            } else {
                toast.error('Failed to remove investor');
            }
        } catch (error) {
            toast.error('Failed to remove investor');
        }
    };

    const deleteCampaign = async () => {
        if (!confirm('Are you sure you want to delete this campaign?')) return;

        try {
            const token = await getAuthToken();
            const response = await fetch(`http://127.0.0.1:8000/campaigns/${campaignId}`, {
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            });

            if (response.ok) {
                toast.success('Campaign deleted successfully');
                router.push('/campaigns');
            } else {
                toast.error('Failed to delete campaign');
            }
        } catch (error) {
            toast.error('Failed to delete campaign');
        }
    };

    const handleInvestorClick = (investorId: string) => {
        router.push(`/outreachcampaign/${campaignId}/investor/${investorId}`);
    };

    // Helper function to display array or string data
    const displayArrayOrString = (data: string[] | string): string => {
        if (Array.isArray(data)) {
            return data.join(', ');
        }
        return data || '';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
                <div className="flex justify-center items-center h-screen">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin"></div>
                        <div className="mt-4 text-center">
                            <p className="text-lg font-medium text-gray-600 dark:text-gray-300 animate-pulse">Loading campaign...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 transition-colors duration-500">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-4 -right-4 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-10 animate-pulse delay-500"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                {/* Header Section */}
                <div className="animate-fade-in-up">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-8">
                        <div className="flex items-start gap-4 flex-1">
                            <Button 
                                variant="ghost" 
                                onClick={() => router.back()}
                                className="shrink-0 hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-sm transition-all duration-200 hover:scale-105"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                                    {campaign?.name}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base leading-relaxed">
                                    {campaign?.description}
                                </p>
                                {campaign?.created_at && (
                                    <div className="flex items-center gap-2 mt-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                        Created {new Date(campaign.created_at).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>
                        <Button 
                            variant="destructive" 
                            onClick={deleteCampaign}
                            className="shrink-0 hover:scale-105 transition-all duration-200 shadow-lg"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Delete Campaign</span>
                            <span className="sm:hidden">Delete</span>
                        </Button>
                    </div>
                </div>

                {/* Stats and Add Button */}
                <div className="animate-fade-in-up delay-200">
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                                            {investors.length} Investors
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                                            {investors.length === 0 ? 'No investors yet' : 'Building your network'}
                                        </p>
                                    </div>
                                </div>
                                <Button 
                                    onClick={() => setShowAddForm(!showAddForm)}
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 hover:scale-105 shadow-lg"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Investor
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Add Investor Form */}
                {showAddForm && (
                    <div className="animate-fade-in-up delay-300">
                        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-0 shadow-2xl">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                                    Add New Investor
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={addInvestor} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Name *</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="firm" className="text-sm font-medium text-gray-700 dark:text-gray-300">Firm</Label>
                                            <Input
                                                id="firm"
                                                value={formData.firm}
                                                onChange={(e) => setFormData({ ...formData, firm: e.target.value })}
                                                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="industry_focus" className="text-sm font-medium text-gray-700 dark:text-gray-300">Industry Focus</Label>
                                            <Input
                                                id="industry_focus"
                                                value={formData.industry_focus}
                                                onChange={(e) => setFormData({ ...formData, industry_focus: e.target.value })}
                                                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                                placeholder="e.g., Tech, Healthcare, Fintech (comma-separated)"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="investment_stage" className="text-sm font-medium text-gray-700 dark:text-gray-300">Investment Stage</Label>
                                            <Input
                                                id="investment_stage"
                                                value={formData.investment_stage}
                                                onChange={(e) => setFormData({ ...formData, investment_stage: e.target.value })}
                                                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="linkedin_url" className="text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn URL</Label>
                                            <Input
                                                id="linkedin_url"
                                                value={formData.linkedin_url}
                                                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                                                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="source" className="text-sm font-medium text-gray-700 dark:text-gray-300">Source</Label>
                                            <Input
                                                id="source"
                                                value={formData.source}
                                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="portfolio_companies" className="text-sm font-medium text-gray-700 dark:text-gray-300">Portfolio Companies</Label>
                                        <Textarea
                                            id="portfolio_companies"
                                            value={formData.portfolio_companies}
                                            onChange={(e) => setFormData({ ...formData, portfolio_companies: e.target.value })}
                                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 min-h-[100px]"
                                            placeholder="Enter portfolio companies (comma-separated)..."
                                        />
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                        <Button 
                                            type="submit"
                                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 hover:scale-105 shadow-lg"
                                        >
                                            Add Investor
                                        </Button>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => setShowAddForm(false)}
                                            className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Investors Grid */}
                <div className="space-y-4 sm:space-y-6">
                    {investors.map((investor, index) => (
                        <div key={investor.id} className="animate-fade-in-up" style={{animationDelay: `${400 + index * 100}ms`}}>
                            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group cursor-pointer">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex flex-col lg:flex-row justify-between items-start gap-4 lg:gap-6">
                                        <div 
                                            className="flex-1 w-full"
                                            onClick={() => handleInvestorClick(investor.id)}
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                                <div className="space-y-3">
                                                    <h3 className="font-semibold text-lg sm:text-xl text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                                                        {investor.name}
                                                    </h3>
                                                    <div className="space-y-2"></div>
                                                        <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2 text-sm sm:text-base">
                                                            <Mail className="w-4 h-4 text-blue-500" />
                                                            {investor.email}
                                                        </p>
                                                        {investor.firm && (
                                                            <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2 text-sm sm:text-base">
                                                                <Building className="w-4 h-4 text-purple-500" />
                                                                {investor.firm}
                                                            </p>
                                                        )}
                                                        {investor.linkedin_url && (
                                                            <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2 text-sm sm:text-base">
                                                                <Globe className="w-4 h-4 text-green-500" />
                                                                <a 
                                                                    href={investor.linkedin_url} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    LinkedIn Profile
                                                                </a>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    {investor.industry_focus && (
                                                        <div className="flex items-start gap-2">
                                                            <Target className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-white text-sm">Industry Focus</p>
                                                                <p className="text-gray-600 dark:text-gray-300 text-sm">{displayArrayOrString(investor.industry_focus)}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {investor.investment_stage && (
                                                        <div className="flex items-start gap-2">
                                                            <Briefcase className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-white text-sm">Investment Stage</p>
                                                                <p className="text-gray-600 dark:text-gray-300 text-sm">{investor.investment_stage}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {investor.source && (
                                                        <div className="flex items-start gap-2">
                                                            <Users className="w-4 h-4 text-pink-500 mt-0.5 shrink-0" />
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-white text-sm">Source</p>
                                                                <p className="text-gray-600 dark:text-gray-300 text-sm">{investor.source}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {investor.portfolio_companies && (
                                                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                    <p className="font-medium text-gray-900 dark:text-white text-sm mb-2">Portfolio Companies</p>
                                                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{displayArrayOrString(investor.portfolio_companies)}</p>
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeInvestor(investor.id);
                                            }}
                                            className="shrink-0 hover:scale-105 transition-all duration-200 shadow-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    
                                </CardContent>
                                
                            </Card>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {investors.length === 0 && (
                    <div className="animate-fade-in-up delay-500">
                        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                            <CardContent className="text-center py-12 sm:py-16">
                                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Users className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">No Investors Yet</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base max-w-md mx-auto">
                                    Start building your investor network by adding your first investor to this campaign.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                }
                
                .delay-200 {
                    animation-delay: 200ms;
                }
                
                .delay-300 {
                    animation-delay: 300ms;
                }
                
                .delay-500 {
                    animation-delay: 500ms;
                }
                
                .delay-1000 {
                    animation-delay: 1000ms;
                }
            `}</style>
        </div>
    );
}