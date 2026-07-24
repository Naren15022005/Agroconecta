import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json({ isActive: true });
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ isActive: true });
}
