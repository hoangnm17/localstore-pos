const userRoutes = require("./user.route");
const inventoryRoutes = require("./inventory.route");
const invoiceRoutes = require("./invoice.route");
const authRoutes = require("./auth.route");
const staffRoutes = require("./staff.route");

module.exports = (app) => {
    const version = "/api";

    app.use(version + "/users", userRoutes);
    app.use(version + "/inventory", inventoryRoutes);
    app.use(version + "/invoices", invoiceRoutes);
    app.use(version + "/auth",authRoutes);
    app.use(version + "/staff", staffRoutes);
};
