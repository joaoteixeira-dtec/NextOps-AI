import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    "[supabase] SUPABASE_URL or SUPABASE_SERVICE_KEY not set. Database operations will fail."
  );
}

export const supabase = createClient(supabaseUrl ?? "", supabaseServiceKey ?? "");
