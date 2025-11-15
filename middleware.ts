import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const currentPath = req.nextUrl.pathname;
  const authUrl = '/auth/login';
  if (currentPath.startsWith('/user-dashboard')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.redirect(new URL(authUrl, req.url));
    }
    //you can do role based authentication here
    return NextResponse.next();
  }
  // Protect admin routes
  if (currentPath.startsWith('/admin-dashboard')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.redirect(new URL(authUrl, req.url));
    }
    const isAdmin = (token as any)?.role === 'admin';
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
    return NextResponse.next();
  }
  return NextResponse.next();
}