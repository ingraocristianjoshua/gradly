import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { exams, sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

// Helper: get or create session
async function getOrCreateSession(): Promise<string> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('graduam_session')?.value;

  if (sessionId) {
    const existing = await db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
    });
    if (existing) return sessionId;
  }

  // Create new session
  const [newSession] = await db.insert(sessions).values({}).returning();
  return newSession.id;
}

// GET /api/exams — list all exams for session
export async function GET() {
  try {
    const sessionId = await getOrCreateSession();
    const rows = await db.query.exams.findMany({
      where: eq(exams.sessionId, sessionId),
      orderBy: (exams, { asc }) => [asc(exams.createdAt)],
    });

    const response = NextResponse.json(rows);
    response.cookies.set('graduam_session', sessionId, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      sameSite: 'lax',
    });
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Errore nel recupero degli esami' }, { status: 500 });
  }
}

// POST /api/exams — add a new exam
export async function POST(req: NextRequest) {
  try {
    const sessionId = await getOrCreateSession();
    const body = await req.json();
    const { name, grade, cfu, lode } = body;

    if (!name || grade === undefined || !cfu) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 });
    }

    const [newExam] = await db
      .insert(exams)
      .values({ sessionId, name, grade, cfu, lode: lode ?? false })
      .returning();

    const response = NextResponse.json(newExam, { status: 201 });
    response.cookies.set('graduam_session', sessionId, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
    });
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Errore nel salvataggio' }, { status: 500 });
  }
}

// DELETE /api/exams — delete all exams for session
export async function DELETE() {
  try {
    const sessionId = await getOrCreateSession();
    await db.delete(exams).where(eq(exams.sessionId, sessionId));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Errore nella cancellazione' }, { status: 500 });
  }
}
