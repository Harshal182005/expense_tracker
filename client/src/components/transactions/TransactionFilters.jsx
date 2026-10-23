import { Search, Filter, X } from 'lucide-react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../../utils/constants';

const TransactionFilters = ({ filters, onChange, onReset }) => {
  const allCategories = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])].sort();

  const handleChange = (key, value) => onChange({ ...filters, [key]: value });

  const hasActiveFilters = Object.entries(filters).some(
    ([k, v]) => v && k !== 'page' && k !== 'sortBy' && k !== 'sortOrder'
  );

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Filter className="w-4 h-4" />
          Filters
        </div>
        {hasActiveFilters && (
          <button onClick={onReset} className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="form-input pl-9"
            value={filters.search || ''}
            onChange={e => handleChange('search', e.target.value)}
          />
        </div>

        {/* Type */}
        <select className="form-input" value={filters.type || ''} onChange={e => handleChange('type', e.target.value)}>
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        {/* Category */}
        <select className="form-input" value={filters.category || ''} onChange={e => handleChange('category', e.target.value)}>
          <option value="">All Categories</option>
          {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Payment Method */}
        <select className="form-input" value={filters.paymentMethod || ''} onChange={e => handleChange('paymentMethod', e.target.value)}>
          <option value="">All Methods</option>
          {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        {/* Date range */}
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">From Date</label>
          <input type="date" className="form-input" value={filters.startDate || ''} onChange={e => handleChange('startDate', e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">To Date</label>
          <input type="date" className="form-input" value={filters.endDate || ''} onChange={e => handleChange('endDate', e.target.value)} />
        </div>

        {/* Amount range */}
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Min Amount</label>
          <input type="number" min="0" placeholder="₹0" className="form-input" value={filters.minAmount || ''} onChange={e => handleChange('minAmount', e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Max Amount</label>
          <input type="number" min="0" placeholder="₹∞" className="form-input" value={filters.maxAmount || ''} onChange={e => handleChange('maxAmount', e.target.value)} />
        </div>
      </div>

      {/* Sort */}
      <div className="flex gap-3 pt-1 border-t border-gray-100 dark:border-gray-700">
        <select className="form-input text-sm" value={filters.sortBy || 'date'} onChange={e => handleChange('sortBy', e.target.value)}>
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
          <option value="description">Sort by Description</option>
          <option value="category">Sort by Category</option>
        </select>
        <select className="form-input text-sm w-36" value={filters.sortOrder || 'desc'} onChange={e => handleChange('sortOrder', e.target.value)}>
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </select>
      </div>
    </div>
  );
};

export default TransactionFilters;
