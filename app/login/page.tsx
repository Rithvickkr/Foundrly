// app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardFooter, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState("");
  const [isDarkTheme, setIsDarkTheme] = useState(false); // State for theme
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    let authResponse;
    if (isSignUp) {
      authResponse = await supabase.auth.signUp({ email, password });
      if (!authResponse.error) {
        await supabase.from("profiles").insert([{ id: authResponse.data.user?.id, name, email }]);
      }
    } else if (useMagicLink) {
      authResponse = await supabase.auth.signInWithOtp({ email });
    } else {
      authResponse = await supabase.auth.signInWithPassword({ email, password });
    }

    if (authResponse.error) {
      setMessage(authResponse.error.message);
    } else {
      setMessage(
        isSignUp
          ? "Signup successful! Check your email to verify."
          : useMagicLink
          ? "Magic link sent! Check your email."
          : "Login successful!"
      );
      if (!isSignUp && !useMagicLink) router.push("/");
    }
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    document.body.classList.toggle("dark", !isDarkTheme); // Toggle dark class on body
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <Card className={`w-full max-w-md p-8 ${isDarkTheme ? 'bg-gray-800 text-white' : 'bg-white text-black'} rounded-lg shadow-lg`}>
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">{isSignUp ? "Create an Account" : "Welcome Back"}</h2>
        </CardHeader>
        <CardContent>
          {message && <div className="text-center text-red-500 mb-4">{message}</div>}
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <Input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
                required
              />
            )}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              required
            />
            {!useMagicLink && (
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                required
              />
            )}
            <div className="flex items-center">
              <Checkbox
                checked={useMagicLink}
                onChange={() => setUseMagicLink(!useMagicLink)}
                className="mr-2"
                disabled={isSignUp}
              />
              <span className="text-sm">Use Magic Link</span>
            </div>
            <Button type="submit" className={`w-full mt-4 ${isDarkTheme ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
              {isSignUp ? "Sign Up" : useMagicLink ? "Send Magic Link" : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="text-center">
            {isSignUp ? "Already have an account?" : "New user?"}{" "}
            <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} className="text-blue-600">
              {isSignUp ? "Login here" : "Sign up here"}
            </Button>
          </div>
        </CardFooter>
      </Card>
      <Button onClick={toggleTheme} className="mt-4">
        Toggle Theme
      </Button>
    </div>
  );
}
