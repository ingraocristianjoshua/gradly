import { NextResponse } from 'next/server';
import { getAllUniversities } from '@/lib/universities';

export async function GET() {
  return NextResponse.json(getAllUniversities());
}
