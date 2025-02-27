// app/login/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    let authResponse;
    if (useMagicLink) {
      authResponse = await supabase.auth.signInWithOtp({ email });
    } else {
      authResponse = await supabase.auth.signInWithPassword({ email, password });
    }

    if (authResponse.error) {
      setMessage(authResponse.error.message);
    } else {
      setMessage(useMagicLink ? "Magic link sent! Check your email." : "Login successful!");
      if (!useMagicLink) router.push("/");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        {message && <p className="mt-2 text-center text-red-500">{message}</p>}
        <form onSubmit={handleLogin} className="mt-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
          {!useMagicLink && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-2 border rounded-md"
              required
            />
          )}
          <div className="mt-2 flex items-center">
            <input
              type="checkbox"
              checked={useMagicLink}
              onChange={() => setUseMagicLink(!useMagicLink)}
              className="mr-2"
            />
            <label>Use Magic Link</label>
          </div>
          <button
            type="submit"
            className="w-full mt-4 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            {useMagicLink ? "Send Magic Link" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}