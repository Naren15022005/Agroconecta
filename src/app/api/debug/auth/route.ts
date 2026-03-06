import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
  }

  const cookies = req.headers.get('cookie') || ''

  return NextResponse.json({
    ok: true,
    env: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
      GOOGLE_CLIENT_ID_set: Boolean(process.env.GOOGLE_CLIENT_ID),
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || null,
      NEXTAUTH_SECRET_set: Boolean(process.env.NEXTAUTH_SECRET),
    },
    requestCookies: cookies
  })
}
