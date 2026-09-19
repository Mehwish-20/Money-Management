import React, { useState } from 'react';
import {
  CalendarClock,
  Plus,
  Check,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Pencil,
  Trash2,
  Calendar,
  CreditCard,
  BellRing,
} from 'lucide-react';
import { Currency, RecurringBill } from '../../types';
import { formatCurrency, getBillDueStatus } from '../../utils/formatters';
import { CategoryIcon } from '../CategoryIcon';

interface RecurringBillsTabProps {
  recurringBills: RecurringBill[];
  currency: Currency;
  onOpenAddBillModal: (initialBill?: RecurringBill) => void;
  onMarkBillPaid: (billId: string) => void;
  onUnmarkBillPaid: (billId: string) => void;
  onDeleteBill: (billId: string) => void;
}

export const RecurringBillsTab: React.FC<RecurringBillsTabProps> = ({
  recurringBills,
  currency,
  onOpenAddBillModal,
  onMarkBillPaid,
  onUnmarkBillPaid,
  onDeleteBill,
}) => {
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all');

  const today = new Date();
  const currentDay = today.getDate();

  // Process bills with due status
  const billsWithStatus = recurringBills.map((bill) => ({
    bill,
    dueInfo: getBillDueStatus(bill),
  }));

  // Calculations
  const totalMonthlyCommitment = recurringBills.reduce((acc, b) => {
    if (b.frequency === 'yearly') return acc + b.amount / 12;
    if (b.frequency === 'weekly') return acc + b.amount * 4.33;
    return acc + b.amount;
  }, 0);

  const totalPaidThisMonth = billsWithStatus
    .filter((b) => b.dueInfo.status === 'paid')
    .reduce((acc, b) => acc + b.bill.amount, 0);

  const totalRemainingDue = totalMonthlyCommitment - totalPaidThisMonth;

  // Filtered list
  const displayBills = billsWithStatus.filter((b) => {
    if (filter === 'unpaid') return b.dueInfo.status !== 'paid';
    if (filter === 'paid') return b.dueInfo.status === 'paid';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Recurring Bills & Subscriptions</h1>
          <p className="text-xs text-slate-500">
            Track fixed commitments, avoid late fees, and manage billing cycles
          </p>
        </div>

        <button
          id="open-new-bill-btn"
          onClick={() => onOpenAddBillModal()}
          className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Add Recurring Bill</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Monthly Commitment
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(totalMonthlyCommitment, currency)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {recurringBills.length} active recurring services
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Paid So Far This Month
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {formatCurrency(totalPaidThisMonth, currency)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {billsWithStatus.filter((b) => b.dueInfo.status === 'paid').length} of {recurringBills.length} bills settled
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Remaining to Pay
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(Math.max(0, totalRemainingDue), currency)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {billsWithStatus.filter((b) => b.dueInfo.status !== 'paid').length} upcoming payments
          </div>
        </div>
      </div>

      {/* Monthly Due Date Timeline Visualizer */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-slate-500" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              31-Day Due Date Calendar
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Today is Day {currentDay} of the month
          </span>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-11 md:grid-cols-16 gap-1.5">
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
            const isToday = day === currentDay;
            const billsOnDay = recurringBills.filter((b) => b.dueDay === day);
            const hasBills = billsOnDay.length > 0;

            return (
              <div
                key={day}
                className={`p-1.5 rounded-lg text-center transition-all ${
                  isToday
                    ? 'bg-slate-900 text-white font-bold ring-2 ring-slate-900 ring-offset-1'
                    : hasBills
                    ? 'bg-blue-50 border border-blue-200 text-blue-900 font-semibold'
                    : 'bg-slate-50 text-slate-400'
                }`}
                title={
                  hasBills
                    ? `Day ${day}: ${billsOnDay.map((b) => `${b.name} (${formatCurrency(b.amount, currency)})`).join(', ')}`
                    : `Day ${day}`
                }
              >
                <div className="text-[10px]">{day}</div>
                {hasBills && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mx-auto mt-0.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bills Filter & List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Tracked Bills & Subscriptions</h2>
            <p className="text-xs text-slate-500">Mark bills paid each month to record your expenses</p>
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'unpaid', label: 'Unpaid' },
                { id: 'paid', label: 'Paid' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  filter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {displayBills.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
            No bills in this view.
          </div>
        ) : (
          <div className="space-y-3">
            {displayBills.map(({ bill, dueInfo }) => {
              const isPaid = dueInfo.status === 'paid';
              return (
                <div
                  key={bill.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all ${
                    isPaid
                      ? 'bg-slate-50/70 border-slate-200 opacity-80'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {/* Info */}
                  <div className="flex items-center space-x-3 min-w-0 mb-3 sm:mb-0">
                    <CategoryIcon category={bill.category} size={18} />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {bill.name}
                        </span>
                        {bill.autoPay && (
                          <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-slate-100 text-slate-600 rounded-sm">
                            Auto-Pay
                          </span>
                        )}
                        <span className="text-[10px] uppercase font-semibold text-slate-400">
                          {bill.frequency}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] border ${dueInfo.badgeClass}`}>
                          {dueInfo.badgeText}
                        </span>
                        <span className="text-xs text-slate-400">{bill.category}</span>
                        {bill.notes && (
                          <span className="text-xs text-slate-400 italic">• {bill.notes}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="text-base font-bold text-slate-900 block">
                        {formatCurrency(bill.amount, currency)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        per {bill.frequency === 'monthly' ? 'month' : bill.frequency}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {isPaid ? (
                        <button
                          onClick={() => onUnmarkBillPaid(bill.id)}
                          className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                          title="Undo paid status"
                        >
                          <RotateCcw size={12} />
                          <span>Paid</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onMarkBillPaid(bill.id)}
                          className="flex items-center space-x-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                        >
                          <Check size={14} />
                          <span>Mark Paid</span>
                        </button>
                      )}

                      <button
                        onClick={() => onOpenAddBillModal(bill)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit bill details"
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        onClick={() => onDeleteBill(bill.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Delete bill"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
