'use client';

import { useState } from 'react';
import Sidebar from '@/components/navigation/Sidebar';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border-2 border-gray-200"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:relative fixed left-0 top-0 h-full z-40 transition-transform duration-300 ease-in-out
      `}>
        <Sidebar onMobileClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full lg:w-auto">
        <div className="container mx-auto p-4 sm:p-6 pt-16 lg:pt-6">
          {children}
        </div>
      </main>
    </div>
  );
}