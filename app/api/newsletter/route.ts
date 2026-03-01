import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const BodySchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Validate
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { email, firstName, lastName } = parsed.data;

  // Check Brevo config
  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID;
  if (!apiKey || !listId) {
    // Graceful degradation — log and return success to not break UX
    console.warn('Newsletter: BREVO_API_KEY or BREVO_LIST_ID not configured');
    return NextResponse.json({ ok: true, mock: true }, { status: 200 });
  }

  // Call Brevo API
  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        attributes: {
          FIRSTNAME: firstName ?? '',
          LASTNAME: lastName ?? '',
        },
        listIds: [Number(listId)],
        updateEnabled: true,
      }),
    });

    // 201 = created, 204 = already exists
    if (response.status === 201 || response.status === 204) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Handle Brevo errors
    const error = await response.json().catch(() => ({}));
    console.error('Brevo API error:', response.status, error);
    return NextResponse.json(
      { error: 'Subscription failed' },
      { status: 500 }
    );
  } catch (err) {
    console.error('Newsletter API error:', err);
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 500 }
    );
  }
}
