import User from "../../models/User.js";
import Product from "../../models/Product.js";
import Order from "../../models/Order.js";
import SellerVerification from "../../models/SellerVerification.js";
import Report from "../../models/Report.js";
import Payment from "../../models/Payment.js";

/**
 * GET /api/admin/stats
 */
export const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const admins = await User.countDocuments({ role: "admin" });
        const sellersCount = await User.countDocuments({ role: "seller" });
        const productsCount = await Product.countDocuments();
        const ordersCount = await Order.countDocuments();

        // Sum revenue from successful payments, split by purpose
        const payments = await Payment.find({ status: "completed" });
        
        const listingRevenue = payments
          .filter(p => {
              // Priority 1: Explicit purpose
              if (p.purpose) return p.purpose.includes('listing');
              // Priority 2: Gateway Metadata (Stripe)
              if (p.paymentGatewayData?.metadata?.purpose) return p.paymentGatewayData.metadata.purpose.includes('listing');
              // Priority 3: Order Name (Khalti)
              if (p.paymentGatewayData?.purchase_order_name) return p.paymentGatewayData.purchase_order_name.toLowerCase().includes('listing');
              // Fallback: If no purpose and not obviously a boost, it's a listing fee (old data)
              const isBoost = p.paymentGatewayData?.purchase_order_name?.toLowerCase().includes('boost') || 
                              p.paymentGatewayData?.metadata?.purpose?.includes('boost');
              return !isBoost;
          })
          .reduce((acc, p) => acc + (p.amount || 0), 0);

        const boostRevenueFromPayments = payments
          .filter(p => {
              // Priority 1: Explicit purpose
              if (p.purpose) return p.purpose.includes('boost');
              // Priority 2: Gateway Metadata (Stripe)
              if (p.paymentGatewayData?.metadata?.purpose) return p.paymentGatewayData.metadata.purpose.includes('boost');
              // Priority 3: Order Name (Khalti)
              if (p.paymentGatewayData?.purchase_order_name) return p.paymentGatewayData.purchase_order_name.toLowerCase().includes('boost');
              return false;
          })
          .reduce((acc, p) => acc + (p.amount || 0), 0);

        // Fallback/Supplement: Sum boostAmount from Products collection for currently active boosts
        // that might not have corresponding Payment records in this test environment
        const productsWithBoost = await Product.find({ boostAmount: { $gt: 0 } });
        const boostAmountFromProducts = productsWithBoost.reduce((acc, p) => acc + (p.boostAmount || 0), 0);

        // We use the MAX of both or sum them? To be safe, usually total boost revenue = boostRevenueFromPayments.
        // But if boostRevenueFromPayments is 0 and we have boostAmount in products, we should show it.
        const boostRevenue = Math.max(boostRevenueFromPayments, boostAmountFromProducts);
        const totalRevenue = listingRevenue + boostRevenue;


        // Time-based ranges
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());

        // Active Users
        const activeUsers7d = await User.countDocuments({ lastActive: { $gte: sevenDaysAgo } });
        const activeUsers30d = await User.countDocuments({ lastActive: { $gte: thirtyDaysAgo } });

        // Growth metrics
        const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: startOfWeek } });
        const newSellersThisWeek = await User.countDocuments({ role: "seller", createdAt: { $gte: startOfWeek } });

        // View & Engagement stats
        const products = await Product.find({}, 'views likes paymentInfo status category');
        const totalProductViews = products.reduce((acc, p) => acc + (p.views || 0), 0);

        const totalInterestedUsers = products.reduce((acc, p) => acc + (p.likes?.length || 0), 0);

        // Active Sellers (last active within 30 days)
        const activeSellersCount = await User.countDocuments({
            role: "seller",
            isBlocked: false,
            lastActive: { $gte: thirtyDaysAgo }
        });


        // Moderation & Alerts
        const pendingVerifications = await SellerVerification.countDocuments({ status: "pending" });
        const reportedItemsCount = await Report.countDocuments({ status: "pending" });

        // Category breakdown
        const categoryCounts = products.reduce((acc, p) => {
            acc[p.category] = (acc[p.category] || 0) + 1;
            return acc;
        }, {});
        const categoryChartData = Object.keys(categoryCounts).map(cat => ({
            name: cat,
            value: categoryCounts[cat]
        })).sort((a, b) => b.value - a.value).slice(0, 5);

        // Orders Total
        const orders = await Order.find({ status: { $ne: 'cancelled' } });
        const totalSalesValue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

        res.json({
            totalUsers,
            admins,
            sellersCount,
            productsCount,
            ordersCount,
            totalProductViews,
            totalInterestedUsers,
            totalRevenue,
            listingRevenue,
            boostRevenue,
            pendingVerifications,
            reportedItemsCount,
            activeSellersCount,
            totalSalesValue,
            activeUsers7d,
            activeUsers30d,
            newUsersThisWeek,
            newSellersThisWeek,
            categoryChartData
        });
    } catch (err) {
        console.error("Stats Error:", err);
        res.status(500).json({ message: "Failed to load analytics" });
    }
};

/**
 * GET /api/admin/sales-data
 * Returns daily data for the last 14 days
 */
export const getSalesData = async (req, res) => {
    try {
        const days = 14;
        const data = [];
        const now = new Date();

        // Loop through last 14 days
        for (let i = days - 1; i >= 0; i--) {
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 23, 59, 59, 999);

            const dayLabel = startOfDay.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

            // 1. New Users
            const newUsers = await User.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } });

            // 2. New Listings (Inventory)
            const newListings = await Product.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } });

            // 3. Engagement (using Sold Items + New Listings)
            // We use soldAt date to track when seller marked item as sold
            const soldItems = await Product.countDocuments({ soldAt: { $gte: startOfDay, $lte: endOfDay } });

            const engagement = soldItems + (newListings * 2);

            data.push({
                name: dayLabel,
                val1: newUsers,      // New Users
                val2: newListings,   // Listings
                val3: engagement     // Activity Points
            });
        }

        res.json(data);
    } catch (error) {
        console.error("Daily Analytics Error:", error);
        res.status(500).json({ message: "Failed to fetch daily analytics" });
    }
};

/**
 * GET /api/admin/recent-buyers
 */
export const getRecentBuyers = async (req, res) => {
    try {
        // Find recent unique buyers
        const orders = await Order.find().sort({ createdAt: -1 }).limit(20).populate('user', 'name email image');

        // Deduplicate users
        const uniqueBuyers = [];
        const seenUserIds = new Set();

        for (const order of orders) {
            if (order.user && !seenUserIds.has(order.user._id.toString())) {
                seenUserIds.add(order.user._id.toString());
                uniqueBuyers.push({
                    _id: order.user._id,
                    name: order.user.name,
                    email: order.user.email,
                    image: order.user.image, // Assuming user has image
                    lastPurchase: order.createdAt,
                    amount: order.totalAmount
                });
            }
            if (uniqueBuyers.length >= 5) break;
        }

        res.json(uniqueBuyers);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch recent buyers" });
    }
};

/**
 * GET /api/admin/recent-orders
 */
export const getRecentOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'name')
            .populate('items.product', 'name'); // Assuming items has product ref

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch recent orders" });
    }
};

/**
 * GET /api/admin/boosted-products
 * Returns all currently active boosted products across all sellers
 */
export const getAdminBoostedProducts = async (req, res) => {
    try {
        const now = new Date();
        const boosted = await Product.find({ boostedUntil: { $gt: now } })
            .populate({ path: "seller", select: "name email" })
            .sort({ boostedUntil: -1 })
            .lean();
        res.json(boosted);
    } catch (err) {
        console.error("Admin boosted products error:", err);
        res.status(500).json({ message: "Failed to fetch boosted products" });
    }
};

