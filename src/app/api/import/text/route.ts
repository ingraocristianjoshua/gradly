import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export const maxDuration = 30; // Allow more time for AI processing

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing text content' }, { status: 400 });
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'API Key mancante. Configura GOOGLE_GENERATIVE_AI_API_KEY su Vercel.' },
        { status: 500 }
      );
    }

    // Call the Gemini model to parse the chaotic text
    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: z.object({
        exams: z.array(
          z.object({
            name: z.string().describe('Nome della materia / esame (es. Analisi Matematica I)'),
            cfu: z.number().describe('Numero di crediti (CFU) dell\'esame (es. 9, 12, 6)'),
          })
        ),
      }),
      prompt: `Sei un assistente per studenti universitari. Estrai la lista degli esami e i relativi CFU (crediti) dal seguente testo. 
      Ignora le informazioni irrilevanti (come voti, lodi, scadenze, professori, aule). 
      Se un esame non ha crediti espliciti, prova a dedurli se ovvio, altrimenti imposta 0.
      Restituisci solo gli esami che sembrano effettive materie universitarie (non seminari vuoti o "prova finale").
      
      Testo:
      ${text}`,
    });

    return NextResponse.json({ exams: object.exams });
  } catch (error: any) {
    console.error('Error generating object from text:', error);
    return NextResponse.json({ error: 'Errore durante l\'elaborazione AI', details: error.message }, { status: 500 });
  }
}
