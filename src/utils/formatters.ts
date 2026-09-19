import { Currency, RecurringBill, Transaction } from '../types';
import { DEFAULT_CATEGORIES } from '../data/defaultData';

export const formatCurrency = (amount: number, currency: Currency): string => {
  const formattedNumber = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const sign = amount < 0 ? '-' : '';

  if (currency.code === 'JPY') {
    const intFormatted = Math.abs(Math.round(amount)).toLocaleString('en-US');
    return `${sign}${currency.symbol}${intFormatted}`;
  }

  return `${sign}${currency.symbol}${formattedNumber}`;
};

export const formatDateDisplay = (dateString: string): string => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays === 1) return 'Tomorrow';

  return targetDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: targetDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
};

export const getCategoryMeta = (categoryName: string) => {
  const found = DEFAULT_CATEGORIES.find(
    (c) => c.name.toLowerCase() === categoryName.toLowerCase() || c.id === categoryName.toLowerCase()
  );
  if (found) return found;
  return {
    id: 'other',
    name: categoryName,
    color: '#64748b',
    bgColor: '#f1f5f9',
    icon: 'CircleEllipsis',
    type: 'expense' as const,
  };
};

export const getBillDueStatus = (bill: RecurringBill): {
  daysLeft: number;
  status: 'paid' | 'due-today' | 'due-soon' | 'upcoming' | 'overdue';
  badgeText: string;
  badgeClass: string;
} => {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Check if paid this month
  if (bill.lastPaidDate) {
    const [pYear, pMonth] = bill.lastPaidDate.split('-').map(Number);
    if (pYear === currentYear && pMonth === currentMonth + 1) {
      return {
        daysLeft: 0,
        status: 'paid',
        badgeText: 'Paid this month',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    }
  }

  const daysDifference = bill.dueDay - currentDay;

  if (daysDifference < 0) {
    return {
      daysLeft: daysDifference,
      status: 'overdue',
      badgeText: `Overdue by ${Math.abs(daysDifference)}d`,
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse',
    };
  }

  if (daysDifference === 0) {
    return {
      daysLeft: 0,
      status: 'due-today',
      badgeText: 'Due today!',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-300 font-medium',
    };
  }

  if (daysDifference <= 3) {
    return {
      daysLeft: daysDifference,
      status: 'due-soon',
      badgeText: `Due in ${daysDifference} day${daysDifference > 1 ? 's' : ''}`,
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }

  return {
    daysLeft: daysDifference,
    status: 'upcoming',
    badgeText: `Due on ${bill.dueDay}${getOrdinalSuffix(bill.dueDay)}`,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  };
};

const getOrdinalSuffix = (i: number): string => {
  const j = i % 10;
  const k = i % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
};

export const exportToCSV = (transactions: Transaction[]) => {
  const headers = ['ID', 'Date', 'Type', 'Category', 'Title', 'Amount', 'Payment Method', 'Notes'];
  const rows = transactions.map((t) => [
    t.id,
    t.date,
    t.type,
    `"${(t.category || '').replace(/"/g, '""')}"`,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    t.amount.toFixed(2),
    t.paymentMethod,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `money_management_expenses_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
