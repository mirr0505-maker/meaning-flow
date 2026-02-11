// Debug endpoint removed - use app UI and Supabase client instead.
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ ok: false, error: 'debug endpoint removed' }, { status: 410 })
}
