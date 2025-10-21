'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  Users,
  ChefHat,
  Calculator,
  Truck,
  FileText,
  ArrowRight,
  CheckCircle,
  Circle,
  AlertCircle,
  BarChart3,
  Target,
  Zap,
  Clock,
  Menu as MenuIcon
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { useLanguage } from '@/contexts/LanguageContext';

interface StatCard {
  title: string;
  value: string | number;
  change?: string;
  icon: any;
  color: string;
}

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: any;
  color: string;
}

interface JourneyStep {
  id: string;
  title: string;
  description: string;
  href: string;
  completed: boolean;
  current: boolean;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { products } = useProducts();
  const { t, language } = useLanguage();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('setup-products');

  // Journey steps
  const journeySteps: JourneyStep[] = [
    {
      id: 'setup-products',
      title: t('setup-products'),
      description: t('setup-products-desc'),
      href: '/dashboard/admin/products',
      completed: products.length > 0,
      current: currentStep === 'setup-products'
    },
    {
      id: 'create-recipes',
      title: t('create-recipes'),
      description: t('create-recipes-desc'),
      href: '/dashboard/foodcost',
      completed: completedSteps.includes('create-recipes'),
      current: currentStep === 'create-recipes'
    },
    {
      id: 'calculate-prices',
      title: t('calculate-prices'),
      description: t('calculate-prices-desc'),
      href: '/dashboard/pricing',
      completed: completedSteps.includes('calculate-prices'),
      current: currentStep === 'calculate-prices'
    },
    {
      id: 'analyze-competition',
      title: t('analyze-competition'),
      description: t('analyze-competition-desc'),
      href: '/dashboard/pricing/competitor',
      completed: completedSteps.includes('analyze-competition'),
      current: currentStep === 'analyze-competition'
    },
    {
      id: 'configure-menus',
      title: t('configure-menus'),
      description: t('configure-menus-desc'),
      href: '/dashboard/menu-configurator',
      completed: completedSteps.includes('configure-menus'),
      current: currentStep === 'configure-menus'
    },
  ];

  // Update current step based on progress
  useEffect(() => {
    if (products.length > 0 && currentStep === 'setup-products') {
      setCurrentStep('create-recipes');
    }
  }, [products, currentStep]);

  // Calculate progress
  const totalSteps = journeySteps.length;
  const completedCount = journeySteps.filter(step => step.completed).length;
  const progressPercentage = Math.round((completedCount / totalSteps) * 100);

  // Stats cards
  const stats: StatCard[] = [
    {
      title: t('total-products'),
      value: products.length,
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      title: t('active-recipes'),
      value: 0,
      icon: ChefHat,
      color: 'bg-green-500'
    },
    {
      title: t('avg-food-cost'),
      value: '0%',
      icon: DollarSign,
      color: 'bg-purple-500'
    },
    {
      title: t('profit-margin'),
      value: '0%',
      icon: TrendingUp,
      color: 'bg-orange-500'
    },
  ];

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      title: t('quick-price-check'),
      description: t('quick-price-check-desc'),
      href: '/dashboard/pricing',
      icon: Calculator,
      color: 'bg-blue-100 hover:bg-blue-200 text-blue-700'
    },
    {
      title: t('add-new-recipe'),
      description: t('add-new-recipe-desc'),
      href: '/dashboard/foodcost/new',
      icon: ChefHat,
      color: 'bg-green-100 hover:bg-green-200 text-green-700'
    },
    {
      title: t('configure-menus'),
      description: t('configure-menus-desc'),
      href: '/dashboard/menu-configurator',
      icon: MenuIcon,
      color: 'bg-purple-100 hover:bg-purple-200 text-purple-700'
    },
    {
      title: t('competitor-analysis'),
      description: t('competitor-analysis-desc'),
      href: '/dashboard/pricing/competitor',
      icon: TrendingUp,
      color: 'bg-orange-100 hover:bg-orange-200 text-orange-700'
    },
  ];

  // Get next recommended action
  const getNextAction = () => {
    const nextStep = journeySteps.find(step => !step.completed);
    return nextStep || journeySteps[journeySteps.length - 1];
  };

  const nextAction = getNextAction();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border-2 border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-2">
              {t('welcome-back')}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 font-semibold">
              {user?.email?.split('@')[0] || 'User'}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs sm:text-sm text-gray-500 mb-1">{t('today')}</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900">
              {new Date().toLocaleDateString(language === 'ro' ? 'ro-RO' : 'en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Journey Progress */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 text-white">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black mb-2">{t('quick-start-progress')}</h2>
              <p className="text-white/90 text-sm sm:text-base">{t('complete-steps-message')}</p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black">{progressPercentage}%</div>
              <p className="text-white/90 text-xs sm:text-sm">{completedCount} {t('of')} {totalSteps} {t('completed')}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Journey Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {journeySteps.map((step, index) => (
            <Link
              key={step.id}
              href={step.href}
              className={`p-3 sm:p-4 rounded-xl transition-all ${
                step.completed 
                  ? 'bg-white/20 hover:bg-white/30' 
                  : step.current
                  ? 'bg-white text-blue-600 shadow-lg sm:transform sm:scale-105'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 ${
                  step.completed 
                    ? 'text-white' 
                    : step.current 
                    ? 'text-blue-600'
                    : 'text-white/60'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-sm mb-1 ${
                    step.current ? 'text-blue-900' : ''
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-xs ${
                    step.current ? 'text-blue-600' : 'opacity-90'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Next Action */}
        <div className="mt-6 p-3 sm:p-4 bg-white/10 rounded-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" />
              <div>
                <p className="text-xs sm:text-sm text-white/90">{t('next-recommended-action')}</p>
                <p className="text-sm sm:text-base font-bold">{nextAction.title}</p>
              </div>
            </div>
            <Link
              href={nextAction.href}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {t('get-started')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 border-2 border-gray-200 hover:shadow-xl transition-shadow"
          >
            <div className="flex flex-col sm:flex-row items-start justify-between mb-2 sm:mb-4 gap-2">
              <div className={`p-2 sm:p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              {stat.change && (
                <span className={`text-sm font-bold ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-1">{stat.title}</p>
            <p className="text-lg sm:text-2xl lg:text-3xl font-black text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border-2 border-gray-200">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-4 sm:mb-6">{t('quick-actions')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className={`p-4 sm:p-5 lg:p-6 rounded-xl border-2 border-gray-200 hover:shadow-lg transition-all ${action.color}`}
            >
              <action.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 mb-2 sm:mb-3" />
              <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2">{action.title}</h3>
              <p className="text-xs sm:text-sm opacity-90">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Insights */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg lg:text-xl font-black text-gray-900">{t('smart-insights')}</h3>
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-900 text-sm">{t('setup-incomplete')}</p>
                  <p className="text-blue-700 text-sm">{t('setup-incomplete-desc')}</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-bold text-green-900 text-sm">{t('growth-opportunity')}</p>
                  <p className="text-green-700 text-sm">{t('growth-opportunity-desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Updates */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg lg:text-xl font-black text-gray-900">{t('recent-activity')}</h3>
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{t('system-ready')}</p>
                <p className="text-xs text-gray-500">{t('just-now')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{t('dashboard-updated')}</p>
                <p className="text-xs text-gray-500">2 {t('minutes-ago')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{t('new-features-available')}</p>
                <p className="text-xs text-gray-500">5 {t('minutes-ago')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}