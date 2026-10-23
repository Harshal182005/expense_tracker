const Transaction = require('../models/Transaction');

// @desc    Get overall financial summary
// @route   GET /api/analytics/summary
exports.getSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const allTransactions = await Transaction.find({ userId });

    let totalIncome = 0;
    let totalExpense = 0;
    allTransactions.forEach(t => {
      if (t.type === 'income') totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    // Current month stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthTransactions = allTransactions.filter(t => new Date(t.date) >= startOfMonth);

    let monthIncome = 0;
    let monthExpense = 0;
    monthTransactions.forEach(t => {
      if (t.type === 'income') monthIncome += t.amount;
      else monthExpense += t.amount;
    });

    // Category breakdown for all expenses
    const categoryBreakdown = {};
    allTransactions.filter(t => t.type === 'expense').forEach(t => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    });

    const highestCategory = Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])[0];

    // Average monthly expense (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentExpenses = allTransactions.filter(
      t => t.type === 'expense' && new Date(t.date) >= sixMonthsAgo
    );
    const avgMonthlyExpense = recentExpenses.reduce((s, t) => s + t.amount, 0) / 6;

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        totalBalance: totalIncome - totalExpense,
        totalSavings: totalIncome - totalExpense,
        savingsPercentage: totalIncome > 0
          ? parseFloat(((totalIncome - totalExpense) / totalIncome * 100).toFixed(1))
          : 0,
        totalTransactions: allTransactions.length,
        monthIncome,
        monthExpense,
        monthBalance: monthIncome - monthExpense,
        monthTransactions: monthTransactions.length,
        highestCategory: highestCategory
          ? { name: highestCategory[0], amount: highestCategory[1] }
          : null,
        avgMonthlyExpense: parseFloat(avgMonthlyExpense.toFixed(2)),
        categoryBreakdown
      }
    });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch summary' });
  }
};

// @desc    Get monthly income vs expense data
// @route   GET /api/analytics/monthly
exports.getMonthly = async (req, res) => {
  try {
    const userId = req.user._id;
    const months = Math.min(parseInt(req.query.months) || 12, 24);

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const transactions = await Transaction.find({ userId, date: { $gte: startDate } });

    const monthlyMap = {};
    transactions.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[key]) monthlyMap[key] = { income: 0, expense: 0 };
      if (t.type === 'income') monthlyMap[key].income += t.amount;
      else monthlyMap[key].expense += t.amount;
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      result.push({
        month: key,
        label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        shortLabel: monthNames[d.getMonth()],
        income: monthlyMap[key]?.income || 0,
        expense: monthlyMap[key]?.expense || 0,
        savings: (monthlyMap[key]?.income || 0) - (monthlyMap[key]?.expense || 0)
      });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch monthly data' });
  }
};

// @desc    Get category-wise breakdown
// @route   GET /api/analytics/categories
exports.getCategories = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type = 'expense', year, month } = req.query;

    const filter = { userId, type };

    if (year && month) {
      const y = parseInt(year);
      const m = parseInt(month);
      filter.date = {
        $gte: new Date(y, m - 1, 1),
        $lte: new Date(y, m, 0, 23, 59, 59)
      };
    }

    const transactions = await Transaction.find(filter);

    const breakdown = {};
    let total = 0;
    transactions.forEach(t => {
      breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
      total += t.amount;
    });

    const data = Object.entries(breakdown)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? parseFloat((amount / total * 100).toFixed(1)) : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    res.json({ success: true, data, total });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};
