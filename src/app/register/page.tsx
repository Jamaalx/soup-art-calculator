'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Parolele nu se potrivesc');
      return;
    }

    if (formData.password.length < 8) {
      setError('Parola trebuie să aibă minim 8 caractere');
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await signUp(
      formData.email,
      formData.password,
      formData.companyName
    );

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
    } else {
      setSuccess(true);
      // Redirect after 3 seconds
      setTimeout(() => router.push('/login'), 3000);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#BBDCFF] via-white to-[#9eff55]">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border-4 border-black text-center">
          <div className="text-6xl mb-4 font-bold text-green-600">Success</div>
          <h2 className="text-2xl font-black mb-4">CONT CREAT CU SUCCES!</h2>
          <p className="text-gray-700 font-semibold mb-6">
            Am trimis un email de verificare la <strong>{formData.email}</strong>
          </p>
          <p className="text-sm text-gray-600 font-semibold">
            Verifică inbox-ul (sau spam) și dă click pe link pentru a activa contul.
          </p>
          <div className="mt-6">
            <Link 
              href="/login"
              className="inline-block bg-[#9eff55] hover:bg-[#8ee945] text-black font-black py-3 px-6 rounded-xl border-4 border-black"
            >
              MERGI LA LOGIN
            </Link>
          </div>
        </div>
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

        {/* Register Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-[#FFC857] rounded-full text-black text-sm font-bold border-2 border-black">
              CREATE ACCOUNT
            </span>
            <h2 className="text-2xl font-black mt-4 mb-2">Creează cont gratuit</h2>
            <p className="text-gray-600 font-semibold">Începe să optimizezi prețurile meniului</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border-2 border-red-500 rounded-xl">
              <p className="text-red-700 font-bold text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                EMAIL *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 border-4 border-black rounded-xl font-semibold focus:outline-none focus:ring-4 focus:ring-[#9eff55]"
                placeholder="nume@companie.ro"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                NUME COMPANIE (opțional)
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-4 py-3 border-4 border-black rounded-xl font-semibold focus:outline-none focus:ring-4 focus:ring-[#9eff55]"
                placeholder="Restaurant ABC"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                PAROLĂ * (min. 8 caractere)
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                className="w-full px-4 py-3 border-4 border-black rounded-xl font-semibold focus:outline-none focus:ring-4 focus:ring-[#9eff55]"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                CONFIRMĂ PAROLA *
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="w-full px-4 py-3 border-4 border-black rounded-xl font-semibold focus:outline-none focus:ring-4 focus:ring-[#9eff55]"
                placeholder="••••••••"
              />
            </div>

            <div className="bg-[#EBEBEB] border-2 border-black rounded-xl p-4">
              <p className="text-xs font-bold text-gray-700">
                ✓ Vei primi un email de verificare<br/>
                ✓ Accesul este gratuit pentru clienții ZED-ZEN<br/>
                ✓ Date securizate și confidențiale
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#FFC857] hover:bg-[#ffb627] text-black font-black py-4 rounded-xl border-4 border-black transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'SE CREEAZĂ CONTUL...' : 'CREEAZĂ CONT'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 font-semibold">
              Ai deja cont?{' '}
              <Link href="/login" className="text-black font-black hover:underline">
                Conectează-te aici
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