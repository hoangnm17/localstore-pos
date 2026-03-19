const { connectDB, sql } = require('./src/config/database');

async function fixPermissions() {
    try {
        const pool = await connectDB();

        // 1. Lấy ID của các Roles
        const rolesRes = await pool.request().query("SELECT id, name FROM Roles");
        const managerRole = rolesRes.recordset.find(r => r.name === 'Manager');
        const cashierRole = rolesRes.recordset.find(r => r.name === 'Cashier');

        if (managerRole) {
            // Manager: Gán tất cả mọi quyền trong bảng Features
            await pool.request().input('rid', sql.Int, managerRole.id).query(`
                INSERT INTO RoleFeatures (roleId, featureId)
                SELECT @rid, id FROM Features
                WHERE id NOT IN (SELECT featureId FROM RoleFeatures WHERE roleId = @rid)
            `);
            console.log('--- Cấp toàn bộ quyền cho Manager thành công ---');
        }

        if (cashierRole) {
            // Cashier: Cấp các quyền cơ bản (Bán hàng, Xem sản phẩm, CRM xem khuyến mãi)
            const cashierFeatures = ['SELL_POS', 'VIEW_PRODUCT', 'VIEW_INVOICE', 'CREATE_INVOICE', 'DELETE_INVOICE', 'VIEW_CUSTOMER'];
            await pool.request().input('rid', sql.Int, cashierRole.id).query(`
                INSERT INTO RoleFeatures (roleId, featureId)
                SELECT @rid, id FROM Features
                WHERE featureKey IN ('SELL_POS', 'VIEW_PRODUCT', 'VIEW_INVOICE', 'CREATE_INVOICE', 'DELETE_INVOICE', 'VIEW_CUSTOMER')
                  AND id NOT IN (SELECT featureId FROM RoleFeatures WHERE roleId = @rid)
            `);
            console.log('--- Cấp quyền cơ bản cho Cashier thành công ---');
        }

    } catch (err) {
        console.error('Lỗi khi fix quyền:', err);
    } finally {
        process.exit(0);
    }
}

fixPermissions();
