import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-jai-jinendra-grocery-mart-2026';

export interface AdminSession {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'manager' | 'staff';
}

// Security: Lockout State Tracker
// 5 failed attempts -> Locked out for 1 hour (3600 seconds)
interface LockoutState {
  failedAttempts: number;
  lockedUntil: number | null;
}

const lockoutMap = new Map<string, LockoutState>();
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 60 * 60 * 1000; // 1 hour

export function getLockoutStatus(identifier: string): {
  isLocked: boolean;
  remainingMinutes: number;
  failedAttempts: number;
} {
  const state = lockoutMap.get(identifier);
  if (!state) {
    return { isLocked: false, remainingMinutes: 0, failedAttempts: 0 };
  }

  const now = Date.now();
  if (state.lockedUntil && state.lockedUntil > now) {
    const remainingMs = state.lockedUntil - now;
    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
    return { isLocked: true, remainingMinutes, failedAttempts: state.failedAttempts };
  }

  // If lock expired, reset
  if (state.lockedUntil && state.lockedUntil <= now) {
    lockoutMap.delete(identifier);
    return { isLocked: false, remainingMinutes: 0, failedAttempts: 0 };
  }

  return { isLocked: false, remainingMinutes: 0, failedAttempts: state.failedAttempts };
}

export function recordFailedAttempt(identifier: string): {
  isNowLocked: boolean;
  remainingMinutes: number;
  attempts: number;
  maxAttempts: number;
} {
  const now = Date.now();
  const state = lockoutMap.get(identifier) || { failedAttempts: 0, lockedUntil: null };

  state.failedAttempts += 1;

  if (state.failedAttempts >= MAX_LOGIN_ATTEMPTS) {
    state.lockedUntil = now + LOCKOUT_DURATION_MS;
    lockoutMap.set(identifier, state);
    return {
      isNowLocked: true,
      remainingMinutes: 60,
      attempts: state.failedAttempts,
      maxAttempts: MAX_LOGIN_ATTEMPTS,
    };
  }

  lockoutMap.set(identifier, state);
  return {
    isNowLocked: false,
    remainingMinutes: 0,
    attempts: state.failedAttempts,
    maxAttempts: MAX_LOGIN_ATTEMPTS,
  };
}

export function resetFailedAttempts(identifier: string) {
  lockoutMap.delete(identifier);
}

export function signAdminToken(payload: AdminSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

export function verifyAdminToken(token: string): AdminSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminSession;
  } catch (err) {
    return null;
  }
}

export function getAdminSession(req: NextRequest): AdminSession | null {
  const authHeader = req.headers.get('Authorization');
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    const cookie = req.cookies.get('jjm_admin_token');
    if (cookie) {
      token = cookie.value;
    }
  }

  if (!token) return null;
  return verifyAdminToken(token);
}

export function requireAdminRole(
  req: NextRequest,
  allowedRoles: Array<'super_admin' | 'manager' | 'staff'> = ['super_admin', 'manager', 'staff']
): { session: AdminSession | null; error?: string; status?: number } {
  const session = getAdminSession(req);
  if (!session) {
    return { session: null, error: 'Unauthorized: Admin login required', status: 401 };
  }

  if (!allowedRoles.includes(session.role)) {
    return {
      session: null,
      error: `Forbidden: Insufficient permissions for role '${session.role}'`,
      status: 403,
    };
  }

  return { session };
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function getAdminUserFromRequest(req: NextRequest): AdminSession | null {
  return getAdminSession(req);
}
