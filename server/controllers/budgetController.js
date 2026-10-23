const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Get budgets for a month with actual spending
// @route   GET /api/budgets?month=&year=
exports.getBudgets = async (req, res) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    const budgets = await Budget.find({ userId: req.user._id, month, year });

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const transactions = await Transaction.find({
          userId: req.user._id,
          type: 'expense',
          category: budget.category,
          date: { $gte: startDate, $lte: endDate }
        });

        const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
        const percentage = budget.amount > 0 ? parseFloat((spent / budget.amount * 100).toFixed(1)) : 0;

        return {
          ...budget.toObject(),
          spent,
          percentage,
          remaining: Math.max(0, budget.amount - spent),
          status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'ok'
        };
      })
    );

    res.json({ success: true, data: budgetsWithSpending, month, year });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch budgets' });
  }
};

// @desc    Create budget
// @route   POST /api/budgets
exports.createBudget = async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;

    if (!category || amount === undefined || !month || !year) {
      return res.status(400).json({ success: false, message: 'Category, amount, month and year are required' });
    }

    const budget = await Budget.create({
      userId: req.user._id,
      category,
      amount: parseFloat(amount),
      month: parseInt(month),
      year: parseInt(year)
    });

    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Budget already exists for this category and month' });
    }
    res.status(500).json({ success: false, message: 'Failed to create budget' });
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
exports.updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user._id });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    const { amount, category } = req.body;
    if (amount !== undefined) budget.amount = parseFloat(amount);
    if (category) budget.category = category;

    await budget.save();
    res.json({ success: true, data: budget });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update budget' });
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user._id });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }
    await budget.deleteOne();
    res.json({ success: true, message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete budget' });
  }
};
