'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, ArrowLeft, Mail, Building, Calendar, Target, Briefcase, Globe, Users, Zap, TrendingUp, Eye, Filter, Search, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthToken } from '@/lib/actions/getauthtoken';
import { UUID } from 'crypto';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

interface Campaign {
    id: string;
    description: string;
    created_at: string;
    campaign_name: string;
    company_name: string;
    founder_name: string;
    industry: string;
    pitch_summary: string;
    startup_stage: string;
    target_investors: string;
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
    const { scrollY } = useScroll();
    const headerY = useTransform(scrollY, [0, 300], [0, -50]);
    const headerOpacity = useTransform(scrollY, [0, 300], [1, 0.9]);

    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [investors, setInvestors] = useState<Investor[]>([]);
    const [filteredInvestors, setFilteredInvestors] = useState<Investor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedCard, setExpandedCard] = useState<string | null>(null);
    const investorsPerPage = 8;

    const [formData, setFormData] = useState<InvestorForm>({
        name: '',
        email: '',
        firm: '',
        industry_focus: '',
        investment_stage: '',
        linkedin_url: '',
        portfolio_companies: '',
        source: '',
        campaign_id: campaignId as UUID,
    });
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(isDarkMode);
        fetchCampaign();
        fetchInvestors();
    }, [campaignId]);

    useEffect(() => {
        let filtered = investors;
        
        if (searchTerm) {
            filtered = filtered.filter(investor => 
                investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                investor.firm.toLowerCase().includes(searchTerm.toLowerCase()) ||
                investor.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (selectedFilter !== 'all') {
            filtered = filtered.filter(investor => 
                investor.investment_stage.toLowerCase().includes(selectedFilter.toLowerCase())
            );
        }
        
        setFilteredInvestors(filtered);
        setCurrentPage(1);
    }, [investors, searchTerm, selectedFilter]);

    const totalPages = Math.ceil(filteredInvestors.length / investorsPerPage);
    const indexOfLastInvestor = currentPage * investorsPerPage;
    const indexOfFirstInvestor = indexOfLastInvestor - investorsPerPage;
    const currentInvestors = filteredInvestors.slice(indexOfFirstInvestor, indexOfLastInvestor);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            setExpandedCard(null);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            setExpandedCard(null);
        }
    };

    const toggleCardExpansion = (investorId: string) => {
        setExpandedCard(expandedCard === investorId ? null : investorId);
    };

    const fetchCampaign = async () => {
        try {
            const token = await getAuthToken();
            const response = await fetch(`http://127.0.0.1:8000/campaigns/${campaignId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                setCampaign(data);
            } else {
                toast.error('Failed to fetch campaign');
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
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                setInvestors(data);
            } else {
                toast.error('Failed to fetch investors');
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
            const payload = {
                ...formData,
                industry_focus: formData.industry_focus
                    ? formData.industry_focus.split(',').map((item) => item.trim()).filter((item) => item.length > 0)
                    : [],
                portfolio_companies: formData.portfolio_companies
                    ? formData.portfolio_companies.split(',').map((item) => item.trim()).filter((item) => item.length > 0)
                    : [],
            };

            const response = await fetch(`http://127.0.0.1:8000/campaigns/${campaignId}/investors`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                toast.success('Investor added successfully');
                setFormData({
                    name: '',
                    email: '',
                    firm: '',
                    industry_focus: '',
                    investment_stage: '',
                    linkedin_url: '',
                    portfolio_companies: '',
                    source: '',
                    campaign_id: campaignId as UUID,
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
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
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
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
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

    const displayArrayOrString = (data: string[] | string): string => {
        if (Array.isArray(data)) {
            return data.join(', ');
        }
        return data || '';
    };

    const getIndustryIcon = (industry: string) => {
        const icons: { [key: string]: string } = {
            technology: '💻',
            healthcare: '🏥',
            finance: '💰',
            education: '📚',
            retail: '🛍️',
            manufacturing: '🏭',
            'real estate': '🏢',
            food: '🍽️',
            transportation: '🚗',
            energy: '⚡',
            entertainment: '🎬',
            sports: '⚽',
            agriculture: '🌾',
            construction: '🏗️',
            consulting: '📊',
            default: '🚀',
        };
        return icons[industry.toLowerCase()] || icons.default;
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.7,
                ease: [0.25, 0.46, 0.45, 0.94] as const,
            },
        },
    };

    const cardVariants = {
        collapsed: {
            height: 'auto',
            transition: {
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94] as const,
            },
        },
        expanded: {
            height: 'auto',
            transition: {
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94] as const,
            },
        },
    };

    if (loading) {
        return (
            <div className={`min-h-screen transition-colors duration-500 ${
                isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
            } flex items-center justify-center px-4 relative overflow-hidden`}>
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute inset-0 opacity-20"
                        animate={{
                            background: [
                                'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)',
                                'radial-gradient(circle at 80% 50%, rgba(147, 51, 234, 0.2) 0%, transparent 50%)',
                                'radial-gradient(circle at 40% 80%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)',
                            ],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    />
                </div>
                
                <motion.div className="flex flex-col items-center space-y-6 relative z-10">
                    <motion.div
                        className="relative"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                        <div className={`w-12 h-12 border-4 border-t-blue-500 rounded-full ${
                            isDark ? 'border-blue-400' : 'border-blue-600'
                        }`} />
                    </motion.div>
                    <motion.h2
                        className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        Loading Campaign...
                    </motion.h2>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-500 ${
            isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
        } relative overflow-hidden`}>
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/15 to-purple-600/15 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 40, 0],
                        y: [0, -20, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/15 to-pink-600/15 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.15, 1],
                        x: [0, -40, 0],
                        y: [0, 20, 0],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <motion.div
                    style={{ y: headerY, opacity: headerOpacity }}
                    className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-xl border border-gray-200/30 dark:border-gray-700/30 p-6 shadow-md"
                >
                    <motion.div
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col gap-4"
                    >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1">
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button
                                        variant="ghost"
                                        onClick={() => router.back()}
                                        className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50"
                                    >
                                        <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
                                    </Button>
                                </motion.div>
                                <h1 className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent truncate`}>
                                    {campaign?.campaign_name || 'Campaign Name'}
                                </h1>
                            </div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    variant="destructive"
                                    onClick={deleteCampaign}
                                    className="rounded-lg px-4 py-2 bg-red-600 hover:bg-red-700"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Campaign
                                </Button>
                            </motion.div>
                        </div>

                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {[
                                { icon: Building, label: 'Company', value: campaign?.company_name },
                                { icon: Users, label: 'Founder', value: campaign?.founder_name },
                                { icon: Target, label: 'Industry', value: campaign?.industry, emoji: getIndustryIcon(campaign?.industry || 'default') },
                                { icon: TrendingUp, label: 'Stage', value: campaign?.startup_stage },
                                { icon: Users, label: 'Target Investors', value: campaign?.target_investors },
                                { icon: Calendar, label: 'Created', value: campaign?.created_at ? new Date(campaign.created_at).toLocaleDateString() : 'N/A' },
                            ].map((item, index) => (
                                <motion.div
                                    key={item.label}
                                    className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm`}
                                    whileHover={{ scale: 1.03 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        {item.emoji ? (
                                            <span className="text-xl">{item.emoji}</span>
                                        ) : (
                                            <item.icon className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                                        )}
                                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {item.label}
                                        </span>
                                    </div>
                                    <p className={`text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {item.value || 'N/A'}
                                    </p>
                                </motion.div>
                            ))}
                            <motion.div
                                className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm col-span-1 sm:col-span-2 lg:col-span-4`}
                                whileHover={{ scale: 1.03 }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Star className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Description
                                    </span>
                                </div>
                                <p className={`text-sm line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {campaign?.description || 'No description available'}
                                </p>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </motion.div>

                <motion.div variants={itemVariants} initial="hidden" animate="visible">
                    <Card className={`${isDark ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-lg border-0 shadow-lg rounded-xl`}>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {[
                                    { icon: Users, value: investors.length, label: 'Total Investors', color: 'blue' },
                                    { icon: TrendingUp, value: filteredInvestors.length, label: 'Filtered Results', color: 'green' },
                                    { icon: Star, value: new Set(investors.map(i => i.investment_stage)).size, label: 'Investment Stages', color: 'purple' },
                                ].map((stat, index) => (
                                    <motion.div
                                        key={stat.label}
                                        className="text-center space-y-3"
                                        whileHover={{ y: -3 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                    >
                                        <motion.div
                                            className={`w-12 h-12 bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-400 rounded-lg flex items-center justify-center mx-auto`}
                                        >
                                            <stat.icon className="w-6 h-6 text-white" />
                                        </motion.div>
                                        <div>
                                            <h3 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {stat.value}
                                            </h3>
                                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {stat.label}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <motion.div
                                className="mt-6 flex justify-center"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    onClick={() => setShowAddForm(!showAddForm)}
                                    className="rounded-lg px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add New Investor
                                </Button>
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>

                {investors.length > 0 && (
                    <motion.div
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col sm:flex-row gap-4 items-center justify-between"
                    >
                        <div className="w-full sm:w-1/2 max-w-md">
                            <motion.div className="relative">
                                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                <Input
                                    placeholder="Search investors..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`pl-10 py-2 rounded-lg ${isDark ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                                />
                            </motion.div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            <select
                                value={selectedFilter}
                                onChange={(e) => setSelectedFilter(e.target.value)}
                                className={`px-3 py-2 rounded-lg ${isDark ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                            >
                                <option value="all">All Stages</option>
                                <option value="pre-seed">Pre-Seed</option>
                                <option value="seed">Seed</option>
                                <option value="series-a">Series A</option>
                                <option value="series-b">Series B</option>
                                <option value="growth">Growth</option>
                            </select>
                        </div>
                    </motion.div>
                )}

                <AnimatePresence>
                    {showAddForm && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card className={`${isDark ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-lg border-0 shadow-lg rounded-xl`}>
                                <CardHeader>
                                    <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        Add New Investor
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <form onSubmit={addInvestor} className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {[
                                                { id: 'name', label: 'Name', type: 'text', required: true, icon: Users },
                                                { id: 'email', label: 'Email', type: 'email', required: true, icon: Mail },
                                                { id: 'firm', label: 'Firm', type: 'text', required: false, icon: Building },
                                                { id: 'investment_stage', label: 'Investment Stage', type: 'text', required: false, icon: TrendingUp },
                                                { id: 'linkedin_url', label: 'LinkedIn URL', type: 'url', required: false, icon: Globe },
                                                { id: 'source', label: 'Source', type: 'text', required: false, icon: Target },
                                            ].map((field) => (
                                                <div key={field.id} className="space-y-2">
                                                    <Label htmlFor={field.id} className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        <field.icon className="w-4 h-4" />
                                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                                    </Label>
                                                    <Input
                                                        id={field.id}
                                                        type={field.type}
                                                        value={formData[field.id as keyof InvestorForm] as string}
                                                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                                        className={`rounded-lg ${isDark ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                                                        required={field.required}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="industry_focus" className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                <Target className="w-4 h-4" />
                                                Industry Focus
                                            </Label>
                                            <Input
                                                id="industry_focus"
                                                value={formData.industry_focus}
                                                onChange={(e) => setFormData({ ...formData, industry_focus: e.target.value })}
                                                className={`rounded-lg ${isDark ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                                                placeholder="e.g., Tech, Healthcare, Fintech (comma-separated)"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="portfolio_companies" className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                <Briefcase className="w-4 h-4" />
                                                Portfolio Companies
                                            </Label>
                                            <Textarea
                                                id="portfolio_companies"
                                                value={formData.portfolio_companies}
                                                onChange={(e) => setFormData({ ...formData, portfolio_companies: e.target.value })}
                                                className={`min-h-[100px] rounded-lg ${isDark ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                                                placeholder="Enter portfolio companies (comma-separated)..."
                                            />
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <Button
                                                type="submit"
                                                className="rounded-lg px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Investor
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setShowAddForm(false)}
                                                className={`rounded-lg px-6 py-2 ${isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {filteredInvestors.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card className={`${isDark ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-lg border-0 shadow-lg rounded-xl`}>
                                <CardContent className="text-center py-12">
                                    <motion.div
                                        className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4"
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Users className="w-8 h-8 text-white" />
                                    </motion.div>
                                    <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {investors.length === 0 ? 'No Investors Yet' : 'No Matching Investors'}
                                    </h3>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                                        {investors.length === 0 
                                            ? 'Add your first investor to start building your network.'
                                            : 'Adjust your search or filters to find investors.'
                                        }
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <>
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {currentInvestors.map((investor, index) => (
                                    <motion.div
                                        key={investor.id}
                                        variants={cardVariants}
                                        initial="collapsed"
                                        animate={expandedCard === investor.id ? 'expanded' : 'collapsed'}
                                    >
                                        <Card
                                            className={`group relative rounded-xl overflow-hidden border-0 shadow-md transition-all duration-300 hover:shadow-xl ${
                                                isDark ? 'bg-gray-800/90' : 'bg-white/90'
                                            } backdrop-blur-lg cursor-pointer`}
                                            onClick={() => handleInvestorClick(investor.id)}
                                        >
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                layout
                                            />
                                            <CardContent className="p-6 relative z-10">
                                                <div className="flex justify-between items-center mb-4">
                                                    <motion.h3
                                                        className={`text-lg font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                    >
                                                        {investor.name}
                                                    </motion.h3>
                                                    <motion.div
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeInvestor(investor.id);
                                                            }}
                                                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"
                                                        >
                                                            <Trash2 className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                                                        </Button>
                                                    </motion.div>
                                                </div>
                                                <div className="space-y-3">
                                                    <motion.div
                                                        className="flex items-center gap-2"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.1 + 0.1 }}
                                                    >
                                                        <Mail className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                                                        <span className={`text-sm truncate ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                            {investor.email}
                                                        </span>
                                                    </motion.div>
                                                    {investor.firm && (
                                                        <motion.div
                                                            className="flex items-center gap-2"
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: index * 0.1 + 0.2 }}
                                                        >
                                                            <Building className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                                                            <span className={`text-sm truncate ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                {investor.firm}
                                                            </span>
                                                        </motion.div>
                                                    )}
                                                    {investor.investment_stage && (
                                                        <motion.div
                                                            className="flex items-center gap-2"
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: index * 0.1 + 0.3 }}
                                                        >
                                                            <TrendingUp className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                                                            <span className={`text-sm truncate ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                {investor.investment_stage}
                                                            </span>
                                                        </motion.div>
                                                    )}
                                                </div>
                                                {(investor.linkedin_url || investor.industry_focus || investor.source || investor.portfolio_companies) && (
                                                    <motion.div
                                                        className="mt-4"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: index * 0.1 + 0.4 }}
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleCardExpansion(investor.id);
                                                            }}
                                                            className={`w-full rounded-lg py-2 text-sm ${isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}
                                                        >
                                                            {expandedCard === investor.id ? 'Hide Details' : 'View Details'}
                                                            <Eye className="w-4 h-4 ml-2" />
                                                        </Button>
                                                    </motion.div>
                                                )}
                                                <AnimatePresence>
                                                    {expandedCard === investor.id && (
                                                        <motion.div
                                                            className="mt-4 space-y-3"
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.4, ease: 'easeOut' }}
                                                        >
                                                            {investor.linkedin_url && (
                                                                <motion.div
                                                                    className="flex items-center gap-2"
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: 0.1 }}
                                                                >
                                                                    <Globe className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                                                                    <a
                                                                        href={investor.linkedin_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className={`text-sm hover:underline ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        LinkedIn Profile
                                                                    </a>
                                                                </motion.div>
                                                            )}
                                                            {investor.industry_focus && (
                                                                <motion.div
                                                                    className="space-y-1"
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: 0.2 }}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <Target className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                                                                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                                            Industry Focus
                                                                        </span>
                                                                    </div>
                                                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                        {displayArrayOrString(investor.industry_focus)}
                                                                    </p>
                                                                </motion.div>
                                                            )}
                                                            {investor.source && (
                                                                <motion.div
                                                                    className="flex items-center gap-2"
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: 0.3 }}
                                                                >
                                                                    <Users className={`w-4 h-4 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                                                                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                                                        Source: {investor.source}
                                                                    </span>
                                                                </motion.div>
                                                            )}
                                                            {investor.portfolio_companies && (
                                                                <motion.div
                                                                    className="space-y-1"
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: 0.4 }}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <Briefcase className={`w-4 h-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                                                                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                                            Portfolio Companies
                                                                        </span>
                                                                    </div>
                                                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                        {displayArrayOrString(investor.portfolio_companies)}
                                                                    </p>
                                                                </motion.div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {totalPages > 1 && (
                                <motion.div
                                    className="flex justify-center items-center gap-4 mt-6"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <Button
                                        variant="outline"
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 1}
                                        className={`rounded-lg p-2 ${isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className={`rounded-lg p-2 ${isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </motion.div>
                            )}
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}