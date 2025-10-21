'use client';

import React from 'react';
import { Calculator, Utensils, Truck, PartyPopper, TrendingUp, ArrowRight, DollarSign, BarChart3 } from 'lucide-react';
import Link from 'next/link';

const calculators = [
  {
    title: 'Restaurant Menu Pricing',
    description: 'Calculate prices for dine-in restaurant menu items with precise cost analysis and profit margins.',
    icon: Utensils,
    href: '/dashboard/pricing/offline',
    gradient: 'from-purple-600 to-pink-600',
    stats: 'Dine-in customers',
  },
  {
    title: 'Online Menu Pricing',
    description: 'Optimize pricing for online delivery orders including platform fees and delivery costs.',
    icon: Truck,
    href: '/dashboard/pricing/online',
    gradient: 'from-green-600 to-blue-600',
    stats: 'Delivery orders',
  },
  {
    title: 'Catering Menu Pricing',
    description: 'Generate professional offers for catering and events with bulk pricing strategies.',
    icon: PartyPopper,
    href: '/dashboard/pricing/catering',
    gradient: 'from-orange-600 to-yellow-600',
    stats: 'Event catering',
  },
  {
    title: 'Competitor Analysis',
    description: 'Track competitor prices and analyze market positioning to optimize your pricing strategy.',
    icon: TrendingUp,
    href: '/dashboard/pricing/competitor',
    gradient: 'from-red-600 to-purple-600',
    stats: 'Market insights',
  },
];

const features = [
  {
    icon: DollarSign,
    title: 'Cost Analysis',
    description: 'Real-time ingredient cost tracking and profit margin calculations',
  },
  {
    icon: BarChart3,
    title: 'Performance Insights',
    description: 'Detailed analytics on menu performance and profitability',
  },
  {
    icon: Calculator,
    title: 'Dynamic Pricing',
    description: 'Automated pricing adjustments based on cost fluctuations',
  },
];

export default function PricingDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Calculator className="w-8 h-8" />
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">PRICING SUITE</span>
            </div>
            <h1 className="text-4xl font-black mb-2">Menu Pricing Calculators</h1>
            <p className="text-blue-100">
              Professional pricing tools for all your restaurant operations
            </p>
          </div>
        </div>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {calculators.map((calculator) => {
          const IconComponent = calculator.icon;
          return (
            <Link key={calculator.href} href={calculator.href}>
              <div className="group bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all cursor-pointer">
                <div className={`bg-gradient-to-r ${calculator.gradient} p-6 rounded-t-xl`}>
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-8 h-8" />
                      <div>
                        <h3 className="text-xl font-black">{calculator.title}</h3>
                        <p className="text-sm opacity-90">{calculator.stats}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-700 font-medium leading-relaxed">
                    {calculator.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-8">
        <h2 className="text-2xl font-black text-gray-900 mb-6">Pricing Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div key={feature.title} className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/dashboard/foodcost" 
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="bg-green-100 rounded-lg p-2">
              <Calculator className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Manage Recipe Costs</p>
              <p className="text-sm text-gray-600">Update ingredient prices and recipe calculations</p>
            </div>
          </Link>
          
          <Link 
            href="/dashboard/reports" 
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="bg-purple-100 rounded-lg p-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900">View Reports</p>
              <p className="text-sm text-gray-600">Analyze menu performance and profitability</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}