import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
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

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options?: CookieOpts) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options?: CookieOpts) {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;
  const isPublic = ["/", "/login", "/signup", "/pending-approval", "/favicon.ico"].some((p) => path === p || path.startsWith("/_next"));

  if (!user && !isPublic) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  if (user && (path === "/" || path === "/login" || path === "/signup")) {
    return NextResponse.redirect(new URL("/properties", req.url));
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const isAdmin = profile?.role === "admin";
    const adminOnly = path.startsWith("/pending-users") || path.startsWith("/api/pending-users");
    if (adminOnly && !isAdmin) {
      return NextResponse.redirect(new URL("/properties", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/(.*)"],
};
