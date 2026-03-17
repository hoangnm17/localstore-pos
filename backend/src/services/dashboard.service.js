const { connectDB, sql } = require('../config/database');

class DashboardService {
    async getSummary() {
        const pool = await connectDB();

        // 1. Staff Stats
        const staffStats = await pool.request().query(`
            SELECT 
                (SELECT COUNT(*) FROM Staff) as totalStaff,
                (SELECT COUNT(*) FROM Staff WHERE employmentStatus = 'OnLeave') as staffOnLeave
        `);

        // 2. Product/Category Stats
        const productStats = await pool.request().query(`
            SELECT 
                (SELECT COUNT(*) FROM Categories) as totalCategories,
                (SELECT COUNT(*) FROM Products WHERE status = 'Active') as totalProducts
        `);

        // 3. Inventory Stats (Low Stock) - Sửa: InventoryStocks và quantityOnHand
        const inventoryStats = await pool.request().query(`
            SELECT COUNT(*) as lowStock 
            FROM InventoryStocks
            WHERE quantityOnHand <= minThreshold
        `);

        // 4. Revenue Stats
        const revenueStats = await pool.request().query(`
            SELECT 
                ISNULL(SUM(CASE WHEN CAST(createdAt AS DATE) = CAST(GETDATE() AS DATE) THEN finalAmount ELSE 0 END), 0) as todayRevenue,
                ISNULL(SUM(CASE WHEN createdAt >= DATEADD(day, -7, GETDATE()) THEN finalAmount ELSE 0 END), 0) as weekRevenue,
                ISNULL(SUM(CASE WHEN createdAt >= DATEADD(month, -1, GETDATE()) THEN finalAmount ELSE 0 END), 0) as monthRevenue
            FROM Invoices
            WHERE status != 'CANCELLED'
        `);

        // 5. Payment Methods
        const paymentStats = await pool.request().query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN paymentMethod = 'BANK' THEN 1 ELSE 0 END) as bank_transfer,
                SUM(CASE WHEN paymentMethod = 'CASH' THEN 1 ELSE 0 END) as cash
            FROM Payments
            WHERE createdAt >= CAST(GETDATE() AS DATE)
        `);

        // 6. CRM Stats
        const crmStats = await pool.request().query(`
            SELECT 
                (SELECT COUNT(*) FROM Promotions WHERE status = 'Active') as totalPromotions,
                (SELECT COUNT(*) FROM Vouchers WHERE status = 'Active') as totalVouchers,
                (SELECT ISNULL(SUM(currentUsage), 0) FROM Vouchers) as usedVouchers
        `);

        // 7. Active Marketing Event
        const eventRes = await pool.request().query(`
            SELECT name FROM MarketingEvents 
            WHERE status = 'Active' AND GETDATE() BETWEEN startTime AND endTime
            ORDER BY createdAt DESC
        `);

        // 8. Chart Data
        const chartRes = await pool.request().query(`
            SELECT 
                FORMAT(createdAt, 'HH:00') as time,
                SUM(finalAmount) as amount
            FROM Invoices
            WHERE createdAt >= CAST(GETDATE() AS DATE) AND status != 'CANCELLED'
            GROUP BY FORMAT(createdAt, 'HH:00')
            ORDER BY time
        `);

        return {
            summary: {
                ...staffStats.recordset[0],
                ...productStats.recordset[0],
                totalVouchers: crmStats.recordset[0].totalVouchers,
                usedVouchers: crmStats.recordset[0].usedVouchers,
                totalPromotions: crmStats.recordset[0].totalPromotions
            },
            inventory: {
                ...inventoryStats.recordset[0],
                newPO: 0,
                newAdjustments: 0
            },
            revenue: revenueStats.recordset[0],
            payments: {
                total: paymentStats.recordset[0].total || 0,
                bank_transfer: paymentStats.recordset[0].bank_transfer || 0,
                cash: paymentStats.recordset[0].cash || 0
            },
            campaign: {
                activeName: eventRes.recordset[0]?.name || 'Không có sự kiện nào'
            },
            chartData: chartRes.recordset.length > 0 ? chartRes.recordset : [
                { time: '08:00', amount: 0 },
                { time: '12:00', amount: 0 },
                { time: '16:00', amount: 0 },
                { time: '20:00', amount: 0 }
            ]
        };
    }
}

module.exports = new DashboardService();
