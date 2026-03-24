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

        // 4. Revenue Stats (Tính doanh thu thực tế = Hóa đơn - Hoàn trả)
        const revenueStats = await pool.request().query(`
            SELECT 
                (
                    (SELECT ISNULL(SUM(finalAmount), 0) FROM Invoices WHERE status != 'CANCELLED' AND CAST(createdAt AS DATE) = CAST(GETDATE() AS DATE))
                    - 
                    (SELECT ISNULL(SUM(totalRefundAmount), 0) FROM Returns WHERE status = 'Approve' AND CAST(createdAt AS DATE) = CAST(GETDATE() AS DATE))
                ) as todayRevenue,
                (
                    (SELECT ISNULL(SUM(finalAmount), 0) FROM Invoices WHERE status != 'CANCELLED' AND createdAt >= DATEADD(day, -7, GETDATE()))
                    - 
                    (SELECT ISNULL(SUM(totalRefundAmount), 0) FROM Returns WHERE status = 'Approve' AND createdAt >= DATEADD(day, -7, GETDATE()))
                ) as weekRevenue,
                (
                    (SELECT ISNULL(SUM(finalAmount), 0) FROM Invoices WHERE status != 'CANCELLED' AND createdAt >= DATEADD(month, -1, GETDATE()))
                    - 
                    (SELECT ISNULL(SUM(totalRefundAmount), 0) FROM Returns WHERE status = 'Approve' AND createdAt >= DATEADD(month, -1, GETDATE()))
                ) as monthRevenue
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

        // 8. Chart Data (Doanh thu thực tế theo giờ = Hóa đơn - Hoàn trả)
        const chartRes = await pool.request().query(`
            SELECT 
                t.time,
                SUM(t.amount) as amount
            FROM (
                SELECT FORMAT(createdAt, 'HH:00') as time, finalAmount as amount
                FROM Invoices
                WHERE createdAt >= CAST(GETDATE() AS DATE) AND status != 'CANCELLED'
                UNION ALL
                SELECT FORMAT(createdAt, 'HH:00') as time, -totalRefundAmount as amount
                FROM Returns
                WHERE createdAt >= CAST(GETDATE() AS DATE) AND status = 'Approve'
            ) t
            GROUP BY t.time
            ORDER BY t.time
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
