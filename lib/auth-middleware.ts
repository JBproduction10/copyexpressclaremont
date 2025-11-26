/* eslint-disable @typescript-eslint/no-unused-vars */
// lib/auth-middleware.ts
import { getServerSession } from "next-auth";
import { authOptions } from "./auth.config";
import { NextRequest, NextResponse } from "next/server";

export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  return session;
}

export async function requireAdmin(request: NextRequest) {
  const session = await requireAuth(request);

  if (session instanceof NextResponse) {
    return session; // Already an error response
  }

  if (session.user.role !== "admin" && session.user.role !== "editor") {
    return NextResponse.json(
      { message: "Forbidden: Insufficient permissions" },
      { status: 403 }
    );
  }

  return session;
}