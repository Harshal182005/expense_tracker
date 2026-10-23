const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Budget = require('./models/Budget');

dotenv.config();

const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...\n');

    // Find or create demo user
    let demoUser = await User.findOne({ email: 'demo@example.com' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Arjun Sharma',
        email: 'demo@example.com',
        password: 'demo123456'
      });
      console.log('✅ Demo user created');
    } else {
      console.log('ℹ️  Demo user already exists, resetting data...');
    }

    // Clear existing demo data
    await Transaction.deleteMany({ userId: demoUser._id });
    await Budget.deleteMany({ userId: demoUser._id });

    const now = new Date();
    const transactions = [];

    // Generate 6 months of realistic transaction data
    for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
      const year = now.getFullYear();
      const month = now.getMonth() - monthOffset;
      const baseDate = new Date(year, month, 1);

      // Salary income - 1st of month
      transactions.push({
        userId: demoUser._id,
        type: 'income',
        amount: 60000,
        description: 'Monthly Salary',
        category: 'Salary',
        paymentMethod: 'Net Banking',
        date: new Date(year, month, 1),
        notes: 'Regular monthly salary credit'
      });

      // Freelance income (alternate months)
      if (monthOffset % 2 === 0) {
        transactions.push({
          userId: demoUser._id,
          type: 'income',
          amount: getRandom(5000, 15000),
          description: 'Freelance Web Project',
          category: 'Freelance',
          paymentMethod: 'UPI',
          date: new Date(year, month, 12)
        });
      }

      // Investment returns (quarterly)
      if (monthOffset % 3 === 0) {
        transactions.push({
          userId: demoUser._id,
          type: 'income',
          amount: getRandom(2000, 5000),
          description: 'Mutual Fund Dividend',
          category: 'Investment',
          paymentMethod: 'Net Banking',
          date: new Date(year, month, 20)
        });
      }

      // Fixed monthly expenses
      const fixedExpenses = [
        { desc: 'House Rent', cat: 'Rent', min: 15000, max: 15000, method: 'Net Banking', day: 2 },
        { desc: 'Electricity Bill', cat: 'Bills', min: 900, max: 1600, method: 'UPI', day: 5 },
        { desc: 'Mobile & Internet', cat: 'Bills', min: 600, max: 900, method: 'UPI', day: 6 },
        { desc: 'Netflix & Spotify', cat: 'Entertainment', min: 900, max: 1100, method: 'Credit Card', day: 7 },
        { desc: 'Gym Membership', cat: 'Health', min: 1200, max: 1500, method: 'Cash', day: 8 },
      ];

      fixedExpenses.forEach(exp => {
        transactions.push({
          userId: demoUser._id,
          type: 'expense',
          amount: getRandom(exp.min, exp.max),
          description: exp.desc,
          category: exp.cat,
          paymentMethod: exp.method,
          date: new Date(year, month, exp.day)
        });
      });

      // Variable expenses
      const variableExpenses = [
        { desc: 'Grocery Shopping - BigBasket', cat: 'Food', min: 2500, max: 4000, method: 'UPI', day: 3 },
        { desc: 'Restaurant Dining', cat: 'Food', min: 800, max: 2500, method: 'Credit Card', day: 9 },
        { desc: 'Swiggy / Zomato', cat: 'Food', min: 500, max: 1500, method: 'UPI', day: 14 },
        { desc: 'Uber / Ola Rides', cat: 'Transport', min: 600, max: 2000, method: 'UPI', day: 10 },
        { desc: 'Petrol', cat: 'Transport', min: 1000, max: 2000, method: 'Cash', day: 15 },
        { desc: 'Amazon Shopping', cat: 'Shopping', min: 1000, max: 6000, method: 'Credit Card', day: 11 },
        { desc: 'Clothing & Accessories', cat: 'Shopping', min: 500, max: 3000, method: 'Credit Card', day: 18 },
        { desc: 'Medicine & Health', cat: 'Health', min: 200, max: 800, method: 'Cash', day: 13 },
        { desc: 'Online Course - Udemy', cat: 'Education', min: 500, max: 2000, method: 'Credit Card', day: 20 },
        { desc: 'Movie / OTT Outing', cat: 'Entertainment', min: 400, max: 1200, method: 'Debit Card', day: 22 },
      ];

      variableExpenses.forEach(exp => {
        transactions.push({
          userId: demoUser._id,
          type: 'expense',
          amount: getRandom(exp.min, exp.max),
          description: exp.desc,
          category: exp.cat,
          paymentMethod: exp.method,
          date: new Date(year, month, exp.day)
        });
      });
    }

    await Transaction.insertMany(transactions);
    console.log(`✅ Created ${transactions.length} transactions\n`);

    // Budgets for current month
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const budgets = [
      { category: 'Food', amount: 8000 },
      { category: 'Transport', amount: 3000 },
      { category: 'Shopping', amount: 5000 },
      { category: 'Bills', amount: 3000 },
      { category: 'Entertainment', amount: 2500 },
      { category: 'Health', amount: 3000 },
      { category: 'Education', amount: 3000 },
      { category: 'Rent', amount: 15000 },
      { category: 'Travel', amount: 5000 },
    ];

    await Budget.insertMany(
      budgets.map(b => ({ ...b, userId: demoUser._id, month: currentMonth, year: currentYear }))
    );
    console.log('✅ Created budgets for current month\n');

    console.log('═══════════════════════════════════════');
    console.log('🎉 Seed completed successfully!');
    console.log('───────────────────────────────────────');
    console.log('Demo login credentials:');
    console.log('  Email    : demo@example.com');
    console.log('  Password : demo123456');
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedData();
