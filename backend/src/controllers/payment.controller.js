const invoiceModel = require("../models/invoice.model");
const invoiceItemModel = require("../models/invoiceItem.model");
const paymentModel = require("../models/payment.model");
const vnpayModel = require("../models/vnpay.model");
const createVnpayUtil = require("../utils/vnpay.mockup");
const createPaymentService = require("../services/payment.service");

const vnpayUtil = createVnpayUtil({
    secretKey: "MOCK_SECRET",
});

const paymentService = createPaymentService({
    invoiceModel,
    invoiceItemModel,
    paymentModel,
    vnpayModel,
    vnpayUtil,
});

const createPayment = async (req, res) => {
  try {
    const { invoiceId, method, customerPay } = req.body;

    if (!invoiceId) {
      return res.status(400).json({ message: "invoiceId is required" });
    }

    const result = await paymentService.createPayment({
      invoiceId,
      method,
      customerPay,
      staffId: req.user.id, // lấy từ token
    });

    res.json(result);

  } catch (err) {
    console.error("createPayment error:", err);
    res.status(400).json({ message: err.message });
  }
};


const vnpayReturn = async (req, res) => {
    try {
        const result = await paymentService.handleReturn(req.query);
        res.json(result);
    } catch (err) {
        console.error("vnpayReturn error:", err);
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    createPayment,
    vnpayReturn,
};
