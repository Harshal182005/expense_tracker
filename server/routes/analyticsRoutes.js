const express = require('express');
const router = express.Router();
const { getSummary, getMonthly, getCategories } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary', getSummary);
router.get('/monthly', getMonthly);
router.get('/categories', getCategories);

module.exports = router;
