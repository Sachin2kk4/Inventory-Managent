const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

/**
 * Database Seeder
 * Populates the database with sample data for development/demo
 * Usage: node utils/seeder.js
 */

const sampleProducts = [
  { name: 'MacBook Pro 16"', sku: 'ELEC-001', description: 'Apple MacBook Pro with M3 chip', category: 'Electronics', price: 2499, costPrice: 1800, quantity: 25, lowStockThreshold: 5, supplier: 'Apple Inc.' },
  { name: 'Dell Monitor 27"', sku: 'ELEC-002', description: '4K UHD IPS Monitor', category: 'Electronics', price: 449, costPrice: 280, quantity: 42, lowStockThreshold: 10, supplier: 'Dell Technologies' },
  { name: 'Mechanical Keyboard', sku: 'ELEC-003', description: 'Cherry MX Blue switches', category: 'Electronics', price: 129, costPrice: 65, quantity: 8, lowStockThreshold: 15, supplier: 'Keychron' },
  { name: 'Wireless Mouse', sku: 'ELEC-004', description: 'Ergonomic wireless mouse', category: 'Electronics', price: 79, costPrice: 35, quantity: 3, lowStockThreshold: 10, supplier: 'Logitech' },
  { name: 'USB-C Hub', sku: 'ELEC-005', description: '7-in-1 USB-C multiport adapter', category: 'Electronics', price: 59, costPrice: 22, quantity: 67, lowStockThreshold: 15, supplier: 'Anker' },
  { name: 'Ergonomic Office Chair', sku: 'FURN-001', description: 'Mesh back, adjustable lumbar', category: 'Furniture', price: 399, costPrice: 220, quantity: 15, lowStockThreshold: 5, supplier: 'Herman Miller' },
  { name: 'Standing Desk', sku: 'FURN-002', description: 'Electric height adjustable desk', category: 'Furniture', price: 599, costPrice: 350, quantity: 12, lowStockThreshold: 3, supplier: 'Uplift Desk' },
  { name: 'Premium Coffee Beans 1kg', sku: 'FOOD-001', description: 'Single origin Arabica beans', category: 'Food & Beverages', price: 24, costPrice: 12, quantity: 150, lowStockThreshold: 20, supplier: 'Blue Bottle Coffee' },
  { name: 'Organic Green Tea Box', sku: 'FOOD-002', description: '50 sachets organic green tea', category: 'Food & Beverages', price: 18, costPrice: 8, quantity: 5, lowStockThreshold: 10, supplier: 'Twinings' },
  { name: 'A4 Printer Paper (500 sheets)', sku: 'OFFC-001', description: 'Premium white printer paper', category: 'Office Supplies', price: 12, costPrice: 6, quantity: 200, lowStockThreshold: 25, supplier: 'Hammermill' },
  { name: 'Ballpoint Pen Set (12)', sku: 'OFFC-002', description: 'Black ink, medium point', category: 'Office Supplies', price: 8, costPrice: 3, quantity: 300, lowStockThreshold: 30, supplier: 'Pilot' },
  { name: 'Power Drill Kit', sku: 'TOOL-001', description: '20V cordless drill with 30 bits', category: 'Tools & Hardware', price: 149, costPrice: 75, quantity: 18, lowStockThreshold: 5, supplier: 'DeWalt' },
  { name: 'Running Shoes (Unisex)', sku: 'SPRT-001', description: 'Lightweight mesh running shoes', category: 'Sports & Outdoors', price: 120, costPrice: 55, quantity: 45, lowStockThreshold: 10, supplier: 'Nike' },
  { name: 'Yoga Mat Premium', sku: 'SPRT-002', description: 'Non-slip TPE yoga mat 6mm', category: 'Sports & Outdoors', price: 35, costPrice: 14, quantity: 2, lowStockThreshold: 8, supplier: 'Manduka' },
  { name: 'Vitamin D3 Supplements', sku: 'HLTH-001', description: '365 softgels, 5000 IU', category: 'Health & Beauty', price: 22, costPrice: 9, quantity: 90, lowStockThreshold: 15, supplier: 'NatureWise' },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    // Drop entire orders collection to clear stale indexes
    await mongoose.connection.db.collection('orders').drop().catch(() => {});
    console.log('🗑️  Cleared existing data');

    // Create demo user
    const user = await User.create({
      name: 'Admin User',
      email: 'admin@inventory.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('👤 Demo user created: admin@inventory.com / admin123');

    // Create products
    const productsWithUser = sampleProducts.map((p) => ({ ...p, createdBy: user._id }));
    const products = await Product.insertMany(productsWithUser);
    console.log(`📦 ${products.length} products created`);

    // Create sample orders — use .create() so pre('save') hook runs
    const sampleOrders = [
      {
        items: [
          { product: products[0]._id, productName: products[0].name, quantity: 2, unitPrice: products[0].price, total: products[0].price * 2 },
          { product: products[2]._id, productName: products[2].name, quantity: 1, unitPrice: products[2].price, total: products[2].price },
        ],
        customerName: 'Priya Sharma',
        customerEmail: 'priya@example.com',
        totalAmount: products[0].price * 2 + products[2].price,
        status: 'delivered',
        paymentStatus: 'paid',
        createdBy: user._id,
      },
      {
        items: [
          { product: products[5]._id, productName: products[5].name, quantity: 3, unitPrice: products[5].price, total: products[5].price * 3 },
        ],
        customerName: 'Rahul Gupta',
        customerEmail: 'rahul@example.com',
        totalAmount: products[5].price * 3,
        status: 'processing',
        paymentStatus: 'paid',
        createdBy: user._id,
      },
      {
        items: [
          { product: products[7]._id, productName: products[7].name, quantity: 5, unitPrice: products[7].price, total: products[7].price * 5 },
          { product: products[10]._id, productName: products[10].name, quantity: 10, unitPrice: products[10].price, total: products[10].price * 10 },
        ],
        customerName: 'Anita Verma',
        customerEmail: 'anita@example.com',
        totalAmount: products[7].price * 5 + products[10].price * 10,
        status: 'shipped',
        paymentStatus: 'paid',
        createdBy: user._id,
      },
      {
        items: [
          { product: products[12]._id, productName: products[12].name, quantity: 2, unitPrice: products[12].price, total: products[12].price * 2 },
        ],
        customerName: 'Vikram Singh',
        customerEmail: 'vikram@example.com',
        totalAmount: products[12].price * 2,
        status: 'pending',
        paymentStatus: 'unpaid',
        createdBy: user._id,
      },
      {
        items: [
          { product: products[1]._id, productName: products[1].name, quantity: 1, unitPrice: products[1].price, total: products[1].price },
          { product: products[6]._id, productName: products[6].name, quantity: 1, unitPrice: products[6].price, total: products[6].price },
        ],
        customerName: 'Deepa Nair',
        customerEmail: 'deepa@example.com',
        totalAmount: products[1].price + products[6].price,
        status: 'delivered',
        paymentStatus: 'paid',
        createdBy: user._id,
      },
    ];

    // Use sequential create() to trigger pre('save') hook for orderNumber generation
    for (const orderData of sampleOrders) {
      await Order.create(orderData);
    }
    console.log(`🧾 ${sampleOrders.length} sample orders created`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('📧 Login: admin@inventory.com');
    console.log('🔑 Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedDB();
