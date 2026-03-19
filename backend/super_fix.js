const { connectDB, sql } = require('./src/config/database');

async function superFix() {
    try {
        const pool = await connectDB();
        console.log('--- Đang sửa lỗi Database thần tốc ---');

        // 1. Sửa bảng WorkSchedules
        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('WorkSchedules') AND name = 'snapshotShiftName')
            BEGIN
                ALTER TABLE WorkSchedules ADD 
                    snapshotStartTime TIME, 
                    snapshotEndTime TIME, 
                    snapshotShiftName NVARCHAR(100);
                PRINT 'Added columns to WorkSchedules';
            END
        `);

        // 2. Đảm bảo admin có hồ sơ Staff
        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM Staff WHERE userId = 4)
            BEGIN
                INSERT INTO Staff (userId, fullName, email, phoneNumber, baseSalary, salaryType, employmentStatus)
                VALUES (4, N'Quản trị viên', 'admin@localstore.com', '0123456789', 0, 'hourly', 'working');
                PRINT 'Created Staff record for admin';
            END
        `);

        // 3. Đảm bảo có Quầy hàng
        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM Counters WHERE id = 1)
            BEGIN
                SET IDENTITY_INSERT Counters ON;
                INSERT INTO Counters (id, counterCode, counterName, status) VALUES (1, 'C001', N'Quầy chính', 'Active');
                SET IDENTITY_INSERT Counters OFF;
                PRINT 'Created default Counter';
            END
        `);

        console.log('--- XONG! Bạn hãy F5 trình duyệt và thử lại ngay ---');
    } catch (err) {
        console.error('Lỗi nghiêm trọng:', err.message);
    } finally {
        process.exit(0);
    }
}

superFix();
