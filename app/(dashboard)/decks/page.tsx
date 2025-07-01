"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Loader2, 
  Plus, 
  PresentationIcon, 
  Trash2, 
  Filter, 
  Search, 
  Calendar, 
  Target, 
  Building, 
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Folder,
  Bell,
  Star,
  Grid3X3,
  List,
  Menu,
  X,
  Heart,
  Bookmark,
  Share2,
  Eye,
  MessageCircle,
  Zap,
  Award,
  Building2,
  ChevronLeft,
  ChevronRight,
  Rocket
} from "lucide-react";
import { getDecks } from "@/lib/actions/getdecks";
import { deleteDeck } from "@/lib/actions/deletedeck";
import { UUID } from "crypto";
import { toast } from "sonner";

interface PitchDeckResponseDetails {
  id: any;
  created_at: string;
  pitch_id: string;
  title: string;
  description: string;
  industry: string;
  startup_stage: string;
  target_market: string;
}

export default function DecksPage() {
  const [decks, setDecks] = useState<PitchDeckResponseDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [decksPerPage] = useState(9);
  const [filterIndustry, setFilterIndustry] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedStage, setSelectedStage] = useState("All");
  const [selectedTargetMarket, setSelectedTargetMarket] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [likedDecks, setLikedDecks] = useState<Set<string>>(new Set());
  const [bookmarkedDecks, setBookmarkedDecks] = useState<Set<string>>(new Set());
  // Add state for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<{ id: UUID; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadDecks() {
      try {
        setLoading(true);
        const fetchedDecks = await getDecks();
        if (!fetchedDecks) {
          throw new Error("Failed to fetch decks");
        }
        setDecks(fetchedDecks || []);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch decks:", error);
        setError("Failed to load pitch decks. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadDecks();
  }, []);

  const handleRetry = async () => {
    setError(null);
    setLoading(true);
    try {
      const fetchedDecks = await getDecks();
      setDecks(fetchedDecks || []);
    } catch (err) {
      setError("Failed to load pitch decks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = (deckId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedDecks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(deckId)) {
        newSet.delete(deckId);
        toast.success("Removed from favorites");
      } else {
        newSet.add(deckId);
        toast.success("Added to favorites");
      }
      return newSet;
    });
  };

  const toggleBookmark = (deckId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedDecks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(deckId)) {
        newSet.delete(deckId);
        toast.success("Bookmark removed");
      } else {
        newSet.add(deckId);
        toast.success("Deck bookmarked");
      }
      return newSet;
    });
  };

  // Filter and paginate decks
  const filteredDecks = useMemo(() => {
    return decks.filter((deck) => {
      const matchesSearch =
        deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.target_market?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesIndustry =
        selectedIndustry === "All" || deck.industry === selectedIndustry;

      const matchesStage =
        selectedStage === "All" || deck.startup_stage === selectedStage;

      const matchesTargetMarket =
        selectedTargetMarket === "All" || deck.target_market === selectedTargetMarket;

      const matchesFilter = filterIndustry
        ? deck.industry.toLowerCase().includes(filterIndustry.toLowerCase())
        : true;

      return matchesSearch && matchesIndustry && matchesStage && matchesTargetMarket && matchesFilter;
    });
  }, [decks, searchQuery, selectedIndustry, selectedStage, selectedTargetMarket, filterIndustry]);

  const totalPages = Math.ceil(filteredDecks.length / decksPerPage);
  const paginatedDecks = useMemo(() => {
    const startIndex = (currentPage - 1) * decksPerPage;
    const endIndex = startIndex + decksPerPage;
    return filteredDecks.slice(startIndex, endIndex);
  }, [filteredDecks, currentPage, decksPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Updated delete handlers
  const handleDeleteClick = (id: UUID, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeckToDelete({ id, title });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deckToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteDeck(deckToDelete.id);
      setDecks(decks.filter((deck) => deck.id !== deckToDelete.id));
      toast.success("Pitch deck deleted successfully");
      setShowDeleteModal(false);
      setDeckToDelete(null);
    } catch (error) {
      console.error("Failed to delete deck:", error);
      toast.error("Failed to delete pitch deck. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeckToDelete(null);
  };

  const industries = [
    "All",
    ...new Set(decks.map((deck) => deck.industry).filter(Boolean)),
  ];

  const stages = [
    "All",
    ...new Set(decks.map((deck) => deck.startup_stage).filter(Boolean)),
  ];

  const targetMarkets = [
    "All",
    ...new Set(decks.map((deck) => deck.target_market).filter(Boolean)),
  ];

  const getIndustryIcon = (industry: string) => {
    switch (industry?.toLowerCase()) {
      case "technology":
        return <Building2 className="w-4 h-4" />;
      case "fintech":
        return <TrendingUp className="w-4 h-4" />;
      case "healthcare":
      case "healthtech":
        return <Heart className="w-4 h-4" />;
      case "cleantech":
        return <Zap className="w-4 h-4" />;
      case "edtech":
        return <Award className="w-4 h-4" />;
      default:
        return <Building className="w-4 h-4" />;
    }
  };

  const getStageColor = (stage: string = "") => {
    switch (stage.toLowerCase()) {
      case "pre-seed":
        return "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 dark:from-purple-900/40 dark:to-purple-800/40 dark:text-purple-300";
      case "seed":
        return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/40 dark:to-green-800/40 dark:text-green-300";
      case "series a":
      case "series-a":
        return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900/40 dark:to-blue-800/40 dark:text-blue-300";
      case "series b":
      case "series-b":
        return "bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 dark:from-indigo-900/40 dark:to-indigo-800/40 dark:text-indigo-300";
      case "growth":
        return "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 dark:from-orange-900/40 dark:to-orange-800/40 dark:text-orange-300";
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-700/40 dark:to-gray-600/40 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Enhanced skeleton loader component
  const SkeletonCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div className="relative p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded-full w-16"></div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded-lg w-24"></div>
        </div>
      </div>
    </motion.div>
  );

  // Delete Confirmation Modal Component
  const DeleteModal = () => (
    <AnimatePresence>
      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleDeleteCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
              Delete Pitch Deck
            </h3>

            <p className="text-gray-600 dark:text-gray-300 text-center mb-2">
              Are you sure you want to delete this pitch deck?
            </p>

            {deckToDelete && (
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 text-center mb-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                "{deckToDelete.title}"
              </p>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-6">
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/20">
      {/* Delete Modal */}
      <DeleteModal />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Your Pitch Decks
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                  {filteredDecks.length} deck{filteredDecks.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search pitch decks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-60 lg:w-80 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm text-sm transition-all focus:w-72 lg:focus:w-96"
                />
              </div>

              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 shadow-sm border border-gray-200/50 dark:border-gray-700/50"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: showFilters ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <Filter size={18} />
                </motion.div>
                <span className="font-medium hidden sm:inline">Filter</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                ></motion.span>
              </motion.button>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/createpitchdeck"
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Deck</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Mobile Filters Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-4"
            >
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search pitch decks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry === "All" ? "All Industries" : industry}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {stages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage === "All" ? "All Stages" : stage}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedTargetMarket}
                  onChange={(e) => setSelectedTargetMarket(e.target.value)}
                  className="bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {targetMarkets.map((market) => (
                    <option key={market} value={market}>
                      {market === "All" ? "All Markets" : market}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Filters and Controls */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="hidden md:block px-6 py-4 bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm border-b border-gray-200/30 dark:border-gray-700/30"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4 flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <select
                      value={selectedIndustry}
                      onChange={(e) => setSelectedIndustry(e.target.value)}
                      className="bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      {industries.map((industry) => (
                        <option key={industry} value={industry}>
                          {industry === "All" ? "All Industries" : industry}
                        </option>
                      ))}
                    </select>
                  </div>

                  <select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                    className="bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    {stages.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage === "All" ? "All Stages" : stage}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedTargetMarket}
                    onChange={(e) => setSelectedTargetMarket(e.target.value)}
                    className="bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    {targetMarkets.map((market) => (
                      <option key={market} value={market}>
                        {market === "All" ? "All Markets" : market}
                      </option>
                    ))}
                  </select>

                  <motion.div
                    key={filteredDecks.length}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-gray-500 dark:text-gray-400"
                  >
                    {filteredDecks.length} deck{filteredDecks.length !== 1 ? "s" : ""}
                  </motion.div>
                </div>

                <div className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 rounded-lg p-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "grid"
                        ? "bg-white dark:bg-gray-700 shadow-sm"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "list"
                        ? "bg-white dark:bg-gray-700 shadow-sm"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {loading ? (
            <div
              className={`grid gap-4 sm:gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {[...Array(9)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md"
              >
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Something went wrong
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRetry}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </motion.button>
              </motion.div>
            </div>
          ) : filteredDecks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md"
              >
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Folder className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No pitch decks found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchQuery ||
                  selectedIndustry !== "All" ||
                  selectedStage !== "All" ||
                  selectedTargetMarket !== "All" ||
                  filterIndustry
                    ? "Try adjusting your search or filters"
                    : "Create your first pitch deck to get started"}
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <Link href="/createpitchdeck">Create Your First Deck</Link>
                </motion.button>
              </motion.div>
            </div>
          ) : (
            <>
              <div
                className={`grid gap-4 sm:gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                <AnimatePresence>
                  {paginatedDecks.map((deck, index) => (
                    <motion.div
                      key={deck.id}
                      layout
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: { delay: index * 0.1, duration: 0.5 },
                      }}
                      exit={{ opacity: 0, y: 30, scale: 0.9 }}
                      whileHover={{
                        y: -8,
                        transition: { type: "spring", stiffness: 300, damping: 20 },
                      }}
                      className={`group cursor-pointer will-change-transform ${
                        viewMode === "list" ? "flex items-center space-x-6" : ""
                      }`}
                      onHoverStart={() => setHoveredCard(deck.id)}
                      onHoverEnd={() => setHoveredCard(null)}
                    >
                      <div
                        className={`
                        relative overflow-hidden h-full flex flex-col
                        bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg 
                        border border-gray-200/50 dark:border-gray-700/50 
                        rounded-2xl transition-all duration-300
                        hover:shadow-xl hover:shadow-blue-500/10
                        hover:border-blue-200/70 dark:hover:border-blue-600/70
                        ${viewMode === "list" ? "flex-1 flex-row" : ""}
                        group-hover:bg-white/90 dark:group-hover:bg-gray-800/90
                      `}
                      >
                        {/* Glowing background effect */}
                        <div
                          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 will-change-opacity"
                          style={{ zIndex: -1 }}
                        ></div>

                        {/* Floating orbs */}
                        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500"></div>
                        <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-2xl transform -translate-x-4 translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500"></div>

                        {/* Card Content */}
                        <div className="relative p-6 flex flex-col h-full">
                          {/* Header with icon and title */}
                          <div className="flex items-start space-x-3 mb-4">
                            <div className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400">
                              {getIndustryIcon(deck.industry)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link href={`/pitchdeck/${deck.id}`}>
                                <motion.h3
                                  className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight mb-2"
                                  whileHover={{ scale: 1.02 }}
                                  title={deck.title}
                                >
                                  {deck.title}
                                </motion.h3>
                              </Link>
                              
                              {/* Tags row */}
                              <div className="flex flex-wrap gap-2">
                                <motion.span
                                  whileHover={{ scale: 1.05 }}
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStageColor(
                                    deck.startup_stage
                                  )} truncate max-w-[120px]`}
                                  title={deck.startup_stage}
                                >
                                  <Star className="w-3 h-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">{deck.startup_stage}</span>
                                </motion.span>
                                <motion.span
                                  whileHover={{ scale: 1.05 }}
                                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-700/40 dark:to-gray-600/40 dark:text-gray-300 border border-gray-300/50 truncate max-w-[120px]"
                                  title={deck.industry}
                                >
                                  <Building2 className="w-3 h-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">{deck.industry}</span>
                                </motion.span>
                              </div>
                            </div>

                            {/* Action buttons - moved to top right */}
                            <div className="flex space-x-1 flex-shrink-0">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => toggleLike(deck.id, e)}
                                className={`p-2 rounded-lg transition-colors ${
                                  likedDecks.has(deck.id)
                                    ? "bg-red-100 dark:bg-red-900/30 text-red-500"
                                    : "bg-gray-100 dark:bg-gray-700/50 text-gray-400 hover:text-red-500"
                                }`}
                              >
                                <Heart
                                  className={`w-4 h-4 ${
                                    likedDecks.has(deck.id) ? "fill-current" : ""
                                  }`}
                                />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => toggleBookmark(deck.id, e)}
                                className={`p-2 rounded-lg transition-colors ${
                                  bookmarkedDecks.has(deck.id)
                                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500"
                                    : "bg-gray-100 dark:bg-gray-700/50 text-gray-400 hover:text-yellow-500"
                                }`}
                              >
                                <Bookmark
                                  className={`w-4 h-4 ${
                                    bookmarkedDecks.has(deck.id) ? "fill-current" : ""
                                  }`}
                                />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => handleDeleteClick(deck.id, deck.title, e)}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </div>

                          {/* Description */}
                          <div className="flex-1 mb-4">
                            <motion.p
                              className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 leading-relaxed"
                              initial={{ opacity: 0.8 }}
                              whileHover={{ opacity: 1 }}
                              title={deck.description || "No description available"}
                            >
                              {deck.description || "No description available"}
                            </motion.p>
                          </div>

                          {/* Target Market */}
                          {deck.target_market && (
                            <div className="mb-4">
                              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-lg px-3 py-2">
                                <Target className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate" title={deck.target_market}>
                                  {deck.target_market}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Footer - simplified and better spaced */}
                          <div className="mt-auto space-y-3">
                            {/* Date */}
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-3 h-3 flex-shrink-0" />
                                <span>{formatDate(deck.created_at || "")}</span>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                              >
                                <Share2 className="w-3 h-3" />
                              </motion.button>
                            </div>

                            {/* Action buttons - cleaner layout */}
                            <div className="flex gap-2">
                              <Link href={`/pitchdeck/${deck.id}`} className="flex-1">
                                <motion.button
                                  whileHover={{
                                    scale: 1.02,
                                    boxShadow: "0 4px 12px -2px rgba(34, 197, 94, 0.3)",
                                  }}
                                  whileTap={{ scale: 0.98 }}
                                  className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-medium rounded-lg transition-all hover:from-green-600 hover:to-emerald-700"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>View</span>
                                </motion.button>
                              </Link>

                              <Link href={`/CofChat/${deck.id}`} className="flex-1">
                                <motion.button
                                  whileHover={{
                                    scale: 1.02,
                                    boxShadow: "0 4px 12px -2px rgba(59, 130, 246, 0.3)",
                                  }}
                                  whileTap={{ scale: 0.98 }}
                                  className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-medium rounded-lg transition-all hover:from-blue-600 hover:to-indigo-700"
                                >
                                  <Rocket className="w-3 h-3" />
                                  <span>Chat</span>
                                </motion.button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center mt-6 space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-colors ${
                      currentPage === 1
                        ? "bg-gray-100 dark:bg-gray-700/50 text-gray-400 cursor-not-allowed"
                        : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </motion.button>

                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    // Show first, last, current, and adjacent pages
                    if (
                      page === 1 ||
                      page === totalPages ||
                      page === currentPage ||
                      Math.abs(page - currentPage) <= 1
                    ) {
                      return (
                        <motion.button
                          key={page}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                            currentPage === page
                              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                              : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {page}
                        </motion.button>
                      );
                    } else if (
                      (page === currentPage - 2 && currentPage > 3) ||
                      (page === currentPage + 2 && currentPage < totalPages - 2)
                    ) {
                      // Show ellipsis for skipped pages
                      return (
                        <span
                          key={`ellipsis-${page}`}
                          className="px-2 text-gray-500 dark:text-gray-400"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition-colors ${
                      currentPage === totalPages
                        ? "bg-gray-100 dark:bg-gray-700/50 text-gray-400 cursor-not-allowed"
                        : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}