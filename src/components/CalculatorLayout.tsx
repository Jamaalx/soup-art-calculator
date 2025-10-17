'use client';

import React, { useState } from 'react';
import MenuCalculator from './MenuCalculator';
import MenuOfflineCalculator from './MenuOfflineCalculator';

type CalculatorMode = 'online' | 'offline';

const CalculatorLayout = () => {
  const [mode, setMode] = useState<CalculatorMode>('online');

  return (
    <div className="min-h-screen">
      {/* Navigation Toggle */}
      <div className="sticky top-0 z-50 bg-white border-b-4 border-black shadow-xl">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-black">Menu Calculator Pro</h1>
              <p className="text-sm text-gray-600">by ZED-ZEN</p>
            </div>
            <div className="flex gap-2 bg-[#EBEBEB] p-2 rounded-2xl border-4 border-black">
              <button
                onClick={() => setMode('online')}
                className={`px-6 py-3 rounded-xl font-black text-sm transition-all border-2 border-black ${
                  mode === 'online'
                    ? 'bg-[#BBDCFF] text-black scale-105 shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                🚚 ONLINE (Delivery)
              </button>
              <button
                onClick={() => setMode('offline')}
                className={`px-6 py-3 rounded-xl font-black text-sm transition-all border-2 border-black ${
                  mode === 'offline'
                    ? 'bg-[#9eff55] text-black scale-105 shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                🏪 OFFLINE (Restaurant)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Content */}
      <div>
        {mode === 'online' ? <MenuCalculator /> : <MenuOfflineCalculator />}
      </div>
    </div>
  );
};

export default CalculatorLayout;