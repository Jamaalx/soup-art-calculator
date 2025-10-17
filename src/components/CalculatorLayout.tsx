'use client';

import React, { useState } from 'react';
import MenuCalculator from './MenuCalculator';
import MenuOfflineCalculator from './MenuOfflineCalculator';
import MenuFixCalculator from './MenuFixCalculator';
import MenuCateringCalculator from './MenuCateringCalculator';

type CalculatorType = 'online' | 'offline' | 'fix' | 'catering';

const CalculatorLayout = () => {
  const [activeTab, setActiveTab] = useState<CalculatorType>('online');

  const tabs = [
    { id: 'online' as CalculatorType, label: '🚚 ONLINE (Delivery)', icon: '📦' },
    { id: 'offline' as CalculatorType, label: '🏪 OFFLINE (Restaurant)', icon: '🍽️' },
    { id: 'fix' as CalculatorType, label: '📋 MENIU FIX', icon: '📋' },
    { id: 'catering' as CalculatorType, label: '🎉 CATERING', icon: '🎊' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
        body {
          font-family: 'Montserrat', sans-serif;
        }
      `}</style>

      {/* Header */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border-4 border-black">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black text-black mb-2 tracking-tight">
            Menu Calculator Pro
          </h1>
          <p className="text-gray-700 font-semibold">by ZED-ZEN</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-3xl shadow-2xl p-4 mb-6 border-4 border-black">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-6 py-4 rounded-2xl font-black text-sm md:text-base
                border-4 border-black transition-all hover:scale-105
                ${activeTab === tab.id 
                  ? 'bg-[#9eff55] text-black shadow-lg' 
                  : 'bg-[#EBEBEB] text-gray-700 hover:bg-[#BBDCFF]'
                }
              `}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">{tab.icon}</span>
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">{tab.label.split(' ')[0]}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Calculator Content */}
      <div className="animate-fadeIn">
        {activeTab === 'online' && <MenuCalculator />}
        {activeTab === 'offline' && <MenuOfflineCalculator />}
        {activeTab === 'fix' && <MenuFixCalculator />}
        {activeTab === 'catering' && <MenuCateringCalculator />}
      </div>

      {/* Footer */}
      <div className="bg-black rounded-3xl shadow-2xl p-8 mt-6 text-white border-4 border-black">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="font-bold text-white mb-2">
              Calculator dezvoltat pentru <strong className="text-[#9eff55]">CLIENTII ZED-ZEN</strong>
            </p>
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
  );
};

export default CalculatorLayout;