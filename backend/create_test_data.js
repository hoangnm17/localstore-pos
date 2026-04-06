const { connectDB, sql } = require('./src/config/database');

async function createTestData() {
    try {
        const pool = await connectDB();

        // 1. Tạo khuyến mãi 15% cho sản phẩm 1 (Mì Hảo Hảo)
        const res1 = await pool.request().query(`
            INSERT INTO Promotions (name, type, value, startDate, endDate, status, createdAt)
            OUTPUT INSERTED.id
            VALUES (N'Khuyen mai 15%', 'Percent', 15.00, '2026-03-10', '2026-03-25', 'Active', GETDATE());
        `);
        const p1Id = res1.recordset[0].id;
        await pool.request()
            .input('promoId', sql.BigInt, p1Id)
            .query("INSERT INTO PromotionProducts (promotionId, productId) VALUES (@promoId, 1)");
        console.log('--- Created Promo 1: 15% discount for Product 1 (Mì Hảo Hảo) ---');

        // 2. Tạo khuyến mãi giảm 10,000đ cho sản phẩm 2 (Nước Lavie)
        const res2 = await pool.request().query(`
            INSERT INTO Promotions (name, type, value, startDate, endDate, status, createdAt)
            OUTPUT INSERTED.id
            VALUES (N'Khuyen mai 10k', 'Amount', 10000.00, '2026-03-10', '2026-03-25', 'Active', GETDATE());
        `);
        const p2Id = res2.recordset[0].id;
        await pool.request()
            .input('promoId', sql.BigInt, p2Id)
            .query("INSERT INTO PromotionProducts (promotionId, productId) VALUES (@promoId, 2)");
        console.log('--- Created Promo 2: 10,000 VND discount for Product 2 (Nước Lavie) ---');

        // 3. Tạo khuyến mãi 5% cho toàn bộ Danh mục 1 (Bánh kẹo/Mì gói)
        const res3 = await pool.request().query(`
            INSERT INTO Promotions (name, type, value, startDate, endDate, status, createdAt)
            OUTPUT INSERTED.id
            VALUES (N'Sale Danh muc 5%', 'Percent', 5.00, '2026-03-10', '2026-03-25', 'Active', GETDATE());
        `);
        const p3Id = res3.recordset[0].id;
        await pool.request()
            .input('promoId', sql.BigInt, p3Id)
            .query("INSERT INTO PromotionProducts (promotionId, categoryId) VALUES (@promoId, 1)");
        console.log('--- Created Promo 3: 5% discount for all products in Category 1 ---');

    } catch (err) {
        console.error('Lỗi khi tạo data test:', err);
    } finally {
        process.exit(0);
    }
}

createTestData();
