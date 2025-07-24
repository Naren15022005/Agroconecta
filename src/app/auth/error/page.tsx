import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-8 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-red-700 mb-2">Error de autenticación</h1>
        <p className="mb-4 text-gray-600">Ocurrió un problema al iniciar sesión. Verifica tus credenciales o intenta nuevamente.</p>
        <Link href="/auth/signin" className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-md shadow transition">
          Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
}
