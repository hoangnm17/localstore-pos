const { connectDB } = require('./src/config/database');

async function renameColumn() {
    try {
        const pool = await connectDB();
        await pool.request().query(`
            EXEC sp_rename 'ProductUnits.price', 'salePrice', 'COLUMN';
        `);
        console.log('--- Đổi tên cột price -> salePrice trong ProductUnits: THÀNH CÔNG ---');
    } catch (err) {
        console.error('Lỗi:', err.message);
    } finally {
        process.exit(0);
    }
}

renameColumn();
