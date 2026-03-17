const paymentService = require("../services/payment.service");

const handleError = (res, err) => {
  console.error(err);

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err.message?.toLowerCase().includes("not found")) {
    return res.status(404).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(400).json({
    success: false,
    message: err.message || "Internal server error",
  });
};


const payCash = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const result = await paymentService.payCash(id, req.body);

    return res.status(200).json({
      success: true,
      ...result,
    });

  } catch (err) {
    return handleError(res, err);
  }
};

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

const cancelPendingPayment = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    await paymentService.cancelPendingPayment(invoiceId);

    res.json({
      success: true,
      message: "Cancelled pending payment"
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  createQR,
  webhook,
  payCash,
  cancelPendingPayment,
};