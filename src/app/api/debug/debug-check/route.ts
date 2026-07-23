import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'No session' });
  }
  
  let user = null;
  let error = null;
  try {
    user = await prisma.user.findUnique({ 
      where: { id: session.user.id }, 
      include: { role: true } 
    });
  } catch (e) {
    error = String(e);
  }
  
  return NextResponse.json({
    sessionUserId: session.user.id,
    sessionRole: session.user.role,
    userFound: !!user,
    userRole: user?.role?.name,
    userRoleId: user?.roleId,
    userDbId: user?.id,
    error,
  });
}
