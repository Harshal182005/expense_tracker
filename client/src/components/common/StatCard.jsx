import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Activity } from 'lucide-react';
import { formatCurrency } from '../../utils/constants';

const iconMap = {
  income: TrendingUp,
  expense: TrendingDown,
  balance: DollarSign,
  savings: PiggyBank,
  transactions: Activity,
};

const colorMap = {
  income: 'from-green-400 to-emerald-600',
  expense: 'from-red-400 to-rose-600',
  balance: 'from-blue-400 to-blue-600',
  savings: 'from-purple-400 to-violet-600',
  transactions: 'from-orange-400 to-amber-600',
};

const bgMap = {
  income: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  expense: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  balance: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  savings: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
  transactions: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
};

const StatCard = ({ title, value, type, subtitle, isCurrency = true, loading = false }) => {
  const Icon = iconMap[type] || DollarSign;

  if (loading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton w-10 h-10 rounded-full" />
        </div>
        <div className="skeleton h-8 w-32 mb-2" />
        <div className="skeleton h-3 w-20" />
      </div>
    );
  }

  return (
    <div className={`card p-6 border ${bgMap[type] || ''} transition-transform hover:scale-[1.02] duration-200`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorMap[type] || 'from-gray-400 to-gray-600'} flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
        {isCurrency ? formatCurrency(value) : value?.toLocaleString('en-IN')}
      </p>
      {subtitle && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
      )}
    </div>
  );
};

export default StatCard;
