import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );

  const token = req.cookies.get("sb-access-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  // If there's no user or an error occurred, redirect to login
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // User is authenticated — let them in
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"], // Only protect /dashboard/*
};
