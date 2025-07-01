"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import Tilt from "react-parallax-tilt";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "lucide-react";
import { useRouter } from "next/navigation";

// Accessibility: Detect reduced motion preference
const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const HOME = () => {
  const [mounted, setMounted] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeDemoTab, setActiveDemoTab] = useState("input");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const router = useRouter();

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Parallax and opacity for hero
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.7]);

  const phrases = [
    "Validating Idea...",
    "Generating Pitch...",
    "Emailing Investor...",
    "Creating Brand...",
    "Analyzing Market...",
  ];

  // Custom easing for smooth animations
  const smoothEasing = [0.6, 0.05, 0.01, 0.99] as const;
  const bounceEasing = [0.68, -0.55, 0.265, 1.55] as const;

  // Handle mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Typing animation with randomized delays
  useEffect(() => {
    if (!mounted) return;

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
        }, 2000);
      }
    }, 80 + Math.random() * 20); // Randomized typing speed

    return () => clearInterval(typeInterval);
  }, [currentPhrase, mounted]);

  // Testimonials rotation
  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [mounted]);

  // Mouse trail effect
  useEffect(() => {
    if (!mounted) return;

    const handleMouseMove = (e: { clientX: any; clientY: any; }) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mounted]);

  const features = [
    {
      icon: Search,
      title: "Idea Validation Engine",
      description: "AI analyzes market demand, competition, and feasibility in seconds",
      gradient: "from-blue-600 to-cyan-600",
    },
    {
      icon: BarChart3,
      title: "Competitor & Market Analysis",
      description: "Deep insights into your competitive landscape and market opportunities",
      gradient: "from-purple-600 to-pink-600",
    },
    {
      icon: FileText,
      title: "Pitch Deck Auto-Creation",
      description: "Generate professional decks with charts, branding, and compelling narratives",
      gradient: "from-green-600 to-emerald-600",
    },
    {
      icon: Globe,
      title: "Investor Outreach Toolkit",
      description: "Crafted emails and video pitches that get responses from VCs",
      gradient: "from-orange-600 to-red-600",
    },
    {
      icon: Mic,
      title: "Voiceover with Avatar Video",
      description: "AI-generated presentations with professional voiceovers and avatars",
      gradient: "from-indigo-600 to-purple-600",
    },
    {
      icon: Bot,
      title: "AI-Powered Co-Founder",
      description: "Your AI co-founder that works 24/7 to build your startup",
      gradient: "from-yellow-600 to-amber-600",
    },
  ];

  const steps = [
    {
      icon: FileCode,
      title: "Submit Your Idea",
      description: "Tell us your startup concept",
    },
    {
      icon: Search,
      title: "AI Market Scan",
      description: "We validate and research for you",
    },
    {
      icon: FileText,
      title: "Generate Deck",
      description: "Professional pitch deck created",
    },
    {
      icon: Mic,
      title: "Create Video Pitch",
      description: "AI voiceover and avatar video",
    },
    {
      icon: Rocket,
      title: "Launch & Scale",
      description: "Ready to pitch investors!",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Founder, TechFlow",
      content: "Foundrly turned my napkin sketch into a $2M funding round. The AI validation caught market gaps I never saw.",
      rating: 5,
      avatar: "SC",
    },
    {
      name: "Marcus Rodriguez",
      role: "Serial Entrepreneur",
      content: "This is like having a Stanford MBA co-founder who works 24/7. The pitch decks are investor-ready from day one.",
      rating: 5,
      avatar: "MR",
    },
    {
      name: "Emily Watson",
      role: "Y Combinator Mentor",
      content: "I've seen thousands of pitches. Foundrly-generated decks are consistently in the top 10% for clarity and impact.",
      rating: 5,
      avatar: "EW",
    },
  ];

  const handleEmailSubmit = useCallback(() => {
    if (email && email.includes("@")) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail("");
      }, 3000);
    }
  }, [email]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
      {/* Dynamic Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-black"
          animate={{
            background: [
              "linear-gradient(135deg, rgba(88, 28, 135, 0.2), rgba(29, 78, 216, 0.2), #000000)",
              "linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(59, 130, 246, 0.2), #000000)",
              "linear-gradient(135deg, rgba(88, 28, 135, 0.2), rgba(29, 78, 216, 0.2), #000000)",
            ],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {/* Particle System */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                willChange: "transform, opacity",
              }}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [0, 1.5, 0],
                x: Math.random() * 20 - 10,
                y: Math.random() * 20 - 10,
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        {/* Mouse Trail */}
        <motion.div
          className="absolute w-4 h-4 bg-cyan-400/20 rounded-full pointer-events-none"
          style={{
            x: mousePosition.x - 8,
            y: mousePosition.y - 8,
            willChange: "transform",
          }}
          animate={{ scale: [1, 1.5, 0], opacity: [0.5, 0.3, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeOut" }}
        />
      </div>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: smoothEasing }}
      >
        <motion.div
          style={{ y, opacity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            className="w-80 h-80 sm:w-96 sm:h-96 lg:w-120 lg:h-120 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-3xl"
            animate={{
              scale: [1, 1.15, 1],
              rotate: [0, 10, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        <div className="relative z-10 text-center max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              ease: bounceEasing,
              delay: 0.2,
            }}
            className="mb-8"
          >
            <Brain className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 text-cyan-400 animate-pulse" />
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-300 to-purple-300 bg-clip-text text-transparent leading-tight">
              Build Your Startup.
            </h1>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent leading-tight">
              Foundrly Powers It.
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.4,
              ease: smoothEasing,
            }}
            className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto px-4"
          >
            Your AI co-founder validates ideas, crafts pitches, and scales your vision.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: smoothEasing }}
            className="mb-12"
          >
            <div className="h-8 text-cyan-400 text-lg sm:text-xl font-mono">
              {typedText}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                |
              </motion.span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.8,
              ease: bounceEasing,
            }}
          >
            <motion.button
              className="group relative px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-lg sm:text-xl font-semibold shadow-2xl overflow-hidden"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 20px rgba(34, 211, 238, 0.5)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/login")}
              aria-label="Try Foundrly Now"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-600 opacity-0"
                whileHover={{ opacity: 0.3 }}
                transition={{ duration: 0.3 }}
              />
              Try Foundrly Now
              <ArrowRight className="inline ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* What It Does Section */}
      <section className="relative py-24 sm:py-32 lg:py-40 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: smoothEasing,
            }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16 sm:mb-20 lg:mb-24"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
              What It Does
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto px-4">
              From idea to investor pitch, your AI co-founder handles it all.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Tilt key={index} tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.02}>
                <motion.div
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: smoothEasing,
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                  whileHover={{
                    y: -8,
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                  }}
                  className="group relative p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 hover:border-cyan-400/50 transition-all duration-300"
                  style={{ willChange: "transform, box-shadow" }}
                >
                  <motion.div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} p-4 mb-6 mx-auto`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <feature.icon className="w-full h-full text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-4 text-center">{feature.title}</h3>
                  <p className="text-gray-400 text-center leading-relaxed text-base">
                    {feature.description}
                  </p>
                </motion.div>
              </Tilt>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-24 sm:py-32 lg:py-40 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: smoothEasing,
            }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16 sm:mb-20 lg:mb-24"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
              How It Works
            </h2>
          </motion.div>

          <div className="relative">
            {/* Dynamic Timeline Line */}
            <motion.div
              className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-cyan-500 to-purple-500"
              initial={{ height: 0 }}
              whileInView={{ height: "100%" }}
              transition={{ duration: 1.5, ease: smoothEasing }}
              viewport={{ once: true }}
            />

            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.15,
                  ease: smoothEasing,
                }}
                viewport={{ once: true, margin: "-50px" }}
                className={`relative flex flex-col lg:flex-row items-center mb-16 lg:mb-24 ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                <motion.div
                  className={`w-full lg:w-1/2 ${
                    index % 2 === 0 ? "lg:pr-16 lg:text-right" : "lg:pl-16"
                  } mb-8 lg:mb-0`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 hover:border-cyan-400/50 transition-all duration-300">
                    <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                    <p className="text-gray-400 text-base">{step.description}</p>
                  </div>
                </motion.div>

                <motion.div
                  className="relative lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center mb-8 lg:mb-0"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.15 + 0.2,
                    ease: bounceEasing,
                  }}
                  viewport={{ once: true }}
                >
                  <step.icon className="w-8 h-8 text-white" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-24 sm:py-32 lg:py-40 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: smoothEasing,
            }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16 sm:mb-20 lg:mb-24"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
              Founders Love Foundrly
            </h2>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{
                  duration: 0.5,
                  ease: smoothEasing,
                }}
                className="text-center"
              >
                <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5}>
                  <div className="p-8 lg:p-12 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 mb-8">
                    <motion.div
                      className="flex justify-center mb-6"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.1,
                        ease: bounceEasing,
                      }}
                    >
                      {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-6 h-6 text-yellow-400 fill-current"
                        />
                      ))}
                    </motion.div>
                    <p className="text-xl text-gray-300 mb-8 leading-relaxed italic">
                      "{testimonials[activeTestimonial].content}"
                    </p>
                    <div className="flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center mr-4">
                        <span className="text-white font-bold text-base">
                          {testimonials[activeTestimonial].avatar}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-base">{testimonials[activeTestimonial].name}</div>
                        <div className="text-gray-400 text-sm">{testimonials[activeTestimonial].role}</div>
                      </div>
                    </div>
                  </div>
                </Tilt>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center space-x-3">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeTestimonial ? "bg-cyan-400 scale-125" : "bg-gray-600"
                  }`}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo Preview Section */}
      <section className="relative py-24 sm:py-32 lg:py-40 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: smoothEasing,
            }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16 sm:mb-20 lg:mb-24"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
              See It In Action
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 px-4">
              Experience Foundrly crafting your startup package live.
            </p>
          </motion.div>

          <motion.div
            className="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 overflow-hidden"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: smoothEasing,
            }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <div className="flex flex-col sm:flex-row border-b border-white/20">
              {[
                { id: "input", label: "Idea Input", icon: FileCode },
                { id: "slides", label: "Deck Slides", icon: FileText },
                { id: "email", label: "Investor Email", icon: Mail },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveDemoTab(tab.id)}
                  className={`flex-1 p-6 flex items-center justify-center space-x-3 transition-all duration-300 text-base ${
                    activeDemoTab === tab.id
                      ? "bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ y: 0, scale: 0.98 }}
                  aria-label={`Switch to ${tab.label} tab`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </motion.button>
              ))}
            </div>

            <div className="p-12">
              <AnimatePresence mode="wait">
                {activeDemoTab === "input" && (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{
                      duration: 0.4,
                      ease: smoothEasing,
                    }}
                    className="space-y-6"
                  >
                    <div className="text-lg mb-6">Tell us about your startup idea:</div>
                    <div className="p-6 bg-black/40 rounded-2xl border border-cyan-500/40">
                      <div className="text-cyan-400 font-mono text-sm mb-3">User Input:</div>
                      <div className="text-white text-base">
                        "AI-powered meal planning app that creates shopping lists and tracks nutrition goals"
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 text-cyan-400 text-base">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <Zap className="w-4 h-4" />
                      </motion.div>
                      <span>AI is analyzing your idea...</span>
                    </div>
                  </motion.div>
                )}

                {activeDemoTab === "slides" && (
                  <motion.div
                    key="slides"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{
                      duration: 0.4,
                      ease: smoothEasing,
                    }}
                    className="grid grid-cols-2 lg:grid-cols-3 gap-4"
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
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.1,
                          ease: bounceEasing,
                        }}
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
                        }}
                        className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border border-gray-700 hover:border-cyan-500 transition-all duration-300"
                      >
                        <div className="text-sm text-gray-400 mb-2">Slide {index + 1}</div>
                        <div className="font-semibold text-base">
                          {slide}
                          <div className="mt-2 space-y-1">
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
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{
                      duration: 0.4,
                      ease: smoothEasing,
                    }}
                    className="space-y-6"
                  >
                    <div className="p-6 bg-black/40 rounded-2xl border border-purple-500/40 h-96 flex flex-col">
                      <div className="text-purple-400 font-mono text-sm mb-4 flex items-center border-b border-gray-700 pb-4">
                        <Bot className="w-4 h-4 mr-2" />
                        AI Co-Founder Chat
                        <span className="ml-auto text-green-400 text-xs">● Online</span>
                      </div>

                      <ScrollArea className="flex-1 mb-4 overflow-y-auto">
                        <div className="space-y-4 pr-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="text-gray-300 text-sm bg-gray-800/60 rounded-lg p-3 rounded-tl-none">
                                Hello! I'm your AI co-founder. I can help you validate your meal planning app idea, analyze the market, create pitch decks, and reach out to investors. What would you like to work on first?
                              </div>
                              <div className="text-xs text-gray-500 mt-1">AI Co-Founder • now</div>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3 justify-end">
                            <div className="flex-1 flex justify-end">
                              <div className="text-gray-300 text-sm bg-cyan-600/60 rounded-lg p-3 rounded-tr-none max-w-xs">
                                Can you analyze the competition for my meal planning app?
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
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
                          </div>

                          <motion.div
                            className="flex items-center space-x-2 text-gray-400 text-xs"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          >
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>AI Co-Founder is typing...</span>
                          </motion.div>
                        </div>
                      </ScrollArea>

                      <div className="border-t border-gray-700 pt-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="text"
                            placeholder="Ask about pitch decks, funding..."
                            className="flex-1 px-4 py-2 rounded-full bg-gray-800/60 border border-gray-600 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-400"
                            aria-label="Chat with AI Co-Founder"
                          />
                          <motion.button
                            className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label="Send message"
                          >
                            <ArrowRight className="w-4 h-4 text-white" />
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {[
                        { label: "QUERIES ANSWERED", value: "1,247", sub: "This session", gradient: "from-purple-500/30 to-pink-500/30" },
                        { label: "INSIGHTS PROVIDED", value: "89", sub: "Actionable recommendations", gradient: "from-green-500/30 to-emerald-500/30" },
                        { label: "RESPONSE TIME", value: "0.3s", sub: "Average", gradient: "from-cyan-500/30 to-blue-500/30" },
                      ].map((stat, index) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: index * 0.1,
                            ease: smoothEasing,
                          }}
                          className={`p-4 bg-gradient-to-br ${stat.gradient} rounded-xl border border-opacity-40`}
                        >
                          <div className="text-xs mb-2">{stat.label}</div>
                          <div className="text-2xl font-bold mb-1">{stat.value}</div>
                          <div className="text-gray-400 text-xs">{stat.sub}</div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 sm:py-32 lg:py-40 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: smoothEasing,
            }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
              Co-Found with AI Today
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 mb-12 px-4">
              Join the future of entrepreneurship with Foundrly.
            </p>

            <div className="flex flex-col items-center">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8 w-full max-w-md sm:max-w-none">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full sm:w-80 px-6 py-4 rounded-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-all duration-300"
                  aria-label="Enter your email to join beta"
                />
                <motion.button
                  onClick={handleEmailSubmit}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-full relative overflow-hidden"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 20px rgba(34, 211, 238, 0.5)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isSubmitted}
                  aria-label={isSubmitted ? "Joined" : "Join Beta"}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-600 opacity-0"
                    whileHover={{ opacity: 0.3 }}
                    transition={{ duration: 0.3 }}
                  />
                  {isSubmitted ? (
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{
                        duration: 0.4,
                        ease: bounceEasing,
                      }}
                      className="flex items-center justify-center"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Joined!
                    </motion.div>
                  ) : (
                    "Join Beta"
                  )}
                </motion.button>
              </div>
            </div>

            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  ease: bounceEasing,
                }}
                className="mt-8"
              >
                <Rocket className="w-16 h-16 mx-auto text-cyan-400 mb-4 animate-bounce" />
                <p className="text-cyan-400 text-lg">
                  🚀 You're in! Welcome to the future of founding!
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-20 px-4 sm:px-6 lg:px-8 z-10 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <motion.div
              className="flex items-center mb-8 lg:mb-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: smoothEasing }}
            >
              <Brain className="w-10 h-10 text-cyan-400 mr-4" />
              <span className="text-2xl font-bold">Foundrly</span>
            </motion.div>

            <div className="flex flex-wrap justify-center lg:justify-end gap-8 text-gray-400">
              {[
                { icon: FileText, label: "Docs" },
                { icon: Twitter, label: "Twitter" },
                { icon: Globe, label: "Blog" },
                { icon: Shield, label: "Privacy" },
              ].map((item, index) => (
                <motion.a
                  key={item.label}
                  href="#"
                  className="hover:text-white transition-colors flex items-center text-base"
                  whileHover={{
                    y: -2,
                    color: "#22D3EE",
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.1,
                    ease: smoothEasing,
                  }}
                  aria-label={item.label}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </motion.a>
              ))}
            </div>
          </div>

          <motion.div
            className="mt-12 pt-8 border-t border-white/10 text-center text-gray-400 text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p>
              © 2025 Foundrly. Empowering the next generation of founders.
            </p>
          </motion.div>
        </div>
      </footer>

      {/* Reduced Motion Styles */}
      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse,
          .animate-bounce,
          [class*="motion-"] {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HOME;