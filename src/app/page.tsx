'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { 
  Calculator, 
  ChefHat, 
  TrendingUp, 
  DollarSign, 
  CheckCircle, 
  ArrowRight,
  BarChart3,
  Users,
  Shield,
  Clock,
  Target,
  Zap
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-2xl font-bold text-gray-900">Loading...</div>
      </div>
    );
  }

  // Don't show landing page if user is logged in
  if (user) {
    return null;
  }

  const features = [
    {
      icon: Calculator,
      title: 'Smart Pricing',
      description: 'Calculate optimal menu prices based on real ingredient costs and desired profit margins'
    },
    {
      icon: ChefHat,
      title: 'Recipe Management',
      description: 'Build detailed recipes with precise cost calculations and ingredient tracking'
    },
    {
      icon: TrendingUp,
      title: 'Profit Optimization',
      description: 'Maximize profitability with data-driven pricing recommendations and market analysis'
    }
  ];

  const benefits = [
    'Calculate exact food costs per serving',
    'Set profitable prices for restaurant and delivery',
    'Track ingredient costs and supplier pricing',
    'Generate professional menu exports',
    'Analyze competitor pricing strategies',
    'Multi-platform pricing (restaurant, delivery, catering)'
  ];

  const stats = [
    { number: '30%', label: 'Average Profit Increase' },
    { number: '5min', label: 'Recipe Setup Time' },
    { number: '100%', label: 'Price Accuracy' },
    { number: '24/7', label: 'Platform Access' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-black text-gray-900">Z</div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-widest text-gray-900">ZED</span>
                <span className="text-sm font-black tracking-widest text-gray-900">ZEN</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => router.push('/login')}
                className="text-gray-600 hover:text-gray-900 font-semibold transition text-sm sm:text-base"
              >
                Sign In
              </button>
              <button
                onClick={() => setIsTrialModalOpen(true)}
                className="px-3 sm:px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition text-sm sm:text-base"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 sm:mb-6 leading-tight">
                Professional Restaurant Menu Pricing
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 leading-relaxed">
                Calculate optimal menu prices, track food costs, and maximize profitability with our comprehensive restaurant management platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-6 sm:mb-8">
                <button
                  onClick={() => setIsTrialModalOpen(true)}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 rounded-lg font-bold text-base sm:text-lg hover:bg-gray-100 transition flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white rounded-lg font-bold text-base sm:text-lg hover:bg-white hover:text-blue-600 transition"
                >
                  Sign In
                </button>
              </div>

              <div className="flex items-center gap-4 text-blue-100">
                <CheckCircle className="w-5 h-5" />
                <span>14-day free trial</span>
                <CheckCircle className="w-5 h-5" />
                <span>No credit card required</span>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 text-gray-900">
                <div className="flex items-center gap-3 mb-6">
                  <Calculator className="w-8 h-8 text-blue-600" />
                  <h3 className="text-2xl font-bold">Price Calculator</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Chicken Breast Recipe</span>
                    <span className="font-bold text-green-600">15.50 RON</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Food Cost</span>
                    <span className="font-bold">8.20 RON</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Profit Margin</span>
                    <span className="font-bold text-blue-600">47%</span>
                  </div>
                  <div className="bg-blue-600 text-white p-4 rounded-lg text-center">
                    <div className="text-sm opacity-90">Suggested Price</div>
                    <div className="text-2xl font-bold">25.90 RON</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium text-sm sm:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              Everything You Need to Optimize Your Menu
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              From recipe costing to competitor analysis, our platform provides all the tools restaurant owners need to maximize profitability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
                <div className="bg-blue-100 rounded-lg p-3 w-fit mb-4">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-6">
                Take Control of Your Restaurant's Profitability
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Stop guessing at menu prices. Our platform gives you the data and tools you need to make informed pricing decisions that drive profitability.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Monthly Revenue</span>
                    <span className="text-2xl font-bold text-green-600">+30%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Food Cost Control</span>
                    <span className="text-2xl font-bold text-blue-600">-15%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Price Accuracy</span>
                    <span className="text-2xl font-bold text-purple-600">100%</span>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-lg text-center">
                    <div className="text-sm opacity-90">Net Profit Increase</div>
                    <div className="text-3xl font-bold">45%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black mb-4">
            Ready to Optimize Your Menu Pricing?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of restaurant owners who trust our platform to maximize their profitability.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setIsTrialModalOpen(true)}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition flex items-center justify-center gap-2"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <p className="text-blue-200 mt-4 text-sm">
            14-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl font-black">Z</div>
                <div className="flex flex-col">
                  <span className="text-sm font-black tracking-widest">ZED</span>
                  <span className="text-sm font-black tracking-widest">ZEN</span>
                </div>
              </div>
              <p className="text-gray-400">
                Professional restaurant management and menu pricing solutions.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <div className="space-y-2 text-gray-400">
                <div>Menu Pricing</div>
                <div>Recipe Management</div>
                <div>Cost Analysis</div>
                <div>Competitor Tracking</div>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <div className="space-y-2 text-gray-400">
                <div>Help Center</div>
                <div>Documentation</div>
                <div>Contact Us</div>
                <div>Training</div>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <div className="space-y-2 text-gray-400">
                <div>About</div>
                <div>Privacy Policy</div>
                <div>Terms of Service</div>
                <div>Security</div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ZED-ZEN. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Free Trial Modal */}
      {isTrialModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 mx-4">
            <div className="text-center mb-6">
              <div className="bg-blue-100 rounded-full p-3 w-fit mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Start Your Free Trial</h3>
              <p className="text-gray-600">
                Get full access to all features for 14 days. No credit card required.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Full access to all features</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Unlimited recipes and calculations</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Priority customer support</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsTrialModalOpen(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsTrialModalOpen(false);
                  router.push('/register');
                }}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm sm:text-base"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}