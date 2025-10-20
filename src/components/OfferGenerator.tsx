'use client';

import React, { useState } from 'react';
import type { Product, FixedMenuCombo, MenuCombination } from '@/types';
import MeniuFixBuilder from './MenuFixBuilder';
import MeniuVariatiiBuilder from './MeniuVariatiiBuilder';
import jsPDF from 'jspdf';
import { getCategoryLabel } from '@/lib/data/categories';

interface OfferGeneratorProps {
  products: Product[];
}

type MenuType = 'fix' | 'variatii';

interface MenuData {
  type: MenuType;
  combos?: FixedMenuCombo[];
  selectedCombo?: FixedMenuCombo;
  combinations?: MenuCombination[];
  selectedCombinations?: MenuCombination[];
}

const OfferGenerator: React.FC<OfferGeneratorProps> = ({ products }) => {
  const [activeMenu, setActiveMenu] = useState<MenuType>('fix');
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  
  // Client form data
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [offerName, setOfferName] = useState('');
  const [portions, setPortions] = useState(10);
  const [offerType, setOfferType] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Helper to remove diacritics
  const removeDiacritics = (str: string): string => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  const handleGeneratePDF = () => {
    if (!clientName.trim() || !offerName.trim()) {
      alert('Te rog completeaza numele clientului si numele ofertei!');
      return;
    }

    if (!menuData || (activeMenu === 'fix' && !menuData.selectedCombo) || 
        (activeMenu === 'variatii' && (!menuData.selectedCombinations || menuData.selectedCombinations.length === 0))) {
      alert('Te rog selecteaza cel putin un meniu inainte de a genera PDF-ul!');
      return;
    }

    const doc = new jsPDF();
    
    // Colors
    const darkGray: [number, number, number] = [45, 55, 72];
    const accentBlue: [number, number, number] = [59, 130, 246];
    const lightGray: [number, number, number] = [156, 163, 175];
    
    // Header
    doc.setFillColor(249, 250, 251);
    doc.rect(0, 0, 210, 65, 'F');
    
    // ZED-ZEN Logo
    doc.setFillColor(...darkGray);
    doc.rect(15, 15, 25, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Z', 27.5, 32, { align: 'center' });
    
    // Title
    doc.setTextColor(...darkGray);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(removeDiacritics('OFERTA COMERCIALA'), 50, 25);
    
    // ZED-ZEN Tagline
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...lightGray);
    doc.text('AUTOMATE YOUR HORECA BUSINESS', 50, 32);
    
    // Date info
    const today = new Date();
    const validUntil = new Date(today);
    validUntil.setDate(validUntil.getDate() + 30);
    doc.setFontSize(9);
    doc.text(`Data: ${today.toLocaleDateString('ro-RO')}`, 50, 40);
    doc.text(removeDiacritics(`Valabila pana la: ${validUntil.toLocaleDateString('ro-RO')}`), 50, 45);
    
    // From (User company info)
    doc.setFontSize(8);
    doc.setTextColor(...darkGray);
    doc.text(removeDiacritics('Oferta de la: [NUME COMPANIE USER]'), 50, 52);
    doc.text('Contact: [EMAIL/TELEFON USER]', 50, 57);
    
    // Client Info Box
    let yPos = 75;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...lightGray);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, yPos, 180, clientAddress ? 25 : 20, 3, 3, 'FD');
    
    yPos += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);
    doc.text(removeDiacritics('CATRE:'), 20, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.text(removeDiacritics(clientName), 35, yPos);
    yPos += 5;
    
    if (clientContact) {
      doc.text(removeDiacritics(`Contact: ${clientContact}`), 35, yPos);
      yPos += 5;
    }
    if (clientAddress) {
      doc.text(removeDiacritics(`Adresa: ${clientAddress}`), 35, yPos);
      yPos += 5;
    }
    yPos += 10;
    
    // Offer Title
    doc.setDrawColor(...lightGray);
    doc.line(15, yPos, 195, yPos);
    yPos += 12;
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);
    doc.text(removeDiacritics(offerName.toUpperCase()), 15, yPos);
    yPos += 8;
    
    // Offer Type Label
    const offerTypeLabels = {
      daily: 'Oferta Zilnica',
      weekly: 'Oferta Saptamanala', 
      monthly: 'Oferta Lunara'
    };
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...lightGray);
    doc.text(removeDiacritics(offerTypeLabels[offerType]), 15, yPos);
    yPos += 15;
    
    // Menu Details Section
    doc.setFillColor(249, 250, 251);
    doc.rect(15, yPos - 5, 180, 40, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);
    doc.text('DETALII MENIU:', 20, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(removeDiacritics(`Tip: ${activeMenu === 'fix' ? 'Meniu Fix' : 'Meniu cu Variatii'}`), 20, yPos);
    yPos += 7;

    // Add menu composition details
    if (activeMenu === 'fix' && menuData.selectedCombo) {
      const combo = menuData.selectedCombo;
      doc.setFont('helvetica', 'bold');
      doc.text(removeDiacritics(`Combo: ${combo.name}`), 20, yPos);
      yPos += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      combo.products.forEach((item) => {
        doc.text(removeDiacritics(`  - ${getCategoryLabel(item.category)}: ${item.productName}`), 20, yPos);
        yPos += 4;
      });
      yPos += 3;
      
      doc.setFontSize(10);
      doc.text(`Pret per meniu: ${combo.comboPrice.toFixed(2)} lei`, 20, yPos);
      yPos += 5;
      doc.text(`Cost per meniu: ${combo.totalCost.toFixed(2)} lei`, 20, yPos);
      yPos += 5;
      doc.text(`Marja profit: ${combo.marjaProfit.toFixed(1)}%`, 20, yPos);
      
    } else if (activeMenu === 'variatii' && menuData.selectedCombinations) {
      doc.setFont('helvetica', 'bold');
      doc.text(removeDiacritics(`Variatii selectate: ${menuData.selectedCombinations.length}`), 20, yPos);
      yPos += 5;
      
      // Show average menu price
      const avgPrice = menuData.selectedCombinations.reduce((sum, c) => sum + c.pretMeniu, 0) / menuData.selectedCombinations.length;
      const avgCost = menuData.selectedCombinations.reduce((sum, c) => sum + c.costTotal, 0) / menuData.selectedCombinations.length;
      const avgMargin = menuData.selectedCombinations.reduce((sum, c) => sum + c.marjaProfit, 0) / menuData.selectedCombinations.length;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Pret mediu per meniu: ${avgPrice.toFixed(2)} lei`, 20, yPos);
      yPos += 5;
      doc.text(`Cost mediu per meniu: ${avgCost.toFixed(2)} lei`, 20, yPos);
      yPos += 5;
      doc.text(`Marja medie: ${avgMargin.toFixed(1)}%`, 20, yPos);
    }
    
    yPos += 15;
    doc.text(`Numar de portii: ${portions}`, 20, yPos);
    
    yPos += 20;
    
    // Total Calculation
    let menuPrice = 0;
    if (activeMenu === 'fix' && menuData.selectedCombo) {
      menuPrice = menuData.selectedCombo.comboPrice;
    } else if (activeMenu === 'variatii' && menuData.selectedCombinations) {
      menuPrice = menuData.selectedCombinations.reduce((sum, c) => sum + c.pretMeniu, 0) / menuData.selectedCombinations.length;
    }
    
    const totalPerDay = menuPrice * portions;
    let totalAmount = totalPerDay;
    let daysLabel = '';
    
    if (offerType === 'weekly') {
      totalAmount = totalPerDay * 7;
      daysLabel = '(7 zile)';
    } else if (offerType === 'monthly') {
      totalAmount = totalPerDay * 30;
      daysLabel = '(30 zile)';
    }
    
    doc.setDrawColor(...lightGray);
    doc.line(15, yPos, 195, yPos);
    yPos += 15;
    
    // Summary Box
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(15, yPos - 5, 180, 50, 3, 3, 'F');
    
    // Total Price (Large)
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...accentBlue);
    doc.text(`${totalAmount.toFixed(2)} lei`, 105, yPos + 18, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...lightGray);
    doc.text(removeDiacritics(`Pret total ${daysLabel}`), 105, yPos + 26, { align: 'center' });
    
    // Breakdown
    yPos += 40;
    doc.setFontSize(9);
    doc.setTextColor(...darkGray);
    doc.text(`${menuPrice.toFixed(2)} lei/meniu`, 25, yPos);
    doc.text(`x ${portions} portii`, 105, yPos, { align: 'center' });
    if (offerType !== 'daily') {
      doc.text(daysLabel, 185, yPos, { align: 'right' });
    }
    
    // Terms
    yPos += 15;
    doc.setDrawColor(...lightGray);
    doc.line(15, yPos, 195, yPos);
    yPos += 8;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(removeDiacritics('Termeni si conditii:'), 15, yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...lightGray);
    const terms = [
      removeDiacritics('Oferta este valabila 30 de zile de la data emiterii'),
      removeDiacritics('Preturile includ TVA'),
      'Livrare conform programului stabilit',
      'Plata la livrare sau conform acordului'
    ];
    
    terms.forEach(term => {
      doc.text(`• ${term}`, 15, yPos);
      yPos += 4;
    });
    
    // Footer
    doc.setDrawColor(...lightGray);
    doc.setLineWidth(0.3);
    doc.line(15, 280, 195, 280);
    
    doc.setFontSize(8);
    doc.setTextColor(...lightGray);
    doc.text('Powered by ZED-ZEN | www.zed-zen.com', 15, 285);
    doc.text('Pagina 1 din 1', 195, 285, { align: 'right' });
    
    // Save
    const fileName = `oferta_${offerName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.pdf`;
    doc.save(fileName);
    
    // Close modal
    setShowPdfModal(false);
    
    // Reset form
    setClientName('');
    setClientContact('');
    setClientAddress('');
    setOfferName('');
    setPortions(10);
  };

  // Callback to receive menu data from builders
  const handleMenuDataUpdate = (data: MenuData) => {
    setMenuData(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="inline-block px-4 py-2 bg-[#9eff55] rounded-full text-black text-sm font-bold mb-3 border-2 border-black">
              📄 GENERATOR OFERTE
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-black mb-2 tracking-tight">
              OFERTE CLIENTI
            </h1>
            <p className="text-gray-700 font-semibold">
              Genereaza oferte profesionale PDF pentru clienti
            </p>
          </div>
          <button
            onClick={() => setShowPdfModal(true)}
            disabled={!menuData}
            className={`px-8 py-4 rounded-2xl border-4 border-black font-black text-xl transition-all shadow-xl ${
              menuData
                ? 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
            }`}
          >
            📄 GENEREAZA PDF
          </button>
        </div>
      </div>

      {/* Menu Type Toggle */}
      <div className="bg-white rounded-3xl shadow-2xl p-6 border-4 border-black">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              setActiveMenu('fix');
              setMenuData(null);
            }}
            className={`py-4 px-6 rounded-2xl border-4 border-black font-black text-lg transition-all ${
              activeMenu === 'fix'
                ? 'bg-[#9eff55] text-black scale-105'
                : 'bg-white text-black hover:bg-green-100'
            }`}
          >
            🔒 MENIU FIX
          </button>
          
          <button
            onClick={() => {
              setActiveMenu('variatii');
              setMenuData(null);
            }}
            className={`py-4 px-6 rounded-2xl border-4 border-black font-black text-lg transition-all ${
              activeMenu === 'variatii'
                ? 'bg-[#9eff55] text-black scale-105'
                : 'bg-white text-black hover:bg-green-100'
            }`}
          >
            🎨 MENIU VARIATII
          </button>
        </div>
      </div>

      {/* Calculator Content */}
      <div>
        {activeMenu === 'fix' && (
          <MeniuFixBuilder 
            products={products} 
            calculatorType="online"
            onMenuUpdate={handleMenuDataUpdate}
          />
        )}
        
        {activeMenu === 'variatii' && (
          <MeniuVariatiiBuilder 
            products={products} 
            calculatorType="online"
            onMenuUpdate={handleMenuDataUpdate}
          />
        )}
      </div>

      {/* PDF Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-black max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-black mb-6 text-black">
              📄 DETALII OFERTA PDF
            </h2>

            {/* Offer Name */}
            <div className="mb-4">
              <label className="block text-sm font-black text-black mb-2">
                NUME OFERTA *
              </label>
              <input
                type="text"
                value={offerName}
                onChange={(e) => setOfferName(e.target.value)}
                placeholder="Ex: Pachet Saptamanal Premium"
                className="w-full p-3 rounded-xl border-2 border-black font-bold text-black"
              />
            </div>

            {/* Client Info */}
            <div className="mb-6 p-4 bg-blue-50 rounded-2xl border-2 border-black">
              <p className="text-sm font-black text-black mb-3">
                INFORMATII CLIENT *
              </p>
              
              <div className="space-y-3">
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nume Client *"
                  className="w-full p-2 rounded-lg border-2 border-gray-300 font-bold text-black text-sm"
                />
                
                <input
                  type="text"
                  value={clientContact}
                  onChange={(e) => setClientContact(e.target.value)}
                  placeholder="Contact (optional)"
                  className="w-full p-2 rounded-lg border-2 border-gray-300 font-bold text-black text-sm"
                />
                
                <input
                  type="text"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="Adresa (optional)"
                  className="w-full p-2 rounded-lg border-2 border-gray-300 font-bold text-black text-sm"
                />
              </div>
            </div>

            {/* Offer Type */}
            <div className="mb-4">
              <label className="block text-sm font-black text-black mb-2">
                TIP OFERTA
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'daily' as const, label: 'ZILNIC' },
                  { value: 'weekly' as const, label: 'SAPTAMANAL' },
                  { value: 'monthly' as const, label: 'LUNAR' }
                ].map(type => (
                  <button
                    key={type.value}
                    onClick={() => setOfferType(type.value)}
                    className={`py-2 px-4 rounded-xl border-2 border-black font-bold text-sm ${
                      offerType === type.value
                        ? 'bg-green-500 text-white'
                        : 'bg-white text-black'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Portions */}
            <div className="mb-6">
              <label className="block text-sm font-black text-black mb-2">
                NUMAR PORTII: {portions}
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={portions}
                onChange={(e) => setPortions(parseInt(e.target.value))}
                className="w-full h-3 bg-green-300 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs font-bold text-black mt-1">
                <span>5</span>
                <span>50</span>
              </div>
            </div>

            {/* Menu Preview */}
            {menuData && (
              <div className="mb-6 p-4 bg-yellow-50 rounded-2xl border-2 border-black">
                <p className="text-sm font-black text-black mb-2">MENIU SELECTAT:</p>
                {activeMenu === 'fix' && menuData.selectedCombo && (
                  <div>
                    <p className="text-xs font-bold text-black mb-1">{menuData.selectedCombo.name}</p>
                    <p className="text-xs font-bold text-black">Pret: {menuData.selectedCombo.comboPrice.toFixed(2)} LEI</p>
                    <p className="text-xs font-bold text-gray-700">
                      {menuData.selectedCombo.products.length} produse
                    </p>
                  </div>
                )}
                {activeMenu === 'variatii' && menuData.selectedCombinations && (
                  <div>
                    <p className="text-xs font-bold text-black mb-1">
                      {menuData.selectedCombinations.length} variatii selectate
                    </p>
                    <p className="text-xs font-bold text-gray-700">
                      Pret mediu: {(menuData.selectedCombinations.reduce((sum, c) => sum + c.pretMeniu, 0) / menuData.selectedCombinations.length).toFixed(2)} LEI
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Preview */}
            {menuData && (
              <div className="mb-6 p-4 bg-gray-100 rounded-2xl border-2 border-black">
                <p className="text-xs font-black text-black mb-2">PREVIEW:</p>
                {(() => {
                  let menuPrice = 0;
                  if (activeMenu === 'fix' && menuData.selectedCombo) {
                    menuPrice = menuData.selectedCombo.comboPrice;
                  } else if (activeMenu === 'variatii' && menuData.selectedCombinations) {
                    menuPrice = menuData.selectedCombinations.reduce((sum, c) => sum + c.pretMeniu, 0) / menuData.selectedCombinations.length;
                  }
                  const dailyTotal = menuPrice * portions;
                  return (
                    <p className="text-sm font-bold text-black">
                      {menuPrice.toFixed(2)} lei/meniu x {portions} portii = {dailyTotal.toFixed(2)} lei
                      {offerType === 'weekly' && ` x 7 zile = ${(dailyTotal * 7).toFixed(2)} lei`}
                      {offerType === 'monthly' && ` x 30 zile = ${(dailyTotal * 30).toFixed(2)} lei`}
                    </p>
                  );
                })()}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleGeneratePDF}
                className="flex-1 py-3 bg-green-500 text-white rounded-xl border-2 border-black font-black hover:bg-green-600"
              >
                ✅ GENEREAZA PDF
              </button>
              <button
                onClick={() => setShowPdfModal(false)}
                className="flex-1 py-3 bg-gray-300 text-black rounded-xl border-2 border-black font-black hover:bg-gray-400"
              >
                ❌ ANULEAZA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferGenerator;