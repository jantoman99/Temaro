import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/account",
  "/calendar",
  "/campaigns",
  "/booking-page",
  "/clients",
  "/classes",
  "/commissions",
  "/dashboard",
  "/import",
  "/integrations",
  "/inventory",
  "/locations",
  "/memberships",
  "/packages",
  "/payments",
  "/pos",
  "/referrals",
  "/recovery",
  "/reports",
  "/resources",
  "/services",
  "/start",
  "/settings",
  "/staff",
  "/vouchers",
];

function hasSupabaseSessionCookie(request: NextRequest) {
  return request.cookies.getAll().some((cookie) => {
    const isSupabaseAuthCookie =
      cookie.name === "supabase-auth-token" ||
      (cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"));

    return isSupabaseAuthCookie && cookie.value.trim().length > 0;
  });
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) =>
      request.nextUrl.pathname === route ||
      request.nextUrl.pathname.startsWith(`${route}/`),
  );

  if (!isProtectedRoute) {
    return response;
  }

  if (!hasSupabaseSessionCookie(request)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("redirectedFrom", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/account",
    "/account/:path*",
    "/calendar/:path*",
    "/campaigns/:path*",
    "/booking-page/:path*",
    "/clients/:path*",
    "/classes/:path*",
    "/commissions/:path*",
    "/dashboard/:path*",
    "/import/:path*",
    "/integrations/:path*",
    "/inventory/:path*",
    "/locations/:path*",
    "/memberships/:path*",
    "/packages/:path*",
    "/payments/:path*",
    "/pos/:path*",
    "/referrals/:path*",
    "/recovery/:path*",
    "/reports/:path*",
    "/resources/:path*",
    "/services/:path*",
    "/start/:path*",
    "/settings/:path*",
    "/staff/:path*",
    "/vouchers/:path*",
  ],
};
