import React from 'react';
import {
  Wallet,
  LayoutDashboard,
  ReceiptText,
  Target,
  CalendarClock,
  PiggyBank,
  PieChart,
  Plus,
  Coins,
} from 'lucide-react';
import { Currency } from '../types';
import { CURRENCIES } from '../data/defaultData';

export type ActiveTab = 'overview' | 'expenses' | 'budgets' | 'recurring' | 'goals' | 'reports';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  onOpenAddModal: () => void;
  monthlySpend: number;
  monthlyBudget: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  onOpenAddModal,
}) => {
  const tabs = [
    { id: 'overview' as ActiveTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'expenses' as ActiveTab, label: 'Daily Expenses', icon: ReceiptText },
    { id: 'budgets' as ActiveTab, label: 'Budgets', icon: Target },
    { id: 'recurring' as ActiveTab, label: 'Recurring Bills', icon: CalendarClock },
    { id: 'goals' as ActiveTab, label: 'Savings Goals', icon: PiggyBank },
    { id: 'reports' as ActiveTab, label: 'Visual Reports', icon: PieChart },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Wallet size={20} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-slate-900 tracking-tight">Money Management</span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
                  Financial Suite
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">Expenses, Budgets & Goals</p>
            </div>
          </div>

          {/* Action controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Currency Selector */}
            <div className="relative">
              <select
                id="currency-selector"
                value={currency.code}
                onChange={(e) => {
                  const selected = CURRENCIES.find((c) => c.code === e.target.value);
                  if (selected) setCurrency(selected);
                }}
                className="appearance-none bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 pl-3 pr-7 rounded-xl border border-transparent focus:border-slate-300 focus:outline-none cursor-pointer transition-colors"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <Coins size={12} />
              </div>
            </div>

            {/* + Add Transaction Button */}
            <button
              id="header-quick-add-btn"
              onClick={onOpenAddModal}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 active:bg-black text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all duration-150 transform active:scale-95"
            >
              <Plus size={16} />
              <span className="hidden xs:inline">Add Transaction</span>
              <span className="xs:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs bar */}
        <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
