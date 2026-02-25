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
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Items is required",
      });
    }

    const calculatedTotal = items.reduce(
      (sum, item) => sum + Number(item.lineTotal || 0),
      0
    );

    const data = {
      ...req.body,
      staffId: req.body.staffId,
      counterId: req.body.counterId,
      customerId: req.body.customerId || null,
      total: calculatedTotal,
    };

    const result = await paymentService.createPayment(data);

    res.json(result);

  } catch (err) {
    console.error("createPayment error:", err);
    res.status(400).json({
      message: err.message,
    });
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
