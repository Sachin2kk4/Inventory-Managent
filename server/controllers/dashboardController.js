const Product = require('../models/Product');
const Order = require('../models/Order');

/**
 * Dashboard Controller
 * Provides aggregated analytics data for the dashboard
 */

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Total products
    const totalProducts = await Product.countDocuments();

    // Low stock products (quantity <= threshold)
    const lowStockProducts = await Product.countDocuments({
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
    });

    // Total inventory value
    const inventoryValueResult = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$price', '$quantity'] } },
          totalCostValue: { $sum: { $multiply: ['$costPrice', '$quantity'] } },
        },
      },
    ]);

    const inventoryValue = inventoryValueResult[0]?.totalValue || 0;
    const inventoryCost = inventoryValueResult[0]?.totalCostValue || 0;

    // Order statistics
    const totalOrders = await Order.countDocuments();

    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Recent orders (last 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'name');

    // Low stock products list (top 5)
    const lowStockList = await Product.find({
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
    })
      .sort({ quantity: 1 })
      .limit(5);

    // Category distribution
    const categoryDistribution = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        lowStockProducts,
        inventoryValue,
        inventoryCost,
        totalOrders,
        totalRevenue,
        ordersByStatus,
        recentOrders,
        lowStockList,
        categoryDistribution,
        monthlyRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};
