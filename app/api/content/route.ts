import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { deepMerge } from '@/lib/deep-merge';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const BodySchema = z
  .object({
    locale: z.enum(['en', 'fr', 'es']),
    file: z
      .string()
      .regex(
        /^[a-z][a-z0-9-]*$/,
        'File name must be lowercase alphanumeric with hyphens only'
      ),
    content: z.record(z.string(), z.unknown()).optional(),
    patch: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((d) => Boolean(d.content) !== Boolean(d.patch), {
    message:
      'Provide exactly one of content (full replace) or patch (partial merge)',
  });

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  // Auth check
  const authHeader = request.headers.get('Authorization');
  const expectedToken = `Bearer ${process.env.CONTENT_API_SECRET}`;
  if (!authHeader || authHeader !== expectedToken) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  // Body validation
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.issues },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const { locale, file, content, patch } = parsed.data;

  // File existence check — prevents creating arbitrary new files via the API
  const filePath = path.join(
    process.cwd(),
    'content',
    'data',
    locale,
    `${file}.json`
  );

  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: 'Content file not found' },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  try {
    if (content !== undefined) {
      // Full replace
      await fs.promises.writeFile(filePath, JSON.stringify(content, null, 2), 'utf-8');
    } else if (patch !== undefined) {
      // Partial merge
      const existing = JSON.parse(
        await fs.promises.readFile(filePath, 'utf-8')
      ) as Record<string, unknown>;
      const merged = deepMerge(existing, patch);
      await fs.promises.writeFile(filePath, JSON.stringify(merged, null, 2), 'utf-8');
    }

    return NextResponse.json(
      { ok: true, locale, file },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to write content' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
