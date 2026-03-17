﻿USE [master];
GO


CREATE DATABASE [LocalStorePOS_Final];
GO

USE [LocalStorePOS_Final];
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
    [imageUrl] NVARCHAR(500) NULL,
    [name] NVARCHAR(100) NOT NULL,
    [parentId] INT NULL,
    [status] BIT DEFAULT 1, 
    CONSTRAINT [FK_Category_Parent] FOREIGN KEY ([parentId]) REFERENCES [Categories]([id])
);
GO

-- 17. Suppliers
CREATE TABLE [Suppliers] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [name] NVARCHAR(255) NOT NULL,
    [contactInfo] NVARCHAR(255),
    [address] NVARCHAR(255)
);
GO

-- 12. Products
CREATE TABLE [Products] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [code] VARCHAR(50) NOT NULL UNIQUE,
    [imageUrl] NVARCHAR(500) NULL,
    [name] NVARCHAR(200) NOT NULL,
    [categoryId] INT,
    [baseUnit] NVARCHAR(20) NOT NULL,
    [allowDecimalQuantity] BIT DEFAULT 0,
    [isCombo] BIT DEFAULT 0,
    [status] VARCHAR(20) DEFAULT 'Selling',
    [createdAt] DATETIME2 DEFAULT GETDATE(),
    [updatedAt] DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT [FK_Products_Category] FOREIGN KEY ([categoryId]) REFERENCES [Categories]([id])
);
GO

CREATE INDEX [IX_Products_Name] ON [Products]([name]);
GO

-- 13. ProductUnits
CREATE TABLE [ProductUnits] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [productId] BIGINT NOT NULL,
    [unitName] NVARCHAR(20) NOT NULL,
    [unitType] VARCHAR(20) NOT NULL DEFAULT 'PIECE',
    [conversionFactor] DECIMAL(10,3) NOT NULL,
    [salePrice] DECIMAL(15, 2) NOT NULL,
    [barcode] VARCHAR(50) NULL,
    
    CONSTRAINT [FK_ProductUnits_Product] FOREIGN KEY ([productId]) REFERENCES [Products]([id]) ON DELETE CASCADE,
    CONSTRAINT [UQ_ProductUnits_Product_UnitName] UNIQUE ([productId], [unitName]),
    CONSTRAINT [UQ_ProductUnits_ProductId_Id] UNIQUE ([productId], [id]),
    CONSTRAINT [CK_ProductUnits_UnitType] CHECK ([unitType] IN ('PIECE', 'WEIGHT')),
    CONSTRAINT [CK_ProductUnits_ConversionFactor] CHECK ([conversionFactor] > 0),
    CONSTRAINT [CK_ProductUnits_SalePrice] CHECK ([salePrice] >= 0)
);
GO

-- Mỗi sản phẩm chỉ có tối đa 1 base unit (conversionFactor = 1)
CREATE UNIQUE INDEX [UX_ProductUnits_OneBaseUnit]
ON [ProductUnits]([productId])
WHERE [conversionFactor] = 1;
GO

-- Barcode không bắt buộc nhưng nếu có thì phải unique
CREATE UNIQUE INDEX [UX_ProductUnits_Barcode_NotNull]
ON [ProductUnits]([barcode])
WHERE [barcode] IS NOT NULL;
GO

CREATE INDEX [IX_ProductUnits_ProductId]
ON [ProductUnits]([productId]);
GO

CREATE TABLE [ProductSuppliers] (
    [productId] BIGINT NOT NULL,
    [supplierId] INT NOT NULL,
    [status] VARCHAR(20) DEFAULT 'active',
    PRIMARY KEY ([productId], [supplierId]),
    CONSTRAINT [FK_PS_Product] FOREIGN KEY ([productId]) REFERENCES [Products]([id]),
    CONSTRAINT [FK_PS_Supplier] FOREIGN KEY ([supplierId]) REFERENCES [Suppliers]([id])
);
GO

CREATE TABLE [SupplierProductPrices] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [productId] BIGINT NOT NULL,
    [supplierId] INT NOT NULL,
    [unitId] INT NOT NULL,
    [price] DECIMAL(15,2) NOT NULL,
    [createdAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [createdBy] BIGINT NULL,

    CONSTRAINT [FK_SPP_Product] FOREIGN KEY ([productId]) REFERENCES [Products]([id]),
    CONSTRAINT [FK_SPP_Supplier] FOREIGN KEY ([supplierId]) REFERENCES [Suppliers]([id]),
    CONSTRAINT [FK_SPP_ProductUnit] FOREIGN KEY ([unitId]) REFERENCES [ProductUnits]([id]),
    CONSTRAINT [FK_SPP_Staff] FOREIGN KEY ([createdBy]) REFERENCES [Staff]([id])
);
GO

-- 14. ProductCombos
CREATE TABLE [ProductCombos] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [parentProductId] BIGINT NOT NULL,
    [childProductId] BIGINT NOT NULL,
    [quantity] DECIMAL(15,3) NOT NULL DEFAULT 1,
    
    CONSTRAINT [FK_Combo_Parent] FOREIGN KEY ([parentProductId]) REFERENCES [Products]([id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Combo_Child] FOREIGN KEY ([childProductId]) REFERENCES [Products]([id]),
    CONSTRAINT [CK_ProductCombos_Quantity] CHECK ([quantity] > 0),
    CONSTRAINT [CK_ProductCombos_ParentChild] CHECK ([parentProductId] <> [childProductId]),
    CONSTRAINT [UQ_ProductCombos_Parent_Child] UNIQUE ([parentProductId], [childProductId])
);
GO

-- 15. ProductSalePriceHistories
CREATE TABLE [ProductSalePriceHistories] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [productId] BIGINT NOT NULL,
    [productUnitId] INT NOT NULL,
    [oldSalePrice] DECIMAL(15, 2),
    [newSalePrice] DECIMAL(15, 2),
    [changedBy] BIGINT NULL, 
    [changedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT [FK_ProductSalePriceHistories_Product] FOREIGN KEY ([productId]) REFERENCES [Products]([id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ProductSalePriceHistories_ProductUnit]FOREIGN KEY ([productId], [productUnitId])REFERENCES [ProductUnits]([productId], [id]),
    CONSTRAINT [FK_ProductSalePriceHistories_Staff] FOREIGN KEY ([changedBy]) REFERENCES [Staff]([id])
);
GO

-- 16. LabelPrintQueue
CREATE TABLE [LabelPrintQueue] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [productId] BIGINT NOT NULL,
    [productUnitId] INT NOT NULL,
    [barcode] VARCHAR(50) NOT NULL,
    [quantity] INT DEFAULT 1,
    [status] VARCHAR(20) DEFAULT 'Pending',
    [createdAt] DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT [FK_Queue_Product] FOREIGN KEY ([productId]) REFERENCES [Products]([id]) ON DELETE CASCADE,
    CONSTRAINT [FK_LabelPrintQueue_ProductUnit]FOREIGN KEY ([productId], [productUnitId]) REFERENCES [ProductUnits]([productId], [id]),
    CONSTRAINT [CK_Queue_Status] CHECK ([status] IN ('Pending', 'Printed', 'Cancelled')),
    CONSTRAINT [CK_LabelPrintQueue_Quantity] CHECK ([quantity] > 0)
);
GO

-- ================================================================
-- MODULE 3: SUPPLY CHAIN & INVENTORY (FIXED VERSION)
-- ================================================================

-- 18. InventoryStocks
CREATE TABLE InventoryStocks (
    productId BIGINT NOT NULL,
    quantityOnHand DECIMAL(15,3) NOT NULL DEFAULT 0,
    minThreshold DECIMAL(15,3) NOT NULL DEFAULT 0,

    CONSTRAINT PK_InventoryStocks PRIMARY KEY (productId),

    CONSTRAINT FK_InventoryStocks_Product
        FOREIGN KEY (productId) REFERENCES Products(id)
);
GO


-- 19. PurchaseOrders
CREATE TABLE PurchaseOrders (
    id INT IDENTITY(1,1) PRIMARY KEY,

    createdBy BIGINT NOT NULL,
    processBy BIGINT NULL,
    receivedBy BIGINT NULL,

    note NVARCHAR(MAX),

    supplierId INT NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'Pending',

    totalAmount DECIMAL(18,2) DEFAULT 0,

    createdAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_PO_CreatedBy
        FOREIGN KEY (createdBy) REFERENCES Staff(id),

    CONSTRAINT FK_PO_ProcessBy
        FOREIGN KEY (processBy) REFERENCES Staff(id),

    CONSTRAINT FK_PO_ReceivedBy
        FOREIGN KEY (receivedBy) REFERENCES Staff(id),

    CONSTRAINT FK_PO_Supplier
        FOREIGN KEY (supplierId) REFERENCES Suppliers(id),

    CONSTRAINT CK_PO_Status
        CHECK (status IN 
            ('Pending','Approved','Rejected',
             'WaitingForDelivery','Received','CannotDeliver','PartiallyReceived')
        )
);
GO


-- 20. PurchaseOrderItems
CREATE TABLE PurchaseOrderItems (
    id INT IDENTITY(1,1) PRIMARY KEY,

    poId INT NOT NULL,
    productUnitId INT NOT NULL,

    quantity DECIMAL(15,3) NOT NULL,
    costPrice DECIMAL(15,2) NOT NULL,

    total AS (quantity * costPrice) PERSISTED,

    note NVARCHAR(500),

    receivedQuantity DECIMAL(15,3) DEFAULT 0,

    CONSTRAINT FK_POI_PO
        FOREIGN KEY (poId)
        REFERENCES PurchaseOrders(id)
        ON DELETE CASCADE,

    CONSTRAINT FK_POI_ProductUnit
        FOREIGN KEY (productUnitId)
        REFERENCES ProductUnits(id)
);
GO


-- 21. InventoryAdjustments
CREATE TABLE [InventoryAdjustments] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [createdBy] BIGINT NOT NULL,
    [processedBy] BIGINT NULL,
    [reason] NVARCHAR(50) NOT NULL,
    [status] VARCHAR(20) DEFAULT 'Pending',
    [createdAt] DATETIME2 DEFAULT GETDATE(),
    [processedAt] DATETIME2 NULL,

    CONSTRAINT [FK_Adjustment_Staff]
        FOREIGN KEY ([createdBy]) REFERENCES [Staff]([id]),

    CONSTRAINT [FK_Adjustment_Staff]
        FOREIGN KEY ([processedBy]) REFERENCES [Staff]([id]),

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
    [productUnitId] INT NULL, -- Thêm cột này để hỗ trợ giảm giá theo đơn vị cụ thể
    
    CONSTRAINT [FK_PP_Promotion] FOREIGN KEY ([promotionId]) REFERENCES [Promotions]([id]) ON DELETE CASCADE,
    CONSTRAINT [FK_PP_Product] FOREIGN KEY ([productId]) REFERENCES [Products]([id]),
    CONSTRAINT [FK_PP_Category] FOREIGN KEY ([categoryId]) REFERENCES [Categories]([id]),
    CONSTRAINT [FK_PP_ProductUnit] FOREIGN KEY ([productUnitId]) REFERENCES [ProductUnits]([id]) -- Thêm khóa ngoại
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
    CONSTRAINT [CK_Invoice_Status] CHECK ([status] IN ('UNPAID', 'PAID', 'CANCELLED', 'REFUNDED'))
);
GO

-- 29. InvoiceItems
CREATE TABLE InvoiceItems (
    id BIGINT IDENTITY PRIMARY KEY,

    invoiceId BIGINT NOT NULL,

    productId BIGINT NOT NULL,
    -- productUnitId INT NOT NULL,

    productName NVARCHAR(255) NOT NULL,
    -- unitName NVARCHAR(20) NOT NULL,

    unitPrice DECIMAL(15,2) NOT NULL,

    quantity DECIMAL(15,3) NOT NULL,

    -- baseQuantity DECIMAL(15,3) NOT NULL,

    lineTotal DECIMAL(15,2) NOT NULL,

    CONSTRAINT FK_InvoiceItems_Invoice
        FOREIGN KEY (invoiceId) REFERENCES Invoices(id) ON DELETE CASCADE,

    CONSTRAINT FK_InvoiceItems_Product
        FOREIGN KEY (productId) REFERENCES Products(id),

    CONSTRAINT FK_InvoiceItems_ProductUnit
        FOREIGN KEY (productUnitId) REFERENCES ProductUnits(id)
);

-- 30. Payments
CREATE TABLE [Payments] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [invoiceId] BIGINT NOT NULL UNIQUE, 
    [paymentMethod] VARCHAR(20) NOT NULL,
    [amount] DECIMAL(15,2) NOT NULL,
    [status] VARCHAR(20) NOT NULL,
    [createdAt] DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT [FK_Payment_Invoice] FOREIGN KEY ([invoiceId]) REFERENCES [Invoices]([id]) ON DELETE CASCADE,
    CONSTRAINT [CK_Payment_Method] CHECK ([paymentMethod] IN ('CASH', 'BANK_TRANSFER')),
    CONSTRAINT [CK_Payment_Status] CHECK ([status] IN ('PENDING', 'SUCCESS', 'FAILED'))
);
GO

-- 31. SePayTransactions (ĐÃ MỞ KHÓA & CHUẨN HÓA) 
CREATE TABLE [SePayTransactions] ( 
[id] BIGINT IDENTITY(1,1) PRIMARY KEY, 
[invoiceId] BIGINT NOT NULL UNIQUE, 
[sepayId] BIGINT, -- ID giao dịch từ hệ thống SePay 
[transactionContent] NVARCHAR(255), -- Nội dung chuyển khoản để đối soát 
[amountIn] DECIMAL(18, 2), -- Số tiền thực nhận vào ngân hàng 
[bankAccountNumber] VARCHAR(50), [transactionDate] DATETIME2, 
[status] VARCHAR(20) DEFAULT 'PENDING', 
[createdAt] DATETIME2 DEFAULT GETDATE(), 
[confirmedAt] DATETIME2, 
CONSTRAINT [FK_SePay_Invoice] FOREIGN KEY ([invoiceId]) REFERENCES [Invoices]([id]) ON DELETE CASCADE, 
CONSTRAINT [CK_SePay_Status] CHECK ([status] IN ('PENDING', 'SUCCESS', 'EXPIRED')) );

-- 32. Returns (Đã fix lỗi cú pháp và bổ sung liên kết)
CREATE TABLE [Returns] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [invoiceId] BIGINT NOT NULL,
    [counterId] BIGINT NOT NULL,
    [staffId] BIGINT NOT NULL, -- Nhân viên tạo phiếu trả
    
    [returnType] VARCHAR(20) NOT NULL,
    [refundMethod] VARCHAR(20) NOT NULL,
    [totalRefundAmount] DECIMAL(15,2) NOT NULL,
    [reason] NVARCHAR(MAX),
    
    -- [status] VARCHAR(20) DEFAULT 'Pending', -- Đã sửa: Thêm kiểu dữ liệu
    -- [approveBy] BIGINT NULL,               -- Đã sửa: Thêm kiểu dữ liệu và cho phép NULL
    
    -- [createdAt] DATETIME2 DEFAULT GETDATE(),
    
    -- Constraints
    CONSTRAINT [FK_Returns_Invoice] FOREIGN KEY ([invoiceId]) REFERENCES [Invoices]([id]),
    CONSTRAINT [FK_Returns_Counter] FOREIGN KEY ([counterId]) REFERENCES [Counters]([id]),
    CONSTRAINT [FK_Returns_Staff] FOREIGN KEY ([staffId]) REFERENCES [Staff]([id]),
    CONSTRAINT [FK_Returns_ApproveBy] FOREIGN KEY ([approveBy]) REFERENCES [Staff]([id]),
    
    CONSTRAINT [CK_Return_Type] CHECK ([returnType] IN ('REFUND', 'EXCHANGE')),
    CONSTRAINT [CK_Refund_Method] CHECK ([refundMethod] IN ('CASH', 'QR_VNPAY')),
    CONSTRAINT [CK_Return_Status] CHECK ([status] IN ('Pending', 'Approve', 'Reject'))
);
GO


-- 33. ReturnItems
CREATE TABLE ReturnItems (
    id BIGINT IDENTITY PRIMARY KEY,

    returnId BIGINT NOT NULL,

    invoiceItemId BIGINT NOT NULL,

    productId BIGINT NOT NULL,
    -- productUnitId INT NOT NULL,

    productName NVARCHAR(255) NOT NULL,
    -- unitName NVARCHAR(20) NOT NULL,

    quantity DECIMAL(15,3) NOT NULL,

    -- baseQuantity DECIMAL(15,3) NOT NULL,

    refundAmount DECIMAL(15,2) NOT NULL,

    CONSTRAINT FK_RItem_Return
        FOREIGN KEY (returnId) REFERENCES Returns(id) ON DELETE CASCADE,

    CONSTRAINT FK_RItem_InvItem
        FOREIGN KEY (invoiceItemId) REFERENCES InvoiceItems(id),

    CONSTRAINT FK_RItem_Product
        FOREIGN KEY (productId) REFERENCES Products(id),

    CONSTRAINT FK_RItem_ProductUnit
        FOREIGN KEY (productUnitId) REFERENCES ProductUnits(id)
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

ALTER TABLE Invoices
ADD CONSTRAINT DF_Invoices_TotalAmount
DEFAULT 0
FOR TotalAmount;

ALTER TABLE Invoices
ADD CONSTRAINT DF_Invoices_FinalAmount
DEFAULT 0
FOR FinalAmount;

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

CREATE TRIGGER [TR_SupplierProductPrices_Validate]
ON [SupplierProductPrices]
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- unitId phải thuộc đúng productId
    IF EXISTS (
        SELECT 1
        FROM inserted i
        INNER JOIN [ProductUnits] pu ON pu.[id] = i.[unitId]
        WHERE pu.[productId] <> i.[productId]
    )
    BEGIN
        RAISERROR (N'unitId trong SupplierProductPrices phải thuộc đúng productId.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- productId + supplierId phải tồn tại trong ProductSuppliers
    IF EXISTS (
        SELECT 1
        FROM inserted i
        LEFT JOIN [ProductSuppliers] ps
            ON ps.[productId] = i.[productId]
           AND ps.[supplierId] = i.[supplierId]
        WHERE ps.[productId] IS NULL
    )
    BEGIN
        RAISERROR (N'Phải khai báo ProductSuppliers trước khi thêm SupplierProductPrices.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END
GO
-- ===========================================
-- THAY ĐỒI CẤU TRÚC BẢNG SHIFTS & WORKSCHEDULES
-- ===========================================
ALTER TABLE [Shifts]
ADD [checkInStart] TIME NULL,
    [checkInEnd]   TIME NULL,
    [checkOutDeadline] TIME NULL;
    [isActive] BIT NOT NULL DEFAULT 1;
ALTER TABLE [WorkSchedules]
ADD [snapshotStartTime] TIME NULL,
    [snapshotEndTime]   TIME NULL,
    [snapshotShiftName] NVARCHAR(50) NULL;
GO

ALTER TABLE ReturnItems
ADD productName NVARCHAR(250); 

ALTER TABLE ReturnItems
ADD restockApproved BIT NULL,
    checkedAt DATETIME2 NULL,
    checkedBy BIGINT NULL;
GO

ALTER TABLE Returns
ADD approvedAt DATETIME2 NULL;
GO

ALTER TABLE ReturnItems
ADD CONSTRAINT FK_Returns_checkedBy
FOREIGN KEY (checkedBy) REFERENCES Staff(id);
GO

ALTER TABLE ReturnItems
ADD CONSTRAINT DF_ReturnItems_restockApproved
DEFAULT 'Pending' FOR restockApproved;
GO

-- END OF SCRIPT