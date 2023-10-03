import { type NextRequest, NextResponse } from "next/server";

export default function middleware(request: NextRequest) {
  if (
    request.cookies.get("guest-pokemon") == null &&
    request.cookies.get(
      process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token"
    ) == null
  ) {
    return NextResponse.redirect(
      new URL(`/login?returnURL=${request.nextUrl.pathname}`, request.url)
    );
  }
}

export const config = {
  matcher: [
    "/",
    "/post/:postId*",
    "/profile/:profileId*",
    "/404",
    "/about",
    "/inbox",
    "/items",
  ],
};
