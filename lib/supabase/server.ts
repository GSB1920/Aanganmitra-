import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

type CookieOpts = {
  expires?: Date;
  maxAge?: number;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: boolean | "lax" | "strict" | "none";
};

export function supabaseServer() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(_name: string, _value: string, _options?: CookieOpts) {
          // no-op in Server Components
        },
        remove(_name: string, _options?: CookieOpts) {
          // no-op in Server Components
        },
      },
    }
  );
}

export async function supabaseServerWritable() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options?: CookieOpts) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options?: CookieOpts) {
          cookieStore.set(name, "", options);
        },
      },
    }
  );
}
