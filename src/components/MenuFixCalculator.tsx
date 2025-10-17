'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getProductsByCategory } from '@/lib/data/products';
import type { ProductCategory } from '@/types';
import { MENU_COSTS } from '@/lib/data/constants';

export default function MenuFixCalculator() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  
  // Client Info
  const [clientCompany, setClientCompany] = useState('');
  const [clientCUI, setClientCUI] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientContact, setClientContact] = useState('');
  
  // Selected Products (single selection with dropdowns)
  const [selectedProducts, setSelectedProducts] = useState<{
    ciorba?: string;
    felPrincipal?: string;
    garnitura?: string;
  }>({});
  
  // Pricing
  const [pretVanzare, setPretVanzare] = useState(35);
  const [validityDays, setValidityDays] = useState(30);

  const products = useMemo(() => ({
    ciorbe: getProductsByCategory('ciorbe' as ProductCategory),
    felPrincipal: getProductsByCategory('felPrincipal' as ProductCategory),
    garnituri: getProductsByCategory('garnituri' as ProductCategory),
  }), []);

  const selectedProductDetails = useMemo(() => {
    const details: any = {};
    if (selectedProducts.ciorba) {
      details.ciorba = products.ciorbe.find(p => p.id === selectedProducts.ciorba);
    }
    if (selectedProducts.felPrincipal) {
      details.felPrincipal = products.felPrincipal.find(p => p.id === selectedProducts.felPrincipal);
    }
    if (selectedProducts.garnitura) {
      details.garnitura = products.garnituri.find(p => p.id === selectedProducts.garnitura);
    }
    return details;
  }, [selectedProducts, products]);

  const calculation = useMemo(() => {
    if (!selectedProductDetails.ciorba || !selectedProductDetails.felPrincipal || !selectedProductDetails.garnitura) {
      return null;
    }

    const costProduse = 
      selectedProductDetails.ciorba.pretCost +
      selectedProductDetails.felPrincipal.pretCost +
      selectedProductDetails.garnitura.pretCost;

    const costTotal = costProduse + MENU_COSTS.ONLINE.PACKAGING_PER_MENU;
    const comision = pretVanzare * MENU_COSTS.ONLINE.COMMISSION_PERCENTAGE;
    const profit = pretVanzare - costTotal - comision;
    const marjaProfit = (profit / costTotal) * 100;

    return {
      costProduse,
      costTotal,
      comision,
      profit,
      marjaProfit,
    };
  }, [selectedProductDetails, pretVanzare]);

  const generateOfficialPDF = async () => {
    try {
      if (!calculation) return;

      const offerData = {
        menuType: 'fixed',
        clientCompany,
        clientCUI,
        clientAddress,
        clientContact,
        pricePerMenu: pretVanzare,
        validityDays,
        selectedMenu: {
          ciorba: selectedProductDetails.ciorba?.nume,
          felPrincipal: selectedProductDetails.felPrincipal?.nume,
          garnitura: selectedProductDetails.garnitura?.nume,
        },
        costProduse: calculation.costProduse,
        profitPerMenu: calculation.profit,
        profitMargin: calculation.marjaProfit,
      };

      alert(`✅ Ofertă MENIU FIX generată!\n\n💰 PROFIT/MENIU: ${calculation.profit.toFixed(2)} LEI\n📈 MARJĂ: ${calculation.marjaProfit.toFixed(1)}%`);
      
      console.log('Offer Data:', offerData);
      // TODO: Call backend API to generate PDF
    } catch (error: any) {
      console.error('PDF generation error:', error);
      alert(`❌ Eroare: ${error.message}`);
    }
  };

  return (
    <div>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
        body {
          font-family: 'Montserrat', sans-serif;
        }
      `}</style>

      {/* Progress Steps */}
      <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 border-4 border-black">
        <div className="flex justify-between items-center">
          {[
            { num: 1, label: 'Info Meniu' },
            { num: 2, label: 'Date Client' },
            { num: 3, label: 'Selectare Meniu' },
            { num: 4, label: 'Preț & Generare' }
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black border-4 ${
                step >= s.num 
                  ? 'bg-[#FFC857] border-black text-black' 
                  : 'bg-gray-200 border-gray-400 text-gray-600'
              }`}>
                {s.num}
              </div>
              <span className="text-xs font-bold mt-2 text-center text-black">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: Menu Info */}
      {step === 1 && (
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
          <span className="inline-block px-4 py-2 bg-[#FFC857] rounded-full text-black text-sm font-bold mb-4 border-2 border-black">
            📋 MENIU FIX PREDEFINIT
          </span>
          <h2 className="text-3xl font-black mb-4 text-black">MENIU UNIC PRESTABILIT</h2>
          
          <div className="bg-[#FFC857] p-6 rounded-2xl border-4 border-black mb-6">
            <h3 className="text-xl font-black mb-3 text-black">📦 CE INCLUDE:</h3>
            <div className="space-y-2 text-black font-bold">
              <div>✅ Ambalaj: {MENU_COSTS.ONLINE.PACKAGING_PER_MENU} LEI per meniu</div>
              <div>✅ Comision platformă: {(MENU_COSTS.ONLINE.COMMISSION_PERCENTAGE * 100).toFixed(1)}%</div>
              <div>✅ Un singur meniu fix prestabilit</div>
              <div>✅ Ciorbă + Fel Principal + Garnitură</div>
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full p-4 bg-[#FFC857] border-4 border-black rounded-xl font-black text-black text-xl hover:scale-105 transition-transform"
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
            <div className="p-6 bg-[#FFC857] rounded-2xl border-4 border-black">
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
              <div className="text-sm font-bold text-black mb-3">Vor apărea automat în ofertă:</div>
              <div className="space-y-1 text-sm font-bold text-black">
                <div>• Email: {user?.email}</div>
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
              className="flex-1 p-4 bg-[#FFC857] border-4 border-black rounded-xl font-black text-black text-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              URMĂTORUL PAS →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Product Selection */}
      {step === 3 && (
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
          <h2 className="text-2xl font-black mb-6 text-black">🍽️ SELECTEAZĂ MENIUL FIX</h2>
          
          <div className="space-y-6">
            {/* Ciorbe */}
            <div>
              <label className="block text-sm font-black text-black mb-3 flex items-center gap-2">
                🍲 CIORBĂ
              </label>
              <select
                value={selectedProducts.ciorba || ''}
                onChange={(e) => setSelectedProducts({...selectedProducts, ciorba: e.target.value})}
                className="w-full px-4 py-3 border-4 border-black rounded-xl font-bold text-sm focus:ring-4 focus:ring-[#FFC857]"
              >
                <option value="">Selectează ciorbă...</option>
                {products.ciorbe.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nume} - {p.pretCost.toFixed(2)} LEI
                  </option>
                ))}
              </select>
            </div>

            {/* Fel Principal */}
            <div>
              <label className="block text-sm font-black text-black mb-3 flex items-center gap-2">
                🍖 FEL PRINCIPAL
              </label>
              <select
                value={selectedProducts.felPrincipal || ''}
                onChange={(e) => setSelectedProducts({...selectedProducts, felPrincipal: e.target.value})}
                className="w-full px-4 py-3 border-4 border-black rounded-xl font-bold text-sm focus:ring-4 focus:ring-[#BBDCFF]"
              >
                <option value="">Selectează fel principal...</option>
                {products.felPrincipal.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nume} - {p.pretCost.toFixed(2)} LEI
                  </option>
                ))}
              </select>
            </div>

            {/* Garnitura */}
            <div>
              <label className="block text-sm font-black text-black mb-3 flex items-center gap-2">
                🥔 GARNITURĂ
              </label>
              <select
                value={selectedProducts.garnitura || ''}
                onChange={(e) => setSelectedProducts({...selectedProducts, garnitura: e.target.value})}
                className="w-full px-4 py-3 border-4 border-black rounded-xl font-bold text-sm focus:ring-4 focus:ring-[#9eff55]"
              >
                <option value="">Selectează garnitură...</option>
                {products.garnituri.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nume} - {p.pretCost.toFixed(2)} LEI
                  </option>
                ))}
              </select>
            </div>

            {/* Preview */}
            {selectedProductDetails.ciorba && selectedProductDetails.felPrincipal && selectedProductDetails.garnitura && (
              <div className="bg-[#FFC857] p-6 rounded-2xl border-4 border-black">
                <h3 className="text-lg font-black mb-3 text-black">📋 MENIUL TĂU:</h3>
                <div className="space-y-2 text-black font-bold">
                  <div>🍲 {selectedProductDetails.ciorba.nume}</div>
                  <div>🍖 {selectedProductDetails.felPrincipal.nume}</div>
                  <div>🥔 {selectedProductDetails.garnitura.nume}</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setStep(2)}
              className="flex-1 p-4 bg-gray-200 border-4 border-black rounded-xl font-black text-black text-xl hover:scale-105 transition-transform"
            >
              ← ÎNAPOI
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!selectedProducts.ciorba || !selectedProducts.felPrincipal || !selectedProducts.garnitura}
              className="flex-1 p-4 bg-[#FFC857] border-4 border-black rounded-xl font-black text-black text-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              URMĂTORUL PAS →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Pricing & Generate */}
      {step === 4 && calculation && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
            <h2 className="text-2xl font-black mb-4 text-black">💰 SETĂRI FINALE</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-black mb-2 text-black">Preț per meniu (fără TVA):</label>
                <div className="text-center mb-4">
                  <div className="inline-block px-8 py-6 bg-[#FFC857] rounded-3xl shadow-xl border-4 border-black">
                    <div className="text-5xl font-black text-black">{pretVanzare.toFixed(2)} LEI</div>
                    <div className="text-sm font-bold text-black mt-2">+ TVA 19% = {(pretVanzare * 1.19).toFixed(2)} LEI</div>
                  </div>
                </div>
                <input
                  type="range"
                  min="20"
                  max="50"
                  step="0.5"
                  value={pretVanzare}
                  onChange={(e) => setPretVanzare(parseFloat(e.target.value))}
                  className="w-full h-4 bg-[#FFC857] rounded-lg cursor-pointer border-2 border-black"
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
            <h3 className="text-2xl font-black mb-4 text-black text-center">📊 ANALIZA DE PROFIT</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border-4 border-black text-center">
                <div className="text-xs font-black text-black mb-1">COST TOTAL</div>
                <div className="text-2xl font-black text-black">{calculation.costTotal.toFixed(2)} LEI</div>
              </div>
              <div className="bg-white p-4 rounded-xl border-4 border-black text-center">
                <div className="text-xs font-black text-black mb-1">PROFIT/MENIU</div>
                <div className="text-2xl font-black text-green-600">+{calculation.profit.toFixed(2)} LEI</div>
              </div>
              <div className="bg-white p-4 rounded-xl border-4 border-black text-center">
                <div className="text-xs font-black text-black mb-1">MARJĂ</div>
                <div className={`text-2xl font-black ${calculation.marjaProfit >= 100 ? 'text-green-600' : calculation.marjaProfit >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {calculation.marjaProfit.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={generateOfficialPDF}
            className="w-full p-6 bg-[#FFC857] text-black border-4 border-black rounded-xl font-black text-2xl hover:scale-105 transition-transform"
          >
            📥 GENEREAZĂ OFERTA PDF
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
                setSelectedProducts({});
              }}
              className="flex-1 p-4 bg-[#BBDCFF] border-4 border-black rounded-xl font-black text-black text-xl hover:scale-105 transition-transform"
            >
              🔄 OFERTĂ NOUĂ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}