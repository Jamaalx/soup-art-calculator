'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-600" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'ro')}
        className="text-sm bg-transparent border-none focus:outline-none cursor-pointer font-medium"
      >
        <option value="ro">Română</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}