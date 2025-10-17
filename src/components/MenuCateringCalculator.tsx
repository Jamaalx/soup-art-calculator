'use client';

import React, { useState, useMemo } from 'react';
import { CIORBE, FELPRINCIPAL as FEL_PRINCIPAL, GARNITURI, DESERT, BAUTURI, AUXILIARE } from '@/lib/data/products';
import type { Product, ProductCategory } from '@/types';

// Helper function to get products by category
const getProductsByCategory = (category: ProductCategory): Product[] => {
  switch(category) {
    case 'ciorbe':
      return CIORBE;
    case 'felPrincipal':
      return FEL_PRINCIPAL;
    case 'garnituri':
      return GARNITURI;
    case 'desert':
      return DESERT;
    case 'bauturi':
      return BAUTURI;
    case 'auxiliare':
      return AUXILIARE;
    default:
      return [];
  }
};

interface MenuCateringSimulation {
  ciorba?: string;
  felPrincipal: string;
  garnitura: string;
  desert?: string;
  bautura?: string;
  auxiliare?: string[];
  costTotal: number;
  pretMeniu: number;
  profit: number;
  marjaProfit: number;
  items: string[];
}

const MenuCateringCalculator = () => {
  const [pretVanzare, setPretVanzare] = useState<number>(45);
  const [includeDesert, setIncludeDesert] = useState<boolean>(true);
  const [includeBautura, setIncludeBautura] = useState<boolean>(true);
  const [numarAuxiliare, setNumarAuxiliare] = useState<number>(2);

  // Get products using the helper function
  const ciorbe = getProductsByCategory('ciorbe');
  const felPrincipal = getProductsByCategory('felPrincipal');
  const garnituri = getProductsByCategory('garnituri');
  const deserturi = getProductsByCategory('desert');
  const bauturi = getProductsByCategory('bauturi');
  const auxiliare = getProductsByCategory('auxiliare');

  const COSTURI_FIXE = 5.0; // Higher fixed costs for catering

  const calculateMenu = (
    ciorba: Product,
    fel: Product,
    garnitura: Product,
    desert?: Product,
    bautura?: Product,
    aux: Product[] = []
  ): MenuCateringSimulation => {
    let costTotal = ciorba.pretCost + fel.pretCost + garnitura.pretCost + COSTURI_FIXE;
    const items = [ciorba.nume, fel.nume, garnitura.nume];

    if (desert) {
      costTotal += desert.pretCost;
      items.push(desert.nume);
    }
    if (bautura) {
      costTotal += bautura.pretCost;
      items.push(bautura.nume);
    }
    aux.forEach(a => {
      costTotal += a.pretCost;
      items.push(a.nume);
    });

    const profit = pretVanzare - costTotal;
    const marjaProfit = (profit / costTotal) * 100;

    return {
      ciorba: ciorba.nume,
      felPrincipal: fel.nume,
      garnitura: garnitura.nume,
      desert: desert?.nume,
      bautura: bautura?.nume,
      auxiliare: aux.map(a => a.nume),
      costTotal,
      pretMeniu: pretVanzare,
      profit,
      marjaProfit,
      items
    };
  };

  const simulari = useMemo<MenuCateringSimulation[]>(() => {
    const result: MenuCateringSimulation[] = [];
    
    // Limit combinations to prevent infinite loops
    const maxCombinations = 1000;
    let count = 0;

    for (const ciorba of ciorbe) {
      for (const fel of felPrincipal) {
        for (const garnitura of garnituri) {
          if (count >= maxCombinations) break;

          if (includeDesert && includeBautura && deserturi.length > 0 && bauturi.length > 0) {
            // Take only first few items to limit combinations
            const limitedDeserturi = deserturi.slice(0, 3);
            const limitedBauturi = bauturi.slice(0, 3);
            
            for (const desert of limitedDeserturi) {
              for (const bautura of limitedBauturi) {
                if (count >= maxCombinations) break;
                
                if (numarAuxiliare > 0 && auxiliare.length >= numarAuxiliare) {
                  const selectedAux = auxiliare.slice(0, numarAuxiliare);
                  result.push(calculateMenu(ciorba, fel, garnitura, desert, bautura, selectedAux));
                } else {
                  result.push(calculateMenu(ciorba, fel, garnitura, desert, bautura));
                }
                count++;
              }
            }
          } else if (includeDesert && deserturi.length > 0) {
            const limitedDeserturi = deserturi.slice(0, 5);
            for (const desert of limitedDeserturi) {
              if (count >= maxCombinations) break;
              result.push(calculateMenu(ciorba, fel, garnitura, desert));
              count++;
            }
          } else if (includeBautura && bauturi.length > 0) {
            const limitedBauturi = bauturi.slice(0, 5);
            for (const bautura of limitedBauturi) {
              if (count >= maxCombinations) break;
              result.push(calculateMenu(ciorba, fel, garnitura, undefined, bautura));
              count++;
            }
          } else {
            result.push(calculateMenu(ciorba, fel, garnitura));
            count++;
          }
        }
      }
    }
    
    return result;
  }, [pretVanzare, includeDesert, includeBautura, numarAuxiliare]); // FIXED: Removed products from dependencies

  const stats = useMemo(() => {
    if (simulari.length === 0) {
      return {
        costMin: 0,
        costMax: 0,
        costMediu: 0,
        profitMediu: 0,
        marjaMin: 0,
        marjaMax: 0,
        marjaMedie: 0,
        profitabile: 0,
      };
    }

    const costuri = simulari.map(s => s.costTotal);
    const profituri = simulari.map(s => s.profit);
    const marje = simulari.map(s => s.marjaProfit);
    
    return {
      costMin: Math.min(...costuri),
      costMax: Math.max(...costuri),
      costMediu: costuri.reduce((a, b) => a + b, 0) / costuri.length,
      profitMediu: profituri.reduce((a, b) => a + b, 0) / profituri.length,
      marjaMin: Math.min(...marje),
      marjaMax: Math.max(...marje),
      marjaMedie: marje.reduce((a, b) => a + b, 0) / marje.length,
      profitabile: simulari.filter(s => s.marjaProfit >= 100).length,
    };
  }, [simulari]);

  const topMeniuri = useMemo(() => {
    if (simulari.length === 0) {
      return { top: [], bottom: [] };
    }
    const sorted = [...simulari].sort((a, b) => b.marjaProfit - a.marjaProfit);
    return {
      top: sorted.slice(0, 5),
      bottom: sorted.slice(-5).reverse()
    };
  }, [simulari]);

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border-4 border-purple-600">
          <h1 className="text-4xl md:text-5xl font-black text-purple-600 mb-2 tracking-tight">
            🍽️ CALCULATOR MENIU CATERING
          </h1>
          <p className="text-gray-700 font-semibold">Meniuri complete pentru evenimente B2B</p>
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border-4 border-purple-600">
          <h2 className="text-2xl font-black mb-6 text-purple-600">⚙️ CONFIGURARE MENIU</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price Control */}
            <div>
              <h3 className="font-bold mb-3">Preț Vânzare</h3>
              <div className="bg-purple-100 rounded-2xl p-4 mb-3">
                <p className="text-3xl font-black text-purple-600">{pretVanzare.toFixed(2)} LEI</p>
              </div>
              <input 
                type="range" 
                min="30" 
                max="80" 
                step="1" 
                value={pretVanzare} 
                onChange={(e) => setPretVanzare(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Options */}
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={includeDesert}
                  onChange={(e) => setIncludeDesert(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="font-bold">Include Desert</span>
              </label>

              <label className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={includeBautura}
                  onChange={(e) => setIncludeBautura(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="font-bold">Include Băutură</span>
              </label>

              <div>
                <label className="font-bold mb-2 block">Număr Auxiliare: {numarAuxiliare}</label>
                <input 
                  type="range" 
                  min="0" 
                  max="4" 
                  step="1" 
                  value={numarAuxiliare} 
                  onChange={(e) => setNumarAuxiliare(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: '📦', label: 'COMBINAȚII', value: simulari.length.toLocaleString(), color: 'bg-purple-100 border-purple-600' },
            { icon: '📈', label: 'MARJĂ MEDIE', value: `${stats.marjaMedie.toFixed(1)}%`, color: 'bg-pink-100 border-pink-600' },
            { icon: '💰', label: 'PROFIT MEDIU', value: `${stats.profitMediu.toFixed(2)} LEI`, color: 'bg-blue-100 border-blue-600' },
            { icon: '✅', label: 'PROFITABILE', value: `${stats.profitabile}`, color: 'bg-green-100 border-green-600' }
          ].map((stat, i) => (
            <div key={i} className={`${stat.color} rounded-2xl p-6 shadow-xl border-4`}>
              <div className="text-4xl mb-2">{stat.icon}</div>
              <p className="text-3xl font-black text-gray-900">{stat.value}</p>
              <p className="text-sm font-black text-gray-700">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Top Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            { title: '🏆 TOP 5 PROFITABILE', items: topMeniuri.top, positive: true },
            { title: '⚠️ TOP 5 NEPROFITABILE', items: topMeniuri.bottom, positive: false }
          ].map((section, idx) => (
            <div key={idx} className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-purple-600">
              <h3 className="text-2xl font-black mb-4 text-purple-600">{section.title}</h3>
              <div className="space-y-3">
                {section.items.map((m, i) => (
                  <div 
                    key={i} 
                    className={`p-4 rounded-2xl border-4 ${
                      m.marjaProfit >= 100 ? 'bg-green-100 border-green-600' : 
                      m.profit < 0 ? 'bg-red-100 border-red-600' : 
                      'bg-yellow-100 border-yellow-600'
                    }`}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-black">
                        #{i+1}
                      </span>
                      <span className="text-lg font-black">{m.marjaProfit.toFixed(1)}%</span>
                    </div>
                    <div className="text-xs space-y-1">
                      {m.items.map((item, idx) => (
                        <p key={idx} className="font-bold">• {item}</p>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t-2 border-gray-300 flex justify-between text-xs font-black">
                      <span>COST: {m.costTotal.toFixed(2)} LEI</span>
                      <span className={m.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {m.profit >= 0 ? '+' : ''}{m.profit.toFixed(2)} LEI
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuCateringCalculator;