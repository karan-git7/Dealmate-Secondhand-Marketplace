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
        const stats = {
            totalUsers: 0,
            admins: 0,
            sellersCount: 0,
            productsCount: 0,
            ordersCount: 0,
            totalProductViews: 0,
            totalInterestedUsers: 0,
            totalRevenue: 0,
            listingRevenue: 0,
            boostRevenue: 0,
            pendingVerifications: 0,
            reportedItemsCount: 0,
            activeSellersCount: 0,
            totalSalesValue: 0,
            activeUsers7d: 0,
            activeUsers30d: 0,
            newUsersThisWeek: 0,
            newSellersThisWeek: 0,
            categoryChartData: []
        };

        // 1. Basic Counts
        try {
            stats.totalUsers = await User.countDocuments();
            stats.admins = await User.countDocuments({ role: "admin" });
            stats.sellersCount = await User.countDocuments({ role: "seller" });
            stats.productsCount = await Product.countDocuments();
            stats.ordersCount = await Order.countDocuments();
        } catch (e) { console.error("Basic counts error:", e); }

        // 2. Revenue Calculation
        try {
            const payments = await Payment.find({ status: "completed" });
            const listingRevenue = payments
                .filter(p => {
                    if (p.purpose === 'listing' || p.purpose?.includes('listing')) return true;
                    const isBoost = p.paymentGatewayData?.purchase_order_name?.toLowerCase().includes('boost') || 
                                    p.paymentGatewayData?.metadata?.purpose?.includes('boost') ||
                                    p.purpose?.includes('boost');
                    return !isBoost;
                })
                .reduce((acc, p) => acc + (p.amount || 0), 0);

            const boostRevenueFromPayments = payments
                .filter(p => {
                    if (p.purpose === 'boost' || p.purpose?.includes('boost')) return true;
                    return p.paymentGatewayData?.purchase_order_name?.toLowerCase().includes('boost') || 
                           p.paymentGatewayData?.metadata?.purpose?.includes('boost');
                })
                .reduce((acc, p) => acc + (p.amount || 0), 0);

            const productsWithBoost = await Product.find({ boostAmount: { $gt: 0 } });
            const boostAmountFromProducts = productsWithBoost.reduce((acc, p) => acc + (p.boostAmount || 0), 0);

            stats.listingRevenue = listingRevenue;
            stats.boostRevenue = Math.max(boostRevenueFromPayments, boostAmountFromProducts);
            stats.totalRevenue = stats.listingRevenue + stats.boostRevenue;
        } catch (e) { console.error("Revenue calculation error:", e); }

        // 3. Time-based metrics
        try {
            const now = new Date();
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());

            stats.activeUsers7d = await User.countDocuments({ lastActive: { $gte: sevenDaysAgo } });
            stats.activeUsers30d = await User.countDocuments({ lastActive: { $gte: thirtyDaysAgo } });
            stats.newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: startOfWeek } });
            stats.newSellersThisWeek = await User.countDocuments({ role: "seller", createdAt: { $gte: startOfWeek } });
            
            stats.activeSellersCount = await User.countDocuments({
                role: "seller",
                isBlocked: false,
                lastActive: { $gte: thirtyDaysAgo }
            });
        } catch (e) { console.error("Time metrics error:", e); }

        // 4. Products & Engagement
        try {
            const products = await Product.find({}, 'views likes category');
            stats.totalProductViews = products.reduce((acc, p) => acc + (p.views || 0), 0);
            stats.totalInterestedUsers = products.reduce((acc, p) => acc + (p.likes?.length || 0), 0);

            const categoryCounts = products.reduce((acc, p) => {
                if (p.category) acc[p.category] = (acc[p.category] || 0) + 1;
                return acc;
            }, {});
            stats.categoryChartData = Object.keys(categoryCounts).map(cat => ({
                name: cat,
                value: categoryCounts[cat]
            })).sort((a, b) => b.value - a.value).slice(0, 5);
        } catch (e) { console.error("Products aggregation error:", e); }

        // 5. Orders & Verification
        try {
            const orders = await Order.find({ status: { $ne: 'cancelled' } });
            stats.totalSalesValue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
            stats.pendingVerifications = await SellerVerification.countDocuments({ status: "pending" });
            stats.reportedItemsCount = await Report.countDocuments({ status: "pending" });
        } catch (e) { console.error("Orders/Verifications error:", e); }

        res.json(stats);
    } catch (err) {
        console.error("Stats Fatal Error:", err);
        res.status(500).json({ 
            message: "A fatal error occurred while loading analytics.", 
            error: err.message 
        });
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

