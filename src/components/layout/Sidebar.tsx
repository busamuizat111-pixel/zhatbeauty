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

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  metrics: DashboardMetrics | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, metrics }) => {
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'inbox',
      label: 'Inbox',
      icon: MessageSquare,
      badge: metrics?.unansweredEnquiries ? metrics.unansweredEnquiries : null,
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      badge: null,
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      badge: null,
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      badge: metrics?.ordersAwaitingPayment ? metrics.ordersAwaitingPayment : null,
      badgeColor: 'bg-amber-600 text-white',
    },
    {
      id: 'followups',
      label: 'Follow-ups',
      icon: Clock,
      badge: metrics?.followUpsDueToday ? metrics.followUpsDueToday : null,
      badgeColor: 'bg-rose-600 text-white',
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp Connections',
      icon: Smartphone,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col shrink-0 min-h-[calc(100vh-65px)]">
      <div className="p-4 flex-1 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Menu
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-50 text-emerald-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== null && item.badge > 0 && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    item.badgeColor || 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Support & Quick Contact Banner */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="rounded-xl p-3 bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <p className="text-xs font-semibold text-slate-900">Nigerian SME Pilot</p>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Need help configuring WhatsApp Cloud API or testing in-store?
          </p>
          <button
            onClick={() => onSelectTab('settings')}
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
          >
            View Setup Guide &rarr;
          </button>
        </div>
      </div>
    </aside>
  );
};
