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

module.exports.createInvoice = async (req, res) => {
    try {
        const { items, customer, total } = req.body

        console.log(req.body)
        res.status(201).json({
            message: "Tạo hóa đơn thành công",
            data: {
                items,
                customer,
                total,
            },
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
