import { randomBytes } from 'node:crypto';
import { supabase } from '../db';
import type { SessionInfo } from '../db';

type Sid = string;

// For our minimal push notification demo, we'll use a simplified in-memory session store
// In a real app, you'd use Supabase Auth for this
const sessionStore = new Map<Sid, SessionInfo>();

function getSid(): Sid {
  return randomBytes(32).toString('hex');
}

export function createSession(username: string): string {
  let sid: Sid = '';

  do {
    sid = getSid();
  } while (sessionStore.has(sid));

  const data: SessionInfo = {
    username
  };

  sessionStore.set(sid, data);
  return sid;
}

export function getSession(sid: Sid): SessionInfo | undefined {
  if (sessionStore.has(sid)) {
    return sessionStore.get(sid);
  }
  return undefined;
}

export function deleteSession(sid: string): void {
  sessionStore.delete(sid);
}
