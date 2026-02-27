const userRoutes = require("./user.route");
const inventoryRoutes = require("./inventory.route");
const invoiceRoutes = require("./invoice.route");
const authRoutes = require("./auth.route");
const customerRoutes = require("./customer.route");
const promotionRoutes = require("./promotion.route");
const voucherRoutes = require("./voucher.route");
const categoryRoutes = require("./category.route");
const productRoutes = require("./product.route");
const productUnitRoutes = require("./productUnit.route");
const priceHistoryRoutes = require("./priceHistory.route");
const paymentRoutes = require("./payment.route")
const staffRoutes = require("./staff.route");
const rosterRoutes = require("./roster.route");
const shiftRoutes = require("./shift.route");
module.exports = (app) => {
    const version = "/api";

    app.use(version + "/users", userRoutes);
    app.use(version + "/inventory", inventoryRoutes);
    app.use(version + "/invoices", invoiceRoutes);
    app.use(version + "/auth", authRoutes);
    app.use(version + "/payment", paymentRoutes)
    app.use(version + "/customers", customerRoutes);
    app.use(version + "/promotions", promotionRoutes);
    app.use(version + "/vouchers", voucherRoutes);
    app.use(version + "/categories", categoryRoutes);
    app.use(version + "/products", productRoutes);
    app.use(version + "/product-units", productUnitRoutes);
    app.use(version + "/price-history", priceHistoryRoutes);
    app.use(version + "/payment", paymentRoutes);
    app.use(version + "/staff", staffRoutes);
    app.use(version + "/shifts", shiftRoutes);
    app.use(version + "/roster", rosterRoutes);

};

