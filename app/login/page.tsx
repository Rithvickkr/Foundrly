"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Sparkles, ArrowRight, BarChart, Code, BrainCircuit, Rocket, Eye, EyeOff, CheckCircle, AlertCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Handle theme switching
  useEffect(() => {
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (theme === "dark" || (theme === "system" && systemPrefersDark)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        if (e.matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    // Loading toast
    const loadingToast = toast.loading(
      useMagicLink ? "Sending magic link..." : "Signing you in...",
      {
        description: useMagicLink ? "Please wait while we send the magic link" : "Verifying your credentials",
      }
    );

    let authResponse;
    try {
      if (useMagicLink) {
        authResponse = await supabase.auth.signInWithOtp({ email });
      } else {
        authResponse = await supabase.auth.signInWithPassword({ email, password });
      }

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (authResponse.error) {
        setStatus("error");
        toast.error("Sign in failed", {
          description: authResponse.error.message,
          icon: <AlertCircle className="h-4 w-4" />,
          duration: 5000,
        });
      } else {
        setStatus("success");
        if (useMagicLink) {
          toast.success("Magic link sent!", {
            description: "Check your email and click the link to sign in",
            icon: <Mail className="h-4 w-4" />,
            duration: 6000,
          });
        } else {
          toast.success("Welcome back!", {
            description: "You've been successfully signed in",
            icon: <CheckCircle className="h-4 w-4" />,
            duration: 3000,
          });
          setTimeout(() => router.push("/appdash"), 1500);
        }
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      setStatus("error");
      toast.error("Something went wrong", {
        description: "An unexpected error occurred. Please try again.",
        icon: <AlertCircle className="h-4 w-4" />,
        duration: 5000,
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    // Loading toast
    const loadingToast = toast.loading("Creating your account...", {
      description: "Setting up your Foundrly account",
    });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (error) {
        setStatus("error");
        toast.error("Signup failed", {
          description: error.message,
          icon: <AlertCircle className="h-4 w-4" />,
          duration: 5000,
        });
      } else {
        setStatus("success");
        toast.success("Account created successfully!", {
          description: "Please check your email to confirm your account",
          icon: <CheckCircle className="h-4 w-4" />,
          duration: 6000,
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      setStatus("error");
      toast.error("Something went wrong", {
        description: "An unexpected error occurred. Please try again.",
        icon: <AlertCircle className="h-4 w-4" />,
        duration: 5000,
      });
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row transition-colors duration-500 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full w-10 h-10 border-2 backdrop-blur-sm border-blue-200 dark:border-blue-900 bg-white/70 dark:bg-gray-900/70 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            key={theme}
          >
            {theme === "light" ? (
              <Sun className="h-5 w-5 text-amber-500" />
            ) : theme === "dark" ? (
              <Moon className="h-5 w-5 text-blue-400" />
            ) : (
              <div className="h-5 w-5 relative">
                <Sun className="absolute h-5 w-5 text-amber-500 opacity-50" />
                <Moon className="absolute h-5 w-5 text-blue-400 opacity-50" />
              </div>
            )}
          </motion.div>
        </Button>
      </div>

      {/* Left section - Website Info */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center items-center md:items-start relative"
      >
        <div className="max-w-lg">
          {/* Logo and Brand */}
          <motion.div 
            className="flex items-center gap-3 mb-8"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <motion.div 
              className="flex items-center justify-center h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-xl shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Sparkles className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
             Foundrly
            </h1>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-3xl md:text-4xl font-extrabold mb-6 text-gray-800 dark:text-white"
          >
            Your AI Co-founder for Building the Future
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
          >
            Get instant expertise for your startup journey with AI-powered insights, strategy, and execution support.
          </motion.p>

          {/* Feature List */}
          <div className="space-y-4">
            {[
              { icon: <BrainCircuit className="h-5 w-5" />, text: "AI-powered startup strategy" },
              { icon: <BarChart className="h-5 w-5" />, text: "Market analysis and validation" },
              { icon: <Code className="h-5 w-5" />, text: "Technical roadmap planning" },
              { icon: <Rocket className="h-5 w-5" />, text: "Growth and scaling frameworks" }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                whileHover={{ x: 10 }}
                className="flex items-center gap-3 group cursor-pointer"
              >
                <motion.div 
                  className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/60 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                >
                  {feature.icon}
                </motion.div>
                <span className="text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                  {feature.text}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Background decoration */}
        <div className="hidden md:block absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-blue-100/50 to-transparent dark:from-blue-950/30 dark:to-transparent z-0"></div>
      </motion.div>

      {/* Right section - Auth Form */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full md:w-1/2 p-6 md:p-12 flex items-center justify-center relative"
      >
        <div className="w-full max-w-md">
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 shadow-xl border border-gray-200 dark:border-gray-700/50 hover:shadow-2xl transition-shadow duration-300">
              <CardHeader className="space-y-1 text-center pb-4">
                <CardTitle className="text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
                  {activeTab === "signin" ? "Welcome Back" : "Join Foundrly"}
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  {activeTab === "signin" ? "Sign in to access your account" : "Create a new account to get started"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs 
                  value={activeTab} 
                  onValueChange={(value) => setActiveTab(value as "signin" | "signup")}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-gray-100 dark:bg-gray-800">
                    <TabsTrigger 
                      value="signin"
                      className="data-[state=active]:bg-blue-500 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600 transition-all duration-200"
                    >
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger 
                      value="signup"
                      className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white dark:data-[state=active]:bg-indigo-600 transition-all duration-200"
                    >
                      Sign Up
                    </TabsTrigger>
                  </TabsList>
                
                  <TabsContent value="signin">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <motion.div 
                        className="space-y-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-200"
                          required
                        />
                      </motion.div>

                      <AnimatePresence>
                        {!useMagicLink && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-2"
                          >
                            <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                            <div className="relative">
                              <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-blue-500 dark:focus:ring-blue-600 pr-10 transition-all duration-200"
                                required
                              />
                              <motion.button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.div 
                        className="flex items-center space-x-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Switch
                          id="magic-link"
                          checked={useMagicLink}
                          onCheckedChange={setUseMagicLink}
                        />
                        <Label htmlFor="magic-link" className="cursor-pointer text-gray-700 dark:text-gray-300">
                          Use Magic Link
                        </Label>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                          disabled={status === "loading"}
                        >
                          <motion.div
                            className="flex items-center justify-center"
                            animate={status === "loading" ? { scale: [1, 1.05, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          >
                            {status === "loading" ? (
                              <motion.div
                                className="flex items-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                Loading...
                              </motion.div>
                            ) : useMagicLink ? (
                              "Send Magic Link"
                            ) : (
                              "Sign In"
                            )}
                          </motion.div>
                        </Button>
                      </motion.div>
                    </form>
                  </TabsContent>
                
                  <TabsContent value="signup">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <motion.div 
                        className="space-y-2"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          type: "spring",
                          stiffness: 300,
                          damping: 15
                        }}
                      >
                        <Label htmlFor="signup-name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-indigo-500 dark:focus:ring-indigo-600 transition-all duration-200"
                          required
                        />
                      </motion.div>
                      
                      <motion.div 
                        className="space-y-2"
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          type: "spring",
                          stiffness: 300,
                          damping: 15,
                          delay: 0.1
                        }}
                      >
                        <Label htmlFor="signup-email" className="text-gray-700 dark:text-gray-300">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-indigo-500 dark:focus:ring-indigo-600 transition-all duration-200"
                          required
                        />
                      </motion.div>

                      <motion.div 
                        className="space-y-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          type: "spring",
                          stiffness: 300,
                          damping: 15,
                          delay: 0.2
                        }}
                      >
                        <Label htmlFor="signup-password" className="text-gray-700 dark:text-gray-300">Password</Label>
                        <div className="relative">
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a secure password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-indigo-500 dark:focus:ring-indigo-600 pr-10 transition-all duration-200"
                            required
                          />
                          <motion.button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </motion.button>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Button
                          type="submit"
                          className="w-full group bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 dark:from-indigo-600 dark:to-indigo-700 dark:hover:from-indigo-700 dark:hover:to-indigo-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                          disabled={status === "loading"}
                        >
                          <motion.div
                            className="flex items-center justify-center"
                            animate={status === "loading" ? { scale: [1, 1.05, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          >
                            {status === "loading" ? (
                              <motion.div
                                className="flex items-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                Loading...
                              </motion.div>
                            ) : (
                              <span className="flex items-center">
                                Create Account 
                                <motion.span
                                  initial={{ x: 0 }}
                                  whileHover={{ x: 3 }}
                                  className="ml-2"
                                >
                                  <ArrowRight className="h-4 w-4" />
                                </motion.span>
                              </span>
                            )}
                          </motion.div>
                        </Button>
                      </motion.div>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2 border-t border-gray-200 dark:border-gray-700/50 pt-4">
                {activeTab === "signin" && !useMagicLink && (
                  <motion.a
                    href="/forgot-password"
                    className="text-sm text-center text-blue-600 dark:text-blue-400 hover:underline"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    Forgot your password?
                  </motion.a>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}