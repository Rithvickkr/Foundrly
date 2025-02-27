import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use admin key (server-side)
  );

  const token = req.cookies.get("sb-access-token")?.value; // Get token from cookies
  let user = null;

  if (token) {
    const { data, error } = await supabase.auth.getUser(token);
    user = data?.user || null;
  }

  // Redirect to login if trying to access dashboard without being logged in
  if (!user && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"], // Protects all dashboard routes
};
