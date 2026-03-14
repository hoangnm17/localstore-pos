const paymentService = require("../services/payment.service");

const createQR = async (req, res) => {
  try {
    const { invoiceId } = req.body;
    const { discount } = req.body;
    const result = await paymentService.createQR(invoiceId, discount);

    return res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("createQR error:", err);
    return res.status(400).json({
      success: false,
      message: err.message || "Create QR failed",
    });
  }
};

const webhook = async (req, res) => {
      console.log("DA NHAN HOOK TU API SEPAY")
    console.log(req.body);
  try {
    await paymentService.confirmPayment(req.body);

    
    return res.json({
      success: true,
      message: "Webhook processed",
    });
  } catch (err) {
    console.error("SePay webhook error:", err);
    return res.status(400).json({
      success: false,
      message: err.message || "Webhook failed",
    });
  }
};

module.exports = {
  createQR,
  webhook,
};