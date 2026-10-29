import React from 'react';
import {
  Clock,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  Smartphone,
  Users,
} from 'lucide-react';
import { DashboardMetrics } from '../../types';

interface MobileNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  metrics: DashboardMetrics | null;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onSelectTab, metrics }) => {
  const primaryTabs = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard },
    {
      id: 'inbox',
      label: 'Inbox',
      icon: MessageSquare,
      badge: metrics?.unansweredEnquiries || null,
    },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: metrics?.ordersAwaitingPayment || null },
    { id: 'followups', label: 'Follow-ups', icon: Clock, badge: metrics?.followUpsDueToday || null },
    { id: 'products', label: 'Catalog', icon: Package },
    { id: 'whatsapp', label: 'WhatsApp', icon: Smartphone },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-2 py-1.5 flex items-center justify-around">
      {primaryTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-medium relative transition-colors ${
              isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {Boolean(tab.badge && tab.badge > 0) && (
                <span className="absolute -top-1 -right-2 bg-emerald-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="mt-0.5">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
