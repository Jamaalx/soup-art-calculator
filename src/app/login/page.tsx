'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
    } else {
      router.push('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#BBDCFF] via-white to-[#9eff55]">
        <div className="text-2xl font-black">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#BBDCFF] via-white to-[#9eff55]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
        body {
          font-family: 'Montserrat', sans-serif;
        }
      `}</style>

      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="inline-block bg-black text-white px-6 py-3 rounded-2xl border-4 border-black mb-4">
            <h1 className="text-3xl font-black tracking-tight">MENU CALCULATOR</h1>
          </div>
          <p className="text-gray-700 font-semibold">Powered by ZED-ZEN</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-[#BBDCFF] rounded-full text-black text-sm font-bold border-2 border-black">
              🔐 AUTENTIFICARE
            </span>
            <h2 className="text-2xl font-black mt-4 mb-2">Bine ai revenit!</h2>
            <p className="text-gray-600 font-semibold">Conectează-te la contul tău</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border-2 border-red-500 rounded-xl">
              <p className="text-red-700 font-bold text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-4 border-black rounded-xl font-semibold focus:outline-none focus:ring-4 focus:ring-[#9eff55]"
                placeholder="nume@companie.ro"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                PAROLĂ
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-4 border-black rounded-xl font-semibold focus:outline-none focus:ring-4 focus:ring-[#9eff55]"
                placeholder="••••••••"
              />
            </div>

            <div className="text-right">
              <Link 
                href="/forgot-password" 
                className="text-sm font-bold text-gray-600 hover:text-black"
              >
                Ai uitat parola?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#9eff55] hover:bg-[#8ee945] text-black font-black py-4 rounded-xl border-4 border-black transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'SE CONECTEAZĂ...' : 'CONECTEAZĂ-TE'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 font-semibold">
              Nu ai cont?{' '}
              <Link href="/register" className="text-black font-black hover:underline">
                Înregistrează-te aici
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="inline-block text-black font-bold hover:underline"
          >
            ← Înapoi la pagina principală
          </Link>
        </div>
      </div>
    </div>
  );
}