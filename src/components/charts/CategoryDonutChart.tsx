import React, { useState } from 'react';
import { Currency } from '../../types';
import { formatCurrency, getCategoryMeta } from '../../utils/formatters';

interface CategoryData {
  category: string;
  amount: number;
  color: string;
}

interface CategoryDonutChartProps {
  data: CategoryData[];
  currency: Currency;
  totalExpenses: number;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  data,
  currency,
  totalExpenses,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0 || totalExpenses <= 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-2xl border border-slate-100 min-h-[220px]">
        <p className="text-sm font-medium text-slate-500">No expenses recorded yet</p>
        <p className="text-xs text-slate-400 mt-1">Log an expense to view category distribution</p>
      </div>
    );
  }

  // Calculate SVG arc paths
  const size = 200;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;
  const slices = data.map((item, index) => {
    const percent = (item.amount / totalExpenses) * 100;
    const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePercent / 100) * circumference);
    cumulativePercent += percent;

    return {
      ...item,
      percent,
      strokeDasharray,
      strokeDashoffset,
      index,
    };
  });

  const activeItem = hoveredIdx !== null ? slices[hoveredIdx] : null;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
      {/* SVG Donut */}
      <div className="relative flex items-center justify-center flex-shrink-0">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />

          {slices.map((slice) => {
            const isHovered = hoveredIdx === slice.index;
            return (
              <circle
                key={slice.category}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(slice.index)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {activeItem ? activeItem.category : 'Total Spent'}
          </span>
          <span className="text-lg font-bold text-slate-900 leading-tight">
            {formatCurrency(activeItem ? activeItem.amount : totalExpenses, currency)}
          </span>
          {activeItem && (
            <span className="text-xs font-semibold text-slate-500">
              {activeItem.percent.toFixed(1)}% of total
            </span>
          )}
        </div>
      </div>

      {/* Legend & Breakdown */}
      <div className="flex-1 w-full space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
        {slices.map((slice) => {
          const isHovered = hoveredIdx === slice.index;
          return (
            <div
              key={slice.category}
              onMouseEnter={() => setHoveredIdx(slice.index)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                isHovered ? 'bg-slate-100/90 font-medium' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="truncate text-slate-700">{slice.category}</span>
              </div>
              <div className="flex items-center space-x-3 text-right flex-shrink-0">
                <span className="font-semibold text-slate-900">
                  {formatCurrency(slice.amount, currency)}
                </span>
                <span className="w-10 text-slate-400 text-right">
                  {slice.percent.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
