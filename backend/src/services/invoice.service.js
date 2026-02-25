const invoiceModel = require("../models/invoice.model")

module.exports.getAllInvoice = async () => {
    return await invoiceModel.getAllInvoice();
}