import { Edit2, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { formatFullCurrency, formatDate, CATEGORY_COLORS } from '../../utils/constants';

const TransactionTable = ({ transactions, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-lg animate-pulse">
            <div className="skeleton w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-1/3" />
              <div className="skeleton h-3 w-1/4" />
            </div>
            <div className="skeleton h-5 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (!transactions?.length) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <ArrowUpCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-gray-500 dark:text-gray-400 font-medium">No transactions found</h3>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Add your first transaction to get started</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Description</th>
              <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Category</th>
              <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Date</th>
              <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Method</th>
              <th className="text-right py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Amount</th>
              <th className="text-right py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {transactions.map(t => (
              <tr key={t._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      t.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {t.type === 'income'
                        ? <ArrowUpCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        : <ArrowDownCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[180px]">{t.description}</p>
                      {t.notes && <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[180px]">{t.notes}</p>}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: CATEGORY_COLORS[t.category] + '20', color: CATEGORY_COLORS[t.category] }}>
                    {t.category}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{formatDate(t.date)}</td>
                <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{t.paymentMethod}</td>
                <td className={`py-3 px-4 text-right font-semibold tabular-nums ${
                  t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {t.type === 'income' ? '+' : '-'}{formatFullCurrency(t.amount)}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(t)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(t._id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {transactions.map(t => (
          <div key={t._id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  t.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {t.type === 'income'
                    ? <ArrowUpCircle className="w-4 h-4 text-green-600" />
                    : <ArrowDownCircle className="w-4 h-4 text-red-600" />
                  }
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{t.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.category} · {formatDate(t.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatFullCurrency(t.amount)}
                </p>
                <div className="flex gap-2 mt-1 justify-end">
                  <button onClick={() => onEdit(t)} className="text-blue-500 hover:text-blue-700">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => onDelete(t._id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default TransactionTable;
