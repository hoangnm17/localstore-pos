﻿
CREATE DATABASE LocalStorePOS_Final;
GO

USE LocalStorePOS_Final;
GO
CREATE TABLE [dbo].[CashHandovers](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[scheduleId] [int] NOT NULL,
	[handoverTime] [datetime2](7) NULL,
	[openingCash] [decimal](15, 2) NULL,
	[systemCash] [decimal](15, 2) NOT NULL,
	[actualCash] [decimal](15, 2) NOT NULL,
	[difference]  AS ([actualCash]-([openingCash]+[systemCash])) PERSISTED,
	[note] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[scheduleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Categories]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Categories](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[parentId] [int] NULL,
	[status] [bit] NULL,
	[imageUrl] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Counters]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Counters](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[counterCode] [varchar](50) NOT NULL,
	[counterName] [nvarchar](100) NOT NULL,
	[status] [varchar](20) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[counterCode] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CustomerPointLogs]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CustomerPointLogs](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[customerId] [bigint] NOT NULL,
	[invoiceId] [bigint] NULL,
	[pointChange] [int] NOT NULL,
	[reason] [nvarchar](255) NULL,
	[createdAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Customers]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Customers](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[phone] [varchar](15) NULL,
	[name] [nvarchar](100) NULL,
	[loyaltyPoints] [int] NULL,
	[totalSpending] [decimal](15, 2) NULL,
	[status] [varchar](20) NULL,
	[createdAt] [datetime2](7) NULL,
	[updatedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[phone] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CustomerVoucherUsage]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CustomerVoucherUsage](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[customerId] [bigint] NOT NULL,
	[voucherId] [int] NOT NULL,
	[invoiceId] [bigint] NOT NULL,
	[usedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Features]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Features](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[featureKey] [varchar](100) NOT NULL,
	[description] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[featureKey] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[InventoryAdjustmentItems]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[InventoryAdjustmentItems](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[adjustmentId] [int] NOT NULL,
	[productId] [bigint] NOT NULL,
	[systemQuantity] [decimal](15, 3) NULL,
	[actualQuantity] [decimal](15, 3) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[InventoryAdjustments]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[InventoryAdjustments](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdBy] [bigint] NOT NULL,
	[reason] [nvarchar](50) NOT NULL,
	[status] [varchar](20) NULL,
	[createdAt] [datetime2](7) NULL,
	[processedBy] [bigint] NULL,
	[processedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[InventoryStocks]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[InventoryStocks](
	[productId] [bigint] NOT NULL,
	[quantityOnHand] [decimal](15, 3) NOT NULL,
	[minThreshold] [decimal](15, 3) NOT NULL,
 CONSTRAINT [PK_InventoryStocks] PRIMARY KEY CLUSTERED 
(
	[productId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[InvoiceItems]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[InvoiceItems](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[invoiceId] [bigint] NOT NULL,
	[productId] [bigint] NOT NULL,
	[productName] [nvarchar](255) NOT NULL,
	[unitPrice] [decimal](15, 2) NOT NULL,
	[quantity] [int] NOT NULL,
	[lineTotal] [decimal](15, 2) NOT NULL,
	[productUnitId] [int] NOT NULL,
	[unitName] [nvarchar](20) NOT NULL,
	[baseQuantity] [decimal](15, 3) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Invoices]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Invoices](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[invoiceCode] [varchar](50) NOT NULL,
	[staffId] [bigint] NOT NULL,
	[counterId] [bigint] NOT NULL,
	[customerId] [bigint] NULL,
	[totalAmount] [decimal](15, 2) NOT NULL,
	[promotionId] [bigint] NULL,
	[promotionDiscount] [decimal](15, 2) NULL,
	[voucherId] [int] NULL,
	[voucherDiscount] [decimal](15, 2) NULL,
	[usedPoints] [int] NULL,
	[pointDiscount] [decimal](15, 2) NULL,
	[finalAmount] [decimal](15, 2) NOT NULL,
	[status] [varchar](20) NULL,
	[createdAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[invoiceCode] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[LabelPrintQueue]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[LabelPrintQueue](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[productId] [bigint] NOT NULL,
	[barcode] [varchar](50) NOT NULL,
	[quantity] [int] NULL,
	[status] [varchar](20) NULL,
	[createdAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Payments]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Payments](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[invoiceId] [bigint] NOT NULL,
	[paymentMethod] [varchar](20) NOT NULL,
	[amount] [decimal](15, 2) NOT NULL,
	[status] [varchar](20) NOT NULL,
	[createdAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[invoiceId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Payrolls]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Payrolls](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[staffId] [bigint] NOT NULL,
	[month] [int] NOT NULL,
	[year] [int] NOT NULL,
	[appliedBaseSalary] [decimal](15, 2) NOT NULL,
	[appliedSalaryType] [varchar](20) NOT NULL,
	[totalWorkUnit] [float] NOT NULL,
	[provisionalSalary] [decimal](15, 2) NULL,
	[deductions] [decimal](15, 2) NULL,
	[finalAmount] [decimal](15, 2) NULL,
	[note] [nvarchar](max) NULL,
	[status] [varchar](20) NULL,
	[createdAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Payroll_Period] UNIQUE NONCLUSTERED 
(
	[staffId] ASC,
	[month] ASC,
	[year] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ProblematicGoodsReport]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ProblematicGoodsReport](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[title] [nvarchar](255) NOT NULL,
	[issueDescription] [nvarchar](max) NULL,
	[reportedBy] [bigint] NOT NULL,
	[status] [varchar](20) NULL,
	[createdAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ProductCombos]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ProductCombos](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[parentProductId] [bigint] NOT NULL,
	[childProductId] [bigint] NOT NULL,
	[quantity] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Products]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Products](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[code] [varchar](50) NOT NULL,
	[name] [nvarchar](200) NOT NULL,
	[categoryId] [int] NULL,
	[baseUnit] [nvarchar](20) NOT NULL,
	[allowDecimalQuantity] [bit] NULL,
	[isCombo] [bit] NULL,
	[status] [varchar](20) NULL,
	[createdAt] [datetime2](7) NULL,
	[updatedAt] [datetime2](7) NULL,
	[imageUrl] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ProductSalePriceHistories]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ProductSalePriceHistories](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[productId] [bigint] NOT NULL,
	[productUnitId] [int] NOT NULL,
	[oldSalePrice] [decimal](15, 2) NULL,
	[newSalePrice] [decimal](15, 2) NULL,
	[changedBy] [bigint] NULL,
	[changedAt] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ProductSuppliers]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ProductSuppliers](
	[productId] [bigint] NOT NULL,
	[supplierId] [int] NOT NULL,
	[status] [varchar](20) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[productId] ASC,
	[supplierId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ProductUnits]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ProductUnits](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[productId] [bigint] NOT NULL,
	[unitName] [nvarchar](20) NOT NULL,
	[conversionFactor] [int] NOT NULL,
	[salePrice] [decimal](15, 2) NOT NULL,
	[barcode] [varchar](50) NULL,
	[unitType] [varchar](20) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PromotionProducts]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PromotionProducts](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[promotionId] [bigint] NOT NULL,
	[productId] [bigint] NULL,
	[categoryId] [int] NULL,
	[productUnitId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Promotions]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Promotions](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](255) NULL,
	[type] [varchar](20) NOT NULL,
	[value] [decimal](15, 2) NULL,
	[startDate] [datetime2](7) NULL,
	[endDate] [datetime2](7) NULL,
	[status] [varchar](20) NULL,
	[createdAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PurchaseOrderItems]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PurchaseOrderItems](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[poId] [int] NOT NULL,
	[productUnitId] [int] NOT NULL,
	[quantity] [decimal](15, 3) NOT NULL,
	[costPrice] [decimal](15, 2) NOT NULL,
	[note] [nvarchar](500) NULL,
	[receivedQuantity] [decimal](15, 3) NULL,
	[receivedTotal]  AS ([receivedQuantity]*[costPrice]) PERSISTED,
	[total]  AS ([quantity]*[costPrice]) PERSISTED,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PurchaseOrders]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PurchaseOrders](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[createdBy] [bigint] NOT NULL,
	[processBy] [bigint] NULL,
	[supplierId] [int] NOT NULL,
	[status] [varchar](20) NOT NULL,
	[createdAt] [datetime2](7) NULL,
	[note] [nvarchar](max) NULL,
	[receivedBy] [bigint] NULL,
	[totalAmount] [decimal](18, 2) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ReturnItems]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ReturnItems](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[returnId] [bigint] NOT NULL,
	[invoiceItemId] [bigint] NOT NULL,
	[productId] [bigint] NOT NULL,
	[quantity] [int] NOT NULL,
	[refundAmount] [decimal](15, 2) NOT NULL,
	[productName] [nvarchar](250) NULL,
	[restockApproved] [varchar](20) NULL,
	[checkedAt] [datetime2](7) NULL,
	[checkedBy] [bigint] NULL,
	[productUnitId] [int] NULL,
	[unitName] [nvarchar](20) NULL,
	[baseQuantity] [decimal](15, 3) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Returns]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Returns](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[invoiceId] [bigint] NOT NULL,
	[counterId] [bigint] NOT NULL,
	[staffId] [bigint] NOT NULL,
	[returnType] [varchar](20) NOT NULL,
	[refundMethod] [varchar](20) NOT NULL,
	[totalRefundAmount] [decimal](15, 2) NOT NULL,
	[reason] [nvarchar](max) NULL,
	[createdAt] [datetime2](7) NULL,
	[approvedAt] [datetime2](7) NULL,
	[status] [varchar](20) NOT NULL,
	[approveBy] [bigint] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RoleFeatures]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RoleFeatures](
	[roleId] [int] NOT NULL,
	[featureId] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[roleId] ASC,
	[featureId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Roles]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Roles](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](50) NOT NULL,
	[description] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Shifts]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Shifts](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](50) NOT NULL,
	[startTime] [time](7) NOT NULL,
	[endTime] [time](7) NOT NULL,
	[checkInStart] [time](7) NULL,
	[checkInEnd] [time](7) NULL,
	[checkOutDeadline] [time](7) NULL,
	[isActive] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Staff]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Staff](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[userId] [int] NULL,
	[fullName] [nvarchar](100) NOT NULL,
	[phoneNumber] [varchar](20) NOT NULL,
	[email] [varchar](100) NULL,
	[salaryType] [varchar](20) NOT NULL,
	[baseSalary] [decimal](15, 2) NULL,
	[employmentStatus] [varchar](20) NULL,
	[createdAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[phoneNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[userId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SupplierProductPrices]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SupplierProductPrices](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[productId] [bigint] NOT NULL,
	[supplierId] [int] NOT NULL,
	[price] [decimal](15, 2) NOT NULL,
	[createdAt] [datetime2](7) NULL,
	[createdBy] [int] NULL,
	[unitId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Suppliers]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Suppliers](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](255) NOT NULL,
	[contactInfo] [nvarchar](255) NULL,
	[address] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Users]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[roleId] [int] NOT NULL,
	[username] [varchar](50) NOT NULL,
	[passwordHash] [varchar](255) NOT NULL,
	[isActive] [varchar](20) NULL,
	[createdAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[username] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[VnPayTransactions]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[VnPayTransactions](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[invoiceId] [bigint] NOT NULL,
	[txnRef] [varchar](100) NULL,
	[responseCode] [varchar](10) NULL,
	[payUrl] [nvarchar](max) NULL,
	[status] [varchar](20) NULL,
	[createdAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[invoiceId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Vouchers]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Vouchers](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[code] [varchar](30) NOT NULL,
	[value] [decimal](15, 2) NOT NULL,
	[type] [varchar](20) NOT NULL,
	[minOrderValue] [decimal](15, 2) NULL,
	[maxUsage] [int] NULL,
	[currentUsage] [int] NULL,
	[startDate] [datetime2](7) NULL,
	[expiryDate] [datetime2](7) NULL,
	[status] [varchar](20) NULL,
	[createdAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[WorkSchedules]    Script Date: 3/17/2026 12:49:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[WorkSchedules](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[staffId] [bigint] NOT NULL,
	[shiftId] [int] NOT NULL,
	[workDate] [date] NOT NULL,
	[counterId] [bigint] NULL,
	[checkInTime] [datetime2](7) NULL,
	[checkOutTime] [datetime2](7) NULL,
	[workedHours] [float] NULL,
	[status] [varchar](20) NULL,
	[note] [nvarchar](max) NULL,
	[snapshotStartTime] [time](7) NULL,
	[snapshotEndTime] [time](7) NULL,
	[snapshotShiftName] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Staff_Schedule] UNIQUE NONCLUSTERED 
(
	[staffId] ASC,
	[shiftId] ASC,
	[workDate] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE [dbo].[CashHandovers] ADD  DEFAULT (getdate()) FOR [handoverTime]
GO
ALTER TABLE [dbo].[CashHandovers] ADD  DEFAULT ((0)) FOR [openingCash]
GO
ALTER TABLE [dbo].[Categories] ADD  DEFAULT ((1)) FOR [status]
GO
ALTER TABLE [dbo].[Counters] ADD  DEFAULT ('ACTIVE') FOR [status]
GO
ALTER TABLE [dbo].[CustomerPointLogs] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[Customers] ADD  DEFAULT ((0)) FOR [loyaltyPoints]
GO
ALTER TABLE [dbo].[Customers] ADD  DEFAULT ((0)) FOR [totalSpending]
GO
ALTER TABLE [dbo].[Customers] ADD  DEFAULT ('Active') FOR [status]
GO
ALTER TABLE [dbo].[Customers] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[Customers] ADD  DEFAULT (getdate()) FOR [updatedAt]
GO
ALTER TABLE [dbo].[CustomerVoucherUsage] ADD  DEFAULT (getdate()) FOR [usedAt]
GO
ALTER TABLE [dbo].[InventoryAdjustments] ADD  DEFAULT ('Pending') FOR [status]
GO
ALTER TABLE [dbo].[InventoryAdjustments] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[InventoryStocks] ADD  DEFAULT ((0)) FOR [quantityOnHand]
GO
ALTER TABLE [dbo].[InventoryStocks] ADD  DEFAULT ((0)) FOR [minThreshold]
GO
ALTER TABLE [dbo].[Invoices] ADD  CONSTRAINT [DF_Invoices_TotalAmount]  DEFAULT ((0)) FOR [totalAmount]
GO
ALTER TABLE [dbo].[Invoices] ADD  DEFAULT ((0)) FOR [promotionDiscount]
GO
ALTER TABLE [dbo].[Invoices] ADD  DEFAULT ((0)) FOR [voucherDiscount]
GO
ALTER TABLE [dbo].[Invoices] ADD  DEFAULT ((0)) FOR [usedPoints]
GO
ALTER TABLE [dbo].[Invoices] ADD  DEFAULT ((0)) FOR [pointDiscount]
GO
ALTER TABLE [dbo].[Invoices] ADD  CONSTRAINT [DF_Invoices_FinalAmount]  DEFAULT ((0)) FOR [finalAmount]
GO
ALTER TABLE [dbo].[Invoices] ADD  DEFAULT ('UNPAID') FOR [status]
GO
ALTER TABLE [dbo].[Invoices] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[LabelPrintQueue] ADD  DEFAULT ((1)) FOR [quantity]
GO
ALTER TABLE [dbo].[LabelPrintQueue] ADD  DEFAULT ('Pending') FOR [status]
GO
ALTER TABLE [dbo].[LabelPrintQueue] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[Payments] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[Payrolls] ADD  DEFAULT ((0)) FOR [deductions]
GO
ALTER TABLE [dbo].[Payrolls] ADD  DEFAULT ('draft') FOR [status]
GO
ALTER TABLE [dbo].[Payrolls] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[ProblematicGoodsReport] ADD  DEFAULT ('Open') FOR [status]
GO
ALTER TABLE [dbo].[ProblematicGoodsReport] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[ProductCombos] ADD  DEFAULT ((1)) FOR [quantity]
GO
ALTER TABLE [dbo].[Products] ADD  DEFAULT ((0)) FOR [allowDecimalQuantity]
GO
ALTER TABLE [dbo].[Products] ADD  DEFAULT ((0)) FOR [isCombo]
GO
ALTER TABLE [dbo].[Products] ADD  DEFAULT ('Selling') FOR [status]
GO
ALTER TABLE [dbo].[Products] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[Products] ADD  DEFAULT (getdate()) FOR [updatedAt]
GO
ALTER TABLE [dbo].[ProductSalePriceHistories] ADD  DEFAULT (getdate()) FOR [changedAt]
GO
ALTER TABLE [dbo].[ProductSuppliers] ADD  DEFAULT ('ACTIVE') FOR [status]
GO
ALTER TABLE [dbo].[ProductUnits] ADD  CONSTRAINT [DF_ProductUnits_UnitType]  DEFAULT ('PIECE') FOR [unitType]
GO
ALTER TABLE [dbo].[Promotions] ADD  DEFAULT ('Active') FOR [status]
GO
ALTER TABLE [dbo].[Promotions] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[PurchaseOrderItems] ADD  DEFAULT ((0)) FOR [receivedQuantity]
GO
ALTER TABLE [dbo].[PurchaseOrders] ADD  DEFAULT ('Draft') FOR [status]
GO
ALTER TABLE [dbo].[PurchaseOrders] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[PurchaseOrders] ADD  DEFAULT ((0)) FOR [totalAmount]
GO
ALTER TABLE [dbo].[ReturnItems] ADD  CONSTRAINT [DF_ReturnItems_restockApproved]  DEFAULT ('Pending') FOR [restockApproved]
GO
ALTER TABLE [dbo].[Returns] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[Returns] ADD  DEFAULT ('Pending') FOR [status]
GO
ALTER TABLE [dbo].[Shifts] ADD  DEFAULT ((1)) FOR [isActive]
GO
ALTER TABLE [dbo].[Staff] ADD  DEFAULT ('hourly') FOR [salaryType]
GO
ALTER TABLE [dbo].[Staff] ADD  DEFAULT ((0)) FOR [baseSalary]
GO
ALTER TABLE [dbo].[Staff] ADD  DEFAULT ('working') FOR [employmentStatus]
GO
ALTER TABLE [dbo].[Staff] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[SupplierProductPrices] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ('active') FOR [isActive]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[VnPayTransactions] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[Vouchers] ADD  DEFAULT ((0)) FOR [minOrderValue]
GO
ALTER TABLE [dbo].[Vouchers] ADD  DEFAULT ((100)) FOR [maxUsage]
GO
ALTER TABLE [dbo].[Vouchers] ADD  DEFAULT ((0)) FOR [currentUsage]
GO
ALTER TABLE [dbo].[Vouchers] ADD  DEFAULT ('Active') FOR [status]
GO
ALTER TABLE [dbo].[Vouchers] ADD  DEFAULT (getdate()) FOR [createdAt]
GO
ALTER TABLE [dbo].[WorkSchedules] ADD  DEFAULT ((0)) FOR [workedHours]
GO
ALTER TABLE [dbo].[WorkSchedules] ADD  DEFAULT ('assigned') FOR [status]
GO
ALTER TABLE [dbo].[CashHandovers]  WITH CHECK ADD  CONSTRAINT [FK_Handover_Schedule] FOREIGN KEY([scheduleId])
REFERENCES [dbo].[WorkSchedules] ([id])
GO
ALTER TABLE [dbo].[CashHandovers] CHECK CONSTRAINT [FK_Handover_Schedule]
GO
ALTER TABLE [dbo].[Categories]  WITH CHECK ADD  CONSTRAINT [FK_Category_Parent] FOREIGN KEY([parentId])
REFERENCES [dbo].[Categories] ([id])
GO
ALTER TABLE [dbo].[Categories] CHECK CONSTRAINT [FK_Category_Parent]
GO
ALTER TABLE [dbo].[CustomerPointLogs]  WITH CHECK ADD  CONSTRAINT [FK_CPL_Customer] FOREIGN KEY([customerId])
REFERENCES [dbo].[Customers] ([id])
GO
ALTER TABLE [dbo].[CustomerPointLogs] CHECK CONSTRAINT [FK_CPL_Customer]
GO
ALTER TABLE [dbo].[CustomerPointLogs]  WITH CHECK ADD  CONSTRAINT [FK_CPL_Invoice] FOREIGN KEY([invoiceId])
REFERENCES [dbo].[Invoices] ([id])
GO
ALTER TABLE [dbo].[CustomerPointLogs] CHECK CONSTRAINT [FK_CPL_Invoice]
GO
ALTER TABLE [dbo].[CustomerVoucherUsage]  WITH CHECK ADD  CONSTRAINT [FK_CVU_Customer] FOREIGN KEY([customerId])
REFERENCES [dbo].[Customers] ([id])
GO
ALTER TABLE [dbo].[CustomerVoucherUsage] CHECK CONSTRAINT [FK_CVU_Customer]
GO
ALTER TABLE [dbo].[CustomerVoucherUsage]  WITH CHECK ADD  CONSTRAINT [FK_CVU_Invoice] FOREIGN KEY([invoiceId])
REFERENCES [dbo].[Invoices] ([id])
GO
ALTER TABLE [dbo].[CustomerVoucherUsage] CHECK CONSTRAINT [FK_CVU_Invoice]
GO
ALTER TABLE [dbo].[CustomerVoucherUsage]  WITH CHECK ADD  CONSTRAINT [FK_CVU_Voucher] FOREIGN KEY([voucherId])
REFERENCES [dbo].[Vouchers] ([id])
GO
ALTER TABLE [dbo].[CustomerVoucherUsage] CHECK CONSTRAINT [FK_CVU_Voucher]
GO
ALTER TABLE [dbo].[InventoryAdjustmentItems]  WITH CHECK ADD  CONSTRAINT [FK_IAI_Adjustment] FOREIGN KEY([adjustmentId])
REFERENCES [dbo].[InventoryAdjustments] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[InventoryAdjustmentItems] CHECK CONSTRAINT [FK_IAI_Adjustment]
GO
ALTER TABLE [dbo].[InventoryAdjustmentItems]  WITH CHECK ADD  CONSTRAINT [FK_IAI_Product] FOREIGN KEY([productId])
REFERENCES [dbo].[Products] ([id])
GO
ALTER TABLE [dbo].[InventoryAdjustmentItems] CHECK CONSTRAINT [FK_IAI_Product]
GO
ALTER TABLE [dbo].[InventoryAdjustments]  WITH CHECK ADD  CONSTRAINT [FK_Adjustment_ProcessedBy] FOREIGN KEY([processedBy])
REFERENCES [dbo].[Staff] ([id])
GO
ALTER TABLE [dbo].[InventoryAdjustments] CHECK CONSTRAINT [FK_Adjustment_ProcessedBy]
GO
ALTER TABLE [dbo].[InventoryAdjustments]  WITH CHECK ADD  CONSTRAINT [FK_Adjustment_Staff] FOREIGN KEY([createdBy])
REFERENCES [dbo].[Staff] ([id])
GO
ALTER TABLE [dbo].[InventoryAdjustments] CHECK CONSTRAINT [FK_Adjustment_Staff]
GO
ALTER TABLE [dbo].[InventoryStocks]  WITH CHECK ADD  CONSTRAINT [FK_InventoryStocks_Product] FOREIGN KEY([productId])
REFERENCES [dbo].[Products] ([id])
GO
ALTER TABLE [dbo].[InventoryStocks] CHECK CONSTRAINT [FK_InventoryStocks_Product]
GO
ALTER TABLE [dbo].[InvoiceItems]  WITH CHECK ADD  CONSTRAINT [FK_InvItem_Invoice] FOREIGN KEY([invoiceId])
REFERENCES [dbo].[Invoices] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[InvoiceItems] CHECK CONSTRAINT [FK_InvItem_Invoice]
GO
ALTER TABLE [dbo].[InvoiceItems]  WITH CHECK ADD  CONSTRAINT [FK_InvItem_Product] FOREIGN KEY([productId])
REFERENCES [dbo].[Products] ([id])
GO
ALTER TABLE [dbo].[InvoiceItems] CHECK CONSTRAINT [FK_InvItem_Product]
GO
ALTER TABLE [dbo].[InvoiceItems]  WITH CHECK ADD  CONSTRAINT [FK_InvoiceItems_ProductUnit] FOREIGN KEY([productUnitId])
REFERENCES [dbo].[ProductUnits] ([id])
GO
ALTER TABLE [dbo].[InvoiceItems] CHECK CONSTRAINT [FK_InvoiceItems_ProductUnit]
GO
ALTER TABLE [dbo].[Invoices]  WITH CHECK ADD  CONSTRAINT [FK_Invoice_Counter] FOREIGN KEY([counterId])
REFERENCES [dbo].[Counters] ([id])
GO
ALTER TABLE [dbo].[Invoices] CHECK CONSTRAINT [FK_Invoice_Counter]
GO
ALTER TABLE [dbo].[Invoices]  WITH CHECK ADD  CONSTRAINT [FK_Invoice_Customer] FOREIGN KEY([customerId])
REFERENCES [dbo].[Customers] ([id])
GO
ALTER TABLE [dbo].[Invoices] CHECK CONSTRAINT [FK_Invoice_Customer]
GO
ALTER TABLE [dbo].[Invoices]  WITH CHECK ADD  CONSTRAINT [FK_Invoice_Promotion] FOREIGN KEY([promotionId])
REFERENCES [dbo].[Promotions] ([id])
GO
ALTER TABLE [dbo].[Invoices] CHECK CONSTRAINT [FK_Invoice_Promotion]
GO
ALTER TABLE [dbo].[Invoices]  WITH CHECK ADD  CONSTRAINT [FK_Invoice_Staff] FOREIGN KEY([staffId])
REFERENCES [dbo].[Staff] ([id])
GO
ALTER TABLE [dbo].[Invoices] CHECK CONSTRAINT [FK_Invoice_Staff]
GO
ALTER TABLE [dbo].[Invoices]  WITH CHECK ADD  CONSTRAINT [FK_Invoice_Voucher] FOREIGN KEY([voucherId])
REFERENCES [dbo].[Vouchers] ([id])
GO
ALTER TABLE [dbo].[Invoices] CHECK CONSTRAINT [FK_Invoice_Voucher]
GO
ALTER TABLE [dbo].[LabelPrintQueue]  WITH CHECK ADD  CONSTRAINT [FK_Queue_Product] FOREIGN KEY([productId])
REFERENCES [dbo].[Products] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[LabelPrintQueue] CHECK CONSTRAINT [FK_Queue_Product]
GO
ALTER TABLE [dbo].[Payments]  WITH CHECK ADD  CONSTRAINT [FK_Payment_Invoice] FOREIGN KEY([invoiceId])
REFERENCES [dbo].[Invoices] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Payments] CHECK CONSTRAINT [FK_Payment_Invoice]
GO
ALTER TABLE [dbo].[Payrolls]  WITH CHECK ADD  CONSTRAINT [FK_Payroll_Staff] FOREIGN KEY([staffId])
REFERENCES [dbo].[Staff] ([id])
GO
ALTER TABLE [dbo].[Payrolls] CHECK CONSTRAINT [FK_Payroll_Staff]
GO
ALTER TABLE [dbo].[ProblematicGoodsReport]  WITH CHECK ADD  CONSTRAINT [FK_PGR_Staff] FOREIGN KEY([reportedBy])
REFERENCES [dbo].[Staff] ([id])
GO
ALTER TABLE [dbo].[ProblematicGoodsReport] CHECK CONSTRAINT [FK_PGR_Staff]
GO
ALTER TABLE [dbo].[ProductCombos]  WITH CHECK ADD  CONSTRAINT [FK_Combo_Child] FOREIGN KEY([childProductId])
REFERENCES [dbo].[Products] ([id])
GO
ALTER TABLE [dbo].[ProductCombos] CHECK CONSTRAINT [FK_Combo_Child]
GO
ALTER TABLE [dbo].[ProductCombos]  WITH CHECK ADD  CONSTRAINT [FK_Combo_Parent] FOREIGN KEY([parentProductId])
REFERENCES [dbo].[Products] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ProductCombos] CHECK CONSTRAINT [FK_Combo_Parent]
GO
ALTER TABLE [dbo].[Products]  WITH CHECK ADD  CONSTRAINT [FK_Product_Category] FOREIGN KEY([categoryId])
REFERENCES [dbo].[Categories] ([id])
GO
ALTER TABLE [dbo].[Products] CHECK CONSTRAINT [FK_Product_Category]
GO
ALTER TABLE [dbo].[ProductSalePriceHistories]  WITH CHECK ADD  CONSTRAINT [FK_ProductSalePriceHistories_Product] FOREIGN KEY([productId])
REFERENCES [dbo].[Products] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ProductSalePriceHistories] CHECK CONSTRAINT [FK_ProductSalePriceHistories_Product]
GO
ALTER TABLE [dbo].[ProductSalePriceHistories]  WITH CHECK ADD  CONSTRAINT [FK_ProductSalePriceHistories_ProductUnit] FOREIGN KEY([productUnitId])
REFERENCES [dbo].[ProductUnits] ([id])
GO
ALTER TABLE [dbo].[ProductSalePriceHistories] CHECK CONSTRAINT [FK_ProductSalePriceHistories_ProductUnit]
GO
ALTER TABLE [dbo].[ProductSalePriceHistories]  WITH CHECK ADD  CONSTRAINT [FK_ProductSalePriceHistories_Staff] FOREIGN KEY([changedBy])
REFERENCES [dbo].[Staff] ([id])
GO
ALTER TABLE [dbo].[ProductSalePriceHistories] CHECK CONSTRAINT [FK_ProductSalePriceHistories_Staff]
GO
ALTER TABLE [dbo].[ProductSuppliers]  WITH CHECK ADD  CONSTRAINT [FK_PS_Product] FOREIGN KEY([productId])
REFERENCES [dbo].[Products] ([id])
GO
ALTER TABLE [dbo].[ProductSuppliers] CHECK CONSTRAINT [FK_PS_Product]
GO
ALTER TABLE [dbo].[ProductSuppliers]  WITH CHECK ADD  CONSTRAINT [FK_PS_Supplier] FOREIGN KEY([supplierId])
REFERENCES [dbo].[Suppliers] ([id])
GO
ALTER TABLE [dbo].[ProductSuppliers] CHECK CONSTRAINT [FK_PS_Supplier]
GO
ALTER TABLE [dbo].[ProductUnits]  WITH CHECK ADD  CONSTRAINT [FK_Unit_Product] FOREIGN KEY([productId])
REFERENCES [dbo].[Products] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ProductUnits] CHECK CONSTRAINT [FK_Unit_Product]
GO
ALTER TABLE [dbo].[PromotionProducts]  WITH CHECK ADD  CONSTRAINT [FK_PP_Category] FOREIGN KEY([categoryId])
REFERENCES [dbo].[Categories] ([id])
GO
ALTER TABLE [dbo].[PromotionProducts] CHECK CONSTRAINT [FK_PP_Category]
GO
ALTER TABLE [dbo].[PromotionProducts]  WITH CHECK ADD  CONSTRAINT [FK_PP_Product] FOREIGN KEY([productId])
REFERENCES [dbo].[Products] ([id])
GO
ALTER TABLE [dbo].[PromotionProducts] CHECK CONSTRAINT [FK_PP_Product]
GO
ALTER TABLE [dbo].[PromotionProducts]  WITH CHECK ADD  CONSTRAINT [FK_PP_ProductUnit] FOREIGN KEY([productUnitId])
REFERENCES [dbo].[ProductUnits] ([id])
GO
ALTER TABLE [dbo].[PromotionProducts] CHECK CONSTRAINT [FK_PP_ProductUnit]
GO
ALTER TABLE [dbo].[PromotionProducts]  WITH CHECK ADD  CONSTRAINT [FK_PP_Promotion] FOREIGN KEY([promotionId])
REFERENCES [dbo].[Promotions] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[PromotionProducts] CHECK CONSTRAINT [FK_PP_Promotion]
GO
ALTER TABLE [dbo].[PurchaseOrderItems]  WITH CHECK ADD  CONSTRAINT [FK_POI_PO] FOREIGN KEY([poId])
REFERENCES [dbo].[PurchaseOrders] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[PurchaseOrderItems] CHECK CONSTRAINT [FK_POI_PO]
GO
ALTER TABLE [dbo].[PurchaseOrderItems]  WITH CHECK ADD  CONSTRAINT [FK_POI_ProductUnit] FOREIGN KEY([productUnitId])
REFERENCES [dbo].[ProductUnits] ([id])
GO
ALTER TABLE [dbo].[PurchaseOrderItems] CHECK CONSTRAINT [FK_POI_ProductUnit]
GO
ALTER TABLE [dbo].[PurchaseOrders]  WITH CHECK ADD  CONSTRAINT [FK_PO_CreatedBy] FOREIGN KEY([createdBy])
REFERENCES [dbo].[Staff] ([id])
GO
ALTER TABLE [dbo].[PurchaseOrders] CHECK CONSTRAINT [FK_PO_CreatedBy]
GO
ALTER TABLE [dbo].[PurchaseOrders]  WITH CHECK ADD  CONSTRAINT [FK_PO_ProcessBy] FOREIGN KEY([processBy])
REFERENCES [dbo].[Staff] ([id])
GO
ALTER TABLE [dbo].[PurchaseOrders] CHECK CONSTRAINT [FK_PO_ProcessBy]
GO
ALTER TABLE [dbo].[PurchaseOrders]  WITH CHECK ADD  CONSTRAINT [FK_PO_ReceivedBy] FOREIGN KEY([receivedBy])
REFERENCES [dbo].[Staff] ([id])
GO
ALTER TABLE [dbo].[PurchaseOrders] CHECK CONSTRAINT [FK_PO_ReceivedBy]
GO
ALTER TABLE [dbo].[PurchaseOrders]  WITH CHECK ADD  CONSTRAINT [FK_PO_Supplier] FOREIGN KEY([supplierId])
REFERENCES [dbo].[Suppliers] ([id])
GO
ALTER TABLE [dbo].[PurchaseOrders] CHECK CONSTRAINT [FK_PO_Supplier]
GO
ALTER TABLE [dbo].[ReturnItems]  WITH CHECK ADD  CONSTRAINT [FK_Returns_checkedBy] FOREIGN KEY([checkedBy])
REFERENCES [dbo].[Staff] ([id])
GO
ALTER TABLE [dbo].[ReturnItems] CHECK CONSTRAINT [FK_Returns_checkedBy]
GO
ALTER TABLE [dbo].[ReturnItems]  WITH CHECK ADD  CONSTRAINT [FK_RItem_InvItem] FOREIGN KEY([invoiceItemId])
REFERENCES [dbo].[InvoiceItems] ([id])
GO
ALTER TABLE [dbo].[ReturnItems] CHECK CONSTRAINT [FK_RItem_InvItem]
GO
ALTER TABLE [dbo].[ReturnItems]  WITH CHECK ADD  CONSTRAINT [FK_RItem_Product] FOREIGN KEY([productId])
REFERENCES [dbo].[Products] ([id])
GO
ALTER TABLE [dbo].[ReturnItems] CHECK CONSTRAINT [FK_RItem_Product]
GO
ALTER TABLE [dbo].[ReturnItems]  WITH CHECK ADD  CONSTRAINT [FK_RItem_ProductUnit] FOREIGN KEY([productUnitId])
REFERENCES [dbo].[ProductUnits] ([id])
GO
ALTER TABLE [dbo].[ReturnItems] CHECK CONSTRAINT [FK_RItem_ProductUnit]
GO
ALTER TABLE [dbo].[ReturnItems]  WITH CHECK ADD  CONSTRAINT [FK_RItem_Return] FOREIGN KEY([returnId])
REFERENCES [dbo].[Returns] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ReturnItems] CHECK CONSTRAINT [FK_RItem_Return]
GO
ALTER TABLE [dbo].[Returns]  WITH CHECK ADD  CONSTRAINT [FK_Returns_ApproveBy] FOREIGN KEY([approveBy])
REFERENCES [dbo].[Staff] ([id])
GO
ALTER TABLE [dbo].[Returns] CHECK CONSTRAINT [FK_Returns_ApproveBy]
GO
ALTER TABLE [dbo].[Returns]  WITH CHECK ADD  CONSTRAINT [FK_Returns_Counter] FOREIGN KEY([counterId])
REFERENCES [dbo].[Counters] ([id])
GO
ALTER TABLE [dbo].[Returns] CHECK CONSTRAINT [FK_Returns_Counter]
GO
ALTER TABLE [dbo].[Returns]  WITH CHECK ADD  CONSTRAINT [FK_Returns_Invoice] FOREIGN KEY([invoiceId])
REFERENCES [dbo].[Invoices] ([id])
GO
ALTER TABLE [dbo].[Returns] CHECK CONSTRAINT [FK_Returns_Invoice]
GO
ALTER TABLE [dbo].[Returns]  WITH CHECK ADD  CONSTRAINT [FK_Returns_Staff] FOREIGN KEY([staffId])
REFERENCES [dbo].[Staff] ([id])
GO
ALTER TABLE [dbo].[Returns] CHECK CONSTRAINT [FK_Returns_Staff]
GO
ALTER TABLE [dbo].[RoleFeatures]  WITH CHECK ADD  CONSTRAINT [FK_RoleFeature_Feature] FOREIGN KEY([featureId])
REFERENCES [dbo].[Features] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[RoleFeatures] CHECK CONSTRAINT [FK_RoleFeature_Feature]
GO
ALTER TABLE [dbo].[RoleFeatures]  WITH CHECK ADD  CONSTRAINT [FK_RoleFeature_Role] FOREIGN KEY([roleId])
REFERENCES [dbo].[Roles] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[RoleFeatures] CHECK CONSTRAINT [FK_RoleFeature_Role]
GO
ALTER TABLE [dbo].[Staff]  WITH CHECK ADD  CONSTRAINT [FK_Staff_User] FOREIGN KEY([userId])
REFERENCES [dbo].[Users] ([id])
ON DELETE SET NULL
GO
ALTER TABLE [dbo].[Staff] CHECK CONSTRAINT [FK_Staff_User]
GO
ALTER TABLE [dbo].[SupplierProductPrices]  WITH CHECK ADD  CONSTRAINT [FK_SPP_Product] FOREIGN KEY([productId])
REFERENCES [dbo].[Products] ([id])
GO
ALTER TABLE [dbo].[SupplierProductPrices] CHECK CONSTRAINT [FK_SPP_Product]
GO
ALTER TABLE [dbo].[SupplierProductPrices]  WITH CHECK ADD  CONSTRAINT [FK_SPP_ProductUnit] FOREIGN KEY([unitId])
REFERENCES [dbo].[ProductUnits] ([id])
GO
ALTER TABLE [dbo].[SupplierProductPrices] CHECK CONSTRAINT [FK_SPP_ProductUnit]
GO
ALTER TABLE [dbo].[SupplierProductPrices]  WITH CHECK ADD  CONSTRAINT [FK_SPP_Supplier] FOREIGN KEY([supplierId])
REFERENCES [dbo].[Suppliers] ([id])
GO
ALTER TABLE [dbo].[SupplierProductPrices] CHECK CONSTRAINT [FK_SPP_Supplier]
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD  CONSTRAINT [FK_Users_Roles] FOREIGN KEY([roleId])
REFERENCES [dbo].[Roles] ([id])
GO
ALTER TABLE [dbo].[Users] CHECK CONSTRAINT [FK_Users_Roles]
GO
ALTER TABLE [dbo].[VnPayTransactions]  WITH CHECK ADD  CONSTRAINT [FK_VnPay_Invoice] FOREIGN KEY([invoiceId])
REFERENCES [dbo].[Invoices] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[VnPayTransactions] CHECK CONSTRAINT [FK_VnPay_Invoice]
GO
ALTER TABLE [dbo].[WorkSchedules]  WITH CHECK ADD  CONSTRAINT [FK_Schedule_Counter] FOREIGN KEY([counterId])
REFERENCES [dbo].[Counters] ([id])
GO
ALTER TABLE [dbo].[WorkSchedules] CHECK CONSTRAINT [FK_Schedule_Counter]
GO
ALTER TABLE [dbo].[WorkSchedules]  WITH CHECK ADD  CONSTRAINT [FK_Schedule_Shift] FOREIGN KEY([shiftId])
REFERENCES [dbo].[Shifts] ([id])
GO
ALTER TABLE [dbo].[WorkSchedules] CHECK CONSTRAINT [FK_Schedule_Shift]
GO
ALTER TABLE [dbo].[WorkSchedules]  WITH CHECK ADD  CONSTRAINT [FK_Schedule_Staff] FOREIGN KEY([staffId])
REFERENCES [dbo].[Staff] ([id])
GO
ALTER TABLE [dbo].[WorkSchedules] CHECK CONSTRAINT [FK_Schedule_Staff]
GO
ALTER TABLE [dbo].[Counters]  WITH CHECK ADD  CONSTRAINT [CK_Counters_Status] CHECK  (([status]='INACTIVE' OR [status]='ACTIVE'))
GO
ALTER TABLE [dbo].[Counters] CHECK CONSTRAINT [CK_Counters_Status]
GO
ALTER TABLE [dbo].[Customers]  WITH CHECK ADD  CONSTRAINT [CK_Customer_Status] CHECK  (([status]='Blocked' OR [status]='Inactive' OR [status]='Active'))
GO
ALTER TABLE [dbo].[Customers] CHECK CONSTRAINT [CK_Customer_Status]
GO
ALTER TABLE [dbo].[InventoryAdjustments]  WITH CHECK ADD  CONSTRAINT [CK_Adjustment_Status] CHECK  (([status]='Rejected' OR [status]='Approved' OR [status]='Pending'))
GO
ALTER TABLE [dbo].[InventoryAdjustments] CHECK CONSTRAINT [CK_Adjustment_Status]
GO
ALTER TABLE [dbo].[Invoices]  WITH CHECK ADD  CONSTRAINT [CK_Invoice_Status] CHECK  (([status]='PARTIALLY_REFUNDED' OR [status]='REFUNDED' OR [status]='CANCELLED' OR [status]='PAID' OR [status]='UNPAID'))
GO
ALTER TABLE [dbo].[Invoices] CHECK CONSTRAINT [CK_Invoice_Status]
GO
ALTER TABLE [dbo].[LabelPrintQueue]  WITH CHECK ADD  CONSTRAINT [CK_Queue_Status] CHECK  (([status]='Cancelled' OR [status]='Printed' OR [status]='Pending'))
GO
ALTER TABLE [dbo].[LabelPrintQueue] CHECK CONSTRAINT [CK_Queue_Status]
GO
ALTER TABLE [dbo].[Payments]  WITH CHECK ADD  CONSTRAINT [CK_Payment_Method] CHECK  (([paymentMethod]='BANK_TRANSFER' OR [paymentMethod]='QR_VNPAY' OR [paymentMethod]='CASH'))
GO
ALTER TABLE [dbo].[Payments] CHECK CONSTRAINT [CK_Payment_Method]
GO
ALTER TABLE [dbo].[Payments]  WITH CHECK ADD  CONSTRAINT [CK_Payment_Status] CHECK  (([status]='FAILED' OR [status]='SUCCESS' OR [status]='PENDING'))
GO
ALTER TABLE [dbo].[Payments] CHECK CONSTRAINT [CK_Payment_Status]
GO
ALTER TABLE [dbo].[Payrolls]  WITH CHECK ADD  CONSTRAINT [CK_Payroll_Status] CHECK  (([status]='paid' OR [status]='draft'))
GO
ALTER TABLE [dbo].[Payrolls] CHECK CONSTRAINT [CK_Payroll_Status]
GO
ALTER TABLE [dbo].[Products]  WITH CHECK ADD  CONSTRAINT [CK_Product_Status] CHECK  (([status]='Suspended' OR [status]='StopSelling' OR [status]='Selling'))
GO
ALTER TABLE [dbo].[Products] CHECK CONSTRAINT [CK_Product_Status]
GO
ALTER TABLE [dbo].[ProductUnits]  WITH CHECK ADD  CONSTRAINT [CK_ProductUnit_Type] CHECK  (([unitType]='WEIGHT' OR [unitType]='PIECE'))
GO
ALTER TABLE [dbo].[ProductUnits] CHECK CONSTRAINT [CK_ProductUnit_Type]
GO
ALTER TABLE [dbo].[Promotions]  WITH CHECK ADD  CONSTRAINT [CK_Prom_Status] CHECK  (([status]='Disabled' OR [status]='Expired' OR [status]='Active'))
GO
ALTER TABLE [dbo].[Promotions] CHECK CONSTRAINT [CK_Prom_Status]
GO
ALTER TABLE [dbo].[Promotions]  WITH CHECK ADD  CONSTRAINT [CK_Prom_Type] CHECK  (([type]='BuyXGetY' OR [type]='Amount' OR [type]='Percent'))
GO
ALTER TABLE [dbo].[Promotions] CHECK CONSTRAINT [CK_Prom_Type]
GO
ALTER TABLE [dbo].[PurchaseOrders]  WITH CHECK ADD  CONSTRAINT [CK_PO_Status] CHECK  (([status]='CannotDeliver' OR [status]='PartiallyReceived' OR [status]='Received' OR [status]='WaitingForDelivery' OR [status]='Rejected' OR [status]='Approved' OR [status]='Pending'))
GO
ALTER TABLE [dbo].[PurchaseOrders] CHECK CONSTRAINT [CK_PO_Status]
GO
ALTER TABLE [dbo].[Returns]  WITH CHECK ADD  CONSTRAINT [CK_Refund_Method] CHECK  (([refundMethod]='QR_VNPAY' OR [refundMethod]='CASH'))
GO
ALTER TABLE [dbo].[Returns] CHECK CONSTRAINT [CK_Refund_Method]
GO
ALTER TABLE [dbo].[Returns]  WITH CHECK ADD  CONSTRAINT [CK_Return_Status] CHECK  (([status]='Reject' OR [status]='Approve' OR [status]='Pending'))
GO
ALTER TABLE [dbo].[Returns] CHECK CONSTRAINT [CK_Return_Status]
GO
ALTER TABLE [dbo].[Returns]  WITH CHECK ADD  CONSTRAINT [CK_Return_Type] CHECK  (([returnType]='EXCHANGE' OR [returnType]='REFUND'))
GO
ALTER TABLE [dbo].[Returns] CHECK CONSTRAINT [CK_Return_Type]
GO
ALTER TABLE [dbo].[Staff]  WITH CHECK ADD  CONSTRAINT [CK_Staff_SalaryType] CHECK  (([salaryType]='monthly' OR [salaryType]='hourly'))
GO
ALTER TABLE [dbo].[Staff] CHECK CONSTRAINT [CK_Staff_SalaryType]
GO
ALTER TABLE [dbo].[Staff]  WITH CHECK ADD  CONSTRAINT [CK_Staff_Status] CHECK  (([employmentStatus]='resigned' OR [employmentStatus]='working'))
GO
ALTER TABLE [dbo].[Staff] CHECK CONSTRAINT [CK_Staff_Status]
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD  CONSTRAINT [CK_Users_Status] CHECK  (([isActive]='locked' OR [isActive]='active'))
GO
ALTER TABLE [dbo].[Users] CHECK CONSTRAINT [CK_Users_Status]
GO
ALTER TABLE [dbo].[VnPayTransactions]  WITH CHECK ADD  CONSTRAINT [CK_VnPay_Status] CHECK  (([status]='FAILED' OR [status]='SUCCESS' OR [status]='INIT'))
GO
ALTER TABLE [dbo].[VnPayTransactions] CHECK CONSTRAINT [CK_VnPay_Status]
GO
ALTER TABLE [dbo].[Vouchers]  WITH CHECK ADD  CONSTRAINT [CK_Voucher_Status] CHECK  (([status]='Disabled' OR [status]='Expired' OR [status]='Active'))
GO
ALTER TABLE [dbo].[Vouchers] CHECK CONSTRAINT [CK_Voucher_Status]
GO
ALTER TABLE [dbo].[Vouchers]  WITH CHECK ADD  CONSTRAINT [CK_Voucher_Type] CHECK  (([type]='Fixed' OR [type]='Percent'))
GO
ALTER TABLE [dbo].[Vouchers] CHECK CONSTRAINT [CK_Voucher_Type]
GO
ALTER TABLE [dbo].[WorkSchedules]  WITH CHECK ADD  CONSTRAINT [CK_Schedule_Status] CHECK  (([status]='late' OR [status]='absent' OR [status]='completed' OR [status]='working' OR [status]='assigned'))
GO
ALTER TABLE [dbo].[WorkSchedules] CHECK CONSTRAINT [CK_Schedule_Status]
GO




INSERT INTO Roles (name, description)
SELECT 'Manager', N'Quản lý cửa hàng'
WHERE NOT EXISTS (SELECT 1 FROM Roles WHERE name='Manager');

INSERT INTO Roles (name, description)
SELECT 'Cashier', N'Thu ngân'
WHERE NOT EXISTS (SELECT 1 FROM Roles WHERE name='Cashier');

INSERT INTO Roles (name, description)
SELECT 'Warehouse', N'Thủ kho'
WHERE NOT EXISTS (SELECT 1 FROM Roles WHERE name='Warehouse');


/* =========================================
FEATURES (PERMISSIONS)
========================================= */

INSERT INTO Features (featureKey, description)
SELECT v.featureKey, v.description
FROM (VALUES
('VIEW_STAFF',N'Xem nhân viên'),
('CREATE_STAFF',N'Tạo nhân viên'),
('UPDATE_STAFF',N'Sửa nhân viên'),
('DETAIL_STAFF',N'Chi tiết nhân viên'),

('VIEW_PRODUCT',N'Xem sản phẩm'),
('CREATE_PRODUCT',N'Tạo sản phẩm'),
('UPDATE_PRODUCT',N'Sửa sản phẩm'),
('DELETE_PRODUCT',N'Xóa sản phẩm'),

('VIEW_PRODUCT_UNIT',N'Xem đơn vị'),
('CREATE_PRODUCT_UNIT',N'Tạo đơn vị'),
('UPDATE_PRODUCT_UNIT',N'Sửa đơn vị'),
('DELETE_PRODUCT_UNIT',N'Xóa đơn vị'),

('VIEW_CATEGORY',N'Xem danh mục'),
('CREATE_CATEGORY',N'Tạo danh mục'),
('UPDATE_CATEGORY',N'Sửa danh mục'),
('DELETE_CATEGORY',N'Xóa danh mục'),

('VIEW_INVOICE',N'Xem hóa đơn'),
('CREATE_INVOICE',N'Tạo hóa đơn'),

('VIEW_SHIFT',N'Xem ca làm'),
('CREATE_SHIFT',N'Tạo ca'),
('UPDATE_SHIFT',N'Sửa ca'),
('DELETE_SHIFT',N'Xóa ca'),

('VIEW_INVENTORY',N'Xem kho'),
('UPDATE_STOCK',N'Cập nhật kho'),

('CREATE_PURCHASE_ORDER',N'Tạo đơn nhập'),
('VIEW_PURCHASE_ORDER',N'Xem đơn nhập')
) v(featureKey,description)
WHERE NOT EXISTS (
    SELECT 1 FROM Features f WHERE f.featureKey = v.featureKey
);

/* =========================================
ROLE PERMISSIONS
========================================= */

INSERT INTO RoleFeatures (roleId, featureId)
SELECT r.id, f.id
FROM Roles r
CROSS JOIN Features f
WHERE r.name='Manager'
AND NOT EXISTS (
    SELECT 1 FROM RoleFeatures rf
    WHERE rf.roleId = r.id AND rf.featureId = f.id
);

INSERT INTO RoleFeatures (roleId, featureId)
SELECT r.id, f.id
FROM Roles r
JOIN Features f ON f.featureKey IN
('VIEW_PRODUCT','VIEW_PRODUCT_UNIT','VIEW_CATEGORY','VIEW_INVOICE','CREATE_INVOICE')
WHERE r.name='Cashier'
AND NOT EXISTS (
    SELECT 1 FROM RoleFeatures rf
    WHERE rf.roleId = r.id AND rf.featureId = f.id
);

INSERT INTO RoleFeatures (roleId, featureId)
SELECT r.id, f.id
FROM Roles r
JOIN Features f ON f.featureKey IN
('VIEW_PRODUCT','VIEW_PRODUCT_UNIT','VIEW_CATEGORY','VIEW_INVENTORY',
'UPDATE_STOCK','CREATE_PURCHASE_ORDER','VIEW_PURCHASE_ORDER')
WHERE r.name='Warehouse'
AND NOT EXISTS (
    SELECT 1 FROM RoleFeatures rf
    WHERE rf.roleId = r.id AND rf.featureId = f.id
);

/* =========================================
USERS
password = 123456
========================================= */

DECLARE @PassHash VARCHAR(255)='$2a$12$73feLBzNo7tbP422IqhhjuO34fQzzMPbFajH0VFjVoqZa/QgRJdXK';

INSERT INTO Users (roleId,username,passwordHash,isActive)
SELECT r.id,'admin@pos.com',@PassHash,'active'
FROM Roles r
WHERE r.name='Manager'
AND NOT EXISTS (SELECT 1 FROM Users WHERE username='admin@pos.com');

INSERT INTO Users (roleId,username,passwordHash,isActive)
SELECT r.id,'cashier@pos.com',@PassHash,'active'
FROM Roles r
WHERE r.name='Cashier'
AND NOT EXISTS (SELECT 1 FROM Users WHERE username='cashier@pos.com');

INSERT INTO Users (roleId,username,passwordHash,isActive)
SELECT r.id,'warehouse@pos.com',@PassHash,'active'
FROM Roles r
WHERE r.name='Warehouse'
AND NOT EXISTS (SELECT 1 FROM Users WHERE username='warehouse@pos.com');

/* =========================================
STAFF
========================================= */

INSERT INTO Staff (userId,fullName,phoneNumber,email,salaryType,baseSalary)
SELECT u.id,N'Trần Quản Lý','0900000001','admin@pos.com','monthly',20000000
FROM Users u
WHERE u.username='admin@pos.com'
AND NOT EXISTS (SELECT 1 FROM Staff WHERE userId = u.id);

INSERT INTO Staff (userId,fullName,phoneNumber,email,salaryType,baseSalary)
SELECT u.id,N'Nguyễn Thu Ngân','0900000002','cashier@pos.com','hourly',25000
FROM Users u
WHERE u.username='cashier@pos.com'
AND NOT EXISTS (SELECT 1 FROM Staff WHERE userId = u.id);

INSERT INTO Staff (userId,fullName,phoneNumber,email,salaryType,baseSalary)
SELECT u.id,N'Lê Văn Kho','0900000003','warehouse@pos.com','monthly',12000000
FROM Users u
WHERE u.username='warehouse@pos.com'
AND NOT EXISTS (SELECT 1 FROM Staff WHERE userId = u.id);