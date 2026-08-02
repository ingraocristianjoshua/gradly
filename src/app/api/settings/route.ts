import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { settings, sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

async function getOrCreateSession(): Promise<string> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('graduam_session')?.value;
  if (sessionId) {
    const existing = await db.query.sessions.findFirst({ where: eq(sessions.id, sessionId) });
    if (existing) return sessionId;
  }
  const [newSession] = await db.insert(sessions).values({}).returning();
  return newSession.id;
}

export async function GET() {
  try {
    const sessionId = await getOrCreateSession();
    const row = await db.query.settings.findFirst({ where: eq(settings.sessionId, sessionId) });
    const response = NextResponse.json(row ?? { thesisPoints: 0, committeePoints: 0 });
    response.cookies.set('graduam_session', sessionId, { httpOnly: true, maxAge: 60 * 60 * 24 * 365, path: '/', sameSite: 'lax' });
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ thesisPoints: 0, committeePoints: 0 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sessionId = await getOrCreateSession();
    const { thesisPoints, committeePoints } = await req.json();
    await db.insert(settings)
      .values({ sessionId, thesisPoints, committeePoints })
      .onConflictDoUpdate({ target: settings.sessionId, set: { thesisPoints, committeePoints } });
    const response = NextResponse.json({ ok: true });
    response.cookies.set('graduam_session', sessionId, { httpOnly: true, maxAge: 60 * 60 * 24 * 365, path: '/', sameSite: 'lax' });
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Errore nel salvataggio settings' }, { status: 500 });
  }
}
