const { connectDB, sql } = require('./src/config/database');

async function fixAll() {
    try {
        const pool = await connectDB();
        console.log('--- Đang dọn đường cho tính năng Bán hàng ---');

        // 1. Tạo Quầy chính (ID = 1) nếu chưa có
        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM Counters WHERE id = 1)
            BEGIN
                SET IDENTITY_INSERT Counters ON;
                INSERT INTO Counters (id, counterCode, counterName, status) VALUES (1, 'C001', N'Quầy chính', 'Active');
                SET IDENTITY_INSERT Counters OFF;
            END
        `);
        console.log('1. Quầy hàng: OK');

        // 2. Gắn tài khoản 'admin' (User ID = 4) vào hồ sơ Staff để có thể bán hàng
        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM Staff WHERE userId = 4)
            BEGIN
                INSERT INTO Staff (userId, fullName, email, phoneNumber, baseSalary, salaryType, employmentStatus)
                VALUES (4, N'Quản trị viên', 'admin@localstore.com', '0123456789', 0, 'hourly', 'working');
            END
        `);
        console.log('2. Hồ sơ Nhân viên cho Admin: OK');

        // 3. Mở khóa toàn bộ quyền Bán hàng & Hóa đơn cho Role 'Manager' và 'Cashier'
        const features = [
            'SELL_POS', 'VIEW_PRODUCT', 'VIEW_INVOICE', 'CREATE_INVOICE',
            'DELETE_INVOICE', 'VIEW_CUSTOMER', 'MANAGE_CRM'
        ];

        // Cấp cho Manager (Tất cả)
        await pool.request().query(`
            INSERT INTO RoleFeatures (roleId, featureId)
            SELECT 1, id FROM Features
            WHERE id NOT IN (SELECT featureId FROM RoleFeatures WHERE roleId = 1)
        `);

        // Cấp cho Cashier (Các quyền bán hàng)
        for (const feature of features) {
            await pool.request().input('fkey', sql.VarChar, feature).query(`
                INSERT INTO RoleFeatures (roleId, featureId)
                SELECT 2, id FROM Features
                WHERE featureKey = @fkey
                  AND id NOT IN (SELECT featureId FROM RoleFeatures WHERE roleId = 2)
            `);
        }
        console.log('3. Phân quyền: OK');

        console.log('--- Xong! Bây giờ bạn hãy Đăng xuất và Đăng nhập lại để vào Bán hàng ---');
    } catch (err) {
        console.error('Lỗi khi xử lý:', err);
    } finally {
        process.exit(0);
    }
}

fixAll();
