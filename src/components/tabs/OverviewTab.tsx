import React from 'react';
import {
  TrendingDown,
  TrendingUp,
  Wallet,
  Calendar,
  AlertCircle,
  PiggyBank,
  ArrowRight,
  Plus,
  Clock,
  Check,
  Flame,
} from 'lucide-react';
import { Budget, Currency, RecurringBill, SavingsGoal, Transaction } from '../../types';
import { formatCurrency, getBillDueStatus, formatDateDisplay } from '../../utils/formatters';
import { CategoryDonutChart } from '../charts/CategoryDonutChart';
import { CategoryIcon } from '../CategoryIcon';
import { ActiveTab } from '../Navbar';

interface OverviewTabProps {
  transactions: Transaction[];
  budgets: Budget[];
  recurringBills: RecurringBill[];
  savingsGoals: SavingsGoal[];
  currency: Currency;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenAddTransaction: () => void;
  onOpenDepositModal: (goal: SavingsGoal) => void;
  onMarkBillPaid: (billId: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  transactions,
  budgets,
  recurringBills,
  savingsGoals,
  currency,
  onNavigateTab,
  onOpenAddTransaction,
  onOpenDepositModal,
  onMarkBillPaid,
}) => {
  const today = new Date();
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  // Calculate days left in month
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const currentDay = today.getDate();
  const daysLeftInMonth = Math.max(1, lastDayOfMonth - currentDay + 1);

  // Current month transactions
  const monthTransactions = transactions.filter((t) => t.date.startsWith(currentMonthStr));
  const monthExpenses = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const monthIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Total monthly budget limit
  const totalBudgetLimit = budgets.reduce((acc, b) => acc + b.monthlyLimit, 0);
  const remainingBudget = Math.max(0, totalBudgetLimit - monthExpenses);
  const budgetPercentUsed = totalBudgetLimit > 0 ? (monthExpenses / totalBudgetLimit) * 100 : 0;

  // Safe daily allowance
  const safeDailyAllowance = remainingBudget / daysLeftInMonth;

  // Category breakdown for donut chart
  const categoryMap: Record<string, number> = {};
  monthTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

  const categoryChartData = Object.entries(categoryMap)
    .map(([cat, amt]) => {
      // Find color from default or generator
      return {
        category: cat,
        amount: amt,
        color:
          cat === 'Food & Dining' ? '#f97316' :
          cat === 'Groceries' ? '#10b981' :
          cat === 'Housing & Rent' ? '#3b82f6' :
          cat === 'Transportation' ? '#8b5cf6' :
          cat === 'Utilities & Bills' ? '#06b6d4' :
          cat === 'Entertainment' ? '#ec4899' :
          cat === 'Shopping & Apparel' ? '#f59e0b' : '#64748b',
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Today's spending
  const todayDateStr = today.toISOString().split('T')[0];
  const todayExpenses = transactions
    .filter((t) => t.date === todayDateStr && t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  // Overbudget alerts
  const overBudgetCategories = budgets.filter((b) => {
    const spentInCat = monthTransactions
      .filter((t) => t.type === 'expense' && t.category.toLowerCase() === b.category.toLowerCase())
      .reduce((sum, t) => sum + t.amount, 0);
    return spentInCat >= b.monthlyLimit * 0.9;
  });

  // Upcoming bills (not yet paid this month)
  const pendingBills = recurringBills
    .map((bill) => ({
      bill,
      dueInfo: getBillDueStatus(bill),
    }))
    .filter((item) => item.dueInfo.status !== 'paid')
    .sort((a, b) => a.dueInfo.daysLeft - b.dueInfo.daysLeft)
    .slice(0, 3);

  // Net Savings
  const netSavings = monthIncome - monthExpenses;
  const savingsRate = monthIncome > 0 ? (netSavings / monthIncome) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 rounded-2xl shadow-sm">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-300 font-semibold flex items-center">
            <Flame size={14} className="text-amber-400 mr-1.5" />
            Financial Health Overview • {today.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            {formatCurrency(monthExpenses, currency)}{' '}
            <span className="text-sm font-normal text-slate-300">spent this month</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            You have <strong className="text-emerald-400">{formatCurrency(remainingBudget, currency)}</strong> budget remaining ({daysLeftInMonth} days left in cycle).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="overview-quick-add-btn"
            onClick={onOpenAddTransaction}
            className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-colors"
          >
            <Plus size={16} />
            <span>Track Daily Spend</span>
          </button>
        </div>
      </div>

      {/* Alert if any budget is near or exceeded */}
      {overBudgetCategories.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <span className="font-semibold">Budget Watch: </span>
            {overBudgetCategories.map((b) => b.category).join(', ')}{' '}
            {overBudgetCategories.length === 1 ? 'is' : 'are'} close to or exceeding monthly target limits.
            <button
              onClick={() => onNavigateTab('budgets')}
              className="ml-2 underline font-semibold text-amber-900 hover:text-amber-950"
            >
              Review Budgets →
            </button>
          </div>
        </div>
      )}

      {/* Key Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spent */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Expenses
            </span>
            <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingDown size={18} />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(monthExpenses, currency)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Today's Spend:</span>
            <strong className="text-slate-800">{formatCurrency(todayExpenses, currency)}</strong>
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Remaining Budget
            </span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Wallet size={18} />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(remainingBudget, currency)}
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center justify-between">
            <span>Limit: {formatCurrency(totalBudgetLimit, currency)}</span>
            <span className={budgetPercentUsed > 90 ? 'text-rose-600 font-semibold' : 'text-slate-700'}>
              {budgetPercentUsed.toFixed(0)}% used
            </span>
          </div>
        </div>

        {/* Daily Safe Allowance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Daily Safe-to-Spend
            </span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Calendar size={18} />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(safeDailyAllowance, currency)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Recommended pace for remaining {daysLeftInMonth} days
          </div>
        </div>

        {/* Net Savings & Income */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Net Savings Rate
            </span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <TrendingUp size={18} />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {savingsRate > 0 ? `${savingsRate.toFixed(1)}%` : '0.0%'}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Net: {formatCurrency(netSavings, currency)}</span>
            <span className="text-emerald-600 font-medium">+{formatCurrency(monthIncome, currency)} inc.</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Visual Donut + Recent Daily Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Spending Donut Chart */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Monthly Expense Breakdown</h2>
              <p className="text-xs text-slate-500">Where your money goes across categories</p>
            </div>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              Full Reports <ArrowRight size={13} className="ml-1" />
            </button>
          </div>

          <CategoryDonutChart
            data={categoryChartData}
            currency={currency}
            totalExpenses={monthExpenses}
          />
        </div>

        {/* Recent Daily Expenses List */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recent Daily Expenses</h2>
                <p className="text-xs text-slate-500">Latest recorded transactions</p>
              </div>
              <button
                onClick={() => onNavigateTab('expenses')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                View All <ArrowRight size={13} className="ml-1" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {transactions.slice(0, 5).map((tx) => {
                const isExpense = tx.type === 'expense';
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <CategoryIcon category={tx.category} size={16} />
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate block">
                          {tx.title}
                        </span>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                          <span>{formatDateDisplay(tx.date)}</span>
                          <span>•</span>
                          <span>{tx.paymentMethod}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span
                        className={`text-xs sm:text-sm font-bold ${
                          isExpense ? 'text-slate-900' : 'text-emerald-600'
                        }`}
                      >
                        {isExpense ? '-' : '+'}
                        {formatCurrency(tx.amount, currency)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{tx.category}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing {Math.min(5, transactions.length)} of {transactions.length} entries
            </span>
            <button
              onClick={onOpenAddTransaction}
              className="text-xs font-semibold text-slate-900 hover:text-indigo-600 flex items-center space-x-1"
            >
              <Plus size={14} />
              <span>Log another item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recurring Bills Due + Savings Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recurring Bills Due Soon */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Clock size={16} />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">Upcoming Recurring Bills</h2>
                <p className="text-xs text-slate-500">Never miss scheduled payments</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('recurring')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center"
            >
              Manage Bills <ArrowRight size={13} className="ml-1" />
            </button>
          </div>

          {pendingBills.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
              🎉 All monthly recurring bills have been paid!
            </div>
          ) : (
            <div className="space-y-3">
              {pendingBills.map(({ bill, dueInfo }) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/40"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-slate-800 truncate block">
                        {bill.name}
                      </span>
                      {bill.autoPay && (
                        <span className="text-[10px] bg-slate-200 text-slate-600 font-medium px-1.5 py-0.5 rounded-sm">
                          Auto-Pay
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] mt-0.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] border ${dueInfo.badgeClass}`}>
                        {dueInfo.badgeText}
                      </span>
                      <span className="text-slate-400">{bill.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <span className="text-sm font-bold text-slate-900">
                      {formatCurrency(bill.amount, currency)}
                    </span>
                    <button
                      onClick={() => onMarkBillPaid(bill.id)}
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
                      title="Mark bill paid and record expense"
                    >
                      <Check size={13} />
                      <span className="hidden sm:inline">Pay</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Savings Goals Snapshot */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <PiggyBank size={16} />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">Savings Goals</h2>
                <p className="text-xs text-slate-500">Track progress toward financial targets</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('goals')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center"
            >
              All Goals <ArrowRight size={13} className="ml-1" />
            </button>
          </div>

          <div className="space-y-3.5">
            {savingsGoals.slice(0, 3).map((goal) => {
              const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              return (
                <div
                  key={goal.id}
                  className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/40"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: goal.color }}
                      />
                      <span className="font-semibold text-slate-800 truncate">{goal.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800">{percent}%</span>
                      <button
                        onClick={() => onOpenDepositModal(goal)}
                        className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md"
                      >
                        + Add Funds
                      </button>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: goal.color,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                    <span>
                      Saved: <strong>{formatCurrency(goal.currentAmount, currency)}</strong>
                    </span>
                    <span>Target: {formatCurrency(goal.targetAmount, currency)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
