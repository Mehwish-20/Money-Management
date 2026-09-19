import React, { useState, useMemo } from 'react';
import {
  PieChart,
  BarChart3,
  Calendar,
  CreditCard,
  TrendingDown,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
} from 'lucide-react';
import { Budget, Currency, Transaction } from '../../types';
import { formatCurrency, getCategoryMeta } from '../../utils/formatters';
import { CategoryDonutChart } from '../charts/CategoryDonutChart';
import { DailySpendingBarChart } from '../charts/DailySpendingBarChart';
import { BudgetComparisonBar } from '../charts/BudgetComparisonBar';

interface VisualReportsTabProps {
  transactions: Transaction[];
  budgets: Budget[];
  currency: Currency;
  onOpenBudgetModal: (category?: string) => void;
}

export const VisualReportsTab: React.FC<VisualReportsTabProps> = ({
  transactions,
  budgets,
  currency,
  onOpenBudgetModal,
}) => {
  const [timeRange, setTimeRange] = useState<'this_month' | 'past_30' | 'all'>('this_month');

  const today = new Date();
  const currentMonthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  // Filtered transactions based on timeRange
  const reportTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (timeRange === 'this_month') {
        return t.date.startsWith(currentMonthPrefix);
      }
      if (timeRange === 'past_30') {
        const d = new Date(t.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return d >= thirtyDaysAgo;
      }
      return true;
    });
  }, [transactions, timeRange, currentMonthPrefix]);

  // Expenses & Income totals
  const totalExpenses = reportTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalIncome = reportTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Category breakdown
  const categorySpending: Record<string, number> = {};
  reportTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    });

  const categoryChartData = Object.entries(categorySpending)
    .map(([cat, amount]) => {
      const meta = getCategoryMeta(cat);
      return {
        category: cat,
        amount,
        color: meta.color,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Daily spending data for the bar chart (last 14 days or days in range)
  const dailyData = useMemo(() => {
    const daysCount = 14;
    const result: { date: string; amount: number; label: string }[] = [];
    
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow', day: 'numeric' });

      const daySpend = transactions
        .filter((t) => t.type === 'expense' && t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);

      result.push({
        date: dateStr,
        amount: daySpend,
        label: dayLabel,
      });
    }

    return result;
  }, [transactions]);

  const activeDaysWithExpenses = dailyData.filter((d) => d.amount > 0).length || 1;
  const totalDailySum = dailyData.reduce((acc, d) => acc + d.amount, 0);
  const averageDailySpend = totalDailySum / dailyData.length;

  // Budget vs Actual comparison
  const comparisonItems = budgets.map((b) => {
    const spent = categorySpending[b.category] || 0;
    return {
      category: b.category,
      budgetLimit: b.monthlyLimit,
      spent,
    };
  });

  // Payment methods breakdown
  const paymentMethodMap: Record<string, number> = {};
  reportTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      paymentMethodMap[t.paymentMethod] = (paymentMethodMap[t.paymentMethod] || 0) + t.amount;
    });

  // Top spending merchants
  const merchantMap: Record<string, { total: number; count: number; category: string }> = {};
  reportTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const name = t.title.trim();
      if (!merchantMap[name]) {
        merchantMap[name] = { total: 0, count: 0, category: t.category };
      }
      merchantMap[name].total += t.amount;
      merchantMap[name].count += 1;
    });

  const topMerchants = Object.entries(merchantMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Visual Financial Reports</h1>
          <p className="text-xs text-slate-500">
            Interactive analytics, category breakdowns, and spending distribution
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          {(
            [
              { id: 'this_month', label: 'This Month' },
              { id: 'past_30', label: 'Past 30 Days' },
              { id: 'all', label: 'All Time' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeRange(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                timeRange === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cash Flow Summary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Income
            </span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ArrowUpRight size={16} />
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            +{formatCurrency(totalIncome, currency)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Cash flow received in period</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Expenses
            </span>
            <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <ArrowDownRight size={16} />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(totalExpenses, currency)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Across all categories</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Net Savings & Rate
            </span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Percent size={16} />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(netSavings, currency)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Savings Rate:{' '}
            <strong className="text-indigo-600 font-bold">{savingsRate.toFixed(1)}%</strong>
          </div>
        </div>
      </div>

      {/* Row 1: Category Donut Breakdown & Daily Spending Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Donut */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Expense Category Distribution</h2>
              <p className="text-xs text-slate-500">Proportional share of each spending bucket</p>
            </div>
          </div>

          <CategoryDonutChart
            data={categoryChartData}
            currency={currency}
            totalExpenses={totalExpenses}
          />
        </div>

        {/* Daily Spending Trend Bar Chart */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">Daily Spending Trend (14-Day)</h2>
              <p className="text-xs text-slate-500">Daily cash outlays with average baseline</p>
            </div>
          </div>

          <DailySpendingBarChart
            data={dailyData}
            currency={currency}
            averagePerDay={averageDailySpend}
          />
        </div>
      </div>

      {/* Row 2: Budget vs Actual & Top Merchants / Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Budget vs Actual Comparison */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Budget vs. Actual Spending</h2>
              <p className="text-xs text-slate-500">Monitoring allocations against real expenditures</p>
            </div>
          </div>

          <BudgetComparisonBar
            items={comparisonItems}
            currency={currency}
            onEditCategoryBudget={(cat) => onOpenBudgetModal(cat)}
          />
        </div>

        {/* Top Merchants & Payment Methods */}
        <div className="lg:col-span-5 space-y-6">
          {/* Top Outlets */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Top Spending Outlets</h2>
            <p className="text-xs text-slate-500 mb-3">Where your money was spent most</p>

            <div className="space-y-2.5">
              {topMerchants.map((m, idx) => (
                <div
                  key={m.name}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-semibold text-slate-800 truncate block">
                      {idx + 1}. {m.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {m.count} transaction{m.count > 1 ? 's' : ''} • {m.category}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 flex-shrink-0">
                    {formatCurrency(m.total, currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Payment Method Breakdown</h2>
            <p className="text-xs text-slate-500 mb-3">Volume processed by instrument</p>

            <div className="space-y-2">
              {Object.entries(paymentMethodMap).map(([method, amount]) => {
                const pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                return (
                  <div key={method} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium">{method}</span>
                      <span className="text-slate-900 font-bold">
                        {formatCurrency(amount, currency)} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-800 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
