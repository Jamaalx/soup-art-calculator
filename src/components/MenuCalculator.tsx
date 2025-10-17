'use client';

import React, { useState, useMemo } from 'react';
import { getProductsByCategory } from '@/lib/data/products';
import type { ProductCategory } from '@/types';
import { MENU_COSTS } from '@/lib/data/constants';

export default function MenuCalculator() {
  const [pretVanzare, setPretVanzare] = useState(35);
  
  // Selected Products (checkboxes for variations)
  const [selectedCiorbe, setSelectedCiorbe] = useState<string[]>([]);
  const [selectedFeluri, setSelectedFeluri] = useState<string[]>([]);
  const [selectedGarnituri, setSelectedGarnituri] = useState<string[]>([]);

  const products = useMemo(() => ({
    ciorbe: getProductsByCategory('ciorbe' as ProductCategory),
    felPrincipal: getProductsByCategory('felPrincipal' as ProductCategory),
    garnituri: getProductsByCategory('garnituri' as ProductCategory),
  }), []);

  const toggleSelection = (itemId: string, list: string[], setList: (items: string[]) => void) => {
    if (list.includes(itemId)) {
      setList(list.filter(i => i !== itemId));
    } else {
      setList([...list, itemId]);
    }
  };

  const toggleSelectAll = (category: 'ciorbe' | 'felPrincipal' | 'garnituri') => {
    if (category === 'ciorbe') {
      const allIds = products.ciorbe.map(p => p.id);
      setSelectedCiorbe(selectedCiorbe.length === allIds.length ? [] : allIds);
    } else if (category === 'felPrincipal') {
      const allIds = products.felPrincipal.map(p => p.id);
      setSelectedFeluri(selectedFeluri.length === allIds.length ? [] : allIds);
    } else {
      const allIds = products.garnituri.map(p => p.id);
      setSelectedGarnituri(selectedGarnituri.length === allIds.length ? [] : allIds);
    }
  };

  const simulari = useMemo(() => {
    const result: any[] = [];
    
    selectedCiorbe.forEach(ciorbaId => {
      selectedFeluri.forEach(felId => {
        selectedGarnituri.forEach(garnituraId => {
          const ciorba = products.ciorbe.find(p => p.id === ciorbaId);
          const fel = products.felPrincipal.find(p => p.id === felId);
          const garnitura = products.garnituri.find(p => p.id === garnituraId);
          
          if (ciorba && fel && garnitura) {
            const costProduse = ciorba.pretCost + fel.pretCost + garnitura.pretCost;
            const costTotal = costProduse + MENU_COSTS.ONLINE.PACKAGING_PER_MENU;
            const comision = pretVanzare * MENU_COSTS.ONLINE.COMMISSION_PERCENTAGE;
            const profit = pretVanzare - costTotal - comision;
            const marjaProfit = (profit / costTotal) * 100;
            
            result.push({
              ciorba: ciorba.nume,
              fel: fel.nume,
              garnitura: garnitura.nume,
              costProduse,
              costTotal,
              comision,
              profit,
              marjaProfit,
            });
          }
        });
      });
    });
    
    return result;
  }, [selectedCiorbe, selectedFeluri, selectedGarnituri, pretVanzare, products]);

  const stats = useMemo(() => {
    if (simulari.length === 0) return null;
    
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
    if (simulari.length === 0) return { top: [], bottom: [] };
    
    const sorted = [...simulari].sort((a, b) => b.marjaProfit - a.marjaProfit);
    return {
      top: sorted.slice(0, 5),
      bottom: sorted.slice(-5).reverse()
    };
  }, [simulari]);

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border-4 border-black">
        <span className="inline-block px-4 py-2 bg-[#BBDCFF] rounded-full text-black text-sm font-bold mb-3 border-2 border-black">
          🚚 CALCULATOR MENIU ONLINE
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-black mb-2 tracking-tight">
          PREȚ MENIU DELIVERY
        </h1>
        <div className="text-gray-700 font-semibold">
          Optimizare prețuri cu variații multiple
        </div>
        <div className="text-sm text-gray-600 font-semibold mt-2">
          Include: Ambalaj ({MENU_COSTS.ONLINE.PACKAGING_PER_MENU} LEI) + Comision ({(MENU_COSTS.ONLINE.COMMISSION_PERCENTAGE * 100).toFixed(1)}%)
        </div>
      </div>

      {/* Price Control */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border-4 border-black">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black mb-4 text-black">SETEAZĂ PREȚUL DE VÂNZARE</h2>
          <div className="inline-block px-8 py-6 bg-[#BBDCFF] rounded-3xl shadow-xl mb-4 border-4 border-black">
            <div className="text-black text-sm font-bold opacity-90">PREȚ PER MENIU</div>
            <div className="text-black text-5xl font-black">{pretVanzare.toFixed(2)} <span className="text-3xl">LEI</span></div>
          </div>
        </div>
        <input 
          type="range" 
          min="20" 
          max="100" 
          step="0.5" 
          value={pretVanzare} 
          onChange={(e) => setPretVanzare(parseFloat(e.target.value))}
          className="w-full h-4 bg-[#BBDCFF] rounded-lg cursor-pointer border-2 border-black"
        />
        <div className="flex justify-between text-sm font-bold text-black mt-2">
          <span>20 LEI</span>
          <span>100 LEI</span>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: '📦', label: 'COMBINAȚII', value: simulari.length.toLocaleString(), color: '#FFC857' },
            { icon: '📈', label: 'MARJĂ MEDIE', value: `${stats.marjaMedie.toFixed(1)}%`, color: '#9eff55' },
            { icon: '💰', label: 'PROFIT MEDIU', value: `${stats.profitMediu.toFixed(2)} LEI`, color: '#BBDCFF' },
            { icon: '✅', label: 'PROFITABILE', value: stats.profitabile, color: '#EBEBEB' }
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl p-6 shadow-xl hover:scale-105 transition-transform border-4 border-black" style={{backgroundColor: stat.color}}>
              <div className="flex justify-between mb-4">
                <div className="text-4xl">{stat.icon}</div>
                <div className="text-3xl font-black text-black">{stat.value}</div>
              </div>
              <div className="text-sm font-black text-black">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Product Selection */}
      <div className="space-y-6 mb-6">
        {/* Ciorbe */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-black text-black">🍲 CIORBE</h2>
              <div className="text-sm text-gray-600">Selectat: {selectedCiorbe.length}/{products.ciorbe.length}</div>
            </div>
            <button
              onClick={() => toggleSelectAll('ciorbe')}
              className="px-4 py-2 bg-[#FFC857] border-2 border-black rounded-lg font-black text-black hover:scale-105 transition-transform"
            >
              {selectedCiorbe.length === products.ciorbe.length ? 'DESELECTEAZĂ' : 'SELECTEAZĂ'} TOT
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {products.ciorbe.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleSelection(item.id, selectedCiorbe, setSelectedCiorbe)}
                className={`p-4 rounded-xl border-4 border-black font-bold text-left transition-all ${
                  selectedCiorbe.includes(item.id)
                    ? 'bg-[#FFC857] scale-105 shadow-lg'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span className="text-sm text-black block mb-1">{item.nume}</span>
                <span className="text-xs text-gray-700">Cost: {item.pretCost.toFixed(2)} LEI</span>
              </button>
            ))}
          </div>
        </div>

        {/* Feluri Principale */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-black text-black">🍖 FELURI PRINCIPALE</h2>
              <div className="text-sm text-gray-600">Selectat: {selectedFeluri.length}/{products.felPrincipal.length}</div>
            </div>
            <button
              onClick={() => toggleSelectAll('felPrincipal')}
              className="px-4 py-2 bg-[#BBDCFF] border-2 border-black rounded-lg font-black text-black hover:scale-105 transition-transform"
            >
              {selectedFeluri.length === products.felPrincipal.length ? 'DESELECTEAZĂ' : 'SELECTEAZĂ'} TOT
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {products.felPrincipal.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleSelection(item.id, selectedFeluri, setSelectedFeluri)}
                className={`p-4 rounded-xl border-4 border-black font-bold text-left transition-all ${
                  selectedFeluri.includes(item.id)
                    ? 'bg-[#BBDCFF] scale-105 shadow-lg'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span className="text-sm text-black block mb-1">{item.nume}</span>
                <span className="text-xs text-gray-700">Cost: {item.pretCost.toFixed(2)} LEI</span>
              </button>
            ))}
          </div>
        </div>

        {/* Garnituri */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-black text-black">🥔 GARNITURI</h2>
              <div className="text-sm text-gray-600">Selectat: {selectedGarnituri.length}/{products.garnituri.length}</div>
            </div>
            <button
              onClick={() => toggleSelectAll('garnituri')}
              className="px-4 py-2 bg-[#9eff55] border-2 border-black rounded-lg font-black text-black hover:scale-105 transition-transform"
            >
              {selectedGarnituri.length === products.garnituri.length ? 'DESELECTEAZĂ' : 'SELECTEAZĂ'} TOT
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {products.garnituri.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleSelection(item.id, selectedGarnituri, setSelectedGarnituri)}
                className={`p-4 rounded-xl border-4 border-black font-bold text-left transition-all ${
                  selectedGarnituri.includes(item.id)
                    ? 'bg-[#9eff55] scale-105 shadow-lg'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span className="text-sm text-black block mb-1">{item.nume}</span>
                <span className="text-xs text-gray-700">Cost: {item.pretCost.toFixed(2)} LEI</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top Lists */}
      {topMeniuri.top.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
            <h3 className="text-2xl font-black mb-4 text-[#9eff55]" style={{WebkitTextStroke: '1px black'}}>🏆 TOP 5 PROFITABILE</h3>
            <div className="space-y-3">
              {topMeniuri.top.map((m, i) => (
                <div 
                  key={i} 
                  className={`p-4 rounded-2xl border-4 border-black ${
                    m.marjaProfit >= 100 ? 'bg-[#9eff55]' : 'bg-[#FFC857]'
                  }`}
                >
                  <div className="flex justify-between mb-2">
                    <span className="px-3 py-1 bg-black text-white rounded-full text-sm font-black">#{i+1}</span>
                    <span className="text-lg font-black text-black">{m.marjaProfit.toFixed(1)}%</span>
                  </div>
                  <div className="text-xs font-bold text-black"><strong>Ciorbă:</strong> {m.ciorba}</div>
                  <div className="text-xs font-bold text-black"><strong>Fel:</strong> {m.fel}</div>
                  <div className="text-xs font-bold text-black"><strong>Garnitură:</strong> {m.garnitura}</div>
                  <div className="mt-2 pt-2 border-t-2 border-black flex justify-between text-xs font-black">
                    <span>COST: {m.costTotal.toFixed(2)} LEI</span>
                    <span>{m.profit >= 0 ? '+' : ''}{m.profit.toFixed(2)} LEI</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
            <h3 className="text-2xl font-black mb-4 text-black">⚠️ TOP 5 NEPROFITABILE</h3>
            <div className="space-y-3">
              {topMeniuri.bottom.map((m, i) => (
                <div 
                  key={i} 
                  className="p-4 rounded-2xl border-4 border-black bg-[#BBDCFF]"
                >
                  <div className="flex justify-between mb-2">
                    <span className="px-3 py-1 bg-black text-white rounded-full text-sm font-black">#{i+1}</span>
                    <span className="text-lg font-black text-black">{m.marjaProfit.toFixed(1)}%</span>
                  </div>
                  <div className="text-xs font-bold text-black"><strong>Ciorbă:</strong> {m.ciorba}</div>
                  <div className="text-xs font-bold text-black"><strong>Fel:</strong> {m.fel}</div>
                  <div className="text-xs font-bold text-black"><strong>Garnitură:</strong> {m.garnitura}</div>
                  <div className="mt-2 pt-2 border-t-2 border-black flex justify-between text-xs font-black">
                    <span>COST: {m.costTotal.toFixed(2)} LEI</span>
                    <span>{m.profit >= 0 ? '+' : ''}{m.profit.toFixed(2)} LEI</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}