const { connectDB, sql } = require('./src/config/database');

async function addTestProducts() {
    try {
        const pool = await connectDB();

        const products = [
            { code: 'SP001', name: 'Mì Hảo Hảo Tôm Chua Cay', categoryId: 1, baseUnit: 'Gói', costPrice: 3500, salePrice: 5000, unitName: 'Gói', unitType: 'PIECE', factor: 1, unitPrice: 5000 },
            { code: 'SP002', name: 'Nước Lavie 500ml', categoryId: 2, baseUnit: 'Chai', costPrice: 5000, salePrice: 7000, unitName: 'Chai', unitType: 'PIECE', factor: 1, unitPrice: 7000 },
            { code: 'SP003', name: 'Bánh Snack Oishi', categoryId: 1, baseUnit: 'Gói', costPrice: 8000, salePrice: 10000, unitName: 'Gói', unitType: 'PIECE', factor: 1, unitPrice: 10000 },
            { code: 'SP004', name: 'Nước Coca-Cola 330ml', categoryId: 2, baseUnit: 'Lon', costPrice: 8000, salePrice: 12000, unitName: 'Lon', unitType: 'PIECE', factor: 1, unitPrice: 12000 },
            { code: 'SP005', name: 'Kẹo Gum Extra', categoryId: 1, baseUnit: 'Hộp', costPrice: 15000, salePrice: 20000, unitName: 'Hộp', unitType: 'PIECE', factor: 1, unitPrice: 20000 },
        ];

        for (const p of products) {
            // Tạo sản phẩm
            const res = await pool.request()
                .input('code', sql.VarChar, p.code)
                .input('name', sql.NVarChar, p.name)
                .input('categoryId', sql.Int, p.categoryId)
                .input('baseUnit', sql.NVarChar, p.baseUnit)
                .input('costPrice', sql.Decimal(15, 2), p.costPrice)
                .input('salePrice', sql.Decimal(15, 2), p.salePrice)
                .query(`
                    IF NOT EXISTS (SELECT 1 FROM Products WHERE code = @code)
                    BEGIN
                        INSERT INTO Products (code, name, categoryId, baseUnit, costPrice, salePrice, isCombo, status, allowDecimalQuantity, createdAt)
                        VALUES (@code, @name, @categoryId, @baseUnit, @costPrice, @salePrice, 0, 'Selling', 0, GETDATE());
                    END
                    SELECT id FROM Products WHERE code = @code
                `);
            const productId = res.recordset[0]?.id;
            if (!productId) { console.log(`Skipped ${p.name}`); continue; }

            // Tạo đơn vị tính
            await pool.request()
                .input('productId', sql.BigInt, productId)
                .input('unitName', sql.NVarChar, p.unitName)
                .input('unitType', sql.VarChar, p.unitType)
                .input('factor', sql.Decimal(15, 3), p.factor)
                .input('price', sql.Decimal(15, 2), p.unitPrice)
                .input('barcode', sql.VarChar, p.code + '-001')
                .query(`
                    IF NOT EXISTS (SELECT 1 FROM ProductUnits WHERE productId = @productId AND unitName = @unitName)
                    BEGIN
                        INSERT INTO ProductUnits (productId, unitName, unitType, conversionFactor, price, barcode)
                        VALUES (@productId, @unitName, @unitType, @factor, @price, @barcode);
                    END
                `);

            console.log(`+ Đã thêm: ${p.name} (${p.unitPrice.toLocaleString()}đ)`);
        }

        console.log('\n--- XONG! Refresh trang Bán hàng để thấy sản phẩm ---');
    } catch (err) {
        console.error('Lỗi:', err.message);
    } finally {
        process.exit(0);
    }
}

addTestProducts();
