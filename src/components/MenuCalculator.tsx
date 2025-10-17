'use client';

import React, { useState, useMemo } from 'react';
import { CIORBE, FEL_PRINCIPAL, GARNITURI } from '@/lib/data/products';
import { calculateOnlineMenu } from '@/lib/calculations/menuOnline';
import { calculateStatistics, getTopProfitableMenus, getBottomProfitableMenus } from '@/lib/calculations/statistics';
import { MENU_COSTS } from '@/lib/data/constants';
import { Product, MenuCalculation } from '@/types';

interface Simulation {
  ciorba: string;
  felPrincipal: string;
  garnitura: string;
  costProduse: number;
  costAmbalaj: number;
  comision: number;
  costTotal: number;
  profit: number;
  marjaProfit: number;
  pretIndividual: number;
  economie: number;
}

const MenuCalculator = () => {
  const [pretVanzare, setPretVanzare] = useState<number>(35);

  const simulari = useMemo<Simulation[]>(() => {
    const result: Simulation[] = [];
    
    CIORBE.forEach(ciorba => {
      FEL_PRINCIPAL.forEach(fel => {
        GARNITURI.forEach(garnitura => {
          const products = [ciorba, fel, garnitura];
          const calc = calculateOnlineMenu(pretVanzare, products);
          
          result.push({
            ciorba: ciorba.nume,
            felPrincipal: fel.nume,
            garnitura: garnitura.nume,
            costProduse: calc.costProduse,
            costAmbalaj: calc.costAmbalaj,
            comision: calc.comision,
            costTotal: calc.costTotal,
            profit: calc.profit,
            marjaProfit: calc.marjaProfit,
            pretIndividual: calc.pretIndividual,
            economie: calc.economie
          });
        });
      });
    });
    
    return result;
  }, [pretVanzare]);

  const stats = useMemo(() => {
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
      economic: simulari.filter(s => s.costTotal < 15).length,
      mediu: simulari.filter(s => s.costTotal >= 15 && s.costTotal < 20).length,
      premium: simulari.filter(s => s.costTotal >= 20).length
    };
  }, [simulari]);

  const topMeniuri = useMemo(() => {
    const sorted = [...simulari].sort((a, b) => b.marjaProfit - a.marjaProfit);
    return {
      top: sorted.slice(0, 5),
      bottom: sorted.slice(-5).reverse()
    };
  }, [simulari]);

  const ProductList = ({ products, colorClass }: { products: Product[], colorClass: string }) => (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {products.map((item, idx) => (
        <div 
          key={idx}
          className={`flex justify-between p-3 ${colorClass} rounded-xl border hover:shadow-md transition-shadow`}
        >
          <div>
            <span className="text-sm font-medium text-gray-800">{item.nume}</span>
            <span className="text-xs text-gray-600 block">{item.cantitate}</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-gray-900 block">{item.pretCost.toFixed(2)} lei</span>
            <span className="text-xs text-gray-600">cost</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-[#BBDCFF] via-white to-[#9eff55]">
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

      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border-4 border-black">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="inline-block px-4 py-2 bg-[#FFC857] rounded-full text-black text-sm font-bold mb-3 border-2 border-black">
                📊 CALCULATOR PROFESIONAL - MENIU ONLINE
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-black mb-2 tracking-tight">PREȚ MENIU DELIVERY</h1>
              <p className="text-gray-700 font-semibold">Optimizare prețuri pentru <strong>Clientii ZED-ZEN</strong></p>
              <p className="text-sm text-gray-600 mt-2">Includes: Ambalaj (3 LEI) + Comision (36.3%)</p>
            </div>
            <div className="px-6 py-3 bg-black rounded-2xl text-white border-4 border-black">
              <p className="text-xs font-bold opacity-90">CLIENT</p>
              <p className="text-xl font-black">CLIENTII ZED-ZEN</p>
            </div>
          </div>
        </div>

        {/* Price Control */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border-4 border-black">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black mb-4 text-black tracking-tight">SETEAZĂ PREȚUL DE VÂNZARE</h2>
            <div className="inline-block px-8 py-6 bg-[#BBDCFF] rounded-3xl shadow-xl mb-4 border-4 border-black">
              <p className="text-black text-sm font-bold opacity-90">PREȚ PER MENIU</p>
              <p className="text-black text-5xl font-black">{pretVanzare.toFixed(2)} <span className="text-3xl">LEI</span></p>
            </div>
          </div>
          <input 
            type="range" 
            min={MENU_COSTS.ONLINE.MIN_PRICE}
            max={MENU_COSTS.ONLINE.MAX_PRICE}
            step={MENU_COSTS.ONLINE.STEP}
            value={pretVanzare} 
            onChange={(e) => setPretVanzare(parseFloat(e.target.value))}
            className="w-full h-4 bg-[#9eff55] rounded-lg cursor-pointer border-2 border-black"
            style={{
              accentColor: '#9eff55'
            }}
          />
          <div className="flex justify-between text-sm font-bold text-black mt-2">
            <span>{MENU_COSTS.ONLINE.MIN_PRICE} LEI</span>
            <span>{MENU_COSTS.ONLINE.MAX_PRICE} LEI</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: '📦', label: 'COMBINAȚII', value: simulari.length.toLocaleString(), sub: `${CIORBE.length}×${FEL_PRINCIPAL.length}×${GARNITURI.length}`, color: '#FFC857' },
            { icon: '📈', label: 'MARJĂ MEDIE', value: `${stats.marjaMedie.toFixed(1)}%`, sub: `${stats.marjaMin.toFixed(0)}%-${stats.marjaMax.toFixed(0)}%`, color: '#9eff55' },
            { icon: '💰', label: 'PROFIT MEDIU', value: `${stats.profitMediu.toFixed(2)}`, sub: 'LEI PER MENIU', color: '#BBDCFF' },
            { icon: '✅', label: 'PROFITABILE', value: stats.profitabile, sub: `${((stats.profitabile/simulari.length)*100).toFixed(1)}%`, color: '#EBEBEB' }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-xl hover:scale-105 transition-transform border-4 border-black" style={{backgroundColor: stat.color}}>
              <div className="flex justify-between mb-4">
                <div className="text-4xl">{stat.icon}</div>
                <p className="text-3xl font-black text-black">{stat.value}</p>
              </div>
              <p className="text-sm font-black text-black">{stat.label}</p>
              <p className="text-xs font-bold text-gray-800 mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Products List */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border-4 border-black">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black mb-2 text-black tracking-tight">📋 PRODUSE DISPONIBILE</h2>
            <p className="text-gray-700 font-semibold">Toate produsele incluse în calculul prețurilor</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4 bg-[#FFC857] p-3 rounded-xl border-2 border-black">
                <div className="text-3xl">🍲</div>
                <h3 className="text-lg font-black text-black">CIORBE ({CIORBE.length})</h3>
              </div>
              <ProductList products={CIORBE} colorClass="bg-[#FFC857]/30 border-[#FFC857]" />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4 bg-[#BBDCFF] p-3 rounded-xl border-2 border-black">
                <div className="text-3xl">🍖</div>
                <h3 className="text-lg font-black text-black">FELURI PRINCIPALE ({FEL_PRINCIPAL.length})</h3>
              </div>
              <ProductList products={FEL_PRINCIPAL} colorClass="bg-[#BBDCFF]/30 border-[#BBDCFF]" />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4 bg-[#9eff55] p-3 rounded-xl border-2 border-black">
                <div className="text-3xl">🥔</div>
                <h3 className="text-lg font-black text-black">GARNITURI ({GARNITURI.length})</h3>
              </div>
              <ProductList products={GARNITURI} colorClass="bg-[#9eff55]/30 border-[#9eff55]" />
            </div>
          </div>
        </div>

        {/* Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
            <h3 className="text-2xl font-black mb-4 flex items-center gap-2 text-black">💵 ANALIZA COSTURILOR</h3>
            <div className="space-y-3">
              {[
                { label: 'COST MINIM', value: stats.costMin, color: '#9eff55' },
                { label: 'COST MEDIU', value: stats.costMediu, color: '#FFC857' },
                { label: 'COST MAXIM', value: stats.costMax, color: '#BBDCFF' }
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-2xl border-4 border-black flex justify-between" style={{backgroundColor: item.color}}>
                  <span className="font-black text-black">{item.label}</span>
                  <span className="text-xl font-black text-black">{item.value.toFixed(2)} LEI</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-[#EBEBEB] border-2 border-black rounded-2xl">
              <p className="text-sm font-bold text-black">📦 Ambalaj: {MENU_COSTS.ONLINE.PACKAGING_PER_MENU} LEI/meniu</p>
              <p className="text-sm font-bold text-black">💳 Comision: {MENU_COSTS.ONLINE.COMMISSION_PERCENTAGE}% din preț</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
            <h3 className="text-2xl font-black mb-4 flex items-center gap-2 text-black">📊 DISTRIBUȚIE MENIURI</h3>
            {[
              { label: 'ECONOMIC (<15 lei)', count: stats.economic, color: '#9eff55' },
              { label: 'MEDIU (15-20 lei)', count: stats.mediu, color: '#FFC857' },
              { label: 'PREMIUM (>20 lei)', count: stats.premium, color: '#BBDCFF' }
            ].map((item, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="font-black flex items-center gap-2 text-black">
                    <span className="w-4 h-4 rounded-full border-2 border-black" style={{backgroundColor: item.color}}></span>
                    {item.label}
                  </span>
                  <span className="text-sm font-bold text-black">{item.count} ({((item.count/simulari.length)*100).toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-[#EBEBEB] rounded-full h-4 border-2 border-black overflow-hidden">
                  <div 
                    className="h-4 transition-all duration-700" 
                    style={{width: `${(item.count/simulari.length)*100}%`, backgroundColor: item.color}}
                  ></div>
                </div>
              </div>
            ))}
            <div className="mt-6 p-5 bg-[#9eff55] rounded-2xl border-4 border-black">
              <p className="text-sm font-bold text-black">MENIURI CU MARJĂ ≥ 100%</p>
              <p className="text-3xl font-black text-black">{stats.profitabile} DIN {simulari.length}</p>
            </div>
          </div>
        </div>

        {/* Top Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {[
            { title: '🏆 TOP 5 PROFITABILE', items: topMeniuri.top, positive: true },
            { title: '⚠️ TOP 5 NEPROFITABILE', items: topMeniuri.bottom, positive: false }
          ].map((section, idx) => (
            <div key={idx} className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
              <h3 className={`text-2xl font-black mb-4 ${section.positive ? 'text-[#9eff55]' : 'text-black'}`} style={{WebkitTextStroke: '1px black'}}>{section.title}</h3>
              <div className="space-y-3">
                {section.items.map((m, i) => (
                  <div 
                    key={i} 
                    className={`p-4 rounded-2xl border-4 border-black ${
                      m.marjaProfit >= 100 
                        ? 'bg-[#9eff55]' 
                        : m.profit < 0 
                        ? 'bg-[#BBDCFF]' 
                        : 'bg-[#FFC857]'
                    }`}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="px-3 py-1 bg-black text-white rounded-full text-sm font-black">
                        #{i+1}
                      </span>
                      <span className="text-lg font-black text-black">{m.marjaProfit.toFixed(1)}%</span>
                    </div>
                    <p className="text-xs font-bold text-black"><strong>Ciorbă:</strong> {m.ciorba}</p>
                    <p className="text-xs font-bold text-black"><strong>Fel:</strong> {m.felPrincipal}</p>
                    <p className="text-xs font-bold text-black"><strong>Garnitură:</strong> {m.garnitura}</p>
                    <div className="mt-2 pt-2 border-t-2 border-black flex justify-between text-xs font-black">
                      <span>COST: {m.costTotal.toFixed(2)} LEI</span>
                      <span className={m.profit >= 0 ? 'text-black' : 'text-black'}>
                        {m.profit >= 0 ? '+' : ''}{m.profit.toFixed(2)} LEI
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div className="bg-[#BBDCFF] rounded-3xl shadow-2xl p-8 border-4 border-black mb-6">
          <h3 className="text-3xl font-black text-center mb-6 text-black tracking-tight">💡 RECOMANDĂRI PRICING</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: '🛡️ CONSERVATOR', price: stats.costMediu * 2.2, desc: 'MARJĂ ~120%', highlight: false, color: '#FFC857' },
              { label: '⭐ OPTIM', price: stats.costMediu * 2, desc: 'MARJĂ ~100%', highlight: true, color: '#9eff55' },
              { label: '🎯 COMPETITIV', price: stats.costMediu * 1.8, desc: 'MARJĂ ~80%', highlight: false, color: '#EBEBEB' }
            ].map((rec, i) => (
              <div 
                key={i} 
                className={`rounded-2xl p-6 hover:scale-105 transition-transform border-4 border-black ${
                  rec.highlight ? 'ring-4 ring-black' : ''
                }`}
                style={{backgroundColor: rec.color}}
              >
                {rec.highlight && (
                  <div className="text-center mb-2">
                    <span className="px-3 py-1 bg-black text-white rounded-full text-xs font-black">RECOMANDAT</span>
                  </div>
                )}
                <p className="text-center text-sm font-black mb-2 text-black">{rec.label}</p>
                <p className="text-center text-3xl font-black mb-2 text-black">{rec.price.toFixed(2)} LEI</p>
                <p className="text-center text-xs font-bold text-black">{rec.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-4 text-center text-sm font-bold text-black border-2 border-black">
            La <strong>{pretVanzare.toFixed(2)} LEI</strong>, ai marjă medie <strong>{stats.marjaMedie.toFixed(1)}%</strong> și{' '}
            <strong>{((stats.profitabile/simulari.length)*100).toFixed(1)}%</strong> meniuri profitabile.
            {stats.marjaMedie < 80 && (
              <><br/><br/>⚠️ Marja sub 80%. Consideră creșterea prețului!</>
            )}
            {stats.marjaMedie >= 100 && (
              <><br/><br/>✅ MARJĂ EXCELENTĂ!</>
            )}
          </div>
        </div>

        {/* Footer with ZED ZEN Branding */}
        <div className="bg-black rounded-3xl shadow-2xl p-8 text-white border-4 border-black">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="font-bold text-white mb-2">Calculator dezvoltat pentru <strong className="text-[#9eff55]">CLIENTII ZED-ZEN</strong></p>
              <p className="text-sm text-gray-400">© 2025 | Date actualizate: Octombrie 2025</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Powered by</p>
              <a 
                href="https://www.zed-zen.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white px-6 py-3 rounded-xl hover:scale-105 transition-transform border-2 border-white"
              >
                <div className="text-4xl font-black text-black" style={{fontFamily: 'Montserrat, sans-serif', letterSpacing: '-0.05em'}}>Z</div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-black tracking-widest">ZED</span>
                  <span className="text-xs font-black text-black tracking-widest">ZEN</span>
                </div>
              </a>
              <p className="text-xs text-gray-400 text-center">www.zed-zen.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuCalculator;