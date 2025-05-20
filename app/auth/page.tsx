"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Moon, Sun, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const router = useRouter();

  // Handle theme switching
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setStatus("loading");

    let authResponse;
    try {
      if (useMagicLink) {
        authResponse = await supabase.auth.signInWithOtp({ email });
      } else {
        authResponse = await supabase.auth.signInWithPassword({ email, password });
      }

      if (authResponse.error) {
        setMessage(authResponse.error.message);
        setStatus("error");
      } else {
        setMessage(useMagicLink ? "Magic link sent! Check your email." : "Login successful!");
        setStatus("success");
        if (!useMagicLink) {
          setTimeout(() => router.push("/"), 1500);
        }
      }
    } catch (error) {
      setMessage("An unexpected error occurred");
      setStatus("error");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center transition-colors duration-300 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full w-10 h-10"
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: theme === "light" ? 0 : 360 }}
            transition={{ duration: 0.5 }}
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5 text-gray-700" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-400" />
            )}
          </motion.div>
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4"
      >
        <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 shadow-xl border border-gray-200 dark:border-gray-700">
          <CardHeader className="space-y-1 text-center">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 15 
              }}
              className="mx-auto mb-4"
            >
              <div className="flex items-center justify-center h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              FounderGPT
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="mb-4"
              >
                <Alert variant={status === "error" ? "destructive" : "default"}>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent"
                  required
                />
              </div>

              {!useMagicLink && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent"
                    required
                  />
                </motion.div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="magic-link"
                  checked={useMagicLink}
                  onCheckedChange={setUseMagicLink}
                />
                <Label htmlFor="magic-link" className="cursor-pointer">
                  Use Magic Link
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={status === "loading"}
              >
                <motion.div
                  className="flex items-center justify-center"
                  initial={{ opacity: 1 }}
                  animate={status === "loading" ? { opacity: [0.5, 1, 0.5] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  {status === "loading" ? (
                    "Loading..."
                  ) : useMagicLink ? (
                    "Send Magic Link"
                  ) : (
                    "Sign In"
                  )}
                </motion.div>
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="text-sm text-center text-gray-500 dark:text-gray-400">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Sign up
              </a>
            </div>
            {!useMagicLink && (
              <a
                href="/forgot-password"
                className="text-sm text-center text-gray-500 dark:text-gray-400 hover:underline"
              >
                Forgot your password?
              </a>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}