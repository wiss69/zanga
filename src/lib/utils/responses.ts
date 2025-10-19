import { NextResponse } from 'next/server';

export function success<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data, status }, { status });
}

export function failure(message: string, code: string, status: number, details?: unknown) {
  return NextResponse.json({ ok: false, error: message, code, status, details }, { status });
}
