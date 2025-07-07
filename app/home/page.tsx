"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import Tilt from "react-parallax-tilt";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Brain,
  Search,
  BarChart3,
  FileText,
  Mail,
  Mic,
  Rocket,
  Star,
  ArrowRight,
  CheckCircle,
  Zap,
  Globe,
  Twitter,
  FileCode,
  Shield,
  Bot,
  DollarSign,
  Users,
  Target,
  TrendingUp,
  Clock,
  Award,
  Lightbulb,
  MessageSquare,
  PieChart,
  Briefcase,
  Menu,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";

const HOME = () => {
  const [mounted, setMounted] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeDemoTab, setActiveDemoTab] = useState("input");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const heroRef = useRef<HTMLElement | null>(null);
  const whatItDoesRef = useRef<HTMLElement | null>(null);
  const howItWorksRef = useRef<HTMLElement | null>(null);
  const testimonialsRef = useRef<HTMLElement | null>(null);
  const liveDemoRef = useRef<HTMLElement | null>(null);
  const faqRef = useRef<HTMLElement | null>(null);
  const ctaRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Enhanced parallax and opacity for hero
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.5]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  // Memoized data
  const phrases = useMemo(
    () => [
      "Validating Idea...",
      "Generating Pitch...",
      "Emailing Investor...",
      "Creating Slides...",
      "Analyzing Market...",
    ],
    []
  );

  const features = useMemo(
    () => [
      {
        icon: Search,
        title: "Idea Validation Engine",
        description:
          "AI analyzes market demand, competition, and feasibility in seconds",
        gradient: "from-blue-600 to-cyan-600",
      },
      {
        icon: BarChart3,
        title: "Competitor & Market Analysis",
        description:
          "Deep insights into your competitive landscape and market opportunities",
        gradient: "from-purple-600 to-pink-600",
      },
      {
        icon: FileText,
        title: "Pitch Deck Auto-Creation",
        description:
          "Generate professional decks with charts, branding, and compelling narratives",
        gradient: "from-green-600 to-emerald-600",
      },
      {
        icon: FileCode,
        title: "Slide Generation Tool",
        description:
          "Create stunning presentation slides with AI-powered design and content",
        gradient: "from-indigo-600 to-blue-600",
      },
      {
        icon: Globe,
        title: "Investor Outreach Toolkit",
        description:
          "Crafted emails and video pitches that get responses from VCs",
        gradient: "from-orange-600 to-red-600",
      },
      {
        icon: Bot,
        title: "AI-Powered Co-Founder",
        description:
          "Your AI co-founder that works 24/7 to build your startup",
        gradient: "from-yellow-600 to-amber-600",
      },
    ],
    []
  );

  const steps = useMemo(
    () => [
      {
        icon: FileCode,
        title: "Submit Your Idea",
        description:
          "Share your startup concept with our AI in a simple form",
      },
      {
        icon: FileText,
        title: "Generate Deck",
        description:
          "Receive a professional pitch deck tailored to your vision",
      },
      {
        icon: Search,
        title: "AI Market Scan",
        description:
          "Get instant market validation and competitor insights",
      },
      {
        icon: Mic,
        title: "Create AI Pitch",
        description:
          "Produce a compelling video pitch with AI voiceover",
      },
      {
        icon: Rocket,
        title: "Launch & Scale",
        description:
          "Pitch investors with confidence and grow your startup",
      },
    ],
    []
  );

  const testimonials = useMemo(
    () => [
      {
        name: "Sarah Chen",
        role: "Founder, TechFlow",
        content:
          "Foundrly turned my napkin sketch into a $2M funding round. The AI validation caught market gaps I never saw.",
        rating: 5,
        avatar: "SC",
      },
      {
        name: "Marcus Rodriguez",
        role: "Serial Entrepreneur",
        content:
          "This is like having a Stanford MBA co-founder who works 24/7. The pitch decks are investor-ready from day one.",
        rating: 5,
        avatar: "MR",
      },
      {
        name: "Emily Watson",
        role: "Y Combinator Mentor",
        content:
          "I've seen thousands of pitches. Foundrly-generated decks are consistently in the top 10% for clarity and impact.",
        rating: 5,
        avatar: "EW",
      },
    ],
    []
  );

  const faqData = useMemo(
    () => [
      {
        question: "How does Foundrly validate startup ideas?",
        answer:
          "Our AI analyzes 50+ data points including market size, competition density, search trends, patent landscapes, and regulatory requirements. We cross-reference with 100,000+ successful startups to give you a comprehensive validation score within minutes.",
        icon: Target,
      },
      {
        question: "What makes Foundrly's pitch decks investor-ready?",
        answer:
          "Our AI studies patterns from 10,000+ funded pitch decks. We automatically include key metrics VCs look for: TAM/SAM analysis, competitive positioning, financial projections, and risk mitigation strategies. Each deck follows proven frameworks that have raised $2B+ in funding.",
        icon: PieChart,
      },
      {
        question: "How does the AI co-founder actually help?",
        answer:
          "Think of it as having a Harvard MBA co-founder available 24/7. It helps with market research, competitive analysis, business model optimization, investor outreach strategies, and even handles regulatory compliance checks. It's trained on data from 50,000+ successful startups.",
        icon: Bot,
      },
      {
        question: "Can I customize the generated content?",
        answer:
          "Absolutely! While our AI creates the foundation, you have full control. Edit slides, adjust financial models, modify pitch scripts, and rebrand everything. Our editor supports real-time collaboration and version control for team workflows.",
        icon: FileCode,
      },
      {
        question: "What's included in the investor outreach?",
        answer:
          "We provide personalized email templates, investor research profiles, follow-up sequences, and even AI-generated video pitches. Our database includes 15,000+ active investors with their investment preferences and contact information.",
        icon: Users,
      },
      {
        question: "How much does Foundrly cost?",
        answer:
          "We offer flexible pricing: Basic ($29/month) for solo founders, Pro ($99/month) for teams with advanced features, and Enterprise ($299/month) for agencies. All plans include unlimited idea validation and pitch deck generation. 14-day free trial included.",
        icon: DollarSign,
      },
      {
        question: "What success rate do Foundrly users see?",
        answer:
          "Our users see 3.2x higher response rates from investors, 67% faster time-to-funding, and 89% report improved pitch clarity. Over 1,200 startups have raised $420M+ using Foundrly-generated materials.",
        icon: TrendingUp,
      },
      {
        question: "Is my startup idea secure?",
        answer:
          "Yes! We use enterprise-grade encryption, never store your data on third-party servers, and offer optional NDA protection. Your ideas remain 100% confidential. We're SOC 2 certified and GDPR compliant.",
        icon: Shield,
      },
    ],
    []
  );

  // Custom easing and spring
  const smoothEasing = useMemo(() => [0.6, 0.05, 0.01, 0.99] as const, []);
  const bounceSpring = useMemo(
    () => ({ type: "spring" as const, stiffness: 200, damping: 20, mass: 0.8 }),
    []
  );
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const staggerChild = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 150,
        damping: 15,
      },
    },
  };

  // Handle mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Typing animation with smoother cursor
  useEffect(() => {
    if (!mounted) {
      setTypedText(phrases[currentPhrase]);
      return;
    }

    const phrase = phrases[currentPhrase];
    let index = 0;

    const typeInterval = setInterval(() => {
      if (index <= phrase.length) {
        setTypedText(phrase.slice(0, index));
        index++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setCurrentPhrase((prev) => (prev + 1) % phrases.length);
        }, 2500);
      }
    }, 70 + Math.random() * 15);

    return () => clearInterval(typeInterval);
  }, [currentPhrase, mounted, phrases]);

  // Testimonials rotation
  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [mounted, testimonials.length]);

  // Mouse trail effect
  useEffect(() => {
    if (!mounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mounted]);

  const handleEmailSubmit = useCallback(() => {
    if (email && email.includes("@")) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail("");
      }, 3500);
    }
  }, [email]);

  // Smooth scrolling to sections
  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
      {/* Navbar */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg border-b border-white/20"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: smoothEasing }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.1 }}
              transition={bounceSpring}
            >
              <Brain className="w-8 h-8 text-cyan-400 mr-2 animate-pulse" />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Foundrly
              </span>
            </motion.div>

            {/* Desktop Menu */}
            <motion.div
              className="hidden lg:flex space-x-8"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {[
                { label: "Home", ref: heroRef },
                { label: "What It Does", ref: whatItDoesRef },
                { label: "How It Works", ref: howItWorksRef },
                { label: "Testimonials", ref: testimonialsRef },
                { label: "Live Demo", ref: liveDemoRef },
                { label: "FAQ", ref: faqRef },
                { label: "Get Started", ref: ctaRef },
              ].map((item) => (
                <motion.button
                  key={item.label}
                  onClick={() => scrollToSection(item.ref)}
                  className="text-gray-300 hover:text-cyan-400 transition-colors text-base font-medium"
                  variants={staggerChild}
                  whileHover={{ y: -4, scale: 1.05, color: "#22D3EE" }}
                  whileTap={{ scale: 0.9 }}
                >
                  {item.label}
                </motion.button>
              ))}
            </motion.div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-cyan-400 p-2"
                whileHover={{ scale: 1.15, rotate: 10 }}
                whileTap={{ scale: 0.85 }}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                className="lg:hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border-t border-white/20"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: smoothEasing }}
              >
                <motion.div
                  className="flex flex-col items-center py-4 space-y-4"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                >
                  {[
                    { label: "Home", ref: heroRef },
                    { label: "What It Does", ref: whatItDoesRef },
                    { label: "How It Works", ref: howItWorksRef },
                    { label: "Testimonials", ref: testimonialsRef },
                    { label: "Live Demo", ref: liveDemoRef },
                    { label: "FAQ", ref: faqRef },
                    { label: "Get Started", ref: ctaRef },
                  ].map((item) => (
                    <motion.button
                      key={item.label}
                      onClick={() => scrollToSection(item.ref)}
                      className="text-gray-300 hover:text-cyan-400 text-lg font-medium"
                      variants={staggerChild}
                      whileHover={{ x: 8, color: "#22D3EE" }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {item.label}
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Dynamic Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-black"
          animate={{
            background: [
              "linear-gradient(135deg, rgba(88, 28, 135, 0.2), rgba(29, 78, 216, 0.2), #000000)",
              "linear-gradient(135deg, rgba(147, 51, 234, 0.25), rgba(59, 130, 246, 0.25), #000000)",
              "linear-gradient(135deg, rgba(88, 28, 135, 0.2), rgba(29, 78, 216, 0.2), #000000)",
            ],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-4 h-4 bg-cyan-400/30 rounded-full pointer-events-none"
          style={{
            x: mousePosition.x - 8,
            y: mousePosition.y - 8,
            willChange: "transform",
          }}
          animate={{ scale: [1, 1.8, 0], opacity: [0.6, 0.4, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: "easeOut" }}
        />
      </div>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 z-10 pt-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: smoothEasing }}
      >
        <motion.div
          style={{ y, opacity, scale }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            className="w-96 h-96 sm:w-120 sm:h-120 lg:w-160 lg:h-160 rounded-full bg-gradient-to-r from-cyan-500/25 to-purple-500/25 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 15, 0],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        <motion.div
          className="relative z-10 text-center max-w-6xl"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={staggerChild} className="mb-10">
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Brain className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 text-cyan-400" />
            </motion.div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-300 to-purple-300 bg-clip-text text-transparent leading-tight">
              Build Your Startup.
            </h1>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent leading-tight">
              Foundrly Powers It.
            </h2>
          </motion.div>

          <motion.p
            variants={staggerChild}
            className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto px-4"
          >
            Your AI co-founder validates ideas, crafts pitches, and scales your vision.
          </motion.p>

          <motion.div variants={staggerChild} className="mb-12">
            <div className="h-8 text-cyan-400 text-lg sm:text-xl font-mono">
              {typedText}
              <motion.span
                animate={{ opacity: [1, 0, 1], scale: [1, 1.2, 1] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                |
              </motion.span>
            </div>
          </motion.div>

          <motion.div variants={staggerChild}>
            <motion.button
              className="group relative px-10 sm:px-14 py-4 sm:py-5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-lg sm:text-xl font-semibold shadow-2xl overflow-hidden"
              whileHover={{
                scale: 1.08,
                boxShadow: "0 0 30px rgba(34, 211, 238, 0.6)",
              }}
              whileTap={{ scale: 0.92 }}
              onClick={() => router.push("/login")}
              transition={bounceSpring}
              aria-label="Try Foundrly Now"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-600 opacity-0"
                whileHover={{ opacity: 0.4 }}
                transition={{ duration: 0.3 }}
              />
              Try Foundrly Now
              <ArrowRight className="inline ml-3 w-5 h-5 group-hover:translate-x-3 transition-transform duration-400" />
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* What It Does Section */}
      <section
        ref={whatItDoesRef}
        className="relative py-32 sm:py-40 lg:py-48 px-4 sm:px-6 lg:px-8 z-10"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: smoothEasing }}
            viewport={{ once: true, margin: "-150px" }}
            className="text-center mb-20 sm:mb-24 lg:mb-32"
          >
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
              What It Does
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto px-4">
              From idea to investor pitch, your AI co-founder handles it all.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            {features.map((feature, index) => (
              <Tilt key={index} tiltMaxAngleX={12} tiltMaxAngleY={12} scale={1.03}>
                <motion.div
                  variants={staggerChild}
                  whileHover={{
                    y: -12,
                    boxShadow: "0 15px 40px rgba(34, 211, 238, 0.2)",
                    scale: 1.02,
                  }}
                  transition={bounceSpring}
                  className="group relative p-10 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 hover:border-cyan-400/60 transition-all duration-400"
                  style={{ willChange: "transform, box-shadow" }}
                >
                  <motion.div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} p-4 mb-6 mx-auto`}
                    whileHover={{ scale: 1.15, rotate: 8 }}
                    transition={bounceSpring}
                  >
                    <feature.icon className="w-full h-full text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-center leading-relaxed text-base">
                    {feature.description}
                  </p>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 rounded-3xl"
                    whileHover={{ opacity: 0.3 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </Tilt>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Enhanced How It Works Section */}
      <section
        ref={howItWorksRef}
        className="relative py-32 sm:py-40 lg:py-48 px-4 sm:px-6 lg:px-8 z-10"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: smoothEasing }}
            viewport={{ once: true, margin: "-150px" }}
            className="text-center mb-20 sm:mb-24 lg:mb-32"
          >
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto px-4">
              Transform your idea into a fundable startup in five seamless steps.
            </p>
          </motion.div>

          <motion.div
            className="relative space-y-16"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={staggerChild}
                className="relative flex items-start"
              >
                {/* Step Indicator */}
                <motion.div
                  className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center relative z-10 mr-8 sm:mr-10"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ ...bounceSpring, delay: index * 0.3 }}
                  whileHover={{
                    scale: 1.15,
                    boxShadow: "0 0 25px rgba(34, 211, 238, 0.6)",
                    rotate: 360,
                  }}
                >
                  <step.icon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  {index < steps.length - 1 && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-24 sm:h-28 bg-gradient-to-b from-cyan-500 to-purple-500" />
                  )}
                </motion.div>

                {/* Step Content */}
                <motion.div
                  className="flex-1 p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 hover:border-cyan-400/60 transition-all duration-400"
                  whileHover={{
                    y: -6,
                    boxShadow: "0 15px 40px rgba(0, 0, 0, 0.25)",
                  }}
                  transition={bounceSpring}
                >
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        ref={testimonialsRef}
        className="relative py-32 sm:py-40 lg:py-48 px-4 sm:px-6 lg:px-8 z-10"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: smoothEasing }}
            viewport={{ once: true, margin: "-150px" }}
            className="text-center mb-20 sm:mb-24 lg:mb-32"
          >
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
              Founders Love Foundrly
            </h2>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.95 }}
                transition={{ duration: 0.6, ease: smoothEasing }}
                className="text-center"
              >
                <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8}>
                  <motion.div
                    className="p-10 lg:p-14 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 mb-10"
                    whileHover={{ scale: 1.03, y: -8 }}
                    transition={bounceSpring}
                  >
                    <motion.div
                      className="flex justify-center mb-8"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ ...bounceSpring, delay: 0.2 }}
                    >
                      {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, rotate: -30 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ ...bounceSpring, delay: i * 0.1 }}
                        >
                          <Star className="w-7 h-7 text-yellow-400 fill-current" />
                        </motion.div>
                      ))}
                    </motion.div>
                    <p className="text-xl text-gray-300 mb-8 leading-relaxed italic">
                      "{testimonials[activeTestimonial].content}"
                    </p>
                    <motion.div
                      className="flex items-center justify-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...bounceSpring, delay: 0.3 }}
                    >
                      <motion.div
                        className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center mr-4"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        transition={bounceSpring}
                      >
                        <span className="text-white font-bold text-lg">
                          {testimonials[activeTestimonial].avatar}
                        </span>
                      </motion.div>
                      <div>
                        <div className="font-bold text-lg">{testimonials[activeTestimonial].name}</div>
                        <div className="text-gray-400 text-sm">{testimonials[activeTestimonial].role}</div>
                      </div>
                    </motion.div>
                  </motion.div>
                </Tilt>
              </motion.div>
            </AnimatePresence>

            <motion.div
              className="flex justify-center space-x-4"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-400 ${
                    index === activeTestimonial ? "bg-cyan-400 scale-150" : "bg-gray-600"
                  }`}
                  variants={staggerChild}
                  whileHover={{ scale: 1.5, backgroundColor: "#22D3EE" }}
                  whileTap={{ scale: 0.8 }}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Demo Preview Section */}
      <section
        ref={liveDemoRef}
        className="relative py-32 sm:py-40 lg:py-48 px-4 sm:px-6 lg:px-8 z-10"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: smoothEasing }}
            viewport={{ once: true, margin: "-150px" }}
            className="text-center mb-20 sm:mb-24 lg:mb-32"
          >
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
              See It In Action
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 px-4">
              Experience Foundrly crafting your startup package live.
            </p>
          </motion.div>

          <motion.div
            className="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 overflow-hidden"
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: smoothEasing }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div
              className="flex flex-col sm:flex-row border-b border-white/20"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {[
                { id: "input", label: "Idea Input", icon: FileCode },
                { id: "slides", label: "Deck Slides", icon: FileText },
                { id: "email", label: "AI Cofounder chat", icon: Mail },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveDemoTab(tab.id)}
                  className={`flex-1 p-6 flex items-center justify-center space-x-3 transition-all duration-400 text-base ${
                    activeDemoTab === tab.id
                      ? "bg-gradient-to-r from-cyan-500/40 to-purple-500/40 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                  variants={staggerChild}
                  whileHover={{ y: -4, scale: 1.05, boxShadow: "0 5px 15px rgba(34, 211, 238, 0.3)" }}
                  whileTap={{ y: 0, scale: 0.95 }}
                  aria-label={`Switch to ${tab.label} tab`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </motion.button>
              ))}
            </motion.div>

            <div className="p-14">
              <AnimatePresence mode="wait">
                {activeDemoTab === "input" && (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.5, ease: smoothEasing }}
                    className="space-y-8"
                  >
                    <motion.div
                      className="text-lg mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...bounceSpring, delay: 0.1 }}
                    >
                      Tell us about your startup idea:
                    </motion.div>
                    <motion.div
                      className="p-8 bg-black/40 rounded-2xl border border-cyan-500/50"
                      whileHover={{ borderColor: "rgba(34, 211, 238, 0.8)", scale: 1.02 }}
                      transition={bounceSpring}
                    >
                      <div className="text-cyan-400 font-mono text-sm mb-4">User Input:</div>
                      <div className="text-white text-base">
                        "AI-powered meal planning app that creates shopping lists and tracks nutrition goals"
                      </div>
                    </motion.div>
                    <motion.div
                      className="flex items-center space-x-3 text-cyan-400 text-base"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...bounceSpring, delay: 0.2 }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <Zap className="w-5 h-5" />
                      </motion.div>
                      <span>AI is analyzing your idea...</span>
                    </motion.div>
                  </motion.div>
                )}

                {activeDemoTab === "slides" && (
                  <motion.div
                    key="slides"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.5, ease: smoothEasing }}
                    className="grid grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {[
                      "Problem",
                      "Solution",
                      "Market",
                      "Product",
                      "Traction",
                      "Funding",
                    ].map((slide, index) => (
                      <motion.div
                        key={slide}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ ...bounceSpring, delay: index * 0.15 }}
                        whileHover={{
                          scale: 1.08,
                          boxShadow: "0 10px 20px rgba(34, 211, 238, 0.3)",
                          borderColor: "rgba(34, 211, 238, 0.6)",
                        }}
                        className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700 transition-all duration-400"
                      >
                        <div className="text-sm text-gray-400 mb-3">Slide {index + 1}</div>
                        <div className="font-semibold text-base">
                          {slide}
                          <div className="mt-3 space-y-2">
                            <div className="h-1 bg-gray-600 rounded w-full"></div>
                            <div className="h-1 bg-gray-600 rounded w-3/4"></div>
                            <div className="h-1 bg-gray-600 rounded w-1/2"></div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {activeDemoTab === "email" && (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.5, ease: smoothEasing }}
                    className="space-y-8"
                  >
                    <motion.div
                      className="p-8 bg-black/40 rounded-2xl border border-purple-500/50 h-96 flex flex-col"
                      whileHover={{ borderColor: "rgba(147, 51, 234, 0.8)", scale: 1.02 }}
                      transition={bounceSpring}
                    >
                      <motion.div
                        className="text-purple-400 font-mono text-sm mb-4 flex items-center border-b border-gray-700 pb-4"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...bounceSpring, delay: 0.1 }}
                      >
                        <Bot className="w-5 h-5 mr-2" />
                        AI Co-Founder Chat
                        <span className="ml-auto text-green-400 text-xs">● Online</span>
                      </motion.div>

                      <ScrollArea className="flex-1 mb-4 overflow-y-auto">
                        <motion.div
                          className="space-y-6 pr-4"
                          variants={staggerContainer}
                          initial="hidden"
                          animate="show"
                        >
                          <motion.div variants={staggerChild} className="flex items-start space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="text-gray-300 text-sm bg-gray-800/60 rounded-lg p-3 rounded-tl-none">
                                Hello! I'm your AI co-founder. I can help you validate your meal planning app idea, analyze the market, create pitch decks, and reach out to investors. What would you like to work on first?
                              </div>
                              <div className="text-xs text-gray-500 mt-1">AI Co-Founder • now</div>
                            </div>
                          </motion.div>

                          <motion.div variants={staggerChild} className="flex items-start space-x-3 justify-end">
                            <div className="flex-1 flex justify-end">
                              <div className="text-gray-300 text-sm bg-cyan-600/60 rounded-lg p-3 rounded-tr-none max-w-xs">
                                Can you analyze the competition for my meal planning app?
                              </div>
                            </div>
                          </motion.div>

                          <motion.div variants={staggerChild} className="flex items-start space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="text-gray-300 text-sm bg-gray-800/60 rounded-lg p-3 rounded-tl-none">
                                <div className="flex items-center mb-2">
                                  <BarChart3 className="w-4 h-4 mr-2 text-cyan-400" />
                                  <span className="text-cyan-400">Analyzing competitors...</span>
                                </div>
                                Found 47 direct competitors. Top 3 threats:
                                <br />• MyFitnessPal (45M users, weak meal planning)
                                <br />• Mealime (2M users, no nutrition tracking)
                                <br />• PlateJoy ($12/month, expensive)
                                <br />
                                <br />
                                <strong>Your opportunity:</strong>
                                AI-powered price optimization at $4.99/month beats all on value.
                              </div>
                              <div className="text-xs text-gray-500 mt-1">AI Co-Founder • 2s ago</div>
                            </div>
                          </motion.div>

                          <motion.div
                            className="flex items-center space-x-2 text-gray-400 text-xs"
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{
                              duration: 1.2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          >
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>AI Co-Founder is typing...</span>
                          </motion.div>
                        </motion.div>
                      </ScrollArea>

                      <motion.div
                        className="border-t border-gray-700 pt-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...bounceSpring, delay: 0.2 }}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="text"
                            placeholder="Ask about pitch decks, funding..."
                            className="flex-1 px-4 py-2 rounded-full bg-gray-800/60 border border-gray-600 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-400"
                            aria-label="Chat with AI Co-Founder"
                          />
                          <motion.button
                            className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            whileHover={{ scale: 1.15, rotate: 10 }}
                            whileTap={{ scale: 0.85 }}
                            aria-label="Send message"
                          >
                            <ArrowRight className="w-4 h-4 text-white" />
                          </motion.button>
                        </div>
                      </motion.div>
                    </motion.div>

                    <motion.div
                      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                      variants={staggerContainer}
                      initial="hidden"
                      animate="show"
                    >
                      {[
                        { label: "QUERIES ANSWERED", value: "1,247", sub: "This session", gradient: "from-purple-500/30 to-pink-500/30" },
                        { label: "INSIGHTS PROVIDED", value: "89", sub: "Actionable recommendations", gradient: "from-green-500/30 to-emerald-500/30" },
                        { label: "RESPONSE TIME", value: "0.3s", sub: "Average", gradient: "from-cyan-500/30 to-blue-500/30" },
                      ].map((stat, index) => (
                        <motion.div
                          key={stat.label}
                          variants={staggerChild}
                          whileHover={{
                            y: -6,
                            boxShadow: "0 10px 20px rgba(34, 211, 238, 0.2)",
                          }}
                          className={`p-6 bg-gradient-to-br ${stat.gradient} rounded-xl border border-opacity-40`}
                        >
                          <div className="text-xs mb-2">{stat.label}</div>
                          <div className="text-2xl font-bold mb-1">{stat.value}</div>
                          <div className="text-gray-400 text-xs">{stat.sub}</div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        ref={faqRef}
        className="relative py-32 sm:py-40 lg:py-48 px-4 sm:px-6 lg:px-8 z-10"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: smoothEasing }}
            viewport={{ once: true, margin: "-150px" }}
            className="text-center mb-20 sm:mb-24 lg:mb-32"
          >
            <motion.h2
              className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent"
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              transition={{ ...bounceSpring, delay: 0.2 }}
            >
              Frequently Asked Questions
            </motion.h2>
            <motion.p
              className="text-lg sm:text-xl text-gray-400 px-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: smoothEasing }}
            >
              Everything you need to know about Foundrly and how it works.
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            <Accordion type="single" collapsible className="space-y-6">
              {faqData.map((faq, index) => (
                <motion.div
                  key={index}
                  variants={staggerChild}
                  whileHover={{
                    y: -6,
                    scale: 1.02,
                    boxShadow: "0 10px 30px rgba(34, 211, 238, 0.15)",
                  }}
                  transition={bounceSpring}
                >
                  <AccordionItem
                    value={`item-${index}`}
                    className="border border-white/20 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg hover:border-cyan-400/60 transition-all duration-500 overflow-hidden group"
                  >
                    <AccordionTrigger className="px-6 py-5 hover:no-underline group/trigger">
                      <motion.div
                        className="flex items-center space-x-4 text-left w-full"
                        whileHover={{ x: 6 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        <motion.div
                          className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 flex items-center justify-center group-hover:from-cyan-500/30 group-hover:to-purple-500/30 transition-all duration-500"
                          whileHover={{
                            scale: 1.15,
                            rotate: 15,
                            background:
                              "linear-gradient(135deg, rgba(34, 211, 238, 0.5), rgba(147, 51, 234, 0.5))",
                          }}
                          transition={bounceSpring}
                        >
                          <motion.div
                            whileHover={{ scale: 1.3 }}
                            transition={{ duration: 0.3 }}
                          >
                            <faq.icon className="w-5 h-5 text-cyan-400 group-hover/trigger:text-cyan-300 transition-colors duration-300" />
                          </motion.div>
                        </motion.div>
                        <motion.span
                          className="text-lg font-semibold text-white group-hover/trigger:text-cyan-300 transition-colors duration-300"
                          initial={{ opacity: 0.9 }}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {faq.question}
                        </motion.span>
                      </motion.div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <motion.div
                        className="ml-14 text-gray-300 leading-relaxed text-base"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: smoothEasing }}
                      >
                        {faq.answer}
                      </motion.div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>

          <motion.div
            className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-10"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              { icon: Award, label: "99.7% Uptime", sub: "Reliable Service" },
              { icon: Clock, label: "24/7 Support", sub: "Always Available" },
              { icon: Users, label: "10K+ Users", sub: "Growing Community" },
              { icon: Shield, label: "Enterprise Security", sub: "Your Data Protected" },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                variants={staggerChild}
                whileHover={{
                  scale: 1.08,
                  y: -10,
                  boxShadow: "0 15px 30px rgba(34, 211, 238, 0.2)",
                }}
                className="text-center p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg border border-white/10 hover:border-cyan-400/40 transition-all duration-500 cursor-pointer group"
              >
                <motion.div
                  whileHover={{
                    scale: 1.3,
                    rotate: 15,
                    color: "#22D3EE",
                  }}
                  transition={bounceSpring}
                >
                  <item.icon className="w-8 h-8 mx-auto mb-4 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300" />
                </motion.div>
                <motion.div
                  className="font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.label}
                </motion.div>
                <motion.div
                  className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.sub}
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaRef}
        className="relative py-32 sm:py-40 lg:py-48 px-4 sm:px-6 lg:px-8 z-10"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: smoothEasing }}
            viewport={{ once: true, margin: "-150px" }}
          >
            <motion.div
              className="mb-12"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              <motion.h2
                variants={staggerChild}
                className="text-5xl sm:text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent"
              >
                Co-Found with AI Today
              </motion.h2>
              <motion.p
                variants={staggerChild}
                className="text-lg sm:text-xl text-gray-400 px-4"
              >
                Join the future of entrepreneurship with Foundrly.
              </motion.p>
            </motion.div>

            <motion.div
              className="flex flex-col items-center"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-10 w-full max-w-md sm:max-w-none mx-auto"
                variants={staggerChild}
              >
                <motion.input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full sm:w-80 px-6 py-4 rounded-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-all duration-400"
                  whileFocus={{ scale: 1.05, borderColor: "rgba(34, 211, 238, 0.8)" }}
                  transition={bounceSpring}
                  aria-label="Enter your email to join beta"
                />
                <motion.button
                  onClick={handleEmailSubmit}
                  className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-full relative overflow-hidden"
                  whileHover={{
                    scale: 1.08,
                    boxShadow: "0 0 30px rgba(34, 211, 238, 0.6)",
                  }}
                  whileTap={{ scale: 0.92 }}
                  disabled={isSubmitted}
                  transition={bounceSpring}
                  aria-label={isSubmitted ? "Joined" : "Join Beta"}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-600 opacity-0"
                    whileHover={{ opacity: 0.4 }}
                    transition={{ duration: 0.3 }}
                  />
                  {isSubmitted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ ...bounceSpring }}
                      className="flex items-center justify-center"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Joined!
                    </motion.div>
                  ) : (
                    "Join Beta"
                  )}
                </motion.button>
              </motion.div>

              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...bounceSpring }}
                  className="mt-10"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Rocket className="w-20 h-20 mx-auto text-cyan-400 mb-4" />
                  </motion.div>
                  <p className="text-cyan-400 text-lg">
                    🚀 You're in! Welcome to the future of founding!
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-24 px-4 sm:px-6 lg:px-8 z-10 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="flex flex-col lg:flex-row justify-between items-center"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            <motion.div
              variants={staggerChild}
              className="flex items-center mb-10 lg:mb-0"
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={bounceSpring}
              >
                <Brain className="w-10 h-10 text-cyan-400 mr-4" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Foundrly
              </span>
            </motion.div>

            <motion.div
              className="flex flex-wrap justify-center lg:justify-end gap-10 text-gray-400"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {[
                { icon: FileText, label: "Docs", href: "#" },
                { icon: Twitter, label: "Twitter", href: "https://x.com/rithvickkr027" },
                { icon: Globe, label: "Blog", href: "#" },
                { icon: Shield, label: "Privacy", href: "#" },
              ].map((item) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="hover:text-white transition-colors flex items-center text-base"
                  variants={staggerChild}
                  whileHover={{
                    y: -4,
                    scale: 1.05,
                    color: "#22D3EE",
                  }}
                  aria-label={item.label}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-12 pt-8 border-t border-white/10 text-center text-gray-400 text-base"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: smoothEasing }}
          >
            <p>
              © 2025 Foundrly. Empowering the next generation of founders.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default HOME;