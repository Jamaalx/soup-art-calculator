'use client';

import React, { useState, useMemo } from 'react';
import { getProductsByCategory } from '@/lib/data/products';
import { MENU_COSTS } from '@/lib/data/constants';

const MenuCateringCalculator = () => {
  const [pretPerMeniu, setPretPerMeniu] = useState<number>(35);
  const [numarPersonae, setNumarPersonae] = useState<number>(50);
  const [selectedProducts, setSelectedProducts] = useState<{
    ciorba?: string;
    felPrincipal?: string;
    garnitura?: string;
  }>({});

  const products = useMemo(() => getProductsByCategory, []);

  const selectedProductDetails = useMemo(() => {
    const details: any = {};
    if (selectedProducts.ciorba) {
      details.ciorba = products.ciorbe.find(p => p.id === selectedProducts.ciorba);
    }
    if (selectedProducts.felPrincipal) {
      details.felPrincipal = products.fel_Principal.find(p => p.id === selectedProducts.felPrincipal);
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

    // Volume discount
    let discount = 0;
    if (numarPersonae >= 200) discount = 0.15;
    else if (numarPersonae >= 100) discount = 0.10;
    else if (numarPersonae >= 50) discount = 0.05;

    const costPerMeniu = 
      selectedProductDetails.ciorba.pretCost +
      selectedProductDetails.felPrincipal.pretCost +
      selectedProductDetails.garnitura.pretCost;

    const pretCuDiscount = pretPerMeniu * (1 - discount);
    
    // Additional costs
    const costTransport = 200; // flat fee
    const costPersonal = Math.ceil(numarPersonae / 25) * 150; // 1 staff per 25 people
    const costEchipament = numarPersonae * 5; // 5 lei per person
    
    const totalCosturiAdditionale = costTransport + costPersonal + costEchipament;
    const costuriAditionalePerMeniu = totalCosturiAdditionale / numarPersonae;
    
    const costTotalPerMeniu = costPerMeniu + costuriAditionalePerMeniu;
    const profitPerMeniu = pretCuDiscount - costTotalPerMeniu;
    const profitTotal = profitPerMeniu * numarPersonae;
    const marjaProfit = (profitPerMeniu / costTotalPerMeniu) * 100;

    return {
      costPerMeniu,
      discount,
      pretCuDiscount,
      costTransport,
      costPersonal,
      costEchipament,
      totalCosturiAdditionale,
      costuriAditionalePerMeniu,
      costTotalPerMeniu,
      profitPerMeniu,
      profitTotal,
      marjaProfit,
      pretTotal: pretCuDiscount * numarPersonae,
    };
  }, [selectedProductDetails, pretPerMeniu, numarPersonae]);

  return (
    <div>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
        body {
          font-family: 'Montserrat', sans-serif;
        }
      `}</style>

      {/* Header */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border-4 border-black">
        <span className="inline-block px-4 py-2 bg-[#FFB6C1] rounded-full text-black text-sm font-bold mb-3 border-2 border-black">
          🎉 CALCULATOR CATERING - EVENIMENTE
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-black mb-2 tracking-tight">
          CATERING CORPORATE
        </h1>
        <p className="text-gray-700 font-semibold">
          Evenimente 10-500 persoane cu reduceri pe volum
        </p>
        <p className="text-sm text-gray-600 font-semibold mt-2">
          Include: Transport + Personal + Echipamente
        </p>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Price Control */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
          <h2 className="text-xl font-black mb-4 text-black">💰 PREȚ PER MENIU</h2>
          <div className="text-center mb-4">
            <div className="inline-block px-6 py-4 bg-[#BBDCFF] rounded-2xl shadow-xl border-4 border-black">
              <p className="text-3xl font-black text-black">{pretPerMeniu.toFixed(2)} LEI</p>
            </div>
          </div>
          <input 
            type="range" 
            min="20" 
            max="100" 
            step="0.5" 
            value={pretPerMeniu} 
            onChange={(e) => setPretPerMeniu(parseFloat(e.target.value))}
            className="w-full h-4 bg-[#9eff55] rounded-lg cursor-pointer border-2 border-black"
          />
          <div className="flex justify-between text-xs font-bold text-black mt-2">
            <span>20</span>
            <span>100</span>
          </div>
        </div>

        {/* People Count */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
          <h2 className="text-xl font-black mb-4 text-black">👥 NUMĂR PERSOANE</h2>
          <div className="text-center mb-4">
            <div className="inline-block px-6 py-4 bg-[#FFC857] rounded-2xl shadow-xl border-4 border-black">
              <p className="text-3xl font-black text-black">{numarPersonae}</p>
            </div>
          </div>
          <input 
            type="range" 
            min="10" 
            max="500" 
            step="5" 
            value={numarPersonae} 
            onChange={(e) => setNumarPersonae(parseInt(e.target.value))}
            className="w-full h-4 bg-[#FFB6C1] rounded-lg cursor-pointer border-2 border-black"
          />
          <div className="flex justify-between text-xs font-bold text-black mt-2">
            <span>10</span>
            <span>500</span>
          </div>
          
          {/* Discount Badge */}
          {numarPersonae >= 50 && (
            <div className="mt-4 text-center">
              <span className="inline-block px-4 py-2 bg-[#9eff55] rounded-full text-black text-sm font-black border-2 border-black">
                🎊 REDUCERE:{' '}
                {numarPersonae >= 200 ? '15%' : numarPersonae >= 100 ? '10%' : '5%'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Product Selection */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border-4 border-black">
        <h2 className="text-2xl font-black mb-6 text-black">🍽️ SELECTEAZĂ MENIUL</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Ciorbe */}
          <div>
            <label className="block text-sm font-black text-black mb-3">🍲 CIORBĂ</label>
            <select
              value={selectedProducts.ciorba || ''}
              onChange={(e) => setSelectedProducts({...selectedProducts, ciorba: e.target.value})}
              className="w-full px-4 py-3 border-4 border-black rounded-xl font-bold text-sm"
            >
              <option value="">Selectează...</option>
              {products.ciorbe.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nume} - {p.pretCost.toFixed(2)} LEI
                </option>
              ))}
            </select>
          </div>

          {/* Fel Principal */}
          <div>
            <label className="block text-sm font-black text-black mb-3">🍖 FEL PRINCIPAL</label>
            <select
              value={selectedProducts.felPrincipal || ''}
              onChange={(e) => setSelectedProducts({...selectedProducts, felPrincipal: e.target.value})}
              className="w-full px-4 py-3 border-4 border-black rounded-xl font-bold text-sm"
            >
              <option value="">Selectează...</option>
              {products.felPrincipal.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nume} - {p.pretCost.toFixed(2)} LEI
                </option>
              ))}
            </select>
          </div>

          {/* Garnitura */}
          <div>
            <label className="block text-sm font-black text-black mb-3">🥔 GARNITURĂ</label>
            <select
              value={selectedProducts.garnitura || ''}
              onChange={(e) => setSelectedProducts({...selectedProducts, garnitura: e.target.value})}
              className="w-full px-4 py-3 border-4 border-black rounded-xl font-bold text-sm"
            >
              <option value="">Selectează...</option>
              {products.garnituri.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nume} - {p.pretCost.toFixed(2)} LEI
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {calculation && (
        <>
          {/* Cost Breakdown */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border-4 border-black">
            <h2 className="text-2xl font-black mb-6 text-black">💵 DEFALCARE COSTURI</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-[#FFC857] p-4 rounded-xl border-4 border-black">
                <p className="text-xs font-bold text-black mb-1">COST PRODUSE/MENIU</p>
                <p className="text-2xl font-black text-black">{calculation.costPerMeniu.toFixed(2)} LEI</p>
              </div>
              
              <div className="bg-[#BBDCFF] p-4 rounded-xl border-4 border-black">
                <p className="text-xs font-bold text-black mb-1">COSTURI ADIȚIONALE/MENIU</p>
                <p className="text-2xl font-black text-black">{calculation.costuriAditionalePerMeniu.toFixed(2)} LEI</p>
              </div>
            </div>

            <div className="bg-[#EBEBEB] p-6 rounded-2xl border-2 border-black mb-4">
              <h3 className="text-sm font-black mb-3 text-black">COSTURI FIXE CATERING:</h3>
              <div className="grid grid-cols-3 gap-3 text-sm font-bold text-black">
                <div>
                  <p className="text-xs opacity-75">Transport:</p>
                  <p className="text-lg font-black">{calculation.costTransport} LEI</p>
                </div>
                <div>
                  <p className="text-xs opacity-75">Personal ({Math.ceil(numarPersonae / 25)}):</p>
                  <p className="text-lg font-black">{calculation.costPersonal} LEI</p>
                </div>
                <div>
                  <p className="text-xs opacity-75">Echipament:</p>
                  <p className="text-lg font-black">{calculation.costEchipament} LEI</p>
                </div>
              </div>
            </div>

            <div className="bg-black p-4 rounded-xl text-center">
              <p className="text-sm font-bold text-white mb-1">COST TOTAL/MENIU</p>
              <p className="text-3xl font-black text-white">{calculation.costTotalPerMeniu.toFixed(2)} LEI</p>
            </div>
          </div>

          {/* Final Results */}
          <div className="bg-gradient-to-r from-[#9eff55] to-[#FFC857] rounded-3xl shadow-2xl p-8 border-4 border-black">
            <h2 className="text-2xl font-black mb-6 text-black text-center">📊 REZULTATE FINALE</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border-4 border-black text-center">
                <p className="text-xs font-bold text-black mb-1">PREȚ/MENIU</p>
                <p className="text-2xl font-black text-black">{calculation.pretCuDiscount.toFixed(2)} LEI</p>
                {calculation.discount > 0 && (
                  <p className="text-xs text-green-600 font-bold">-{(calculation.discount * 100).toFixed(0)}%</p>
                )}
              </div>
              
              <div className="bg-white p-4 rounded-xl border-4 border-black text-center">
                <p className="text-xs font-bold text-black mb-1">PROFIT/MENIU</p>
                <p className={`text-2xl font-black ${calculation.profitPerMeniu >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {calculation.profitPerMeniu >= 0 ? '+' : ''}{calculation.profitPerMeniu.toFixed(2)} LEI
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-xl border-4 border-black text-center">
                <p className="text-xs font-bold text-black mb-1">MARJĂ PROFIT</p>
                <p className={`text-2xl font-black ${calculation.marjaProfit >= 100 ? 'text-green-600' : calculation.marjaProfit >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {calculation.marjaProfit.toFixed(1)}%
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-xl border-4 border-black text-center">
                <p className="text-xs font-bold text-black mb-1">PROFIT TOTAL</p>
                <p className={`text-2xl font-black ${calculation.profitTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {calculation.profitTotal >= 0 ? '+' : ''}{calculation.profitTotal.toFixed(2)} LEI
                </p>
              </div>
            </div>

            <div className="bg-black p-6 rounded-2xl text-center">
              <p className="text-sm font-bold text-white mb-2">VALOARE TOTALĂ CONTRACT</p>
              <p className="text-4xl font-black text-[#9eff55]">{calculation.pretTotal.toFixed(2)} LEI</p>
              <p className="text-sm text-gray-400 font-bold mt-2">
                {numarPersonae} persoane × {calculation.pretCuDiscount.toFixed(2)} LEI
              </p>
            </div>
          </div>
        </>
      )}

      {!calculation && (
        <div className="bg-white rounded-3xl shadow-2xl p-12 border-4 border-black text-center">
          <div className="text-6xl mb-4">🎊</div>
          <p className="text-xl font-black text-gray-600">
            Selectează toate produsele pentru calcul
          </p>
        </div>
      )}
    </div>
  );
};

export default MenuCateringCalculator;