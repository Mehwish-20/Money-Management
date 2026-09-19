import React, { useState } from 'react';
import { Currency } from '../../types';
import { formatCurrency, formatDateDisplay } from '../../utils/formatters';

interface DailyData {
  date: string; // YYYY-MM-DD
  amount: number;
  label: string;
}

interface DailySpendingBarChartProps {
  data: DailyData[];
  currency: Currency;
  averagePerDay: number;
}

export const DailySpendingBarChart: React.FC<DailySpendingBarChartProps> = ({
  data,
  currency,
  averagePerDay,
}) => {
  const [hoveredDay, setHoveredDay] = useState<DailyData | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-center bg-slate-50 rounded-xl text-slate-400 text-xs">
        No daily spending data recorded for this period
      </div>
    );
  }

  const maxAmount = Math.max(...data.map((d) => d.amount), averagePerDay * 1.3, 20);
  const chartHeight = 160;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3 text-slate-500">
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-xs bg-indigo-600 mr-1.5 inline-block" />
            Daily Spend
          </span>
          <span className="flex items-center">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-500 mr-1.5 inline-block" />
            Daily Avg: <strong className="ml-1 text-slate-700">{formatCurrency(averagePerDay, currency)}</strong>
          </span>
        </div>
        {hoveredDay && (
          <div className="bg-slate-900 text-white px-2.5 py-1 rounded-lg text-xs font-medium shadow-sm animate-fade-in">
            {hoveredDay.label}: {formatCurrency(hoveredDay.amount, currency)}
          </div>
        )}
      </div>

      <div className="relative pt-4 pb-2">
        {/* Average line indicator */}
        {averagePerDay > 0 && maxAmount > 0 && (
          <div
            className="absolute left-0 right-0 border-t border-dashed border-amber-400/80 z-10 pointer-events-none flex items-center justify-end"
            style={{
              bottom: `${(averagePerDay / maxAmount) * chartHeight + 24}px`,
            }}
          >
            <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-1 rounded-xs mr-1 transform -translate-y-1/2">
              Avg
            </span>
          </div>
        )}

        {/* Bars Container */}
        <div className="flex items-end justify-between gap-1 sm:gap-2 h-[160px] border-b border-slate-200 px-1">
          {data.map((item) => {
            const heightPercent = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
            const isHovered = hoveredDay?.date === item.date;
            const isAboveAvg = item.amount > averagePerDay && item.amount > 0;

            return (
              <div
                key={item.date}
                className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                onMouseEnter={() => setHoveredDay(item)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                {/* Bar */}
                <div
                  className={`w-full max-w-[28px] rounded-t-md transition-all duration-200 ${
                    item.amount === 0
                      ? 'bg-slate-100 h-1'
                      : isHovered
                      ? 'bg-slate-900 shadow-md'
                      : isAboveAvg
                      ? 'bg-indigo-600'
                      : 'bg-indigo-400'
                  }`}
                  style={{
                    height: item.amount > 0 ? `${Math.max(heightPercent, 4)}%` : '4px',
                  }}
                />

                {/* Day label */}
                <span className="text-[10px] text-slate-400 group-hover:text-slate-800 font-medium mt-2 truncate w-full text-center">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
