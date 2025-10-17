'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
  nume: string;
  pret: number;
}

interface FixedMenu {
  id: number;
  ciorba: string;
  fel: string;
  garnitura: string;
}

export default function OffersPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [offerType, setOfferType] = useState<'daily' | 'weekly'>('daily');
  const [menuType, setMenuType] = useState<'variations' | 'fixed'>('variations');
  
  // Client Info
  const [clientCompany, setClientCompany] = useState('');
  const [clientCUI, setClientCUI] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientContact, setClientContact] = useState('');
  
  // Selected Products (for variations)
  const [selectedCiorbe, setSelectedCiorbe] = useState<string[]>([]);
  const [selectedFeluri, setSelectedFeluri] = useState<string[]>([]);
  const [selectedGarnituri, setSelectedGarnituri] = useState<string[]>([]);
  
  // Fixed Menus
  const [fixedMenus, setFixedMenus] = useState<FixedMenu[]>([
    { id: 1, ciorba: '', fel: '', garnitura: '' }
  ]);
  
  // Pricing
  const [pretVanzare, setPretVanzare] = useState(35);
  const [validityDays, setValidityDays] = useState(30);

  const ciorbe: Product[] = [
    { nume: "Gulas de vita", pret: 14.42 },
    { nume: "Ciorba de burta", pret: 13.06 },
    { nume: "Ciorba radauteana", pret: 11.41 },
    { nume: "Ciorba de vacuta", pret: 14.36 },
    { nume: "Bors de pui", pret: 7.84 },
    { nume: "Ciorba de fasole cu afumatura", pret: 9.83 },
    { nume: "Ciorba de perisoare", pret: 8.52 },
    { nume: "Ciorba de legume", pret: 6.06 },
    { nume: "Supa crema de ciuperci", pret: 9.65 },
    { nume: "Supa crema de legume", pret: 8.00 },
    { nume: "Supa crema de linte", pret: 7.36 }
  ];

  const felPrincipal: Product[] = [
    { nume: "Sarmale cu afumatura", pret: 9.03 },
    { nume: "Tochitura moldoveneasca", pret: 9.00 },
    { nume: "Cod Pane", pret: 6.15 },
    { nume: "Snitel de pui", pret: 5.08 },
    { nume: "Cascaval pane", pret: 6.82 },
    { nume: "Crispy Strips", pret: 9.51 },
    { nume: "Mazare cu pui", pret: 5.23 },
    { nume: "Tocanita de vita", pret: 15.12 },
    { nume: "Carnati la cuptor", pret: 8.44 },
    { nume: "Parjoale de curcan in sos", pret: 7.09 },
    { nume: "Pulpe de pui coapte in sos", pret: 7.09 },
    { nume: "Ceafa de porc", pret: 11.01 }
  ];

  const garnituri: Product[] = [
    { nume: "Cartofi gratinati la cuptor", pret: 6.92 },
    { nume: "Varza murata calita", pret: 5.17 },
    { nume: "Mamaliga", pret: 4.25 },
    { nume: "Piure de cartofi", pret: 6.91 },
    { nume: "Cartofi copti cu unt si marar", pret: 6.92 },
    { nume: "Muraturi asortate", pret: 4.27 },
    { nume: "Salata de varza si morcov", pret: 4.27 },
    { nume: "Salata de ardei copti", pret: 6.47 },
    { nume: "Salata de vinete", pret: 6.47 },
    { nume: "Salata de boeuf", pret: 6.47 }
  ];

  const COSTURI_FIXE = 3.0;

  const toggleSelection = (item: string, list: string[], setList: (items: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const addFixedMenu = () => {
    setFixedMenus([...fixedMenus, { id: fixedMenus.length + 1, ciorba: '', fel: '', garnitura: '' }]);
  };

  const removeFixedMenu = (id: number) => {
    setFixedMenus(fixedMenus.filter(m => m.id !== id));
  };

  const updateFixedMenu = (id: number, field: 'ciorba' | 'fel' | 'garnitura', value: string) => {
    setFixedMenus(fixedMenus.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const generateOfficialPDF = async () => {
    try {
      // Calculate costs
      let avgCost = 0;
      let totalCombinations = 0;
      
      if (menuType === 'variations') {
        selectedCiorbe.forEach(ciorbaName => {
          selectedFeluri.forEach(felName => {
            selectedGarnituri.forEach(garnituraName => {
              const ciorbaPret = ciorbe.find(c => c.nume === ciorbaName)?.pret || 0;
              const felPret = felPrincipal.find(f => f.nume === felName)?.pret || 0;
              const garnituraPret = garnituri.find(g => g.nume === garnituraName)?.pret || 0;
              avgCost += ciorbaPret + felPret + garnituraPret + COSTURI_FIXE;
              totalCombinations++;
            });
          });
        });
        avgCost = avgCost / totalCombinations;
      } else {
        fixedMenus.forEach(menu => {
          const ciorbaPret = ciorbe.find(c => c.nume === menu.ciorba)?.pret || 0;
          const felPret = felPrincipal.find(f => f.nume === menu.fel)?.pret || 0;
          const garnituraPret = garnituri.find(g => g.nume === menu.garnitura)?.pret || 0;
          avgCost += ciorbaPret + felPret + garnituraPret + COSTURI_FIXE;
          totalCombinations++;
        });
        avgCost = avgCost / totalCombinations;
      }
      
      const profit = pretVanzare - avgCost;
      const profitMargin = (profit / avgCost) * 100;

      // Prepare data for backend
      const offerData = {
        clientCompany,
        clientCUI,
        clientAddress,
        clientContact,
        offerType,
        menuType,
        pricePerMenu: pretVanzare,
        validityDays,
        selectedItems: menuType === 'variations' 
          ? { ciorbe: selectedCiorbe, feluri: selectedFeluri, garnituri: selectedGarnituri }
          : { menus: fixedMenus },
        avgCost,
        profitPerMenu: profit,
        profitMargin
      };

      // Call backend API to generate PDF
      const response = await fetch('http://localhost:5000/api/offers/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(offerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Eroare la generarea PDF-ului');
      }

      // Download PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Oferta_${clientCompany.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      alert(`✅ Oferta PDF a fost generată!\n\n💰 PROFIT TĂU: ${profit.toFixed(2)} LEI/meniu\n📈 MARJĂ: ${profitMargin.toFixed(1)}%`);
    } catch (error: any) {
      console.error('PDF generation error:', error);
      alert(`❌ Eroare la generarea PDF-ului: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">  
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
        
        body {
          font-family: 'Montserrat', sans-serif;
        }
        
        h1, h2, h3, .font-title {
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
      `}</style>
      
      <div className="max-w-6xl mx-auto">
  
        {/* Header */}
        <div className="bg-gradient-to-r from-[#9eff55] to-[#FFC857] rounded-3xl shadow-2xl p-8 mb-6 border-4 border-black">
          <h1 className="text-4xl font-black text-black mb-2 text-center">
            🎯 GENERATOR OFERTE OFICIALE
          </h1>
          <p className="text-black text-center font-semibold">Creează oferte comerciale conforme cu legislația română</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 border-4 border-black">
          <div className="flex justify-between items-center">
            {[
              { num: 1, label: 'Tip Meniu' },
              { num: 2, label: 'Date Client' },
              { num: 3, label: 'Produse' },
              { num: 4, label: 'Preț & Generare' }
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black border-4 ${
                  step >= s.num 
                    ? 'bg-[#9eff55] border-black text-black' 
                    : 'bg-gray-200 border-gray-400 text-gray-600'
                }`}>
                  {s.num}
                </div>
                <span className="text-xs font-bold mt-2 text-center text-black">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: Menu Type Selection */}
        {step === 1 && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
            <h2 className="text-3xl font-black mb-6 text-black">🍽️ TIP SISTEM MENIU</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-black mb-2 text-black">Tip ofertă:</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setOfferType('daily')}
                    className={`flex-1 p-4 rounded-xl border-4 border-black font-black ${
                      offerType === 'daily' ? 'bg-[#FFC857] text-black' : 'bg-white text-gray-600'
                    }`}
                  >
                    📅 ZILNICĂ
                  </button>
                  <button
                    onClick={() => setOfferType('weekly')}
                    className={`flex-1 p-4 rounded-xl border-4 border-black font-black ${
                      offerType === 'weekly' ? 'bg-[#BBDCFF] text-black' : 'bg-white text-gray-600'
                    }`}
                  >
                    📆 SĂPTĂMÂNALĂ
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-black mb-2 text-black">Sistem meniu:</label>
                <div className="space-y-3">
                  <button
                    onClick={() => setMenuType('variations')}
                    className={`w-full p-6 rounded-xl border-4 border-black font-bold text-left ${
                      menuType === 'variations' ? 'bg-[#9eff55] text-black' : 'bg-white text-gray-600'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">🔄</span>
                      <div>
                        <h3 className="text-lg font-black mb-1">MENIU CU VARIAȚII</h3>
                        <p className="text-sm">Clientul alege zilnic din opțiuni pentru fiecare categorie</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setMenuType('fixed')}
                    className={`w-full p-6 rounded-xl border-4 border-black font-bold text-left ${
                      menuType === 'fixed' ? 'bg-[#BBDCFF] text-black' : 'bg-white text-gray-600'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">📋</span>
                      <div>
                        <h3 className="text-lg font-black mb-1">MENIURI FIXE PREDEFINITE</h3>
                        <p className="text-sm">Meniuri complete fixe cu combinații prestabilite</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full p-4 bg-[#9eff55] border-4 border-black rounded-xl font-black text-black text-xl hover:scale-105 transition-transform"
            >
              URMĂTORUL PAS →
            </button>
          </div>
        )}

        {/* STEP 2: Client Info */}
        {step === 2 && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
            <h2 className="text-3xl font-black mb-6 text-black">📋 DATE CLIENT</h2>
            
            <div className="space-y-6">
              <div className="p-6 bg-[#BBDCFF] rounded-2xl border-4 border-black">
                <h3 className="text-xl font-black mb-4 text-black">INFORMAȚII CLIENT</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    className="w-full p-3 border-2 border-black rounded-lg font-bold text-black bg-white"
                    placeholder="Denumire companie client"
                  />
                  <input
                    type="text"
                    value={clientCUI}
                    onChange={(e) => setClientCUI(e.target.value)}
                    className="w-full p-3 border-2 border-black rounded-lg font-bold text-black bg-white"
                    placeholder="CUI client (ex: RO87654321)"
                  />
                  <input
                    type="text"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="w-full p-3 border-2 border-black rounded-lg font-bold text-black bg-white"
                    placeholder="Adresă client"
                  />
                  <input
                    type="text"
                    value={clientContact}
                    onChange={(e) => setClientContact(e.target.value)}
                    className="w-full p-3 border-2 border-black rounded-lg font-bold text-black bg-white"
                    placeholder="Persoană de contact"
                  />
                </div>
              </div>

              <div className="p-6 bg-[#9eff55] rounded-2xl border-4 border-black">
                <h3 className="text-xl font-black mb-2 text-black">DATELE TALE (FURNIZOR)</h3>
                <p className="text-sm font-bold text-black mb-3">Acestea vor apărea automat în ofertă:</p>
                <div className="space-y-1 text-sm font-bold text-black">
                  <p>• Companie: {user?.company}</p>
                  <p>• CUI: {user?.cui || 'Necompletat'}</p>
                  <p>• Telefon: {user?.phone || 'Necompletat'}</p>
                  <p>• Email: {user?.email}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 p-4 bg-gray-200 border-4 border-black rounded-xl font-black text-black text-xl hover:scale-105 transition-transform"
              >
                ← ÎNAPOI
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!clientCompany || !clientCUI || !clientAddress || !clientContact}
                className="flex-1 p-4 bg-[#9eff55] border-4 border-black rounded-xl font-black text-black text-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                URMĂTORUL PAS →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Product Selection */}
        {step === 3 && (
          <div className="space-y-6">
            {menuType === 'variations' ? (
              <>
                <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
                  <h2 className="text-2xl font-black mb-2 text-black">🍲 SELECTEAZĂ CIORBE (minim 2)</h2>
                  <p className="text-sm text-gray-600 mb-4">Ai selectat: {selectedCiorbe.length}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {ciorbe.map((item) => (
                      <button
                        key={item.nume}
                        onClick={() => toggleSelection(item.nume, selectedCiorbe, setSelectedCiorbe)}
                        className={`p-4 rounded-xl border-4 border-black font-bold text-left transition-all ${
                          selectedCiorbe.includes(item.nume)
                            ? 'bg-[#FFC857] scale-105 shadow-lg'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <span className="text-sm text-black">{item.nume}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
                  <h2 className="text-2xl font-black mb-2 text-black">🍖 SELECTEAZĂ FELURI PRINCIPALE (minim 2)</h2>
                  <p className="text-sm text-gray-600 mb-4">Ai selectat: {selectedFeluri.length}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {felPrincipal.map((item) => (
                      <button
                        key={item.nume}
                        onClick={() => toggleSelection(item.nume, selectedFeluri, setSelectedFeluri)}
                        className={`p-4 rounded-xl border-4 border-black font-bold text-left transition-all ${
                          selectedFeluri.includes(item.nume)
                            ? 'bg-[#BBDCFF] scale-105 shadow-lg'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <span className="text-sm text-black">{item.nume}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
                  <h2 className="text-2xl font-black mb-2 text-black">🥔 SELECTEAZĂ GARNITURI (minim 2)</h2>
                  <p className="text-sm text-gray-600 mb-4">Ai selectat: {selectedGarnituri.length}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {garnituri.map((item) => (
                      <button
                        key={item.nume}
                        onClick={() => toggleSelection(item.nume, selectedGarnituri, setSelectedGarnituri)}
                        className={`p-4 rounded-xl border-4 border-black font-bold text-left transition-all ${
                          selectedGarnituri.includes(item.nume)
                            ? 'bg-[#9eff55] scale-105 shadow-lg'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <span className="text-sm text-black">{item.nume}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-black">📋 DEFINEȘTE MENIURI FIXE</h2>
                  <button
                    onClick={addFixedMenu}
                    className="px-4 py-2 bg-[#9eff55] border-2 border-black rounded-lg font-black text-black hover:scale-105 transition-transform"
                  >
                    + ADAUGĂ MENIU
                  </button>
                </div>

                <div className="space-y-4">
                  {fixedMenus.map((menu, idx) => (
                    <div key={menu.id} className="p-6 bg-gray-50 rounded-2xl border-4 border-black">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-black text-black">MENIUL {idx + 1}</h3>
                        {fixedMenus.length > 1 && (
                          <button
                            onClick={() => removeFixedMenu(menu.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg font-bold hover:scale-105 transition-transform"
                          >
                            ✕ Șterge
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-black mb-1 text-black">Ciorbă:</label>
                          <select
                            value={menu.ciorba}
                            onChange={(e) => updateFixedMenu(menu.id, 'ciorba', e.target.value)}
                            className="w-full p-3 border-2 border-black rounded-lg font-bold text-black bg-white"
                          >
                            <option value="">Selectează ciorbă</option>
                            {ciorbe.map(c => (
                              <option key={c.nume} value={c.nume}>{c.nume}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-black mb-1 text-black">Fel Principal:</label>
                          <select
                            value={menu.fel}
                            onChange={(e) => updateFixedMenu(menu.id, 'fel', e.target.value)}
                            className="w-full p-3 border-2 border-black rounded-lg font-bold text-black bg-white"
                          >
                            <option value="">Selectează fel principal</option>
                            {felPrincipal.map(f => (
                              <option key={f.nume} value={f.nume}>{f.nume}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-black mb-1 text-black">Garnitură:</label>
                          <select
                            value={menu.garnitura}
                            onChange={(e) => updateFixedMenu(menu.id, 'garnitura', e.target.value)}
                            className="w-full p-3 border-2 border-black rounded-lg font-bold text-black bg-white"
                          >
                            <option value="">Selectează garnitură</option>
                            {garnituri.map(g => (
                              <option key={g.nume} value={g.nume}>{g.nume}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 p-4 bg-gray-200 border-4 border-black rounded-xl font-black text-black text-xl hover:scale-105 transition-transform"
              >
                ← ÎNAPOI
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={
                  menuType === 'variations'
                    ? (selectedCiorbe.length < 2 || selectedFeluri.length < 2 || selectedGarnituri.length < 2)
                    : fixedMenus.some(m => !m.ciorba || !m.fel || !m.garnitura)
                }
                className="flex-1 p-4 bg-[#9eff55] border-4 border-black rounded-xl font-black text-black text-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                URMĂTORUL PAS →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Pricing & Generate */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
              <h2 className="text-2xl font-black mb-4 text-black">💰 SETĂRI FINALE</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-black mb-2 text-black">Preț per meniu (fără TVA):</label>
                  <div className="text-center mb-4">
                    <div className="inline-block px-8 py-6 bg-[#BBDCFF] rounded-3xl shadow-xl border-4 border-black">
                      <p className="text-5xl font-black text-black">{pretVanzare.toFixed(2)} LEI</p>
                      <p className="text-sm font-bold text-black mt-2">+ TVA 19% = {(pretVanzare * 1.19).toFixed(2)} LEI</p>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="50"
                    step="0.5"
                    value={pretVanzare}
                    onChange={(e) => setPretVanzare(parseFloat(e.target.value))}
                    className="w-full h-4 bg-[#9eff55] rounded-lg cursor-pointer border-2 border-black"
                  />
                  <div className="flex justify-between text-sm font-bold mt-2 text-black">
                    <span>20 LEI</span>
                    <span>50 LEI</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-black mb-2 text-black">Valabilitate ofertă (zile):</label>
                  <input
                    type="number"
                    min="7"
                    max="90"
                    value={validityDays}
                    onChange={(e) => setValidityDays(parseInt(e.target.value))}
                    className="w-full p-4 border-4 border-black rounded-xl font-bold text-black bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Profit Analysis */}
            <div className="bg-[#FFC857] rounded-3xl shadow-2xl p-8 border-4 border-black">
              <h3 className="text-2xl font-black mb-4 text-black text-center">📊 ANALIZA TA DE PROFIT</h3>
              <div className="grid grid-cols-3 gap-4">
                {(() => {
                  let avgCost = 0;
                  let totalCombinations = 0;
                  
                  if (menuType === 'variations') {
                    selectedCiorbe.forEach(ciorbaName => {
                      selectedFeluri.forEach(felName => {
                        selectedGarnituri.forEach(garnituraName => {
                          const ciorbaPret = ciorbe.find(c => c.nume === ciorbaName)?.pret || 0;
                          const felPret = felPrincipal.find(f => f.nume === felName)?.pret || 0;
                          const garnituraPret = garnituri.find(g => g.nume === garnituraName)?.pret || 0;
                          avgCost += ciorbaPret + felPret + garnituraPret + COSTURI_FIXE;
                          totalCombinations++;
                        });
                      });
                    });
                  } else {
                    fixedMenus.forEach(menu => {
                      const ciorbaPret = ciorbe.find(c => c.nume === menu.ciorba)?.pret || 0;
                      const felPret = felPrincipal.find(f => f.nume === menu.fel)?.pret || 0;
                      const garnituraPret = garnituri.find(g => g.nume === menu.garnitura)?.pret || 0;
                      avgCost += ciorbaPret + felPret + garnituraPret + COSTURI_FIXE;
                      totalCombinations++;
                    });
                  }
                  
                  avgCost = totalCombinations > 0 ? avgCost / totalCombinations : 0;
                  const profit = pretVanzare - avgCost;
                  const profitMargin = avgCost > 0 ? (profit / avgCost) * 100 : 0;
                  
                  return (
                    <>
                      <div className="bg-white p-4 rounded-xl border-4 border-black text-center">
                        <p className="text-xs font-black text-black mb-1">COST MEDIU</p>
                        <p className="text-2xl font-black text-black">{avgCost.toFixed(2)} LEI</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border-4 border-black text-center">
                        <p className="text-xs font-black text-black mb-1">PROFIT/MENIU</p>
                        <p className="text-2xl font-black text-green-600">+{profit.toFixed(2)} LEI</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border-4 border-black text-center">
                        <p className="text-xs font-black text-black mb-1">MARJĂ</p>
                        <p className={`text-2xl font-black ${profitMargin >= 100 ? 'text-green-600' : profitMargin >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {profitMargin.toFixed(1)}%
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="bg-[#9eff55] rounded-3xl shadow-2xl p-8 border-4 border-black">
              <h3 className="text-2xl font-black mb-4 text-black text-center">✅ GATA DE GENERARE!</h3>
              <div className="space-y-2 text-black font-bold text-center">
                <p>📄 Ofertă oficială conformă cu legislația română</p>
                <p>🏢 {user?.company} → {clientCompany}</p>
                <p>🍽️ Sistem: {menuType === 'variations' ? 'Meniu cu Variații' : 'Meniuri Fixe'}</p>
                <p>💰 Preț: {pretVanzare.toFixed(2)} LEI + TVA</p>
                <p>📅 Valabil: {validityDays} zile</p>
              </div>
            </div>

            <button
              onClick={generateOfficialPDF}
              className="w-full p-6 bg-[#9eff55] text-black border-4 border-black rounded-xl font-black text-2xl hover:scale-105 transition-transform"
            >
              📥 DESCARCĂ OFERTA PDF
            </button>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(3)}
                className="flex-1 p-4 bg-gray-200 border-4 border-black rounded-xl font-black text-black text-xl hover:scale-105 transition-transform"
              >
                ← MODIFICĂ
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setSelectedCiorbe([]);
                  setSelectedFeluri([]);
                  setSelectedGarnituri([]);
                  setFixedMenus([{ id: 1, ciorba: '', fel: '', garnitura: '' }]);
                }}
                className="flex-1 p-4 bg-[#FFC857] border-4 border-black rounded-xl font-black text-black text-xl hover:scale-105 transition-transform"
              >
                🔄 OFERTĂ NOUĂ
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 mt-8">
          <p className="font-bold">Powered by <strong className="text-black">ZED ZEN</strong> | www.zed-zen.com</p>
        </div>
      </div>
    </div>
  );
}