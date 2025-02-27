import { supabase } from "@/utils/supabase/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password, useMagicLink } = await req.json();

  let authResponse;
  if (useMagicLink) {
    authResponse = await supabase.auth.signInWithOtp({ email });
  } else {
    authResponse = await supabase.auth.signInWithPassword({ email, password });
  }

  if (authResponse.error) {
    return NextResponse.json({ error: authResponse.error.message }, { status: 400 });
  }

  return NextResponse.json({ message: useMagicLink ? "Magic link sent!" : "Login successful!" });
}
