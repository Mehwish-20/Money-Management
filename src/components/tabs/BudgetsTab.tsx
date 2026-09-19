import React, { useState } from 'react';
import {
  Target,
  Plus,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Calendar,
  Pencil,
  Trash2,
  Info,
} from 'lucide-react';
import { Budget, Currency, Transaction } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { CategoryIcon } from '../CategoryIcon';
import { BudgetComparisonBar } from '../charts/BudgetComparisonBar';

interface BudgetsTabProps {
  budgets: Budget[];
  transactions: Transaction[];
  currency: Currency;
  onOpenAddBudgetModal: (initialCategory?: string, initialLimit?: number) => void;
  onDeleteBudget: (budgetId: string) => void;
}

export const BudgetsTab: React.FC<BudgetsTabProps> = ({
  budgets,
  transactions,
  currency,
  onOpenAddBudgetModal,
  onDeleteBudget,
}) => {
  const today = new Date();
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  // Calculate remaining days
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const currentDay = today.getDate();
  const daysRemaining = Math.max(1, lastDay - currentDay + 1);

  // Month transactions
  const monthTransactions = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(currentMonthStr)
  );

  // Category spending aggregation
  const spendingByCategory: Record<string, number> = {};
  monthTransactions.forEach((t) => {
    const key = t.category.toLowerCase();
    spendingByCategory[key] = (spendingByCategory[key] || 0) + t.amount;
  });

  const totalBudgeted = budgets.reduce((acc, b) => acc + b.monthlyLimit, 0);
  const totalSpent = monthTransactions.reduce((acc, t) => acc + t.amount, 0);
  const overallRemaining = totalBudgeted - totalSpent;
  const overallPercent = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  // Comparison data
  const comparisonItems = budgets.map((b) => {
    const spent = spendingByCategory[b.category.toLowerCase()] || 0;
    return {
      category: b.category,
      budgetLimit: b.monthlyLimit,
      spent,
    };
  });

  const overBudgetCategories = comparisonItems.filter((item) => item.spent > item.budgetLimit);
  const nearBudgetCategories = comparisonItems.filter(
    (item) => item.spent >= item.budgetLimit * 0.8 && item.spent <= item.budgetLimit
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Monthly Budgets</h1>
          <p className="text-xs text-slate-500">
            Set spending guardrails to optimize savings and prevent overspending
          </p>
        </div>

        <button
          id="open-new-budget-btn"
          onClick={() => onOpenAddBudgetModal()}
          className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Set Category Budget</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Budget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Monthly Cap
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(totalBudgeted, currency)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across {budgets.length} allocated categories
          </div>
        </div>

        {/* Total Spent So Far */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Spent This Month
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                overallPercent > 100
                  ? 'bg-rose-100 text-rose-800'
                  : overallPercent > 80
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {overallPercent.toFixed(0)}% Used
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(totalSpent, currency)}
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercent > 100
                  ? 'bg-rose-500'
                  : overallPercent > 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(overallPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Remaining Allowance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Remaining Allowance
          </span>
          <div
            className={`text-2xl font-bold mt-1 ${
              overallRemaining < 0 ? 'text-rose-600' : 'text-slate-900'
            }`}
          >
            {formatCurrency(overallRemaining, currency)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {overallRemaining > 0 ? (
              <>
                Safe pace: <strong>{formatCurrency(overallRemaining / daysRemaining, currency)}</strong>/day for {daysRemaining}d left
              </>
            ) : (
              'Overall limit exceeded for this month'
            )}
          </div>
        </div>
      </div>

      {/* Warning Banners */}
      {overBudgetCategories.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3">
          <AlertTriangle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-rose-800">
            <strong className="font-semibold block text-sm">Category Budget Exceeded</strong>
            You have spent more than your allocated limit in:{' '}
            {overBudgetCategories.map((c) => `${c.category} (${formatCurrency(c.spent, currency)} / ${formatCurrency(c.budgetLimit, currency)})`).join(', ')}.
          </div>
        </div>
      )}

      {/* Category Budgets List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Category Budgets</h2>
            <p className="text-xs text-slate-500">
              Visual breakdown of limits, expenditures, and remaining balances
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {budgets.map((budget) => {
            const spent = spendingByCategory[budget.category.toLowerCase()] || 0;
            const percent = budget.monthlyLimit > 0 ? (spent / budget.monthlyLimit) * 100 : 0;
            const remaining = budget.monthlyLimit - spent;
            const isOver = percent > 100;
            const isWarning = percent >= 80 && percent <= 100;

            return (
              <div
                key={budget.id}
                className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/40 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <CategoryIcon category={budget.category} size={16} />
                    <div>
                      <span className="text-sm font-bold text-slate-800">{budget.category}</span>
                      <div className="text-xs text-slate-400">
                        Daily pace allowed: {formatCurrency(Math.max(0, remaining) / daysRemaining, currency)}/day
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        isOver
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : isWarning
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {percent.toFixed(0)}%
                    </span>

                    <button
                      onClick={() => onOpenAddBudgetModal(budget.category, budget.monthlyLimit)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-colors"
                      title="Edit budget limit"
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      onClick={() => onDeleteBudget(budget.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                      title="Remove budget"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden my-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <span>
                    Spent: <strong className="text-slate-900">{formatCurrency(spent, currency)}</strong> of{' '}
                    {formatCurrency(budget.monthlyLimit, currency)}
                  </span>

                  <span>
                    {isOver ? (
                      <span className="text-rose-600 font-semibold">
                        Over by {formatCurrency(Math.abs(remaining), currency)}
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium">
                        {formatCurrency(remaining, currency)} remaining
                      </span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
