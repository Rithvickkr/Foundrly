"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Loader2, Plus, PresentationIcon, Trash2, Filter, Search, Calendar, Target, Building, TrendingUp } from "lucide-react";
import { getDecks } from "@/lib/actions/getdecks";
import { deleteDeck } from "@/lib/actions/deletedeck";
import { UUID } from "crypto";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [decksPerPage] = useState(8);
  const [filterIndustry, setFilterIndustry] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    async function loadDecks() {
      try {
        const fetchedDecks = await getDecks();
        setDecks(fetchedDecks || []);
      } catch (error) {
        console.error("Failed to fetch decks:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDecks();
  }, []);

  // Filter and paginate decks
  const filteredDecks = filterIndustry
    ? decks.filter((deck) => deck.industry.toLowerCase().includes(filterIndustry.toLowerCase()))
    : decks;
  const indexOfLastDeck = currentPage * decksPerPage;
  const indexOfFirstDeck = indexOfLastDeck - decksPerPage;
  const currentDecks = filteredDecks.slice(indexOfFirstDeck, indexOfLastDeck);
  const totalPages = Math.ceil(filteredDecks.length / decksPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleDelete = async (id: UUID) => {
    if (confirm("Are you sure you want to delete this pitch deck?")) {
      try {
        await deleteDeck(id);
        setDecks(decks.filter((deck) => deck.id !== id));
      } catch (error) {
        console.error("Failed to delete deck:", error);
      }
    }
  };

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.1
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.95 },
    show: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6
      } 
    },
  };

  const cardHoverVariants = {
    rest: { 
      scale: 1,
      y: 0,
      rotateX: 0,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    },
    hover: { 
      scale: 1.03,
      y: -8,
      rotateX: 2,
      rotateY: 2,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const filterPanelVariants = {
    hidden: { opacity: 0, y: -20, height: 0 },
    show: {
      opacity: 1,
      y: 0,
      height: "auto",
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -20,
      height: 0,
      transition: { duration: 0.4, ease: "easeIn" },
    },
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -30 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: 0.6,
        delay: 0.2,
      },
    },
    exit: {
      opacity: 0,
      x: -30,
      transition: { duration: 0.2, ease: "easeIn" },
    }
  };

  const clearButtonVariants = {
    hidden: { opacity: 0, x: -30 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: 0.6,
        delay: 0.4,
      },
    },
    exit: {
      opacity: 0,
      x: -30,
      transition: { duration: 0.2, ease: "easeIn" },
    }
  };

  // Enhanced skeleton loader component
  const SkeletonCard = () => (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-pulse" />
      </div>
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="flex space-x-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
        </div>
      </div>
    </motion.div>
  );

  const getIndustryIcon = (industry: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'technology': <Building className="w-4 h-4" />,
      'fintech': <TrendingUp className="w-4 h-4" />,
      'healthcare': <Target className="w-4 h-4" />,
      'default': <Building className="w-4 h-4" />
    };
    return icons[industry?.toLowerCase()] || icons.default;
  };

  const getStageColor = (stage: string) => {
    const colors: { [key: string]: string } = {
      'seed': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'series-a': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'series-b': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      'growth': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      'default': 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
    };
    return colors[stage?.toLowerCase().replace(' ', '-')] || colors.default;
  };

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-blue-950/50 dark:to-indigo-950 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Enhanced Header */}
      <motion.div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
            Your Pitch Decks
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {filteredDecks.length} deck{filteredDecks.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <div className="flex items-center gap-4">
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
            <span className="font-medium">Filter</span>
          </motion.button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/createpitchdeck"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl flex items-center transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
            >
              <Plus size={18} className="mr-2" />
              New Deck
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Filter Bar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            variants={filterPanelVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Filter size={20} />
              Filter Your Decks
            </h3>
            <div className="flex items-center gap-4">
              <motion.div variants={inputVariants} className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                />
                <input
                  type="text"
                  placeholder="Search by industry (e.g., Technology, Healthcare, Fintech)..."
                  value={filterIndustry}
                  onChange={(e) => setFilterIndustry(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm"
                />
              </motion.div>
              <motion.button
                variants={clearButtonVariants}
                onClick={() => setFilterIndustry("")}
                className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 font-medium shadow-sm"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Decks Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {Array(8).fill(0).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredDecks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <PresentationIcon className="w-20 h-20 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
            No pitch decks found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {filterIndustry ? "No decks match your current filter. Try adjusting your search criteria." : "Create your first pitch deck to get started on your journey!"}
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/createpitchdeck"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl inline-flex items-center transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
            >
              <Plus size={18} className="mr-2" />
              Create Your First Deck
            </Link>
          </motion.div>
        </motion.div>
      ) : (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {currentDecks.map((deck) => (
              <motion.div
                key={deck.id}
                variants={itemVariants}
                initial="rest"
                whileHover="hover"
                animate="rest"
                onHoverStart={() => setHoveredCard(deck.id)}
                onHoverEnd={() => setHoveredCard(null)}
                className="relative group"
              >
                <motion.div
                  variants={cardHoverVariants}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden backdrop-blur-sm"
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                >
                  <Link href={`/pitchdeck/${deck.id}`} className="block">
                    {/* Enhanced header with gradient and pattern */}
                    <div className="h-44 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 relative overflow-hidden">
                      {/* Animated background pattern */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16" />
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12" />
                        <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-white rounded-full -translate-x-10 -translate-y-10" />
                      </div>
                      
                      {/* Animated icon container */}
                      <motion.div 
                        className="absolute inset-0 flex items-center justify-center"
                        animate={hoveredCard === deck.id ? {
                          scale: [1, 1.2, 1],
                          rotate: [0, 5, -5, 0]
                        } : {}}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      >
                        <PresentationIcon className="h-16 w-16 text-white drop-shadow-lg" />
                      </motion.div>
                      
                      {/* Shimmer effect on hover */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                        animate={hoveredCard === deck.id ? { x: "200%" } : { x: "-100%" }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                      />
                    </div>
                    
                    {/* Enhanced content section */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        {deck.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {deck.description || "No description available"}
                      </p>
                      
                      {/* Enhanced tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <motion.span 
                          className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300"
                          whileHover={{ scale: 1.05 }}
                        >
                          {getIndustryIcon(deck.industry)}
                          {deck.industry || "No industry"}
                        </motion.span>
                        <motion.span 
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${getStageColor(deck.startup_stage)}`}
                          whileHover={{ scale: 1.05 }}
                        >
                          <TrendingUp className="w-3 h-3" />
                          {deck.startup_stage || "No stage"}
                        </motion.span>
                      </div>
                      
                      {/* Enhanced footer */}
                      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(deck.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 truncate max-w-[120px]">
                          <Target className="w-3 h-3 flex-shrink-0" />
                          {deck.target_market || "No target"}
                        </span>
                      </div>
                    </div>
                  </Link>
                  
                  {/* Enhanced delete button */}
                  <motion.button
                    onClick={() => handleDelete(deck.id)}
                    className="absolute top-3 right-3 p-2.5 text-white/70 hover:text-red-400 transition-all duration-200 rounded-full hover:bg-black/20 backdrop-blur-sm"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: hoveredCard === deck.id ? 1 : 0,
                      scale: hoveredCard === deck.id ? 1 : 0.8
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Trash2 size={18} />
                  </motion.button>
                </motion.div>
              </motion.div>
            ))}
            
            {/* Enhanced create new card */}
            <motion.div
              variants={itemVariants}
              className="relative group"
            >
              <motion.div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 bg-gradient-to-br from-gray-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-950/50 backdrop-blur-sm"
                whileHover={{ 
                  scale: 1.02,
                  y: -4,
                  borderColor: "rgb(59 130 246)"
                }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <Link
                  href="/decks/new"
                  className="flex flex-col items-center justify-center h-full w-full p-8 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 min-h-[280px]"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="mb-4"
                  >
                    <Plus className="h-16 w-16" />
                  </motion.div>
                  <span className="text-lg font-semibold mb-2">Create New Deck</span>
                  <span className="text-sm text-center opacity-70">
                    Start building your next pitch presentation
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <motion.div 
              className="mt-12 flex justify-center items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-gray-200 dark:border-gray-700 font-medium"
                whileHover={{ scale: currentPage === 1 ? 1 : 1.05, y: currentPage === 1 ? 0 : -1 }}
                whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
              >
                Previous
              </motion.button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <motion.button
                  key={page}
                  onClick={() => paginate(page)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    currentPage === page
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  }`}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {page}
                </motion.button>
              ))}
              
              <motion.button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-gray-200 dark:border-gray-700 font-medium"
                whileHover={{ scale: currentPage === totalPages ? 1 : 1.05, y: currentPage === totalPages ? 0 : -1 }}
                whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
              >
                Next
              </motion.button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}