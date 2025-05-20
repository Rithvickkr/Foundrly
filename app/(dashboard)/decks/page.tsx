"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Loader2, Plus, PresentationIcon, Trash2, Filter, Search } from "lucide-react";
import { getDecks } from "@/lib/actions/getdecks";
import { deleteDeck } from "@/lib/actions/deletedeck";
import { UUID } from "crypto";
import { exit } from "process";

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.3 } },
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
    hidden: { opacity: 0, x: -20 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: 0.5,
        delay: 0.5,
      },
    },
    exit: {
      opacity: 0,
        x: -20,
        transition: { duration: 0.1, ease: "easeIn" },
    }
  };

  const clearButtonVariants = {
    hidden: { opacity: 0, x: -20 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: 0.5,
        delay: 0.7,
      },
    },
    exit: {
      opacity: 0,
        x: -20,
        transition: { duration: 0.1, ease: "easeIn" },
    }
  };

  // Skeleton loader component
  const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="h-36 bg-gray-200 dark:bg-gray-700 rounded-t-xl" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="flex space-x-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-blue-950 text-gray-800 dark:text-gray-100 transition-colors duration-200 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Your Pitch Decks
        </h1>
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: showFilters ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Filter size={18} />
            </motion.div>
            <span>Filter</span>
          </motion.button>
          <Link
            href="/createpitchdeck"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200 shadow-sm"
          >
            <Plus size={18} className="mr-2" />
            New Deck
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            variants={filterPanelVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Filter Decks
            </h3>
            <div className="flex items-center gap-4">
              <motion.div variants={inputVariants} className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                />
                <input
                  type="text"
                  placeholder="Search by industry..."
                  value={filterIndustry}
                  onChange={(e) => setFilterIndustry(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </motion.div>
              <motion.button
                variants={clearButtonVariants}
                onClick={() => setFilterIndustry("")}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decks Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredDecks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm"
        >
          <PresentationIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            No pitch decks found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">
            Create your first pitch deck or adjust your filters
          </p>
          <Link
            href="/createpitchdeck"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center transition-colors duration-200 shadow-sm"
          >
            <Plus size={18} className="mr-2" />
            Create Pitch Deck
          </Link>
        </motion.div>
      ) : (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {currentDecks.map((deck) => (
              <motion.div
                key={deck.id}
                variants={itemVariants}
                className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 overflow-hidden group"
              >
                <Link href={`/pitchdeck/${deck.id}`} className="block">
                  <div className="h-36 bg-gradient-to-br from-blue-500 to-indigo-600 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center opacity-50 group-hover:opacity-75 transition-opacity">
                      <PresentationIcon className="h-16 w-16 text-white" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {deck.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 line-clamp-2">
                      {deck.description || "No description"}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-block bg-gray-100 dark:bg-gray-700 rounded-full px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                        {deck.industry || "No industry"}
                      </span>
                      <span className="inline-block bg-gray-100 dark:bg-gray-700 rounded-full px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                        {deck.startup_stage || "No stage"}
                      </span>
                    </div>
                    <div className="mt-4 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        {new Date(deck.created_at).toLocaleDateString()}
                      </span>
                      <span>
                        {deck.target_market
                          ? `Target: ${deck.target_market}`
                          : "No target market"}
                      </span>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => handleDelete(deck.id)}
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
            <motion.div
              variants={itemVariants}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
            >
              <Link
                href="/decks/new"
                className="flex flex-col items-center justify-center h-full w-full p-6 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Plus className="h-12 w-12 mb-2" />
                <span className="text-sm font-medium">Create New Deck</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => paginate(page)}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}