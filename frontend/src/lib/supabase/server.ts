import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

export function createSupabaseServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export type AuthProfile = {
  id: string;
  email: string;
  display_name: string;
  role: "Admin" | "User";
  is_disabled: boolean;
};

export async function getAuthProfile(): Promise<AuthProfile | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const service = createSupabaseServiceClient();
  let { data: profile } = await service
    .from("users")
    .select("id, email, display_name, role, is_disabled")
    .eq("id", user.id)
    .single();

  // Auto-create profile for new OAuth users if the trigger hasn't fired yet
  if (!profile) {
    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Unknown";
    const { data: created } = await service
      .from("users")
      .insert({
        id: user.id,
        email: user.email ?? "",
        display_name: displayName,
        role: "User",
        is_disabled: false,
      })
      .select("id, email, display_name, role, is_disabled")
      .single();
    profile = created;
  }

  if (!profile || profile.is_disabled) return null;
  return profile as AuthProfile;
}
