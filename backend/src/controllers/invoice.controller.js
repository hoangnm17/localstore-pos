const invoiceModel = require("../services/invoice.service")

module.exports.getAllInvoice = async (req, res) => {
    try {
        const invoices = await invoiceModel.getAllInvoice()

        return res.status(200).json({
            success: true,
            data: invoices
        })
    } catch (err) {
        console.log("Get All Invoice controller error", err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}