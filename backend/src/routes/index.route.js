const userRoutes = require("./user.route");
const inventoryRoutes = require("./inventory.route");
const invoiceRoutes = require("./invoice.route");

module.exports = (app) => {
    const version = "/api";

    app.use(version + "/users", userRoutes);
    app.use(version + "/inventory", inventoryRoutes);
    app.use(version + "/invoices", invoiceRoutes);
};
