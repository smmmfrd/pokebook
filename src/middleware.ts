import { NextRequest, NextResponse } from "next/server";

export default function middleware(request: NextRequest) {
  if (request.cookies.get("next-auth.session-token") == null) {
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
    // "/profile/:profileId*/friends",
    "/404",
    "/about",
    "/inbox",
    "/items",
  ],
};
