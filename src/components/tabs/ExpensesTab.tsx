import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  Trash2,
  Calendar,
  CreditCard,
  RotateCcw,
  ArrowDownRight,
  ArrowUpRight,
  TrendingDown,
  CalendarRange,
} from 'lucide-react';
import { Currency, Transaction, TransactionType } from '../../types';
import { DEFAULT_CATEGORIES } from '../../data/defaultData';
import { formatCurrency, formatDateDisplay, exportToCSV } from '../../utils/formatters';
import { CategoryIcon } from '../CategoryIcon';

interface ExpensesTabProps {
  transactions: Transaction[];
  currency: Currency;
  onAddTransaction: () => void;
  onDeleteTransaction: (id: string) => void;
  onResetData: () => void;
}

type DateFilterOption = 'all' | 'today' | '7days' | 'this_month';

export const ExpensesTab: React.FC<ExpensesTabProps> = ({
  transactions,
  currency,
  onAddTransaction,
  onDeleteTransaction,
  onResetData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('this_month');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthPrefix = todayStr.slice(0, 7);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Search
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(query);
        const matchCat = t.category.toLowerCase().includes(query);
        const matchNotes = t.notes?.toLowerCase().includes(query);
        if (!matchTitle && !matchCat && !matchNotes) return false;
      }

      // Type
      if (selectedType !== 'all' && t.type !== selectedType) {
        return false;
      }

      // Category
      if (selectedCategory !== 'all' && t.category !== selectedCategory) {
        return false;
      }

      // Payment method
      if (selectedMethod !== 'all' && t.paymentMethod !== selectedMethod) {
        return false;
      }

      // Date
      if (dateFilter === 'today') {
        return t.date === todayStr;
      } else if (dateFilter === '7days') {
        const d = new Date(t.date);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return d >= sevenDaysAgo;
      } else if (dateFilter === 'this_month') {
        return t.date.startsWith(currentMonthPrefix);
      }

      return true;
    });
  }, [transactions, searchTerm, selectedType, selectedCategory, selectedMethod, dateFilter, todayStr, currentMonthPrefix]);

  // Calculate totals for filtered list
  const totalFilteredExpenses = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalFilteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: { date: string; displayDate: string; totalDailyExpense: number; items: Transaction[] }[] = [];
    const dateMap = new Map<string, Transaction[]>();

    filteredTransactions.forEach((t) => {
      const existing = dateMap.get(t.date) || [];
      existing.push(t);
      dateMap.set(t.date, existing);
    });

    // Sort dates descending
    const sortedDates = Array.from(dateMap.keys()).sort((a, b) => b.localeCompare(a));

    sortedDates.forEach((d) => {
      const items = dateMap.get(d) || [];
      const totalDailyExpense = items
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      groups.push({
        date: d,
        displayDate: formatDateDisplay(d),
        totalDailyExpense,
        items,
      });
    });

    return groups;
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Daily Expenses Tracker</h1>
          <p className="text-xs text-slate-500">
            Log and manage your daily cash flow and purchase history
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            id="export-csv-btn"
            onClick={() => exportToCSV(filteredTransactions)}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            id="expenses-add-transaction-btn"
            onClick={onAddTransaction}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
          >
            <Plus size={15} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        {/* Search & Quick Date Presets */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="md:col-span-6 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="expense-search-input"
              type="text"
              placeholder="Search by merchant, title, or note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Date Range Tabs */}
          <div className="md:col-span-6 flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            {(
              [
                { id: 'today', label: 'Today' },
                { id: '7days', label: 'Past 7d' },
                { id: 'this_month', label: 'This Month' },
                { id: 'all', label: 'All Time' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setDateFilter(opt.id)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
                  dateFilter === opt.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category, Type & Payment Method Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Transaction Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="all">All (Expenses & Income)</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="all">All Categories</option>
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Payment Method
            </label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="all">All Methods</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Digital Wallet">Digital Wallet</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter summary badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 text-xs text-slate-600">
        <div>
          Showing <strong>{filteredTransactions.length}</strong> transactions • Total Expenses:{' '}
          <strong className="text-rose-600 font-bold">{formatCurrency(totalFilteredExpenses, currency)}</strong>
          {totalFilteredIncome > 0 && (
            <>
              {' '}
              | Total Income:{' '}
              <strong className="text-emerald-600 font-bold">
                +{formatCurrency(totalFilteredIncome, currency)}
              </strong>
            </>
          )}
        </div>

        <button
          onClick={onResetData}
          className="text-slate-400 hover:text-slate-700 text-xs flex items-center space-x-1"
          title="Reset to default demo data"
        >
          <RotateCcw size={12} />
          <span>Reset Sample Data</span>
        </button>
      </div>

      {/* Daily Grouped List */}
      {groupedTransactions.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Search size={22} />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">No transactions match your criteria</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms, date ranges, or category filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedType('all');
              setDateFilter('all');
              setSelectedMethod('all');
            }}
            className="mt-4 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedTransactions.map((group) => (
            <div
              key={group.date}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
            >
              {/* Daily Group Header */}
              <div className="flex items-center justify-between px-5 py-3 bg-slate-50/80 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-800 tracking-tight">
                    {group.displayDate}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">({group.date})</span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-500 mr-1">Daily Spend:</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(group.totalDailyExpense, currency)}
                  </span>
                </div>
              </div>

              {/* Transactions in Date Group */}
              <div className="divide-y divide-slate-100">
                {group.items.map((tx) => {
                  const isExpense = tx.type === 'expense';
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="flex items-center space-x-3 min-w-0 pr-3">
                        <CategoryIcon category={tx.category} size={17} />
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-slate-900 truncate">
                              {tx.title}
                            </span>
                            {tx.recurringBillId && (
                              <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-sm">
                                Recurring
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 mt-0.5">
                            <span className="font-medium text-slate-700">{tx.category}</span>
                            <span>•</span>
                            <span>{tx.paymentMethod}</span>
                            {tx.notes && (
                              <>
                                <span>•</span>
                                <span className="text-slate-400 italic truncate max-w-xs">{tx.notes}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 flex-shrink-0">
                        <div className="text-right">
                          <span
                            className={`text-sm font-bold block ${
                              isExpense ? 'text-slate-900' : 'text-emerald-600'
                            }`}
                          >
                            {isExpense ? '-' : '+'}
                            {formatCurrency(tx.amount, currency)}
                          </span>
                        </div>

                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
