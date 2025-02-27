"use client";
import { useState } from "react";
import { supabase } from "@/utils/supabase/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) alert(error.message);
    else alert("Check your email for the login link!");
  };

  return (
    <div>
      <input type="email" placeholder="Enter Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Loading..." : "Send Magic Link"}
      </button>
    </div>
  );
}
