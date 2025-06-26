import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or Anon Key");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getAuthToken = async () => {
  const { data, error } = await supabase.auth.getSession();
  
  
  if (error || !data.session) {
    console.error("Error fetching session:", error);
    return null;
  }

  return data.session.access_token;
};
