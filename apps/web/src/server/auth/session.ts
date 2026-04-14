import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import type { NextRequest, NextResponse } from "next/server";
import type { Address } from "viem";

export const SESSION_COOKIE = "wirefluid_admin_session";
export const NONCE_COOKIE = "wirefluid_siwe_nonce";

const SESSION_TTL_SECONDS = 8 * 60 * 60;
const NONCE_TTL_SECONDS = 10 * 60;

export type RoleSnapshot = {
  admin: boolean;
  operator: boolean;
  scorePublisher: boolean;
  treasury: boolean;
  checkedAt: number;
};

export type AuthSession = {
  address: Address;
  chainId: number;
  roles: RoleSnapshot;
  issuedAt: number;
  expiresAt: number;
};

export function createNonce(): string {
  return randomBytes(16).toString("base64url");
}

export function setNonceCookie(response: NextResponse, nonce: string) {
  setSignedCookie(response, NONCE_COOKIE, nonce, NONCE_TTL_SECONDS);
}

export function readNonceCookie(request: NextRequest): string | null {
  return readSignedCookie<string>(request, NONCE_COOKIE);
}

export function clearNonceCookie(response: NextResponse) {
  response.cookies.delete(NONCE_COOKIE);
}

export function setSessionCookie(response: NextResponse, session: AuthSession) {
  setSignedCookie(response, SESSION_COOKIE, session, SESSION_TTL_SECONDS);
}

export function readSessionCookie(request: NextRequest): AuthSession | null {
  const session = readSignedCookie<AuthSession>(request, SESSION_COOKIE);
  if (!session || session.expiresAt < Date.now()) {
    return null;
  }
  return session;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.delete(SESSION_COOKIE);
}

export function hasAdminAccess(roles: RoleSnapshot): boolean {
  return roles.admin || roles.operator || roles.scorePublisher || roles.treasury;
}

function setSignedCookie<T>(response: NextResponse, name: string, value: T, maxAge: number) {
  response.cookies.set(name, sign(value), {
    httpOnly: true,
    maxAge,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
}

function readSignedCookie<T>(request: NextRequest, name: string): T | null {
  const cookie = request.cookies.get(name)?.value;
  if (!cookie) return null;

  const [payload, signature] = cookie.split(".");
  if (!payload || !signature) return null;

  const expected = hmac(payload);
  if (!safeEqual(expected, signature)) return null;

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

function sign(value: unknown): string {
  const payload = Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${payload}.${hmac(payload)}`;
}

function hmac(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function sessionSecret(): string {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SESSION_SECRET is required in production");
  }
  return secret ?? "wirefluid-local-dev-session-secret-change-me";
}
