'use client';

import React, { useState } from 'react';

const LandingPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showApply, setShowApply] = useState(false);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Apply state
  const [applyData, setApplyData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    cui: '',
    address: '',
    phone: '',
  });

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      if (response.ok) {
        window.location.href = '/dashboard';
      } else {
        const data = await response.json();
        alert(data.error || 'Eroare la autentificare');
      }
    } catch (error) {
      alert('Eroare de conexiune');
    }
  };

  const handleApply = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(applyData),
      });

      if (response.ok) {
        alert('✅ Aplicația ta a fost trimisă cu succes! Vei fi redirecționat...');
        window.location.href = '/dashboard';
      } else {
        const data = await response.json();
        alert(data.error || 'Eroare la înregistrare');
      }
    } catch (error) {
      alert('Eroare de conexiune');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#BBDCFF] via-white to-[#9eff55]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        
        body {
          font-family: 'Montserrat', sans-serif;
        }
        
        h1, h2, h3, .font-title {
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
      `}</style>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Navigation */}
          <nav className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-16 gap-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl sm:text-5xl font-black text-black" style={{letterSpacing: '-0.05em'}}>Z</div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-black text-black tracking-widest">ZED</span>
                <span className="text-xs sm:text-sm font-black text-black tracking-widest">ZEN</span>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-4">
              <button
                onClick={() => setShowLogin(true)}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-white border-2 sm:border-4 border-black rounded-lg sm:rounded-xl font-black text-sm sm:text-base text-black hover:scale-105 transition-transform"
              >
                LOGIN
              </button>
              <button
                onClick={() => setShowApply(true)}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-[#9eff55] border-2 sm:border-4 border-black rounded-lg sm:rounded-xl font-black text-sm sm:text-base text-black hover:scale-105 transition-transform"
              >
                APLICĂ ACUM
              </button>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12 sm:mb-20">
            <div>
              <div className="inline-block px-3 sm:px-4 py-1 sm:py-2 bg-[#FFC857] rounded-full text-black text-xs sm:text-sm font-bold mb-3 sm:mb-4 border-2 border-black">
                🚀 PENTRU BUSINESS-URI DE CATERING
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-black mb-4 sm:mb-6 leading-tight">
                CALCULEAZĂ<br/>PREȚUL PERFECT<br/>PENTRU MENIUL TĂU
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-800 mb-6 sm:mb-8 font-semibold leading-relaxed">
                Optimizează prețurile, generează oferte profesionale și maximizează profiturile tale cu o singură unealtă puternică.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => setShowApply(true)}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-[#9eff55] text-black border-2 sm:border-4 border-black rounded-lg sm:rounded-xl font-black text-lg sm:text-xl hover:scale-105 transition-transform"
                >
                  ÎNCEPE GRATUIT
                </button>
                <a
                  href="#features"
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-white border-2 sm:border-4 border-black rounded-lg sm:rounded-xl font-black text-lg sm:text-xl hover:scale-105 transition-transform inline-block text-center text-black"
                >
                  AFLĂ MAI MULT
                </a>
              </div>
            </div>

            {/* Video Placeholder */}
            <div className="relative mt-8 lg:mt-0">
              <div className="aspect-video bg-black rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-black overflow-hidden shadow-2xl">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="text-center px-4">
                    <div className="text-5xl sm:text-8xl mb-2 sm:mb-4">▶️</div>
                    <p className="text-white font-bold text-lg sm:text-xl">VIDEO DEMONSTRAȚIE</p>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">Pune-ți video-ul aici</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div id="features" className="mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-8 sm:mb-12 text-black px-4">DE CE ZED ZEN MENU CALCULATOR?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {[
                {
                  icon: '📊',
                  title: 'CALCUL AUTOMAT',
                  desc: 'Analizează toate combinațiile de meniu și găsește prețul optim instant',
                  color: '#FFC857'
                },
                {
                  icon: '📄',
                  title: 'OFERTE PROFESIONALE',
                  desc: 'Generează PDF-uri oficiale conforme cu legislația română în 2 minute',
                  color: '#BBDCFF'
                },
                {
                  icon: '📈',
                  title: 'OPTIMIZARE PROFIT',
                  desc: 'Vizualizează profitul și marja pentru fiecare combinație de meniu',
                  color: '#9eff55'
                }
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-black hover:scale-105 transition-transform"
                  style={{ backgroundColor: feature.color }}
                >
                  <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">{feature.icon}</div>
                  <h3 className="text-xl sm:text-2xl font-black mb-2 sm:mb-3 text-black">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-black font-semibold">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-black p-6 sm:p-12 mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-8 sm:mb-12 text-black">CUM TE AJUTĂ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              {[
                '✅ Economisește 10+ ore pe săptămână din calculat prețuri manual',
                '✅ Import rapid din Excel - încarci toate prețurile odată',
                '✅ Categorii flexibile - adaugă deserturi, băuturi, salate',
                '✅ Generare oferte oficiale în format PDF profesional',
                '✅ Analiză automată a profitabilității fiecărui meniu',
                '✅ Actualizare ușoară a prețurilor și costurilor fixe',
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl flex-shrink-0">{benefit.split(' ')[0]}</span>
                  <p className="font-bold text-black text-base sm:text-lg">{benefit.substring(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-[#9eff55] to-[#FFC857] rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-black p-6 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 text-black">GATA SĂ ÎNCEPI?</h2>
            <p className="text-base sm:text-lg lg:text-xl font-semibold text-black mb-6 sm:mb-8 px-4">
              Alătură-te business-urilor care își optimizează prețurile cu ZED ZEN
            </p>
            <button
              onClick={() => setShowApply(true)}
              className="px-8 sm:px-12 py-4 sm:py-5 bg-[#9eff55] text-black border-2 sm:border-4 border-black rounded-lg sm:rounded-xl font-black text-lg sm:text-xl lg:text-2xl hover:scale-105 transition-transform"
            >
              APLICĂ PENTRU ACCES GRATUIT
            </button>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border-4 border-black p-8 max-w-md w-full relative">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-3xl font-black hover:scale-110 transition-transform"
            >
              ✕
            </button>
            <h2 className="text-3xl font-black mb-6 text-black">LOGIN</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-black mb-2 text-black">EMAIL</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full p-4 border-4 border-black rounded-xl font-bold text-black bg-white"
                  placeholder="email@exemplu.com"
                />
              </div>
              <div>
                <label className="block text-sm font-black mb-2 text-black">PAROLĂ</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full p-4 border-4 border-black rounded-xl font-bold text-black bg-white"
                  placeholder="••••••••"
                />
              </div>
              <button
                onClick={handleLogin}
                className="w-full p-4 bg-[#9eff55] border-4 border-black rounded-xl font-black text-black text-xl hover:scale-105 transition-transform"
              >
                INTRĂ ÎN CONT
              </button>
            </div>
            <p className="text-center mt-4 text-sm font-bold text-black">
              Nu ai cont?{' '}
              <button
                onClick={() => {
                  setShowLogin(false);
                  setShowApply(true);
                }}
                className="text-black underline hover:no-underline"
              >
                Aplică aici
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApply && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl border-4 border-black p-8 max-w-2xl w-full relative my-8">
            <button
              onClick={() => setShowApply(false)}
              className="absolute top-4 right-4 text-3xl font-black hover:scale-110 transition-transform"
            >
              ✕
            </button>
            <h2 className="text-3xl font-black mb-2 text-black">APLICĂ PENTRU ACCES</h2>
            <p className="text-sm font-semibold text-gray-700 mb-6">Completează formularul pentru acces gratuit</p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black mb-1 text-black">NUME COMPLET *</label>
                  <input
                    type="text"
                    value={applyData.name}
                    onChange={(e) => setApplyData({...applyData, name: e.target.value})}
                    className="w-full p-3 border-2 border-black rounded-xl font-bold text-black bg-white"
                    placeholder="Ion Popescu"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black mb-1 text-black">EMAIL *</label>
                  <input
                    type="email"
                    value={applyData.email}
                    onChange={(e) => setApplyData({...applyData, email: e.target.value})}
                    className="w-full p-3 border-2 border-black rounded-xl font-bold text-black bg-white"
                    placeholder="email@exemplu.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black mb-1 text-black">PAROLĂ *</label>
                <input
                  type="password"
                  value={applyData.password}
                  onChange={(e) => setApplyData({...applyData, password: e.target.value})}
                  className="w-full p-3 border-2 border-black rounded-xl font-bold text-black bg-white"
                  placeholder="Minim 6 caractere"
                />
              </div>

              <div>
                <label className="block text-xs font-black mb-1 text-black">NUME COMPANIE *</label>
                <input
                  type="text"
                  value={applyData.company}
                  onChange={(e) => setApplyData({...applyData, company: e.target.value})}
                  className="w-full p-3 border-2 border-black rounded-xl font-bold text-black bg-white"
                  placeholder="Ex: Soup Art SRL"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black mb-1 text-black">CUI (opțional)</label>
                  <input
                    type="text"
                    value={applyData.cui}
                    onChange={(e) => setApplyData({...applyData, cui: e.target.value})}
                    className="w-full p-3 border-2 border-black rounded-xl font-bold text-black bg-white"
                    placeholder="RO12345678"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black mb-1 text-black">TELEFON (opțional)</label>
                  <input
                    type="tel"
                    value={applyData.phone}
                    onChange={(e) => setApplyData({...applyData, phone: e.target.value})}
                    className="w-full p-3 border-2 border-black rounded-xl font-bold text-black bg-white"
                    placeholder="0722 123 456"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black mb-1 text-black">ADRESĂ (opțional)</label>
                <input
                  type="text"
                  value={applyData.address}
                  onChange={(e) => setApplyData({...applyData, address: e.target.value})}
                  className="w-full p-3 border-2 border-black rounded-xl font-bold text-black bg-white"
                  placeholder="Strada, Oraș, Județ"
                />
              </div>

              <button
                onClick={handleApply}
                className="w-full p-4 bg-[#9eff55] border-4 border-black rounded-xl font-black text-black text-xl hover:scale-105 transition-transform"
              >
                TRIMITE APLICAȚIA
              </button>
            </div>

            <p className="text-center mt-4 text-xs font-bold text-gray-600">
              Ai deja cont?{' '}
              <button
                onClick={() => {
                  setShowApply(false);
                  setShowLogin(true);
                }}
                className="text-black underline hover:no-underline"
              >
                Loghează-te aici
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="text-3xl sm:text-4xl font-black text-white" style={{letterSpacing: '-0.05em'}}>Z</div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white tracking-widest">ZED</span>
                <span className="text-xs font-black text-white tracking-widest">ZEN</span>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="font-bold text-white text-sm sm:text-base">© 2025 ZED ZEN. Toate drepturile rezervate.</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">www.zed-zen.com</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;