import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AuthRedirectPage() {
  const session = await getServerSession(authOptions as any)

  const role = session?.user?.role

  if (role === 'COMPRADOR' || role === 'EMPRESA') {
    redirect('/comprador/mercado')
  }
  if (role === 'CAMPESINO') {
    redirect('/agricultor/mercado')
  }
  if (role === 'ADMINISTRADOR') {
    redirect('/admin')
  }

  // default
  redirect('/')
}
