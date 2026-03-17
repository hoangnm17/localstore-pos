const { connectDB, sql } = require('./src/config/database');

async function createEventsTable() {
    try {
        const pool = await connectDB();

        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MarketingEvents')
            BEGIN
                CREATE TABLE MarketingEvents (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    name NVARCHAR(255) NOT NULL,
                    description NVARCHAR(MAX),
                    startTime DATETIME NOT NULL,
                    endTime DATETIME NOT NULL,
                    privilegeType NVARCHAR(50) NOT NULL, -- multiplier_points, extra_discount
                    privilegeValue FLOAT NOT NULL,
                    minRank NVARCHAR(50),
                    status NVARCHAR(20) DEFAULT 'Active',
                    createdAt DATETIME DEFAULT GETDATE(),
                    updatedAt DATETIME DEFAULT GETDATE()
                );
                PRINT 'Table MarketingEvents created successfully.';
            END
            ELSE
            BEGIN
                PRINT 'Table MarketingEvents already exists.';
            END
        `);

        process.exit(0);
    } catch (err) {
        console.error('Error creating table:', err);
        process.exit(1);
    }
}

createEventsTable();
