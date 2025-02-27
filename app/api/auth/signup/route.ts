import { supabase } from "@/utils/supabase/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password, full_name, useMagicLink } = await req.json();

  let authResponse;
  if (useMagicLink) {
    authResponse = await supabase.auth.signInWithOtp({ email });
  } else {
    authResponse = await supabase.auth.signUp({ email, password });
  }

  if (authResponse.error) {
    return NextResponse.json({ error: authResponse.error.message }, { status: 400 });
  }

  const user = authResponse.data.user;
  if (!user) {
    return NextResponse.json({ error: "User data is unavailable." }, { status: 400 });
  }

  if (!useMagicLink) {
    await supabase.from("users").insert([{ id: user.id, email, full_name }]);
  }

  return NextResponse.json({ message: useMagicLink ? "Magic link sent!" : "User registered successfully!" });
}
