import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/", "/profile", "/test/*", "/topics/*"];
const loginRoute = "/login";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req: req as any,
    secret: "m8bVR7LDvLw+dXJ5wzD9zPDnFLIopKVNvUXg/pGBcO0=",
  });
  console.log("middleware");
  const { pathname } = req.nextUrl;

  if (token && pathname === loginRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!token && protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL(loginRoute, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)"],
  // matcher: [],
};
