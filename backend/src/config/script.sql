USE [master];
GO

-- 1. TẠO DATABASE
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'LocalStorePOS')
BEGIN
    ALTER DATABASE [RetailPOS_DB] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE [RetailPOS_DB];
END
GO

CREATE DATABASE [LocalStorePOS];
GO

USE [LocalStorePOS];
GO

-- ================================================================
-- MODULE 1: AUTH & STAFF (10 Bảng)
-- ================================================================

-- 1. Roles
CREATE TABLE [Roles] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [name] NVARCHAR(50) NOT NULL UNIQUE,
    [description] NVARCHAR(MAX)
);
GO

-- 2. Features (Chức năng hệ thống)
CREATE TABLE [Features] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [featureKey] VARCHAR(100) NOT NULL UNIQUE, 
    [description] NVARCHAR(MAX)
);
GO

-- 3. RoleFeatures (Phân quyền)
CREATE TABLE [RoleFeatures] (
    [roleId] INT NOT NULL,
    [featureId] INT NOT NULL,
    PRIMARY KEY ([roleId], [featureId]),
    CONSTRAINT [FK_RoleFeature_Role] FOREIGN KEY ([roleId]) REFERENCES [Roles]([id]) ON DELETE CASCADE,
    CONSTRAINT [FK_RoleFeature_Feature] FOREIGN KEY ([featureId]) REFERENCES [Features]([id]) ON DELETE CASCADE
);
GO

-- 4. Users
CREATE TABLE [Users] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [roleId] INT NOT NULL, 
    [username] VARCHAR(50) NOT NULL UNIQUE,
    [passwordHash] VARCHAR(255) NOT NULL,
    [isActive] VARCHAR(20) DEFAULT 'active',
    [createdAt] DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT [FK_Users_Roles] FOREIGN KEY ([roleId]) REFERENCES [Roles]([id]),
    CONSTRAINT [CK_Users_Status] CHECK ([isActive] IN ('active', 'locked'))
);
GO

-- 5. Staff
CREATE TABLE [Staff] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [userId] INT UNIQUE,
    [fullName] NVARCHAR(100) NOT NULL,
    [phoneNumber] VARCHAR(20) NOT NULL UNIQUE,
    [email] VARCHAR(100),
    [salaryType] VARCHAR(20) NOT NULL DEFAULT 'hourly',
    [baseSalary] DECIMAL(15, 2) DEFAULT 0,
    [employmentStatus] VARCHAR(20) DEFAULT 'working',
    [createdAt] DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT [FK_Staff_User] FOREIGN KEY ([userId]) REFERENCES [Users]([id]) ON DELETE SET NULL,
    CONSTRAINT [CK_Staff_SalaryType] CHECK ([salaryType] IN ('hourly', 'monthly')),
    CONSTRAINT [CK_Staff_Status] CHECK ([employmentStatus] IN ('working', 'resigned'))
);
GO

-- 6. Counters
CREATE TABLE [Counters] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [counterCode] VARCHAR(50) UNIQUE NOT NULL,
    [counterName] NVARCHAR(100) NOT NULL,
    [status] VARCHAR(20) DEFAULT 'ACTIVE',
    CONSTRAINT [CK_Counters_Status] CHECK ([status] IN ('ACTIVE', 'INACTIVE'))
);
GO

-- 7. Shifts
CREATE TABLE [Shifts] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [name] NVARCHAR(50) NOT NULL,
    [startTime] TIME NOT NULL,
    [endTime] TIME NOT NULL
);
GO

-- 8. WorkSchedules
CREATE TABLE [WorkSchedules] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [staffId] BIGINT NOT NULL,
    [shiftId] INT NOT NULL,
    [workDate] DATE NOT NULL,
    [counterId] BIGINT NULL,
    [checkInTime] DATETIME2 NULL,
    [checkOutTime] DATETIME2 NULL,
    [workedHours] FLOAT DEFAULT 0,
    [status] VARCHAR(20) DEFAULT 'assigned',
    [note] NVARCHAR(MAX),
    
    CONSTRAINT [FK_Schedule_Staff] FOREIGN KEY ([staffId]) REFERENCES [Staff]([id]),
    CONSTRAINT [FK_Schedule_Shift] FOREIGN KEY ([shiftId]) REFERENCES [Shifts]([id]),
    CONSTRAINT [FK_Schedule_Counter] FOREIGN KEY ([counterId]) REFERENCES [Counters]([id]),
    CONSTRAINT [CK_Schedule_Status] CHECK ([status] IN ('assigned', 'working', 'completed', 'absent', 'late')),
    CONSTRAINT [UQ_Staff_Schedule] UNIQUE ([staffId], [shiftId], [workDate])
);
GO

-- 9. CashHandovers
CREATE TABLE [CashHandovers] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [scheduleId] INT NOT NULL UNIQUE,
    [handoverTime] DATETIME2 DEFAULT GETDATE(),
    [openingCash] DECIMAL(15, 2) DEFAULT 0,
    [systemCash] DECIMAL(15, 2) NOT NULL,
    [actualCash] DECIMAL(15, 2) NOT NULL,
    [difference] AS ([actualCash] - ([openingCash] + [systemCash])) PERSISTED,
    [note] NVARCHAR(MAX),
    
    CONSTRAINT [FK_Handover_Schedule] FOREIGN KEY ([scheduleId]) REFERENCES [WorkSchedules]([id])
);
GO

-- 10. Payrolls
CREATE TABLE [Payrolls] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [staffId] BIGINT NOT NULL,
    [month] INT NOT NULL,
    [year] INT NOT NULL,
    [appliedBaseSalary] DECIMAL(15, 2) NOT NULL,
    [appliedSalaryType] VARCHAR(20) NOT NULL,
    [totalWorkUnit] FLOAT NOT NULL,
    [provisionalSalary] DECIMAL(15, 2),
    [deductions] DECIMAL(15, 2) DEFAULT 0,
    [finalAmount] DECIMAL(15, 2),
    [note] NVARCHAR(MAX),
    [status] VARCHAR(20) DEFAULT 'draft',
    [createdAt] DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT [FK_Payroll_Staff] FOREIGN KEY ([staffId]) REFERENCES [Staff]([id]),
    CONSTRAINT [CK_Payroll_Status] CHECK ([status] IN ('draft', 'paid')),
    CONSTRAINT [UQ_Payroll_Period] UNIQUE ([staffId], [month], [year])
);
GO

-- ================================================================
-- MODULE 2: PRODUCT CATALOG (6 Bảng)
-- ================================================================

-- 11. Categories
CREATE TABLE [Categories] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [name] NVARCHAR(100) NOT NULL,
    [parentId] INT NULL,
    [status] BIT DEFAULT 1, 
    CONSTRAINT [FK_Category_Parent] FOREIGN KEY ([parentId]) REFERENCES [Categories]([id])
);
GO

-- 12. Products
CREATE TABLE [Products] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [code] VARCHAR(50) NOT NULL UNIQUE,
    [barcode] VARCHAR(50) UNIQUE,
    [name] NVARCHAR(200) NOT NULL,
    [categoryId] INT,
    [baseUnit] NVARCHAR(20) NOT NULL,
    [allowDecimalQuantity] BIT DEFAULT 0,
    [costPrice] DECIMAL(15, 2) DEFAULT 0,
    [salePrice] DECIMAL(15, 2) DEFAULT 0,
    [isCombo] BIT DEFAULT 0,
    [status] VARCHAR(20) DEFAULT 'Selling',
    [createdAt] DATETIME2 DEFAULT GETDATE(),
    [updatedAt] DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT [FK_Product_Category] FOREIGN KEY ([categoryId]) REFERENCES [Categories]([id]),
    CONSTRAINT [CK_Product_Status] CHECK ([status] IN ('Selling', 'StopSelling', 'Suspended'))
);
GO

-- 13. ProductUnits
CREATE TABLE [ProductUnits] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [productId] BIGINT NOT NULL,
    [unitName] NVARCHAR(20) NOT NULL,
    [conversionFactor] INT NOT NULL,
    [price] DECIMAL(15, 2) NOT NULL,
    [barcode] VARCHAR(50) UNIQUE,
    
    CONSTRAINT [FK_Unit_Product] FOREIGN KEY ([productId]) REFERENCES [Products]([id]) ON DELETE CASCADE
);
GO

-- 14. ProductCombos
CREATE TABLE [ProductCombos] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [parentProductId] BIGINT NOT NULL,
    [childProductId] BIGINT NOT NULL,
    [quantity] INT DEFAULT 1,
    
    CONSTRAINT [FK_Combo_Parent] FOREIGN KEY ([parentProductId]) REFERENCES [Products]([id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Combo_Child] FOREIGN KEY ([childProductId]) REFERENCES [Products]([id])
);
GO

-- 15. ProductPriceHistories
CREATE TABLE [ProductPriceHistories] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [productId] BIGINT NOT NULL,
    [oldPrice] DECIMAL(15, 2),
    [newPrice] DECIMAL(15, 2),
    [changedBy] BIGINT, 
    [changedAt] DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT [FK_History_Product] FOREIGN KEY ([productId]) REFERENCES [Products]([id]) ON DELETE CASCADE,
    CONSTRAINT [FK_History_Staff] FOREIGN KEY ([changedBy]) REFERENCES [Staff]([id])
);
GO

-- 16. LabelPrintQueue
CREATE TABLE [LabelPrintQueue] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [productId] BIGINT NOT NULL,
    [barcode] VARCHAR(50) NOT NULL,
    [quantity] INT DEFAULT 1,
    [status] VARCHAR(20) DEFAULT 'Pending',
    [createdAt] DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT [FK_Queue_Product] FOREIGN KEY ([productId]) REFERENCES [Products]([id]) ON DELETE CASCADE,
    CONSTRAINT [CK_Queue_Status] CHECK ([status] IN ('Pending', 'Printed', 'Cancelled'))
);
GO

-- ================================================================
-- MODULE 3: SUPPLY CHAIN & INVENTORY (FIXED VERSION)
-- ================================================================

-- 17. Suppliers
CREATE TABLE [Suppliers] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [name] NVARCHAR(255) NOT NULL,
    [contactInfo] NVARCHAR(255),
    [address] NVARCHAR(255)
);
GO


-- 18. InventoryStocks
CREATE TABLE InventoryStocks (
    [productId] BIGINT NOT NULL,
    [quantityOnHand] DECIMAL(15,3) NOT NULL DEFAULT 0,
    [minThreshold] DECIMAL(15,3) NOT NULL DEFAULT 0,

    CONSTRAINT PK_InventoryStocks PRIMARY KEY (productId),
    CONSTRAINT FK_InventoryStocks_Product
        FOREIGN KEY (productId) REFERENCES Products(id)
);
GO


-- 19. PurchaseOrders
CREATE TABLE [PurchaseOrders] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [createdBy] BIGINT NOT NULL,
    [approvedBy] BIGINT NULL,
    [supplierId] INT NOT NULL,
    [status] VARCHAR(20) NOT NULL DEFAULT 'Draft',
    [createdAt] DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT [FK_PO_CreatedBy]
        FOREIGN KEY ([createdBy]) REFERENCES [Staff]([id]),

    CONSTRAINT [FK_PO_ApprovedBy]
        FOREIGN KEY ([approvedBy]) REFERENCES [Staff]([id]),

    CONSTRAINT [FK_PO_Supplier]
        FOREIGN KEY ([supplierId]) REFERENCES [Suppliers]([id]),

    CONSTRAINT [CK_PO_Status]
        CHECK ([status] IN ('Draft','Pending','Approved','Received','Cancelled'))
);
GO


-- 20. PurchaseOrderItems
CREATE TABLE [PurchaseOrderItems] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [poId] INT NOT NULL,
    [productId] BIGINT NOT NULL,
    [quantityBeforeOrdered] INT NOT NULL,
    [quantityOrdered] INT NOT NULL,

    CONSTRAINT [FK_POI_PO]
        FOREIGN KEY ([poId]) REFERENCES [PurchaseOrders]([id]) ON DELETE CASCADE,

    CONSTRAINT [FK_POI_Product]
        FOREIGN KEY ([productId]) REFERENCES [Products]([id])
);
GO


-- 21. InventoryAdjustments
CREATE TABLE [InventoryAdjustments] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [createdBy] BIGINT NOT NULL,
    [reason] NVARCHAR(50) NOT NULL,
    [status] VARCHAR(20) DEFAULT 'Pending',
    [createdAt] DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT [FK_Adjustment_Staff]
        FOREIGN KEY ([createdBy]) REFERENCES [Staff]([id]),

    CONSTRAINT [CK_Adjustment_Status]
        CHECK ([status] IN ('Pending','Approved','Rejected'))
);
GO


-- 22. InventoryAdjustmentItems
CREATE TABLE [InventoryAdjustmentItems] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [adjustmentId] INT NOT NULL,
    [productId] BIGINT NOT NULL,
    [systemQuantity] INT NOT NULL,
    [actualQuantity] INT NOT NULL,

    CONSTRAINT [FK_IAI_Adjustment]
        FOREIGN KEY ([adjustmentId]) REFERENCES [InventoryAdjustments]([id]) ON DELETE CASCADE,

    CONSTRAINT [FK_IAI_Product]
        FOREIGN KEY ([productId]) REFERENCES [Products]([id])
);
GO


-- 23. ProblematicGoodsReport
CREATE TABLE [ProblematicGoodsReport] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [title] NVARCHAR(255) NOT NULL,
    [issueDescription] NVARCHAR(MAX),
    [reportedBy] BIGINT NOT NULL,
    [status] VARCHAR(20) DEFAULT 'Open',
    [createdAt] DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT [FK_PGR_Staff]
        FOREIGN KEY ([reportedBy]) REFERENCES [Staff]([id])
);
GO



-- ================================================================
-- MODULE 4: CUSTOMERS & PROMOTIONS (4 Bảng)
-- ================================================================

-- 24. Customers
CREATE TABLE [Customers] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [phone] VARCHAR(15) UNIQUE,
    [name] NVARCHAR(100),
    [loyaltyPoints] INT DEFAULT 0,
    [totalSpending] DECIMAL(15,2) DEFAULT 0,
    [status] VARCHAR(20) DEFAULT 'Active',
    [createdAt] DATETIME2 DEFAULT GETDATE(),
    [updatedAt] DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT [CK_Customer_Status] CHECK ([status] IN ('Active', 'Inactive', 'Blocked'))
);
GO

-- 25. Promotions
CREATE TABLE [Promotions] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [name] NVARCHAR(255),
    [type] VARCHAR(20) NOT NULL,
    [value] DECIMAL(15,2) NULL,
    [startDate] DATETIME2,
    [endDate] DATETIME2,
    [status] VARCHAR(20) DEFAULT 'Active',
    [createdAt] DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT [CK_Prom_Type] CHECK ([type] IN ('Percent', 'Amount', 'BuyXGetY')),
    CONSTRAINT [CK_Prom_Status] CHECK ([status] IN ('Active', 'Expired', 'Disabled'))
);
GO

-- 26. PromotionProducts
CREATE TABLE [PromotionProducts] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [promotionId] BIGINT NOT NULL,
    [productId] BIGINT NULL,
    [categoryId] INT NULL,
    
    CONSTRAINT [FK_PP_Promotion] FOREIGN KEY ([promotionId]) REFERENCES [Promotions]([id]) ON DELETE CASCADE,
    CONSTRAINT [FK_PP_Product] FOREIGN KEY ([productId]) REFERENCES [Products]([id]),
    CONSTRAINT [FK_PP_Category] FOREIGN KEY ([categoryId]) REFERENCES [Categories]([id])
);
GO

-- 27. Vouchers
CREATE TABLE [Vouchers] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [code] VARCHAR(30) UNIQUE NOT NULL,
    [value] DECIMAL(15,2) NOT NULL,
    [type] VARCHAR(20) NOT NULL,
    [minOrderValue] DECIMAL(15,2) DEFAULT 0,
    [maxUsage] INT DEFAULT 100,
    [currentUsage] INT DEFAULT 0,
    [startDate] DATETIME2,
    [expiryDate] DATETIME2,
    [status] VARCHAR(20) DEFAULT 'Active',
    [createdAt] DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT [CK_Voucher_Type] CHECK ([type] IN ('Percent', 'Fixed')),
    CONSTRAINT [CK_Voucher_Status] CHECK ([status] IN ('Active', 'Expired', 'Disabled'))
);
GO

-- ================================================================
-- MODULE 5: SALES & TRANSACTIONS (6 Bảng)
-- ================================================================

-- 28. Invoices
CREATE TABLE [Invoices] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [invoiceCode] VARCHAR(50) UNIQUE NOT NULL,
    [staffId] BIGINT NOT NULL,
    [counterId] BIGINT NOT NULL,
    [customerId] BIGINT NULL,
    [totalAmount] DECIMAL(15,2) NOT NULL,
    
    [promotionId] BIGINT NULL,
    [promotionDiscount] DECIMAL(15,2) DEFAULT 0,
    
    [voucherId] INT NULL,
    [voucherDiscount] DECIMAL(15,2) DEFAULT 0,
    
    [usedPoints] INT DEFAULT 0,
    [pointDiscount] DECIMAL(15,2) DEFAULT 0,
    
    [finalAmount] DECIMAL(15,2) NOT NULL,
    
    [status] VARCHAR(20) DEFAULT 'UNPAID',
    [createdAt] DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT [FK_Invoice_Staff] FOREIGN KEY ([staffId]) REFERENCES [Staff]([id]),
    CONSTRAINT [FK_Invoice_Counter] FOREIGN KEY ([counterId]) REFERENCES [Counters]([id]),
    CONSTRAINT [FK_Invoice_Customer] FOREIGN KEY ([customerId]) REFERENCES [Customers]([id]),
    CONSTRAINT [FK_Invoice_Promotion] FOREIGN KEY ([promotionId]) REFERENCES [Promotions]([id]),
    CONSTRAINT [FK_Invoice_Voucher] FOREIGN KEY ([voucherId]) REFERENCES [Vouchers]([id]),
    CONSTRAINT [CK_Invoice_Status] CHECK ([status] IN ('UNPAID', 'PAID', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED'))
);
GO

-- 29. InvoiceItems
CREATE TABLE [InvoiceItems] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [invoiceId] BIGINT NOT NULL,
    [productId] BIGINT NOT NULL,
    [productName] NVARCHAR(255) NOT NULL,
    [unitPrice] DECIMAL(15,2) NOT NULL,
    [quantity] INT NOT NULL,
    [lineTotal] DECIMAL(15,2) NOT NULL,
    
    CONSTRAINT [FK_InvItem_Invoice] FOREIGN KEY ([invoiceId]) REFERENCES [Invoices]([id]) ON DELETE CASCADE,
    CONSTRAINT [FK_InvItem_Product] FOREIGN KEY ([productId]) REFERENCES [Products]([id])
);
GO

-- 30. Payments
CREATE TABLE [Payments] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [invoiceId] BIGINT NOT NULL UNIQUE, 
    [paymentMethod] VARCHAR(20) NOT NULL,
    [amount] DECIMAL(15,2) NOT NULL,
    [status] VARCHAR(20) NOT NULL,
    [createdAt] DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT [FK_Payment_Invoice] FOREIGN KEY ([invoiceId]) REFERENCES [Invoices]([id]) ON DELETE CASCADE,
    CONSTRAINT [CK_Payment_Method] CHECK ([paymentMethod] IN ('CASH', 'QR_VNPAY', 'BANK_TRANSFER')),
    CONSTRAINT [CK_Payment_Status] CHECK ([status] IN ('PENDING', 'SUCCESS', 'FAILED'))
);
GO

-- 31. VnPayTransactions
CREATE TABLE [VnPayTransactions] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [invoiceId] BIGINT NOT NULL UNIQUE,
    [txnRef] VARCHAR(100),
    [responseCode] VARCHAR(10),
    [payUrl] NVARCHAR(MAX),
    [status] VARCHAR(20),
    [createdAt] DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT [FK_VnPay_Invoice] FOREIGN KEY ([invoiceId]) REFERENCES [Invoices]([id]) ON DELETE CASCADE,
    CONSTRAINT [CK_VnPay_Status] CHECK ([status] IN ('INIT', 'SUCCESS', 'FAILED'))
);
GO

-- 32. Returns
CREATE TABLE [Returns] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [invoiceId] BIGINT NOT NULL,
    [counterId] BIGINT NOT NULL,
    [staffId] BIGINT NOT NULL,
    
    [returnType] VARCHAR(20) NOT NULL,
    [refundMethod] VARCHAR(20) NOT NULL,
    [totalRefundAmount] DECIMAL(15,2) NOT NULL,
    [reason] NVARCHAR(MAX),
    [createdAt] DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT [FK_Returns_Invoice] FOREIGN KEY ([invoiceId]) REFERENCES [Invoices]([id]),
    CONSTRAINT [FK_Returns_Counter] FOREIGN KEY ([counterId]) REFERENCES [Counters]([id]),
    CONSTRAINT [FK_Returns_Staff] FOREIGN KEY ([staffId]) REFERENCES [Staff]([id]),
    CONSTRAINT [CK_Return_Type] CHECK ([returnType] IN ('REFUND', 'EXCHANGE')),
    CONSTRAINT [CK_Refund_Method] CHECK ([refundMethod] IN ('CASH', 'QR_VNPAY'))
);
GO

-- 33. ReturnItems
CREATE TABLE [ReturnItems] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [returnId] BIGINT NOT NULL,
    [invoiceItemId] BIGINT NOT NULL,
    [productId] BIGINT NOT NULL,
    [quantity] INT NOT NULL,
    [refundAmount] DECIMAL(15,2) NOT NULL,
    
    CONSTRAINT [FK_RItem_Return] FOREIGN KEY ([returnId]) REFERENCES [Returns]([id]) ON DELETE CASCADE,
    CONSTRAINT [FK_RItem_InvItem] FOREIGN KEY ([invoiceItemId]) REFERENCES [InvoiceItems]([id]),
    CONSTRAINT [FK_RItem_Product] FOREIGN KEY ([productId]) REFERENCES [Products]([id])
);
GO

-- ================================================================
-- MODULE 6: LOGS (2 Bảng)
-- ================================================================

-- 34. CustomerPointLogs
CREATE TABLE [CustomerPointLogs] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [customerId] BIGINT NOT NULL,
    [invoiceId] BIGINT NULL,
    [pointChange] INT NOT NULL,
    [reason] NVARCHAR(255),
    [createdAt] DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT [FK_CPL_Customer] FOREIGN KEY ([customerId]) REFERENCES [Customers]([id]),
    CONSTRAINT [FK_CPL_Invoice] FOREIGN KEY ([invoiceId]) REFERENCES [Invoices]([id])
);
GO

-- 35. CustomerVoucherUsage
CREATE TABLE [CustomerVoucherUsage] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [customerId] BIGINT NOT NULL,
    [voucherId] INT NOT NULL,
    [invoiceId] BIGINT NOT NULL,
    [usedAt] DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT [FK_CVU_Customer] FOREIGN KEY ([customerId]) REFERENCES [Customers]([id]),
    CONSTRAINT [FK_CVU_Voucher] FOREIGN KEY ([voucherId]) REFERENCES [Vouchers]([id]),
    CONSTRAINT [FK_CVU_Invoice] FOREIGN KEY ([invoiceId]) REFERENCES [Invoices]([id])
);
GO

-- ================================================================
-- TRIGGERS (Tự động cập nhật updatedAt)
-- ================================================================

CREATE TRIGGER [TR_Products_Update]
ON [Products]
AFTER UPDATE
AS
BEGIN
    UPDATE [Products]
    SET [updatedAt] = GETDATE()
    FROM [Products] t
    INNER JOIN inserted i ON t.id = i.id
END
GO

CREATE TRIGGER [TR_Customers_Update]
ON [Customers]
AFTER UPDATE
AS
BEGIN
    UPDATE [Customers]
    SET [updatedAt] = GETDATE()
    FROM [Customers] t
    INNER JOIN inserted i ON t.id = i.id
END
GO

ALTER TABLE [Categories]
ADD [imageUrl] NVARCHAR(500) NULL;
GO

ALTER TABLE [Products]
ADD [imageUrl] NVARCHAR(500) NULL;
GO

-- END OF SCRIPT

