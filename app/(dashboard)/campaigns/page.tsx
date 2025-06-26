'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthToken } from '@/lib/actions/getauthtoken';
import { Plus, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface Campaign {
    id: string;
    campaign_name: string;
    industry: string;
    pitch_summary?: string;
    founder_name?: string;
    target_investors?: string;
    startup_stage?: string;
    company_name: string;
    created_at: string;
}

const CAMPAIGNS_PER_PAGE = 6;

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndustry, setSelectedIndustry] = useState('');
    const [selectedStage, setSelectedStage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const router = useRouter();

    const industries = ['technology', 'healthcare', 'finance', 'education', 'retail', 'manufacturing', 'real estate', 'food', 'transportation', 'energy', 'entertainment', 'sports', 'agriculture', 'construction', 'consulting'];
    const stages = ['idea', 'prototype', 'mvp', 'early', 'growth', 'scale'];

    useEffect(() => {
        fetchCampaigns();
    }, []);

    useEffect(() => {
        filterCampaigns();
    }, [campaigns, searchTerm, selectedIndustry, selectedStage]);

    const fetchCampaigns = async () => {
        try {
            const token = await getAuthToken();
            const response = await fetch('http://127.0.0.1:8000/allcampaigns', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) throw new Error('Failed to fetch campaigns');
            const data = await response.json();
            setCampaigns(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const filterCampaigns = () => {
        let filtered = campaigns;

        if (searchTerm) {
            filtered = filtered.filter(campaign =>
                campaign.campaign_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                campaign.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                campaign.pitch_summary?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedIndustry) {
            filtered = filtered.filter(campaign =>
                campaign.industry.toLowerCase() === selectedIndustry.toLowerCase()
            );
        }

        if (selectedStage) {
            filtered = filtered.filter(campaign =>
                campaign.startup_stage?.toLowerCase() === selectedStage.toLowerCase()
            );
        }

        setFilteredCampaigns(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handleCampaignClick = (campaignId: string) => {
        router.push(`/campaigns/${campaignId}`);
    };

    const handleCreateCampaign = () => {
        router.push('/outreach');
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedIndustry('');
        setSelectedStage('');
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredCampaigns.length / CAMPAIGNS_PER_PAGE);
    const startIndex = (currentPage - 1) * CAMPAIGNS_PER_PAGE;
    const paginatedCampaigns = filteredCampaigns.slice(startIndex, startIndex + CAMPAIGNS_PER_PAGE);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    const getStageColor = (stage: string) => {
        const colors: { [key: string]: string } = {
            idea: 'bg-gradient-to-r from-purple-500 to-purple-700',
            prototype: 'bg-gradient-to-r from-blue-500 to-blue-700',
            mvp: 'bg-gradient-to-r from-indigo-500 to-indigo-700',
            early: 'bg-gradient-to-r from-green-500 to-green-700',
            growth: 'bg-gradient-to-r from-orange-500 to-orange-700',
            scale: 'bg-gradient-to-r from-red-500 to-red-700',
            default: 'bg-gradient-to-r from-gray-500 to-gray-700',
        };
        return colors[stage?.toLowerCase()] || colors.default;
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const cardVariants = {
        hidden: { y: 100, opacity: 0, scale: 0.9 },
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1] as const,
            },
        },
        hover: {
            y: -10,
            scale: 1.03,
            boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
            transition: {
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94] as const,
            },
        },
    };

    if (loading) {
        return (
            <div className="min-h-screen transition-colors duration-500 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <motion.div className="flex flex-col items-center space-y-6">
                    <motion.div
                        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                        transition={{ rotate: { duration: 1.5, repeat: Infinity, ease: 'linear' }, scale: { duration: 1.5, repeat: Infinity } }}
                        className="w-12 h-12 border-4 border-t-transparent rounded-full border-blue-600 dark:border-blue-400"
                    />
                    <motion.p
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                        className="text-lg font-light text-gray-700 dark:text-gray-300"
                    >
                        Discovering campaigns...
                    </motion.p>
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen transition-colors duration-500 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.7 }}
                    className="text-center p-10 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white max-w-lg mx-auto shadow-2xl"
                >
                    <motion.div
                        animate={{ y: [-5, 5, -5], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="text-5xl mb-6"
                    >
                        ⚠️
                    </motion.div>
                    <h2 className="text-2xl font-semibold mb-3">
                        Oops, something broke!
                    </h2>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                        {error}
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchCampaigns}
                        className="mt-6 px-6 py-2 rounded-full font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                    >
                        Try Again
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen transition-colors duration-500 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-7xl">
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="text-center mb-20"
                >
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extralight tracking-tight text-gray-900 dark:text-white">
                        Your Campaigns
                    </h1>
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                        className="h-1 w-24 mx-auto mt-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500"
                    />
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.7 }}
                        className="mt-4 text-lg sm:text-xl font-light text-gray-600 dark:text-gray-300"
                    >
                        Explore and manage your startup pitches
                    </motion.p>
                </motion.div>

                {/* Create Campaign Section */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mb-12 p-6 rounded-2xl bg-white/70 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg"
                >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-center sm:text-left">
                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                                Start a New Campaign
                            </h2>
                            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                                Launch your next pitch to connect with investors and grow your startup.
                            </p>
                        </div>
                        <motion.div 
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }}
                        >
                            <button
                                onClick={handleCreateCampaign}
                                className="rounded-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium shadow-lg transition-all duration-300 flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Create Campaign
                            </button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Search and Filter Section */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mb-8 p-6 rounded-2xl bg-white/70 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg"
                >
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search campaigns..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            />
                        </div>

                        {/* Industry Filter */}
                        <select
                            value={selectedIndustry}
                            onChange={(e) => setSelectedIndustry(e.target.value)}
                            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        >
                            <option value="">All Industries</option>
                            {industries.map(industry => (
                                <option key={industry} value={industry}>
                                    {industry.charAt(0).toUpperCase() + industry.slice(1)}
                                </option>
                            ))}
                        </select>

                        {/* Stage Filter */}
                        <select
                            value={selectedStage}
                            onChange={(e) => setSelectedStage(e.target.value)}
                            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        >
                            <option value="">All Stages</option>
                            {stages.map(stage => (
                                <option key={stage} value={stage}>
                                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                                </option>
                            ))}
                        </select>

                        {/* Clear Filters Button */}
                        {(searchTerm || selectedIndustry || selectedStage) && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={clearFilters}
                                className="px-4 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 transition-all duration-300 flex items-center gap-2"
                            >
                                <Filter className="w-4 h-4" />
                                Clear
                            </motion.button>
                        )}
                    </div>

                    {/* Results Count */}
                    <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                        Showing {paginatedCampaigns.length} of {filteredCampaigns.length} campaigns
                    </div>
                </motion.div>

                <AnimatePresence>
                    {filteredCampaigns.length === 0 ? (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center py-24"
                        >
                            <motion.div
                                animate={{ y: [-10, 10, -10], rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                className="text-7xl mb-8"
                            >
                                {campaigns.length === 0 ? '📝' : '🔍'}
                            </motion.div>
                            <h3 className="text-2xl sm:text-3xl font-light mb-4 text-gray-900 dark:text-white">
                                {campaigns.length === 0 ? 'No campaigns yet' : 'No campaigns found'}
                            </h3>
                            <p className="text-sm sm:text-base max-w-md mx-auto text-gray-600 dark:text-gray-300">
                                {campaigns.length === 0 
                                    ? 'Start creating your first pitch campaign to connect with investors!'
                                    : 'Try adjusting your search or filter criteria.'
                                }
                            </p>
                        </motion.div>
                    ) : (
                        <>
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8"
                            >
                                {paginatedCampaigns.map((campaign) => (
                                    <motion.div
                                        key={campaign.id}
                                        variants={cardVariants}
                                        whileHover="hover"
                                        className="group relative rounded-2xl overflow-hidden cursor-pointer border bg-white/70 dark:bg-gray-800/50 backdrop-blur-md border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-2xl"
                                        onClick={() => handleCampaignClick(campaign.id)}
                                    >
                                        <div className="relative h-48 sm:h-56 overflow-hidden">
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-900"
                                                animate={{ scale: [1, 1.05, 1] }}
                                                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                                            />
                                            <motion.div
                                                className="absolute inset-0 flex items-center justify-center text-6xl opacity-30"
                                                animate={{ rotate: [0, 10, -10, 0] }}
                                                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                                            >
                                                {getIndustryIcon(campaign.industry)}
                                            </motion.div>
                                        </div>

                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <motion.span
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.3 }}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStageColor(campaign.startup_stage || 'default')} text-white`}
                                                >
                                                    {campaign.startup_stage || 'Unknown'}
                                                </motion.span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(campaign.created_at).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <h3 className="text-lg sm:text-xl font-semibold mb-3 line-clamp-2 transition-colors duration-300 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                {campaign.campaign_name}
                                            </h3>
                                            <p className="text-sm mb-4 line-clamp-3 leading-relaxed text-gray-600 dark:text-gray-300">
                                                {campaign.pitch_summary || 'No summary available'}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <motion.div
                                                        className="text-2xl"
                                                        whileHover={{ rotate: 360 }}
                                                        transition={{ duration: 0.5 }}
                                                    >
                                                        {getIndustryIcon(campaign.industry)}
                                                    </motion.div>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {campaign.industry}
                                                    </span>
                                                </div>
                                                <motion.div
                                                    whileHover={{ x: 6 }}
                                                    className="text-sm font-semibold flex items-center text-blue-600 dark:text-blue-400"
                                                >
                                                    Explore
                                                    <motion.svg
                                                        className="w-4 h-4 ml-2"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        whileHover={{ x: 4 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <path 
                                                            strokeLinecap="round" 
                                                            strokeLinejoin="round" 
                                                            strokeWidth={2} 
                                                            d="M9 5l7 7-7 7" 
                                                        />
                                                    </motion.svg>
                                                </motion.div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.5 }}
                                    className="mt-12 flex items-center justify-center space-x-2"
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    </motion.button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <motion.button
                                            key={page}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handlePageChange(page)}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                                currentPage === page
                                                    ? 'bg-blue-600 text-white shadow-lg'
                                                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            {page}
                                        </motion.button>
                                    ))}

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
                                    >
                                        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    </motion.button>
                                </motion.div>
                            )}
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
