import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { exams } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

// DELETE /api/exams/[id] — delete a single exam
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('gradly_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Sessione non trovata' }, { status: 401 });
    }

    // Make sure the exam belongs to this session
    const exam = await db.query.exams.findFirst({
      where: eq(exams.id, id),
    });

    if (!exam || exam.sessionId !== sessionId) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    await db.delete(exams).where(eq(exams.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Errore nella cancellazione' }, { status: 500 });
  }
}
