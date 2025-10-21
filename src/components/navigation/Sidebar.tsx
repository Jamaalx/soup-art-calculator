'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Calculator, 
  ChefHat,
  TrendingUp,
  Menu as MenuIcon,
  Truck,
  DollarSign,
  FileText,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Package,
  Users,
  Building,
  ClipboardList,
  BarChart3,
  Calendar,
  FileSpreadsheet,
  Utensils,
  PartyPopper,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  children?: NavItem[];
  badge?: string;
}

interface SidebarProps {
  onMobileClose?: () => void;
}

export default function Sidebar({ onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const navigation: NavItem[] = [
    {
      label: t('dashboard'),
      href: '/dashboard',
      icon: Home,
    },
    {
      label: t('foodcost'),
      href: '/dashboard/foodcost',
      icon: ChefHat,
      badge: '1',
      children: [
        { label: t('ingredients'), href: '/dashboard/foodcost/ingredients', icon: Package },
        { label: t('recipes'), href: '/dashboard/foodcost', icon: ClipboardList },
        { label: t('insights'), href: '/dashboard/foodcost/insights', icon: BarChart3 },
      ]
    },
    {
      label: t('pricing'),
      href: '/dashboard/pricing',
      icon: Calculator,
      badge: '2',
      children: [
        { label: t('restaurant-pricing'), href: '/dashboard/pricing/restaurant', icon: Utensils },
        { label: t('delivery-pricing'), href: '/dashboard/pricing/delivery', icon: Truck },
        { label: t('competitor-analysis'), href: '/dashboard/pricing/competitor', icon: TrendingUp },
      ]
    },
    {
      label: t('menu-configurator'),
      href: '/dashboard/menu-configurator',
      icon: MenuIcon,
      badge: '3',
      children: [
        { label: t('restaurant-menus'), href: '/dashboard/pricing/offline', icon: Utensils },
        { label: t('online-menus'), href: '/dashboard/pricing/online', icon: Truck },
        { label: t('catering-menus'), href: '/dashboard/pricing/catering', icon: PartyPopper },
        { label: t('platform-export'), href: '/dashboard/menu-configurator', icon: FileSpreadsheet },
      ]
    },
    {
      label: t('settings'),
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isParentActive = (item: NavItem) => {
    if (pathname === item.href) return true;
    if (item.children) {
      return item.children.some(child => pathname === child.href);
    }
    return false;
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const handleNavClick = (href: string) => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <div className={`bg-white border-r-4 border-black shadow-xl transition-all duration-300 flex flex-col h-full ${
      collapsed ? 'w-20 lg:w-20' : 'w-64 lg:w-64'
    } min-w-0`}>
      {/* Header */}
      <div className="p-4 border-b-2 border-gray-200">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="text-3xl font-black text-black">Z</div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-widest text-black">ZED</span>
                <span className="text-sm font-black tracking-widest text-black">ZEN</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-3 border-b-2 border-gray-200 bg-[#9eff55]">
        <div className={`${collapsed ? 'text-center' : ''}`}>
          {!collapsed && <div className="text-xs font-bold text-black">{t('user')}</div>}
          <div className={`font-black text-black ${collapsed ? 'text-xs' : 'text-sm truncate'}`}>
            {collapsed ? user?.email?.charAt(0).toUpperCase() : user?.email?.split('@')[0] || 'user'}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.href}>
              <div>
                <Link
                  href={item.href}
                  onClick={(e) => {
                    if (item.children && !collapsed) {
                      e.preventDefault();
                      toggleExpanded(item.label);
                    } else {
                      handleNavClick(item.href);
                    }
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold transition-all ${
                    isParentActive(item)
                      ? 'bg-[#3B82F6] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {item.children && (
                        <ChevronRight className={`w-4 h-4 transition-transform ${
                          expandedItems.includes(item.label) ? 'rotate-90' : ''
                        }`} />
                      )}
                    </>
                  )}
                </Link>

                {/* Children */}
                {!collapsed && item.children && expandedItems.includes(item.label) && (
                  <ul className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={() => handleNavClick(child.href)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                            isActive(child.href)
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <child.icon className="w-4 h-4" />
                          <span>{child.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      </nav>

      {/* Language Switcher */}
      {!collapsed && (
        <div className="p-2 border-t-2 border-gray-200">
          <div className="px-3 py-2">
            <LanguageSwitcher />
          </div>
        </div>
      )}

      {/* User Journey Guide */}
      {!collapsed && (
        <div className="p-2 border-t-2 border-gray-200">
          <div className="px-3 py-2">
            <h4 className="text-xs font-bold text-gray-600 mb-2">{t('quick-guide')}</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span className="bg-blue-500 text-white text-xs px-1 rounded">1</span>
                <span>{t('guide-step-1')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-500 text-white text-xs px-1 rounded">2</span>
                <span>{t('guide-step-2')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-500 text-white text-xs px-1 rounded">3</span>
                <span>{t('guide-step-3')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Section */}
      <div className="p-2 border-t-2 border-gray-200">
        <Link
          href="/dashboard/admin"
          onClick={() => handleNavClick('/dashboard/admin')}
          className="flex items-center gap-3 px-3 py-2.5 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all shadow-md"
        >
          <Shield className="w-5 h-5" />
          {!collapsed && <span>{t('admin')}</span>}
        </Link>
      </div>

      {/* Logout */}
      <div className="p-2 border-t-2 border-gray-200">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all shadow-md"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>{t('logout')}</span>}
        </button>
      </div>
    </div>
  );
}