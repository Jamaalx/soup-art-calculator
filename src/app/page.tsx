'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-[#BBDCFF] via-white to-[#9eff55]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
        body {
          font-family: 'Montserrat', sans-serif;
        }
      `}</style>

      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 mb-6 border-4 border-black text-center">
          <span className="inline-block px-6 py-3 bg-[#FFC857] rounded-full text-black text-sm font-bold mb-6 border-2 border-black">
            🚀 APLICAȚIE PROFESIONALĂ
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-black mb-6 tracking-tight">
            MENU CALCULATOR PRO
          </h1>
          <p className="text-xl text-gray-700 font-semibold mb-8 max-w-2xl mx-auto">
            Optimizează prețurile meniului zilnic și maximizează profitul cu calculatoare avansate pentru restaurant și catering
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login"
              className="inline-block bg-[#9eff55] hover:bg-[#8ee945] text-black font-black py-4 px-8 rounded-xl border-4 border-black transition-all hover:scale-105"
            >
              🔐 CONECTEAZĂ-TE
            </Link>
            <Link 
              href="/register"
              className="inline-block bg-[#FFC857] hover:bg-[#ffb627] text-black font-black py-4 px-8 rounded-xl border-4 border-black transition-all hover:scale-105"
            >
              ✨ CREEAZĂ CONT GRATUIT
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {[
            {
              icon: '🚚',
              title: 'MENIU ONLINE',
              description: 'Calculator pentru delivery cu comision 36.3% și ambalaj',
              color: '#BBDCFF'
            },
            {
              icon: '🏪',
              title: 'MENIU OFFLINE',
              description: 'Prețuri optimizate pentru vânzare în restaurant',
              color: '#9eff55'
            },
            {
              icon: '📋',
              title: 'MENIU FIX',
              description: 'Calculează profituri pentru meniuri predefinite',
              color: '#FFC857'
            },
            {
              icon: '🎉',
              title: 'CATERING',
              description: 'Oferte pentru evenimente cu reduceri pe volum',
              color: '#FFB6C1'
            }
          ].map((feature, i) => (
            <div 
              key={i}
              className="rounded-2xl p-8 shadow-xl hover:scale-105 transition-transform border-4 border-black"
              style={{ backgroundColor: feature.color }}
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-black text-black mb-3">{feature.title}</h3>
              <p className="text-black font-bold">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border-4 border-black">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '9', label: 'CATEGORII' },
              { value: '78', label: 'PRODUSE' },
              { value: '1320+', label: 'COMBINAȚII' },
              { value: '100%', label: 'GRATUIT' }
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-4xl font-black text-black mb-2">{stat.value}</p>
                <p className="text-sm font-bold text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-black rounded-3xl shadow-2xl p-12 text-white border-4 border-black text-center">
          <h2 className="text-3xl font-black mb-4">GATA SĂ ÎNCEPI?</h2>
          <p className="text-lg font-semibold text-gray-300 mb-8">
            Creează un cont gratuit și optimizează prețurile în mai puțin de 5 minute
          </p>
          <Link 
            href="/register"
            className="inline-block bg-[#9eff55] hover:bg-[#8ee945] text-black font-black py-4 px-12 rounded-xl border-4 border-white transition-all hover:scale-105"
          >
            ÎNCEPE ACUM →
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-700 font-semibold mb-4">Powered by</p>
          <a 
            href="https://www.zed-zen.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-xl border-4 border-black hover:scale-105 transition-transform"
          >
            <div className="text-4xl font-black text-black">Z</div>
            <div className="flex flex-col items-start">
              <span className="text-xs font-black text-black">ZED</span>
              <span className="text-xs font-black text-black">ZEN</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}