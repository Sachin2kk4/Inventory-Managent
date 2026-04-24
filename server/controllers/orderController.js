const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * Order Controller
 * Handles order creation, retrieval, and status management
 * Automatically adjusts product stock on order creation
 */

// @desc    Get all orders (with pagination, filters)
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name');

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('createdBy', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new order (and deduct stock)
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { items, customerName, customerEmail, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must have at least one item',
      });
    }

    // Validate stock availability and build order items
    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.quantity}`,
        });
      }

      const itemTotal = product.price * item.quantity;
      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        total: itemTotal,
      });

      totalAmount += itemTotal;

      // Deduct stock from product
      product.quantity -= item.quantity;
      await product.save();
    }

    // Create the order
    const order = await Order.create({
      items: orderItems,
      customerName,
      customerEmail,
      totalAmount,
      notes,
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;

    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // If cancelling, restore stock
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { quantity: item.quantity },
        });
      }
    }

    order.status = status || order.status;
    order.paymentStatus = paymentStatus || order.paymentStatus;
    await order.save();

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Order deleted' });
  } catch (error) {
    next(error);
  }
};
